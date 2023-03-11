namespace connection {

    import DataModel = data.DataModel;

    type topic = string;

    interface ISubscriber {
        subscriptionReady(model: DataModel);
    }

    export class WebSocketConnection {
        private ws: WebSocket;

        private subscribers = new Map<topic, ISubscriber[]>();
        private lookup = (window as any).lookup = new Map<topic, DataModel>();


        constructor(
            // Delegate, only want one to handle the connect and reconnect 
            private delegate: {
                onReady: VoidFunction,
                onError: VoidFunction,
                onDisconnnect: VoidFunction
            },
            // Websocket API endPoint
            private url: string = "ws://localhost:8080/connect"
        ) { }

        public connnect(): void {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connection established');
                this.delegate.onReady();
            };

            this.ws.onerror = (event) => {
                console.log(`WebSocket error: ${event}`);
                this.delegate.onError();
            };

            this.ws.onclose = () => {
                this.delegate.onDisconnnect();
            }

            var reader = new FileReader();
            reader.onload = () => {
                const message = JSON.parse(reader.result as string) as data.Msg;
                console.log(message);
                
                switch (message.msgType) {

                    case MessageType.Subscribe:
                        this.subscriptionHandler(message as data.SnapshotMsg)

                    case MessageType.Insert:
                        this.insertHandler(message as data.InsertMsg);
                        break;

                    case MessageType.Update:
                        this.updateHandler(message as data.UpdateMsg);
                        break;

                    case MessageType.Delete:
                        this.deleteHandler(message as data.DeleteMsg);
                        break;

                    default:
                        console.log(`Unknown message type: ${message}`);
                        break;
                }

            };

            this.ws.onmessage = (event) => {
                if (!event.data) {
                    console.error("missing data")
                    return;
                }

                reader.readAsBinaryString(event.data);
            };
        }

        public subscribe(topic: topic, subscriber: ISubscriber) {
            if (this.lookup[topic]) {
                subscriber.subscriptionReady(this.lookup[topic]);
                return;
            }

            if (!this.subscribers[topic]) {
                this.subscribers[topic] = [];
            }

            this.subscribers[topic].push(subscriber);

            this.ws.send(connection.MessageType.Subscribe + topic);
        }


        public sendMsg(msg: data.Msg): void {

            this.ws.send(msg.msgType + JSON.stringify(msg));
        }


        private insertModel(message: data.InsertMsg): void {
            this.lookup[message.topic] = new DataModel(message.topic, message.data);
            if (message.parentTopic) {
                this.lookup[message.parentTopic] && this.lookup[message.parentTopic].insert(this.lookup[message.topic]);
            }

            for (const topic in message.children) {
                this.insertModel(message.children[topic]);
            }

        }

        private subscriptionHandler(message: data.SnapshotMsg): void {
            const snapshot = message.data;
            if (!snapshot.topic) {
                console.error(`subscription error for topic: ${message.topic}`);
                return;
            }

            this.insertModel(snapshot);

            for (const s of this.subscribers[message.topic]) {
                s.subscriptionReady(this.lookup[message.topic]);
            }

            this.subscribers[message.topic] = [];
        }

        private insertHandler(message: data.InsertMsg): void {
            this.insertModel(message);
        }

        private updateHandler(message: data.UpdateMsg): void {

            const model = this.lookup[message.topic];
            if (!model) {
                console.error("update: model not present for topic=" + message.topic);
                return;
            }

            model.update(message.data);
        }

        private deleteHandler(message: data.DeleteMsg): void {
            const model = this.lookup[message.topic];
            if (!model) {
                console.error("delete: model not present for topic=" + message.topic);
            }
            model.delete();
            delete this.lookup[message.topic];
        }

    }
}
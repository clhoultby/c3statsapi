namespace connection {

    import DataModel = data.DataModel;

    type topic = string;

    interface ISubscriber {
        subscriptionReady(model: DataModel);
    }

    export class WebSocketConnection {

        private ws: WebSocket;
        private subscribers: Lookup<ISubscriber[]> = {};

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
                        this.subscriptionHandler(message as data.SnapshotMsg);
                        break;

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
            console.log("subscribe: " + topic);

            if (Locator.lookup[topic]) {
                subscriber.subscriptionReady(Locator.lookup[topic]);
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
            Locator.lookup[message.topic] = new DataModel(message.topic, message.data);
            if (message.parentTopic) {
                Locator.lookup[message.parentTopic] && Locator.lookup[message.parentTopic].insert(Locator.lookup[message.topic]);
            }

            for (const c of message.children || []) {
                this.insertModel(c);
            }

        }

        private subscriptionHandler(message: data.SnapshotMsg): void {
            const snapshot = message.data;
            if (!snapshot.topic) {
                console.error(`subscription error for topic: ${message.topic}`);
                return;
            }

            console.log(JSON.stringify(snapshot));

            this.insertModel(snapshot);

            for (const s of this.subscribers[message.topic]) {
                s.subscriptionReady(Locator.lookup[message.topic]);
            }

            this.subscribers[message.topic] = [];
        }

        private insertHandler(message: data.InsertMsg): void {
            this.insertModel(message);
        }

        private updateHandler(message: data.UpdateMsg): void {

            const model = Locator.lookup[message.topic];
            if (!model) {
                console.error("update: model not present for topic=" + message.topic);
                return;
            }

            model.update(message.data);
        }

        private deleteHandler(message: data.DeleteMsg): void {
            const model = Locator.lookup[message.topic];
            if (!model) {
                console.error("delete: model not present for topic=" + message.topic);
            }
            model.delete();
            delete Locator.lookup[message.topic];
        }

    }
}
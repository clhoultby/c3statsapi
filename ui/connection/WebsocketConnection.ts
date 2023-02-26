namespace connection {

    import DataModel = data.DataModel;

    type topic = string;

    interface ISubscriber {
        subscriptionReady(model: DataModel);
        subscriptionError(topic: string);
    }

    export class WebSocketConnection {
        private ws: WebSocket;

        private subscribers = new Map<topic, ISubscriber[]>();

        private lookup = new Map<topic, DataModel>();


        public subscribe(topic: topic, subscriber: ISubscriber) {
            if (this.lookup[topic]) {
                subscriber.subscriptionReady(this.lookup[topic]);
                return;
            }

            if (!this.subscribers[topic]) {
                this.subscribers[topic] = [];
            }

            this.subscribers[topic].push(subscriber);



        }





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

            this.ws.onmessage = (event) => {
                if (!event.data) {
                    console.error("missing data")
                    return;
                }

                const message: data.Msg = JSON.parse(event.data)
                switch (message.msgType) {

                    case MessageType.Subscribe:
                        this.subscriptionHandler(message as data.Snapshot)

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
                        console.log(`Unknown message type: ${event.data}`);
                        break;
                }
            };
        }


        private subscriptionHandler(message: data.Snapshot): void {

            this.lookup[message.topic] = new DataModel(message.topic, message.data);
            for (const child of message.children) {
                this.lookup[child.topic] = new DataModel(child.topic, child.data);
            }

            for (const s of this.subscribers[message.topic]) {
                s.subscriptionReady(this.lookup[message.topic]);
            }
        }

        private insertHandler(message: data.InsertMsg): void {
            const dm = new DataModel(message.topic, message.data);
            this.lookup[message.topic] = dm;
            this.lookup[message.targetTopic] && this.lookup[message.targetTopic].insert(dm);
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
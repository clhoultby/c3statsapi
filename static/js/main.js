var data;
(function (data_1) {
    class DataModel {
        constructor(topic, data) {
            this.topic = topic;
            this.data = data;
            this.children = [];
            this.delegates = [];
        }
        addDelegate(d) {
            this.delegates.push(d);
        }
        getChildren() {
            return this.children;
        }
        childDeleted(child) {
            const i = this.children.indexOf(child);
            if (i === -1) {
                return;
            }
            this.children.splice(i, 1);
        }
        insert(child) {
            this.children.push(child);
            child.parent = this;
            for (const d of this.delegates) {
                d.insert(child);
            }
        }
        delete() {
            for (const d of this.delegates) {
                d.delete();
            }
            this.parent && this.parent.childDeleted(this);
            this.parent = false;
        }
        update(updateData) {
            for (const k in updateData) {
                this.data[k] = updateData[k];
            }
            for (const d of this.delegates) {
                d.update(updateData);
            }
        }
    }
    data_1.DataModel = DataModel;
})(data || (data = {}));
var connection;
(function (connection) {
    let MessageType;
    (function (MessageType) {
        MessageType[MessageType["Subscribe"] = 0] = "Subscribe";
        MessageType[MessageType["Insert"] = 1] = "Insert";
        MessageType[MessageType["Update"] = 2] = "Update";
        MessageType[MessageType["Delete"] = 3] = "Delete";
    })(MessageType = connection.MessageType || (connection.MessageType = {}));
})(connection || (connection = {}));
var connection;
(function (connection) {
    var DataModel = data.DataModel;
    class WebSocketConnection {
        constructor(
        // Delegate, only want one to handle the connect and reconnect 
        delegate, 
        // Websocket API endPoint
        url = "ws://localhost:8080/connect") {
            this.delegate = delegate;
            this.url = url;
            this.subscribers = new Map();
            this.lookup = window.lookup = new Map();
        }
        connnect() {
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
            };
            var reader = new FileReader();
            reader.onload = () => {
                const message = JSON.parse(reader.result);
                switch (message.msgType) {
                    case connection.MessageType.Subscribe:
                        this.subscriptionHandler(message);
                    case connection.MessageType.Insert:
                        this.insertHandler(message);
                        break;
                    case connection.MessageType.Update:
                        this.updateHandler(message);
                        break;
                    case connection.MessageType.Delete:
                        this.deleteHandler(message);
                        break;
                    default:
                        console.log(`Unknown message type: ${message}`);
                        break;
                }
            };
            this.ws.onmessage = (event) => {
                if (!event.data) {
                    console.error("missing data");
                    return;
                }
                reader.readAsBinaryString(event.data);
            };
        }
        subscribe(topic, subscriber) {
            if (this.lookup[topic]) {
                subscriber.subscriptionReady(this.lookup[topic]);
                return;
            }
            if (!this.subscribers[topic]) {
                this.subscribers[topic] = [];
            }
            this.subscribers[topic].push(subscriber);
        }
        addModel() {
        }
        subscriptionHandler(message) {
            debugger;
            this.lookup[message.topic] = new DataModel(message.topic, message.data);
            for (const topic in message.children) {
                const child = message.children[topic];
                this.lookup[topic] = new DataModel(child.topic, child.data);
                this.lookup[message.topic].insert(this.lookup[topic]);
                if (child.parentTopic) {
                    this.lookup[child.parentTopic] && this.lookup[child.parentTopic].insert(this.lookup[topic]);
                }
                if (child.children) {
                    for (const c of child.children) {
                        this.lookup[c.topic] = new DataModel(c.topic, c.data);
                        this.lookup[topic].insert(this.lookup[c.topic]);
                    }
                }
            }
            for (const s of this.subscribers[message.topic]) {
                s.subscriptionReady(this.lookup[message.topic]);
            }
            this.subscribers[message.topic] = [];
        }
        insertHandler(message) {
            const dm = new DataModel(message.topic, message.data);
            this.lookup[message.topic] = dm;
            this.lookup[message.parentTopic] && this.lookup[message.parentTopic].insert(dm);
        }
        updateHandler(message) {
            const model = this.lookup[message.topic];
            if (!model) {
                console.error("update: model not present for topic=" + message.topic);
                return;
            }
            model.update(message.data);
        }
        deleteHandler(message) {
            const model = this.lookup[message.topic];
            if (!model) {
                console.error("delete: model not present for topic=" + message.topic);
            }
            model.delete();
            delete this.lookup[message.topic];
        }
    }
    connection.WebSocketConnection = WebSocketConnection;
})(connection || (connection = {}));
var core;
(function (core) {
    class Component {
        constructor(elementType = "div") {
            this.element = document.createElement(elementType);
            this.element.wrapper = this;
            this.children = [];
            this.styles = [];
        }
        setText(text) {
            window.requestAnimationFrame(() => {
                this.element.innerText = text;
            });
        }
        addStyle(style) {
            this.styles.push(style);
            if (this.commitStyles) {
                return;
            }
            this.commitStyles = true;
            window.requestAnimationFrame(() => {
                this.element.setAttribute("class", this.styles.join(""));
                this.commitStyles = false;
            });
        }
        removeStyle(style) {
            const i = this.styles.indexOf(style);
            if (i === -1) {
                return;
            }
            this.styles.splice(i, 1);
            if (this.commitStyles) {
                return;
            }
            this.commitStyles = true;
            window.requestAnimationFrame(() => {
                this.element.setAttribute("class", this.styles.join(""));
                this.commitStyles = false;
            });
        }
        getElement() {
            return this.element;
        }
        appendChild(child) {
            child.render();
            child.parent = this;
            this.children.push(child);
            window.requestAnimationFrame(() => {
                this.element.appendChild(child.getElement());
            });
        }
        removeChild(child) {
            if (child.parent !== this) {
                console.error("removeChild called for an element that is not a child of target");
                return;
            }
            child.dispose();
            child.parent = false;
            this.children.splice(this.children.indexOf(child), 1);
            this.element.removeChild(child.getElement());
        }
        render() { }
        dispose() {
            for (const c of this.children) {
                c.dispose();
            }
        }
    }
    core.Component = Component;
})(core || (core = {}));
var core;
(function (core) {
    class DataComponent extends core.Component {
        constructor(model, elementType = "div") {
            super(elementType);
            this.model = model;
            model.addDelegate(this);
        }
        insert(model) {
        }
        update(data) {
        }
        delete() {
        }
    }
    core.DataComponent = DataComponent;
})(core || (core = {}));
var stats;
(function (stats) {
    class StatCell extends core.DataComponent {
        constructor(dm) {
            super(dm, "td");
        }
        render() {
            this.addStyle("stats-StatCell");
            this.setText(this.model.data["value"]);
        }
        update(data) {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");
            window.setTimeout(() => {
                this.removeStyle("stats-StatCell-updated");
            }, 5000);
        }
    }
    stats.StatCell = StatCell;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class StatHeader extends core.DataComponent {
        constructor(dm) {
            super(dm, "tr");
        }
        render() {
            this.addStyle("stats-StatHeader");
            for (const c of this.model.getChildren()) {
                const cell = new core.Component("td");
                cell.addStyle("stats-StatHeader_cell");
                cell.setText(c.data["name"]);
                this.appendChild(cell);
            }
        }
    }
    stats.StatHeader = StatHeader;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class StatRow extends core.DataComponent {
        constructor(dm) {
            super(dm, "tr");
        }
        render() {
            this.addStyle("stats-StatRow");
            for (const c of this.model.getChildren()) {
                this.appendChild(new stats.StatCell(c));
            }
        }
    }
    stats.StatRow = StatRow;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class Table extends core.DataComponent {
        constructor(dm) {
            super(dm, "table");
        }
        render() {
            const header = new stats.StatHeader(this.model.getChildren()[0]);
            this.appendChild(header);
            for (const dm of this.model.getChildren()) {
                const row = new stats.StatRow(dm);
                this.appendChild(row);
            }
        }
    }
    stats.Table = Table;
})(stats || (stats = {}));
class Application extends core.Component {
    constructor() {
        super();
        debugger;
        this.element = document.body;
        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        this.connection = new connection.WebSocketConnection({
            onReady: () => this.onWSReady(),
            onError: () => this.onWsError(),
            onDisconnnect: () => this.onWsDisconnect(),
        });
        this.connection.connnect();
    }
    onWsError() {
        console.log("error");
    }
    onWsDisconnect() {
    }
    onWSReady() {
        console.log("ready");
        this.connection.subscribe("stats", this);
    }
    subscriptionReady(dm) {
        const table = new stats.Table(dm);
        this.appendChild(table);
    }
}
window.onload = () => {
    new Application();
};

var data;
(function (data_1) {
    function newUpdateMsg(topic, data) {
        return { msgType: connection.MessageType.Update, topic, data };
    }
    data_1.newUpdateMsg = newUpdateMsg;
    function newInsertMsg(topic, parentTopic, data, children) {
        return {
            msgType: connection.MessageType.Insert,
            topic,
            parentTopic,
            data,
            children
        };
    }
    data_1.newInsertMsg = newInsertMsg;
    function newDeleteMsg(topic) {
        return { msgType: connection.MessageType.Delete, topic };
    }
    data_1.newDeleteMsg = newDeleteMsg;
})(data || (data = {}));
var data;
(function (data_2) {
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
        removeDelete(d) {
            const i = this.delegates.indexOf(d);
            if (i === -1) {
                return;
            }
            this.delegates.splice(i, 1);
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
    data_2.DataModel = DataModel;
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
            this.ws.send(connection.MessageType.Subscribe + topic);
        }
        sendMsg(msg) {
            this.ws.send(msg.msgType + JSON.stringify(msg));
        }
        insertModel(message) {
            this.lookup[message.topic] = new DataModel(message.topic, message.data);
            if (message.parentTopic) {
                this.lookup[message.parentTopic] && this.lookup[message.parentTopic].insert(this.lookup[message.topic]);
            }
            for (const topic in message.children) {
                this.insertModel(message.children[topic]);
            }
        }
        subscriptionHandler(message) {
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
        insertHandler(message) {
            this.insertModel(message);
        }
        updateHandler(message) {
            debugger;
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
                this.element.setAttribute("class", this.styles.join(" "));
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
        sendUpdate(u) {
            let application;
            application = window.application;
            if (!application) {
                debugger;
                return;
            }
            application.sendMsg(u);
        }
    }
    core.DataComponent = DataComponent;
})(core || (core = {}));
var header;
(function (header) {
    var Component = core.Component;
    class Header extends Component {
        constructor() {
            super(...arguments);
            this.baseStyle = "header-Header";
        }
        render() {
            this.addStyle(this.baseStyle);
            const logo = new Component();
            logo.addStyle(this.baseStyle + "_logo");
            this.appendChild(logo);
            const container = new Component();
            container.addStyle(this.baseStyle + "_container");
            this.appendChild(container);
            const title = new Component();
            title.addStyle(this.baseStyle + "_title");
            title.setText("Evermere");
            container.appendChild(title);
            const subTitle = new Component();
            subTitle.addStyle(this.baseStyle + "_subtitle");
            subTitle.setText("The Last Titan");
            container.appendChild(subTitle);
        }
    }
    header.Header = Header;
})(header || (header = {}));
var stats;
(function (stats) {
    var Component = core.Component;
    class CharCell extends core.DataComponent {
        constructor() {
            super(...arguments);
            this.baseStyle = "stats-CharCell";
        }
        render() {
            this.addStyle(this.baseStyle);
            const img = new Component();
            img.addStyle(this.baseStyle + "_img");
            img.getElement().setAttribute("style", `background-image:url("${this.model.data["img"]}")`);
            this.appendChild(img);
            const name = new Component();
            name.addStyle(this.baseStyle + "_name");
            name.setText(this.model.data["name"]);
            this.appendChild(name);
            const secondName = new Component();
            secondName.addStyle(this.baseStyle + "_secondname");
            secondName.setText(this.model.data["secondName"] || "");
            this.appendChild(secondName);
        }
    }
    stats.CharCell = CharCell;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class CharColumn extends core.DataComponent {
        render() {
            this.addStyle("stats-CharColumn");
            const header = new stats.CharCell(this.model);
            this.appendChild(header);
            for (const c of this.model.getChildren()) {
                this.appendChild(new stats.StatCell(c));
            }
        }
    }
    stats.CharColumn = CharColumn;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class StatCell extends core.DataComponent {
        constructor(dm) {
            super(dm, "input");
        }
        render() {
            this.addStyle("stats-StatCell");
            this.element.setAttribute("inputmode", "numeric");
            this.element.value = this.model.data["value"];
            this.element.onblur = e => this.onChangeHandler(e);
            this.element.onfocus = e => this.element.value = "";
        }
        update(data) {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");
            window.setTimeout(() => {
                this.removeStyle("stats-StatCell-updated");
            }, 1000);
        }
        setText(text) {
            window.requestAnimationFrame(() => {
                this.element.value = text;
            });
        }
        onChangeHandler(e) {
            const v = this.element.value && this.element.value.trim();
            if (!v) {
                this.element.value = this.model.data["value"];
                return;
            }
            else if (v == this.model.data["value"]) {
                return;
            }
            const msg = data.newUpdateMsg(this.model.topic, { "value": v });
            this.sendUpdate(msg);
        }
    }
    stats.StatCell = StatCell;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class StatDescCell extends core.DataComponent {
        constructor(dm) {
            super(dm);
        }
        render() {
            this.addStyle("stats-StatDescCell");
            this.setText(this.model.data["name"]);
        }
    }
    stats.StatDescCell = StatDescCell;
})(stats || (stats = {}));
var stats;
(function (stats) {
    var Component = core.Component;
    class StatDescColumn extends core.DataComponent {
        constructor(dm) {
            super(dm);
            this.baseStyle = "stats-StatDescColumn";
        }
        render() {
            this.addStyle(this.baseStyle);
            const header = new Component();
            header.addStyle(this.baseStyle + "_header");
            this.appendChild(header);
            for (const c of this.model.getChildren()) {
                this.appendChild(new stats.StatDescCell(c));
            }
        }
    }
    stats.StatDescColumn = StatDescColumn;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class StatHeader extends core.DataComponent {
        constructor(dm) {
            super(dm);
        }
        render() {
            this.addStyle("stats-StatHeader");
            const cell = new core.Component("td");
            cell.addStyle("stats-StatHeader_charcell");
            cell.setText("Character");
            this.appendChild(cell);
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
    class Table extends core.DataComponent {
        constructor(dm) {
            super(dm);
        }
        render() {
            this.addStyle("stats-Table");
            const children = this.model.getChildren();
            const statDescColumn = new stats.StatDescColumn(children[0]);
            this.appendChild(statDescColumn);
            for (let i = 1; i < children.length; i++) {
                this.appendChild(new stats.CharColumn(children[i]));
            }
        }
    }
    stats.Table = Table;
})(stats || (stats = {}));
class Application extends core.Component {
    constructor() {
        super();
        this.element = document.body;
        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        this.connection = new connection.WebSocketConnection({
            onReady: () => this.onWSReady(),
            onError: () => this.onWsError(),
            onDisconnnect: () => this.onWsDisconnect(),
        }, "ws://" + document.location.host + "/connect");
        this.connection.connnect();
    }
    onWsError() {
        console.log("error");
    }
    onWsDisconnect() {
        document.body.removeChild(this.element);
        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        this.connection = new connection.WebSocketConnection({
            onReady: () => this.onWSReady(),
            onError: () => this.onWsError(),
            onDisconnnect: () => this.onWsDisconnect(),
        }, "ws://" + document.location.host + "/connect");
        this.connection.connnect();
    }
    onWSReady() {
        this.connection.subscribe("STATS", this);
        this.appendChild(new header.Header());
    }
    subscriptionReady(dm) {
        const table = new stats.Table(dm);
        this.appendChild(table);
    }
    sendMsg(msg) {
        this.connection.sendMsg(msg);
    }
}
window.onload = () => {
    window.application = new Application();
};

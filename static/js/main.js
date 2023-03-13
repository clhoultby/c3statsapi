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
        removeDelegate(d) {
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
            Locator.connection.sendMsg(u);
        }
        dispose() {
            this.model.removeDelegate(this);
            super.dispose();
        }
    }
    core.DataComponent = DataComponent;
})(core || (core = {}));
var core;
(function (core) {
    class Page extends core.Component {
        render() {
            this.addStyle("core-Page");
        }
        navigateTo(topic) {
        }
    }
    core.Page = Page;
})(core || (core = {}));
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
            this.subscribers = {};
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
                console.log(message);
                switch (message.msgType) {
                    case connection.MessageType.Subscribe:
                        this.subscriptionHandler(message);
                        break;
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
        sendMsg(msg) {
            this.ws.send(msg.msgType + JSON.stringify(msg));
        }
        insertModel(message) {
            Locator.lookup[message.topic] = new DataModel(message.topic, message.data);
            if (message.parentTopic) {
                Locator.lookup[message.parentTopic] && Locator.lookup[message.parentTopic].insert(Locator.lookup[message.topic]);
            }
            for (const c of message.children || []) {
                this.insertModel(c);
            }
        }
        subscriptionHandler(message) {
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
        insertHandler(message) {
            this.insertModel(message);
        }
        updateHandler(message) {
            const model = Locator.lookup[message.topic];
            if (!model) {
                console.error("update: model not present for topic=" + message.topic);
                return;
            }
            model.update(message.data);
        }
        deleteHandler(message) {
            const model = Locator.lookup[message.topic];
            if (!model) {
                console.error("delete: model not present for topic=" + message.topic);
            }
            model.delete();
            delete Locator.lookup[message.topic];
        }
    }
    connection.WebSocketConnection = WebSocketConnection;
})(connection || (connection = {}));
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
            const topRow = new Component();
            topRow.addStyle(this.baseStyle + "_TopRow");
            this.appendChild(topRow);
            const logo = new Component();
            logo.addStyle(this.baseStyle + "_logo");
            topRow.appendChild(logo);
            const container = new Component();
            container.addStyle(this.baseStyle + "_container");
            topRow.appendChild(container);
            const title = new Component();
            title.addStyle(this.baseStyle + "_title");
            title.setText("Evermere");
            container.appendChild(title);
            const subTitle = new Component();
            subTitle.addStyle(this.baseStyle + "_subtitle");
            subTitle.setText("The Last Titan");
            container.appendChild(subTitle);
            this.appendChild(new header.NavigationBar());
        }
    }
    header.Header = Header;
})(header || (header = {}));
var header;
(function (header) {
    var Component = core.Component;
    class NavigationBar extends Component {
        constructor() {
            super(...arguments);
            this.baseStyle = "header-NavigationBar";
            this.links = {
                "STATS": { name: "Stats", component: new Component() },
                "CO": { name: "Characters", component: new Component() },
            };
        }
        render() {
            this.addStyle(this.baseStyle);
            for (const l in this.links) {
                const c = this.links[l].component;
                c.addStyle(this.baseStyle + "_Link");
                c.setText(this.links[l].name);
                c.getElement().onclick = () => {
                    Locator.navigationManager.navigateTo(l);
                };
                this.appendChild(c);
            }
            Locator.navigationManager.addDelegate(this);
        }
        navigationChanged(key) {
            for (const link in this.links) {
                const c = this.links[link].component;
                if (link === key) {
                    c.addStyle(this.baseStyle + "-Selected");
                }
                else {
                    c.removeStyle(this.baseStyle + "-Selected");
                }
            }
        }
    }
    header.NavigationBar = NavigationBar;
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
            const container = new Component();
            container.addStyle(this.baseStyle + "_container");
            const name = new Component();
            name.addStyle(this.baseStyle + "_name");
            name.setText(this.model.data["name"]);
            container.appendChild(name);
            const secondName = new Component();
            secondName.addStyle(this.baseStyle + "_secondname");
            secondName.setText(this.model.data["secondName"] || "");
            container.appendChild(secondName);
            this.element.onclick = e => {
                Locator.navigationManager.navigateTo("#CO");
            };
            this.appendChild(container);
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
            this.element.setAttribute("type", "number");
            this.element.value = this.model.data["value"];
            this.element.onblur = e => this.onBlurHandler(e);
            this.element.onkeyup = e => this.onKeyUpHandler(e);
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
        onKeyUpHandler(e) {
            if (e.key === "Enter") {
                this.element.blur();
            }
        }
        onBlurHandler(e) {
            let v = this.element.value && this.element.value.trim();
            if (isNaN(+v - parseFloat(v))) {
                this.element.value = this.model.data["value"];
                return;
            }
            else if (!v) {
                this.element.value = this.model.data["value"];
                return;
            }
            // remove any prefix 0's
            v = +v + "";
            if (v == this.model.data["value"]) {
                this.element.value = v;
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
    class StatsPage extends core.Page {
        render() {
            this.addStyle("stats-StatsPage");
        }
        navigateTo(topic) {
            Locator.connection.subscribe("STATS", this);
        }
        subscriptionReady(dm) {
            const table = new stats.Table(dm);
            this.appendChild(table);
        }
    }
    stats.StatsPage = StatsPage;
})(stats || (stats = {}));
var stats;
(function (stats) {
    class Table extends core.DataComponent {
        constructor(dm) {
            super(dm);
            this.baseStyle = "stats-Table";
        }
        render() {
            this.addStyle(this.baseStyle);
            const children = this.model.getChildren();
            const statDescColumn = new stats.StatDescColumn(children[0]);
            this.appendChild(statDescColumn);
            const scrollcontainer = new core.Component();
            scrollcontainer.addStyle(this.baseStyle + "_ScrollContainer");
            for (let i = 1; i < children.length; i++) {
                scrollcontainer.appendChild(new stats.CharColumn(children[i]));
            }
            this.appendChild(scrollcontainer);
        }
    }
    stats.Table = Table;
})(stats || (stats = {}));
var characteroverview;
(function (characteroverview) {
    var Page = core.Page;
    class CharacterOverviewPage extends Page {
        render() {
            super.render();
            this.addStyle("co-CharacterOverviewPage");
        }
        navigateTo(topic) {
            Locator.connection.subscribe("CO", this);
        }
        subscriptionReady(dm) {
            for (const model of dm.getChildren()) {
                const c = new characteroverview.OVCharacter(model);
                this.appendChild(c);
            }
        }
    }
    characteroverview.CharacterOverviewPage = CharacterOverviewPage;
})(characteroverview || (characteroverview = {}));
var characteroverview;
(function (characteroverview) {
    var DataComponent = core.DataComponent;
    var Component = core.Component;
    class OVCharacter extends DataComponent {
        constructor() {
            super(...arguments);
            this.baseStyle = "co-OVCharacter";
        }
        render() {
            this.addStyle(this.baseStyle);
            const header = new Component();
            header.addStyle(this.baseStyle + "_Header");
            this.appendChild(header);
            const image = new Component();
            image.addStyle(this.baseStyle + "_Image");
            image.getElement().setAttribute("style", `background-image:url("${this.model.data["img"]}")`);
            header.appendChild(image);
            const detailsWrapper = new Component();
            detailsWrapper.addStyle(this.baseStyle + "_Details");
            header.appendChild(detailsWrapper);
            const name = new Component();
            name.addStyle(this.baseStyle + "_Name");
            name.setText(this.model.data["name"] + " " + this.model.data["secondname"] || "");
            detailsWrapper.appendChild(name);
            const classDetails = new Component();
            classDetails.addStyle(this.baseStyle + "_ClassDetails");
            detailsWrapper.appendChild(classDetails);
            const level = new Component();
            level.addStyle(this.baseStyle + "_Level");
            level.setText(`Level ${this.model.data["level"]}`);
            classDetails.appendChild(level);
            const classDetailsDivider = new Component();
            classDetailsDivider.addStyle(this.baseStyle + "_ClassDetailsDivider");
            classDetailsDivider.setText("|");
            classDetails.appendChild(classDetailsDivider);
            const race = new Component();
            race.addStyle(this.baseStyle + "_Race");
            race.setText(this.model.data["race"]);
            classDetails.appendChild(race);
            const classDescription = new Component();
            classDescription.addStyle(this.baseStyle + "_ClassDescription");
            classDescription.setText(this.model.data["class"]);
            detailsWrapper.appendChild(classDescription);
            const health = new Component();
            health.addStyle(this.baseStyle + "_Health");
            header.appendChild(health);
            const healthValue = new Component();
            healthValue.addStyle(this.baseStyle + "_HealthValue");
            healthValue.setText(this.model.data["maxhp"]);
            health.appendChild(healthValue);
            const healthLabel = new Component();
            healthLabel.addStyle(this.baseStyle + "_HealthLabel");
            healthLabel.setText("Max HP");
            health.appendChild(healthLabel);
            const passiveStats = new characteroverview.StatsContainer(this.model, 0, 5);
            passiveStats.addStyle(this.baseStyle + "_Passive");
            this.appendChild(passiveStats);
            const attributes = new characteroverview.StatsContainer(this.model, 5, this.model.getChildren().length);
            attributes.addStyle(this.baseStyle + "_Attributes");
            this.appendChild(attributes);
        }
    }
    characteroverview.OVCharacter = OVCharacter;
})(characteroverview || (characteroverview = {}));
var characteroverview;
(function (characteroverview) {
    var Component = core.Component;
    class Stat extends core.DataComponent {
        constructor() {
            super(...arguments);
            this.baseStyle = "co-Stat";
        }
        render() {
            this.addStyle(this.baseStyle);
            const value = new Component();
            value.addStyle(this.baseStyle + "_Value");
            value.setText(this.model.data["value"]);
            this.appendChild(value);
            const desc = new Component();
            desc.addStyle(this.baseStyle + "_Desc");
            desc.setText(this.model.data["desc"]);
            this.appendChild(desc);
        }
    }
    characteroverview.Stat = Stat;
})(characteroverview || (characteroverview = {}));
var characteroverview;
(function (characteroverview) {
    class StatsContainer extends core.DataComponent {
        constructor(model, startIndex, endIndex) {
            super(model);
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.baseStyle = "co-StatsContainer";
        }
        render() {
            this.addStyle(this.baseStyle);
            for (let i = this.startIndex; i < this.endIndex; i++) {
                this.appendChild(new characteroverview.Stat(this.model.getChildren()[i]));
            }
        }
    }
    characteroverview.StatsContainer = StatsContainer;
})(characteroverview || (characteroverview = {}));
var navigation;
(function (navigation) {
    class NavigationManager {
        constructor() {
            this.pages = {
                "STATS": stats.StatsPage,
                "CO": characteroverview.CharacterOverviewPage
            };
            this.delegates = [];
        }
        addDelegate(delegate) {
            this.delegates.push(delegate);
            delegate.navigationChanged(this.currentKey);
        }
        getCurrentLocation() {
            return this.currentKey;
        }
        setRoot(root) {
            this.root = root;
            // window.onhashchange = e => {
            //     const [_, page, topic] = location.hash.split("#");
            //     this.navigateTo(page || "STATS", topic || "");
            // };
        }
        navigateTo(key, topic) {
            if (key.startsWith("#")) {
                key = key.substring(1);
            }
            if (key === this.currentKey) {
                return;
            }
            const page = this.pages[key];
            if (!page) {
                console.error("unsupported pageType");
                return;
            }
            if (this.currentPage) {
                this.root.removeChild(this.currentPage);
            }
            this.root.appendChild(this.currentPage = new page());
            this.currentPage.navigateTo(topic);
            location.hash = this.currentKey = key;
            for (const d of this.delegates) {
                d.navigationChanged(key);
            }
        }
    }
    navigation.NavigationManager = NavigationManager;
})(navigation || (navigation = {}));
class Application extends core.Component {
    constructor() {
        super();
        this.reconnectID = -1;
        document.body.appendChild(this.element);
        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        Locator.connection = new connection.WebSocketConnection({
            onReady: () => this.onWSReady(),
            onError: () => this.onWsError(),
            onDisconnnect: () => this.onWsDisconnect(),
        }, "ws://" + document.location.host + "/connect");
        Locator.connection.connnect();
        this.appendChild(new header.Header());
        Locator.navigationManager.setRoot(this);
    }
    onWsError() {
        console.error("WS Error: attempting reconnect");
        this.reconnect();
    }
    onWsDisconnect() {
        console.error("WS disconnect: attempting reconnect");
        this.reconnect();
    }
    reconnect() {
        console.error("reconnectID: " + this.reconnectID);
        if (this.reconnectID !== -1) {
            return;
        }
        this.reconnectID = window.setTimeout(() => {
            this.reconnectID = -1;
            this.reconnect();
        }, 2000);
        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        Locator.connection = new connection.WebSocketConnection({
            onReady: () => this.onWSReady(),
            onError: () => this.onWsError(),
            onDisconnnect: () => this.onWsDisconnect(),
        }, "ws://" + document.location.host + "/connect");
        Locator.connection.connnect();
    }
    onWSReady() {
        Locator.navigationManager.navigateTo(location.hash || "STATS");
        if (this.reconnectID !== -1) {
            window.clearTimeout(this.reconnectID);
            this.reconnectID = -1;
        }
    }
}
window.onload = () => {
    window.application = new Application();
};
class Locator {
}
Locator.navigationManager = new navigation.NavigationManager();
Locator.lookup = {};

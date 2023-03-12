


class Application extends core.Component {

    private reconnectID: number = -1;

    constructor() {
        super();

        document.body.appendChild(this.element);

        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        Locator.connection = new connection.WebSocketConnection(
            {
                onReady: () => this.onWSReady(),
                onError: () => this.onWsError(),
                onDisconnnect: () => this.onWsDisconnect(),
            },
            "ws://" + document.location.host + "/connect"
        );

        Locator.connection.connnect();
        this.appendChild(new header.Header());

        Locator.navigationManager.setRoot(this);
    }


    public onWsError(): void {
        console.error("WS Error: attempting reconnect");
        this.reconnect();
    }


    public onWsDisconnect(): void {
        console.error("WS disconnect: attempting reconnect");
        this.reconnect();
    }

    public reconnect(): void {
        console.error("reconnectID: " + this.reconnectID);
        if (this.reconnectID !== -1) {
            return;
        }

        this.reconnectID = window.setTimeout(() => {
            this.reconnectID = -1;
            this.reconnect();
        }, 2000);

        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        Locator.connection = new connection.WebSocketConnection(
            {
                onReady: () => this.onWSReady(),
                onError: () => this.onWsError(),
                onDisconnnect: () => this.onWsDisconnect(),
            },
            "ws://" + document.location.host + "/connect"
        );

        Locator.connection.connnect();
    }

    public onWSReady(): void {
        Locator.navigationManager.navigateTo(location.hash || "#STATS");

        if (this.reconnectID !== -1) {
            window.clearTimeout(this.reconnectID);
            this.reconnectID = -1;
        }
    }
}


window.onload = () => {
    (window as any).application = new Application();
}
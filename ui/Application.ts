


class Application extends core.Component {

    private connection: connection.WebSocketConnection;

    constructor() {
        super();

        document.body.appendChild(this.element);

        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        this.connection = new connection.WebSocketConnection(
            {
                onReady: () => this.onWSReady(),
                onError: () => this.onWsError(),
                onDisconnnect: () => this.onWsDisconnect(),
            },
            "ws://" + document.location.host + "/connect"
        );

        this.connection.connnect();
    }


    public onWsError(): void {
        console.log("error");
    }

    public onWsDisconnect(): void {

        document.body.removeChild(this.element);
         // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
         this.connection = new connection.WebSocketConnection(
            {
                onReady: () => this.onWSReady(),
                onError: () => this.onWsError(),
                onDisconnnect: () => this.onWsDisconnect(),
            },
            "ws://" + document.location.host + "/connect"
        );

        this.connection.connnect();
    }

    public onWSReady(): void {
        this.connection.subscribe("STATS", this);
        this.appendChild(new header.Header());
    }

    public subscriptionReady(dm: data.DataModel): void {
        const table = new stats.Table(dm);
        this.appendChild(table);
    }

    public sendMsg(msg: data.Msg): void {
        this.connection.sendMsg(msg);
    }
}


window.onload = () => {
    (window as any).application = new Application();
}
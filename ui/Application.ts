class Application extends core.Component {

    private connection: connection.WebSocketConnection;

    constructor() {
        super();

        this.element = document.body;

        // almost certainly do this better with a proper delegate, don't think we're at risk of losing scope here.
        this.connection = new connection.WebSocketConnection(
            {
                onReady: () => this.onWSReady(),
                onError: () => this.onWsError(),
                onDisconnnect: () => this.onWsDisconnect(),
            }
        );
    }


    public onWsError(): void {
        console.log("error");
    }

    public onWsDisconnect(): void {

    }

    public onWSReady(): void {
        console.log("ready");
    }


}
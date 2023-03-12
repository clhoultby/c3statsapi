


class Application extends core.Component {

    private connection: connection.WebSocketConnection;

    private reconnectID: number = -1;

    private scrollContainer: core.Component;

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
        this.appendChild(new header.Header());
    }


    public onWsError(): void {
        console.error("WS Error: attempting reconnect");
        this.reconnect();
    }
       

    public onWsDisconnect(): void {
        console.error("WS disconnect: attempting reconnect");

        try {
            this.scrollContainer && this.removeChild(this.scrollContainer);
        } catch (e) {

        }

        this.reconnect();
      
    }

    public reconnect(): void {
        console.error("reconnectID: " + this.reconnectID);
        if (this.reconnectID !== -1) {
            return;
        }

        this.reconnectID = window.setTimeout(()=> {
            this.reconnectID = -1;
            this.reconnect();
        }, 2000);

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
        
        if (this.reconnectID !== -1) {
            window.clearTimeout(this.reconnectID);
            this.reconnectID = -1;
        }
    }

    public subscriptionReady(dm: data.DataModel): void {
        this.scrollContainer = new core.Component();
        this.scrollContainer.addStyle("application_container");
        this.appendChild(this.scrollContainer);

        const table = new stats.Table(dm);
        this.scrollContainer.appendChild(table);
    }

    public sendMsg(msg: data.Msg): void {
        this.connection.sendMsg(msg);
    }
}


window.onload = () => {
    (window as any).application = new Application();
}
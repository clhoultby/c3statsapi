


class Application extends core.Component {

    private connection: connection.WebSocketConnection;

    private reconnectID: number = -1;

    constructor() {
        super();


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
        console.error("WS Error: attempting reconnect");
        this.reconnect();
    }
       

    public onWsDisconnect(): void {
        console.error("WS disconnect: attempting reconnect");

        try {
            document.body.removeChild(this.element);
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
        document.body.appendChild(this.element);

        this.connection.subscribe("STATS", this);
        this.appendChild(new header.Header());

        if (this.reconnectID !== -1) {
            window.clearTimeout(this.reconnectID);
            this.reconnectID = -1;
        }
    }

    public subscriptionReady(dm: data.DataModel): void {
        const scrollcontainer = new core.Component();
        scrollcontainer.addStyle("application_container");
        this.appendChild(scrollcontainer);

        const table = new stats.Table(dm);
        scrollcontainer.appendChild(table);
    }

    public sendMsg(msg: data.Msg): void {
        this.connection.sendMsg(msg);
    }
}


window.onload = () => {
    (window as any).application = new Application();
}
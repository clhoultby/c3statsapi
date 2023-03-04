package main

import (
	"flag"
	"net/http"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
	"c3statsapi/publisher"
	"c3statsapi/stats"
)

var wsUpgrader = websocket.Upgrader{}

func main() {

	var port string
	flag.StringVar(&port, "port", "8080", "http port")
	flag.Parse()

	// API Initialisation
	chars := data.GetCharacters()
	stats.Init(chars)

	go publisher.Listen()

	// Web Handlers
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", cors(fs))

	http.HandleFunc("/connect", wsConnectionHandler)

	http.ListenAndServe(":"+port, nil)

}

func cors(fs http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fs.ServeHTTP(w, r)
	}
}

func wsConnectionHandler(w http.ResponseWriter, r *http.Request) {

	ws, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	publisher.AddConnection(ws)
}

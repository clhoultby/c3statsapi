package main

import (
	"flag"
	"net/http"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
	"c3statsapi/publisher"
)

var wsUpgrader = websocket.Upgrader{}

func main() {

	var port string
	flag.StringVar(&port, "port", "8080", "http port")

	flag.Parse()

	populateStats()

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.HandleFunc("/connect", wsConnectionHandler)

	http.ListenAndServe(":"+port, nil)

}

func wsConnectionHandler(w http.ResponseWriter, r *http.Request) {

	ws, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	publisher.AddConnection(ws)
}

func populateStats() {

	topics := []*publisher.Topic{}

	for _, c := range data.GetCharacters() {

		t := &publisher.Topic{
			ID:   c.Topic(),
			Data: c.Data(),
		}

		topics = append(topics, t)
		for _, s := range c.Stats {
			st := &publisher.Topic{
				ID:          s.Topic(),
				ParentTopic: c.Topic(),
				Data:        s.Data(),
			}

			t.AddChild(st)
		}
	}

	publisher.InitialPopulate(topics)

}

package main

import (
	"flag"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"

	"c3statsapi/publisher"
)

var (
	wsUpgrader = websocket.Upgrader{}
	epoch      = time.Unix(0, 0).Format(time.RFC1123)

	noCacheHeaders = map[string]string{
		"Expires":         epoch,
		"Cache-Control":   "no-cache, private, max-age=0",
		"Pragma":          "no-cache",
		"X-Accel-Expires": "0",
	}
)

func main() {

	var port string
	flag.StringVar(&port, "port", "8080", "http port")
	flag.Parse()

	// API Initialisation
	// chars := data.GetCharacters()
	// stats.Init(chars)

	publisher.RestoreFromFile()

	go publisher.Listen()

	// Web Handlers
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", NoCache(cors(fs)))

	http.HandleFunc("/save", func(w http.ResponseWriter, r *http.Request) {
		publisher.SaveState()
	})

	http.HandleFunc("/connect", wsConnectionHandler)
	http.ListenAndServe(":"+port, nil)

}

func cors(fs http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fs.ServeHTTP(w, r)
	}
}

func NoCache(h http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {

		if !strings.Contains(r.RequestURI, "/img/") {
			for k, v := range noCacheHeaders {
				w.Header().Set(k, v)
			}
		}
		h.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}

func wsConnectionHandler(w http.ResponseWriter, r *http.Request) {

	ws, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	publisher.AddConnection(ws)
}

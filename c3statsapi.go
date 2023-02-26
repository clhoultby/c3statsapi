package main

import (
	"flag"
	"net/http"
)

func main() {

	var port string
	flag.StringVar(&port, "port", "8080", "http port")

	flag.Parse()

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.ListenAndServe(":"+port, nil)

}

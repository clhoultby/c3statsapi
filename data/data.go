package data

import "fmt"

func newChar(id int, name string) *Char {
	return &Char{
		ID:     id,
		Name:   name,
		ImgURL: fmt.Sprintf("char_%v.jpg", id),
	}
}

type Char struct {
	ID     int    `json:"Id"`
	ImgURL string `json:"img"`
	Name   string `json:"name"`
	Stats  []Stat `json:"stats"`
}

type Stat struct {
	StatTypeID int `json:"Id"`
	CharID     int `json:"charId"`
	Value      int `json:"value"`
}

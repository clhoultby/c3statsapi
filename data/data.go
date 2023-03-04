package data

import (
	"fmt"
	"strings"
	"sync"
)

const (
	StatTypeHits   = 0
	StatTypeCrits  = 1
	StatTypeDamage = 2
	StatTypeKills  = 3
	StatTypeHPLost = 4
)

var model = &DataModel{
	characters: []*Char{
		NewChar(0, "Aldrick", "Wright"),
		NewChar(1, "Aranris", "Mistarelthwin"),
		NewChar(2, "Hoots", ""),
		NewChar(3, "Kdaav", "Paal Vadu"),
		NewChar(4, "Elendar", "Mor"),
		NewChar(5, "Ofeliya", "Wolfram"),
	},
}

type DataModel struct {
	Mutex      sync.Mutex
	characters []*Char
}

func GetCharacters() []*Char {
	model.Mutex.Lock()
	defer model.Mutex.Unlock()

	return model.characters
}

func (m *DataModel) AddChar(c *Char) {
	m.Mutex.Lock()
	defer m.Mutex.Unlock()
	m.characters = append(m.characters, c)
}

func NewChar(id int, name string, secondName string) *Char {
	return &Char{
		ID:         id,
		FirstName:  name,
		SecondName: secondName,
		ImgURL:     fmt.Sprintf("/img/char_%v.jpg", strings.ToLower(name)),
		Stats: map[int]*Stat{
			StatTypeHits:   NewStat(StatTypeHits, id, "Hits", "0"),
			StatTypeCrits:  NewStat(StatTypeCrits, id, "Crits", "0"),
			StatTypeDamage: NewStat(StatTypeDamage, id, "Damage", "0"),
			StatTypeKills:  NewStat(StatTypeDamage, id, "Kills", "0"),
		},
	}
}

func (c *Char) AddStat(typeID int, name string, value string) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	c.Stats[typeID] = NewStat(typeID, c.ID, name, value)
}

type Char struct {
	Mutex      sync.Mutex    `json:"-"`
	ID         int           `json:"id"`
	ImgURL     string        `json:"img"`
	FirstName  string        `json:"name"`
	SecondName string        `json:"second_name"`
	Stats      map[int]*Stat `json:"stats"`
}

func (c *Char) Topic() string {
	return fmt.Sprintf("C%v", c.ID)
}

func (c *Char) Data() map[string]string {
	return map[string]string{
		"id":   fmt.Sprint(c.ID),
		"img":  c.ImgURL,
		"name": c.FirstName,
	}
}

// Stat is a
type Stat struct {
	Mutex      sync.Mutex `json:"-"`
	StatTypeID string     `json:"id"`
	CharID     string     `json:"cId"`
	Value      string     `json:"value"`
	Name       string     `json:"name"`
}

func (s *Stat) Topic() string {
	return fmt.Sprintf("S%v_C%v", s.StatTypeID, s.CharID)
}

func (s *Stat) Data() map[string]string {
	return map[string]string{
		"id":    s.StatTypeID,
		"name":  s.Name,
		"value": s.Value,
		"cId":   s.CharID,
	}
}

func (s *Stat) Update(value string) {
	s.Mutex.Lock()
	defer s.Mutex.Unlock()
	s.Value = value
}

func NewStat(statTypeID int, charId int, name, value string) *Stat {
	return &Stat{
		StatTypeID: fmt.Sprint(statTypeID),
		CharID:     fmt.Sprint(charId),
		Name:       name,
		Value:      value,
	}
}

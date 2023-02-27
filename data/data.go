package data

import (
	"encoding/json"
	"fmt"
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
		NewChar(0, "Aldrick Wright"),
		NewChar(1, "Aranris"),
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

func NewChar(id int, name string) *Char {
	return &Char{
		ID:     id,
		Name:   name,
		ImgURL: fmt.Sprintf("char_%v.jpg", id),
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
	Mutex  sync.Mutex    `json:"-"`
	ID     int           `json:"id"`
	ImgURL string        `json:"img"`
	Name   string        `json:"name"`
	Stats  map[int]*Stat `json:"stats"`
}

func (c *Char) Topic() string {
	return fmt.Sprintf("C%v", c.ID)
}

func (c *Char) Data() json.RawMessage {
	out, err := json.Marshal(c)
	if err != nil {
		fmt.Printf("char err %v", err)
	}

	return out
}

// Stat is a
type Stat struct {
	Mutex      sync.Mutex `json:"-"`
	StatTypeID int        `json:"id"`
	CharID     int        `json:"cId"`
	Value      string     `json:"value"`
	Name       string     `json:"name"`
}

func (s *Stat) Topic() string {
	return fmt.Sprintf("S%v_C%v", s.StatTypeID, s.CharID)
}

func (s *Stat) Data() json.RawMessage {
	out, err := json.Marshal(s)
	if err != nil {
		fmt.Printf("stat err %v", err)
	}

	return out
}

func (s *Stat) Update(value string) {
	s.Mutex.Lock()
	defer s.Mutex.Unlock()
	s.Value = value
}

func NewStat(statTypeID int, charId int, name, value string) *Stat {
	return &Stat{
		CharID: charId,
		Name:   name,
		Value:  value,
	}
}

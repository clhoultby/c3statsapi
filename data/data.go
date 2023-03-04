package data

import (
	"fmt"
	"strings"
	"sync"
)

const (
	StatTypeHits              = 0
	StatTypeCrits             = 1
	StatTypeDamage            = 2
	StatTypeKills             = 3
	StatTypeHPLost            = 4
	StatTypeHealedAlly        = 5
	StatTypeKOs               = 6
	StatTypeDeathSaveSuccess  = 7
	StatTypeDeathSaveFail     = 8
	StatTypePerceptionSuccess = 9
	StatTypePerceptionFail    = 10
	StatTypeWizSaveSuccess    = 11
	StatTypeWizSaveFail       = 12
	StatTypeConSaveSuccess    = 13
	StatTypeConSaveFail       = 14
	StatTypeDexSaveSuccess    = 15
	StatTypeDexSaveFail       = 16
	StatTypeStrSaveSuccess    = 17
	StatTypeStrSaveFail       = 18
	StatTypeIntSaveSuccess    = 19
	StatTypeIntSaveFail       = 20
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
		Stats: []*Stat{
			NewStat(StatTypeHits, id, "Hits", "0"),
			NewStat(StatTypeCrits, id, "Crits", "0"),
			NewStat(StatTypeDamage, id, "Damage", "0"),
			NewStat(StatTypeKills, id, "Kills", "0"),
			NewStat(StatTypeHPLost, id, "HP Lost", "0"),
			NewStat(StatTypeHealedAlly, id, "Healed Ally", "0"),
			NewStat(StatTypeKOs, id, "KOs", "0"),
			// StatTypeDeathSaveSuccess:  NewStat(StatTypeDeathSaveSuccess, id, "Death Saves Suceeded", "0"),
			// StatTypeDeathSaveFail:     NewStat(StatTypeDeathSaveFail, id, "Death Saves Failed", "0"),
			// StatTypePerceptionSuccess: NewStat(StatTypePerceptionSuccess, id, "Perception Success", "0"),
			// StatTypePerceptionFail:    NewStat(StatTypePerceptionFail, id, "Perception failures", "0"),
			// StatTypeWizSaveSuccess:    NewStat(StatTypeWizSaveSuccess, id, "Wiz Saves Success", "0"),
			// StatTypeWizSaveFail:       NewStat(StatTypeWizSaveFail, id, "Wiz Save failures", "0"),
			// StatTypeConSaveSuccess:    NewStat(StatTypeConSaveSuccess, id, "Con Save Success", "0"),
			// StatTypeConSaveFail:       NewStat(StatTypeConSaveFail, id, "Con Save failures", "0"),
			// StatTypeDexSaveSuccess:    NewStat(StatTypeDexSaveSuccess, id, "Dex Save Success", "0"),
			// StatTypeDexSaveFail:       NewStat(StatTypeDexSaveFail, id, "Dex Save failures", "0"),
			// StatTypeStrSaveSuccess:    NewStat(StatTypeStrSaveSuccess, id, "Str Save Success", "0"),
			// StatTypeStrSaveFail:       NewStat(StatTypeStrSaveFail, id, "Str Save failures", "0"),
			// StatTypeIntSaveSuccess:    NewStat(StatTypeIntSaveSuccess, id, "Int Save Success", "0"),
			// StatTypeIntSaveFail:       NewStat(StatTypeIntSaveFail, id, "Int Save failures", "0"),
		},
	}
}

func (c *Char) AddStat(typeID int, name string, value string) {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	c.Stats[typeID] = NewStat(typeID, c.ID, name, value)
}

type Char struct {
	Mutex      sync.Mutex `json:"-"`
	ID         int        `json:"id"`
	ImgURL     string     `json:"img"`
	FirstName  string     `json:"name"`
	SecondName string     `json:"second_name"`
	Stats      []*Stat    `json:"stats"`
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

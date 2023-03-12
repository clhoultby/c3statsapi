package data

import (
	"fmt"
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

const (
	AttrTypePassivePerception    = 0
	AttrTypePassiveInvestigation = 1
	AttrTypePassiveInsight       = 2
	AttrTypeStrength             = 3
	AttrTypeDexterity            = 4
	AttrTypeConsitution          = 5
	AttrTypeIntelligence         = 6
	AttrTypeWisdom               = 7
	AttrTypeCharisma             = 8
	AttrTypeDarkVision           = 9
	AttrTypeArmorClass           = 10
	AttrTypeWalkingSpeed         = 11
)

func GetCharacters() []*Char {
	return []*Char{
		Aldrick(),
		Aranris(),
		Hoots(),
		KPV(),
		Elendar(),
		Ofeliya(),
	}

}

type Char struct {
	Mutex             sync.Mutex   `json:"-"`
	ID                int          `json:"id"`
	ImgURL            string       `json:"img"`
	FirstName         string       `json:"name"`
	SecondName        string       `json:"secondname"`
	Race              string       `json:"race"`
	Class             string       `json:"class"`
	Level             string       `json:"level"`
	MaxHP             string       `json:"maxhp"`
	Stats             []*Stat      `json:"stats"`
	PassiveAttributes []*Attribute `json:"passive_attributes"`
	Attributes        []*Attribute `json:"attributes"`
}

// Stat is a dynamically updatable object
type Stat struct {
	Mutex      sync.Mutex `json:"-"`
	StatTypeID string     `json:"id"`
	CharID     string     `json:"cId"`
	Value      string     `json:"value"`
	Name       string     `json:"name"`
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

type Attribute struct {
	Mutex  sync.Mutex `json:"-"`
	TypeID string     `json:"id"`
	CharID string     `json:"cId"`
	Value  string     `json:"value"`
	Name   string     `json:"name"`
}

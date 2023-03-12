package data

import "fmt"

func Elendar() *Char {
	return &Char{
		ID:         4,
		FirstName:  "Mor Elendar",
		SecondName: "",
		Race:       "Drow",
		Class:      "Rogue",
		Level:      "2",
		ImgURL:     "/img/char_elendar.jpg",
		MaxHP:      "16",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Investigation", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "120"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "13"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "15"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "9"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "30"},
		},
	}
}

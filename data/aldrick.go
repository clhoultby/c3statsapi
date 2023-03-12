package data

import "fmt"

func Aldrick() *Char {
	return &Char{
		ID:         0,
		FirstName:  "Aldrick",
		SecondName: "Wright",
		Race:       "Hill Dwarf",
		Class:      "Artificer",
		Level:      "2",
		ImgURL:     "/img/char_aldrick.jpg",
		MaxHP:      "19",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "18"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Invest.", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "60"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "15"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "13"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "25"},
		},
	}
}

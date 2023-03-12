package data

import "fmt"

func Ofeliya() *Char {
	return &Char{
		ID:         5,
		FirstName:  "Ofeliya",
		SecondName: "Wolfram",
		Race:       "Half-Elf",
		Class:      "Sorcerer",
		Level:      "2",
		ImgURL:     "/img/char_ofeliya.jpg",
		MaxHP:      "17",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Investigation", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "60"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "30"},
		},
	}
}

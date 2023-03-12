package data

import "fmt"

func Aranris() *Char {
	return &Char{
		ID:         1,
		FirstName:  "Aranris",
		SecondName: "Mistarelthwin",
		Race:       "Wood Elf",
		Class:      "Ranger",
		Level:      "2",
		ImgURL:     "/img/char_aranris.jpg",
		MaxHP:      "23",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "15"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Invest.", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "15"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "60"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "17"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "30"},
		},
	}
}

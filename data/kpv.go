package data

import "fmt"

func KPV() *Char {
	return &Char{
		ID:         3,
		FirstName:  "Kdaav",
		SecondName: "Paal Vadu",
		Race:       "Feral Tiefling",
		Class:      "Monk",
		Level:      "2",
		ImgURL:     "/img/char_kdaav.jpg",
		MaxHP:      "12",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "15"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Investigation", Value: "13"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "60"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "13"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "40"},
		},
	}
}

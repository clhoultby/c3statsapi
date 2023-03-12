package data

import "fmt"

func Hoots() *Char {
	return &Char{
		ID:         2,
		FirstName:  "Hoots",
		SecondName: "",
		Race:       "Owlin",
		Class:      "Fighter",
		Level:      "2",
		ImgURL:     "/img/char_hoots.jpg",
		MaxHP:      "21",
		PassiveAttributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeArmorClass), Name: "Armor Class", Value: "14"},
			{TypeID: fmt.Sprint(AttrTypePassivePerception), Name: "Passive Perception", Value: "11"},
			{TypeID: fmt.Sprint(AttrTypePassiveInvestigation), Name: "Passive Invest.", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypePassiveInsight), Name: "Passive Insight", Value: "9"},
			{TypeID: fmt.Sprint(AttrTypeDarkVision), Name: "Dark Vision", Value: "120"},
		},
		Attributes: []*Attribute{
			{TypeID: fmt.Sprint(AttrTypeStrength), Name: "Strength", Value: "13"},
			{TypeID: fmt.Sprint(AttrTypeDexterity), Name: "Dexterity", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeConsitution), Name: "Consitution", Value: "16"},
			{TypeID: fmt.Sprint(AttrTypeIntelligence), Name: "Intelligence", Value: "10"},
			{TypeID: fmt.Sprint(AttrTypeWisdom), Name: "Wisdom", Value: "8"},
			{TypeID: fmt.Sprint(AttrTypeCharisma), Name: "Charisma", Value: "12"},
			{TypeID: fmt.Sprint(AttrTypeWalkingSpeed), Name: "Walking Speed", Value: "30"},
		},
	}
}

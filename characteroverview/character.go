package characteroverview

import (
	"fmt"

	"c3statsapi/data"
	"c3statsapi/publisher"
)

func Init(data []*data.Char) *publisher.Topic {

	root := publisher.NewTopic("CO")

	for _, char := range data {
		col := formatChar(char)
		root.AddChild(col)
	}

	return root
}

func formatChar(c *data.Char) *publisher.Topic {
	char := publisher.NewTopicWithData(
		fmt.Sprintf("CO_C%v", c.ID),
		map[string]string{
			"name":       c.FirstName,
			"secondname": c.SecondName,
			"img":        c.ImgURL,
			"race":       c.Race,
			"class":      c.Class,
			"level":      c.Level,
			"maxhp":      c.MaxHP,
		})

	for _, attr := range c.PassiveAttributes {

		char.AddChild(publisher.NewTopicWithData(
			fmt.Sprintf("CO_C%v_A%v", c.ID, attr.TypeID),
			map[string]string{
				"desc":  attr.Name,
				"value": attr.Value,
			}))
	}

	for _, attr := range c.Attributes {
		char.AddChild(publisher.NewTopicWithData(
			fmt.Sprintf("CO_C%v_A%v", c.ID, attr.TypeID),
			map[string]string{
				"desc":  attr.Name,
				"value": attr.Value,
			}))

	}

	return char
}

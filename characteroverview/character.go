package characteroverview

import (
	"c3statsapi/data"
	"c3statsapi/publisher"
	"fmt"
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
	col := publisher.NewTopicWithData(
		fmt.Sprintf("CO_C%v", c.ID),
		map[string]string{
			"name":       c.FirstName,
			"secondname": c.SecondName,
			"img":        c.ImgURL,
			"race":       c.Race,
			"class":      c.Class,
			"level":      c.Level,
		})

	return col
}

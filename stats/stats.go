package stats

import (
	"fmt"

	"c3statsapi/data"
	"c3statsapi/publisher"
)

func Init(data []*data.Char) *publisher.Topic {

	root := publisher.NewTopic("STATS")

	statDescCol := publisher.NewTopic("S_D0")
	root.AddChild(statDescCol)

	for _, stat := range data[0].Stats {
		statDescCol.AddChild(formatStatsDescriptionCell(stat))
	}

	for _, char := range data {
		col := formatCharColumn(char)
		root.AddChild(col)
	}

	return root
}

func formatCharColumn(c *data.Char) *publisher.Topic {
	col := publisher.NewTopicWithData(
		fmt.Sprintf("S_C%v", c.ID),
		map[string]string{
			"name": c.Name,
			"img":  c.ImgURL,
		})

	for _, s := range c.Stats {

		col.AddChild(publisher.NewTopicWithData(
			fmt.Sprintf("S_C%v_S%v", c.ID, s.StatTypeID),
			map[string]string{
				"value": s.Value,
			},
		))
	}

	return col
}

func formatStatsDescriptionCell(s *data.Stat) *publisher.Topic {
	return publisher.NewTopicWithData(
		fmt.Sprintf("S_D0_%v", s.StatTypeID),
		map[string]string{
			"name": s.Name,
		},
	)
}

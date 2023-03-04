package data

const (
	MsgIDSnapshot = 0
	MsgIDInsert   = 1
	MsgIDUpdate   = 2
	MsgIDDelete   = 3
)

type SnapshotMsg struct {
	MsgType int         `json:"msgType"`
	TopicID string      `json:"topic"`
	Data    interface{} `json:"data"`
}

type Msg struct {
	MsgType int    `json:"msgType"`
	TopicID string `json:"topic"`
}

type UpdateMsg struct {
	MsgType int               `json:"msgType"`
	TopicID string            `json:"topic"`
	Data    map[string]string `json:"data"`
}

type InsertMsg struct {
	MsgType     int               `json:"msgType"`
	ParentTopic string            `json:"parentTopic"`
	TopicID     string            `json:"topic"`
	Data        map[string]string `json:"data"`
}

type DeleteMsg struct {
	MsgType int    `json:"msgType"`
	TopicID string `json:"topic"`
}

package data

const (
	MsgIDSnapshot = 0
	MsgIDInsert   = 1
	MsgIDUpdate   = 2
	MsgIDDelete   = 3
)

type SnapshotMsg struct {
	MsgType  int         `json:"msgType"`
	TopicID  string      `json:"topic"`
	Data     string      `json:"data"`
	Children interface{} `json:"children"`
}

type UpdateMsg struct {
	MsgType int    `json:"msgType"`
	TopicID string `json:"topic"`
	Data    []byte `json:"data"`
}

type InsertMsg struct {
	MsgType     int    `json:"msgType"`
	ParentTopic string `json:"parentTopic"`
	TopicID     string `json:"topic"`
	Data        []byte `json:"data"`
}

type DeleteMsg struct {
	MsgType int    `json:"msgType"`
	TopicID string `json:"topic"`
}

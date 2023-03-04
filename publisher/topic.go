package publisher

import (
	"c3statsapi/data"
	"encoding/json"
	"sync"
)

type Topic struct {
	Mutex       sync.Mutex        `json:"-"`
	ID          string            `json:"topic"`
	ParentTopic string            `json:"parentTopic,omitempty"`
	Data        map[string]string `json:"data"`
	Children    map[string]*Topic `json:"children,omitempty"`
}

func NewTopic(id string) *Topic {
	t := &Topic{
		ID:       id,
		Children: map[string]*Topic{},
	}

	tree.InsertTopic(t)
	return t
}

func NewTopicWithData(id string, data map[string]string) *Topic {
	t := &Topic{
		ID:       id,
		Children: map[string]*Topic{},
		Data:     data,
	}

	tree.InsertTopic(t)
	return t
}

// AddChild can be used separately to Insert to allow us to populate
// initial model state without sending deltass
func (t *Topic) AddChild(child *Topic) {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	child.ParentTopic = t.ID

	t.Children[child.ID] = child
}

func (t *Topic) Insert(c *Topic) {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	c.ParentTopic = t.ID
	t.Children[c.ID] = c

	msg := data.InsertMsg{
		MsgType:     data.MsgIDInsert,
		ParentTopic: t.ParentTopic,
		TopicID:     c.ID,
		Data:        c.Data,
	}

	out, _ := json.Marshal(msg)

	pubChan <- out
}

func (t *Topic) Delete() {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	msg := data.DeleteMsg{
		MsgType: data.MsgIDDelete,
		TopicID: t.ID,
	}

	out, _ := json.Marshal(msg)

	pubChan <- out
}

func (t *Topic) Update(newData map[string]string) {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	for k, v := range newData {
		t.Data[k] = v
	}

	msg := data.UpdateMsg{
		MsgType: data.MsgIDUpdate,
		TopicID: t.ID,
		Data:    newData,
	}

	out, _ := json.Marshal(msg)
	pubChan <- out

}

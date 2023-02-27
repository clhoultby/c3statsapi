package publisher

import (
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
)

type Topic struct {
	Mutex       sync.Mutex      `json:"-"`
	ID          string          `json:"topic"`
	ParentTopic string          `json:"PT,omitempty"`
	Data        json.RawMessage `json:"data"`
	Children    []*Topic        `json:"children,omitempty"`
}

func (t *Topic) AddChild(child *Topic) {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	t.Children = append(t.Children, child)
}

var connections = &Connections{}

type Connections struct {
	sync.Mutex
	connections []*websocket.Conn
}

var tree = &Tree{
	Topics: map[string]*Topic{},
}

type Tree struct {
	Mutex  sync.Mutex
	Topics map[string]*Topic
}

var (
	snapshotCache            []byte
	snapshotCacheInvalidated int32 = 1
)

func InitialPopulate(topics []*Topic) {

	for _, t := range topics {
		tree.Topics[t.ID] = t
	}

	tree.Snapshot()

	go publish()

}

func (t *Tree) Snapshot() []byte {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()

	if snapshotCacheInvalidated != 1 {
		return snapshotCache
	}

	msg := data.SnapshotMsg{
		MsgType:  data.MsgIDSnapshot,
		TopicID:  "stats",
		Children: tree.Topics,
	}

	out, err := json.Marshal(msg)
	if err != nil {
		fmt.Printf("err:%v", err)
	}

	snapshotCache = out

	return snapshotCache
}

func Insert(t *Topic) {
	tree.Mutex.Lock()
	defer tree.Mutex.Unlock()

	if t.ParentTopic != "" {
		tree.Topics[t.ParentTopic].AddChild(t)
	} else {
		tree.Topics[t.ID] = t
	}

	msg := data.InsertMsg{
		MsgType:     data.MsgIDInsert,
		TopicID:     t.ID,
		ParentTopic: t.ParentTopic,
		Data:        t.Data,
	}

	out, _ := json.Marshal(msg)

	pubChan <- out

	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

func Update(topic string, newData []byte) {
	tree.Mutex.Lock()
	defer tree.Mutex.Unlock()

	if _, ok := tree.Topics[topic]; !ok {
		return
	}

	tree.Topics[topic].Data = newData

	msg := data.UpdateMsg{
		MsgType: data.MsgIDUpdate,
		TopicID: topic,
		Data:    newData,
	}

	out, _ := json.Marshal(msg)
	pubChan <- out

	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

func Delete(topic string) {
	tree.Mutex.Lock()
	defer tree.Mutex.Unlock()

	if _, ok := tree.Topics[topic]; !ok {
		return
	}

	delete(tree.Topics, topic)

	msg := data.DeleteMsg{
		MsgType: data.MsgIDDelete,
		TopicID: topic,
	}

	out, _ := json.Marshal(msg)
	pubChan <- out

	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

func AddConnection(c *websocket.Conn) {
	connections.Mutex.Lock()
	defer connections.Mutex.Unlock()

	c.WriteMessage(2, []byte(tree.Snapshot()))
	connections.connections = append(connections.connections, c)
}

var pubChan = make(chan []byte, 1000)

func publish() {

	for m := range pubChan {
		b := m
		for _, c := range connections.connections {
			c.WriteMessage(2, b)
		}
	}

}

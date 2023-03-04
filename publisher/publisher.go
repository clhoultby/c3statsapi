package publisher

import (
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
)

var connections = &Connections{
	connections: make(map[string]*Subscriber),
}

type Connections struct {
	sync.Mutex
	connections map[string]*Subscriber
}

var pubChan = make(chan []byte, 1000)

func Listen() {

	for m := range pubChan {
		b := m
		for _, s := range connections.connections {
			s.c.WriteMessage(2, b)
		}

		fmt.Printf("message: %s", b)
	}

}

var tree = &Tree{
	Topics: map[string]*Topic{},
}

type Tree struct {
	Mutex  sync.RWMutex
	Topics map[string]*Topic
}

var (
	snapshotCache            []byte
	snapshotCacheInvalidated int32 = 1
)

func (t *Tree) Snapshot(topicID string) []byte {
	t.Mutex.RLock()
	defer t.Mutex.RUnlock()

	if snapshotCacheInvalidated != 1 {
		return snapshotCache
	}

	var response data.SnapshotMsg

	topic, ok := tree.Topics[topicID]
	if !ok {

		// return an empty message
		response = data.SnapshotMsg{
			MsgType: data.MsgIDSnapshot,
			TopicID: topicID,
			Data: &Topic{
				ID: topicID,
			},
		}
	} else {

		response = data.SnapshotMsg{
			MsgType: data.MsgIDSnapshot,
			TopicID: topicID,
			Data:    topic,
		}
	}

	out, err := json.Marshal(&response)
	if err != nil {
		fmt.Printf("err:%v", err)
	}

	snapshotCache = out

	return snapshotCache
}

func (tree *Tree) InsertTopic(t *Topic) {
	tree.Mutex.Lock()
	defer tree.Mutex.Unlock()

	// if we already have a topic, we're in a strange state
	if _, ok := tree.Topics[t.ID]; ok {
		return
	}

	tree.Topics[t.ID] = t

	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

func (tree *Tree) UpdateTopic(topic string, newData map[string]string) {
	tree.Mutex.RLock()
	defer tree.Mutex.RUnlock()

	if _, ok := tree.Topics[topic]; !ok {
		return
	}

	tree.Topics[topic].Update(newData)
	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

// DeleteTopic removes a topic from teh tree and recursively removes
// any child of that topic
func (tree *Tree) DeleteTopic(topic string) {
	tree.Mutex.Lock()
	defer tree.Mutex.Unlock()

	if _, ok := tree.Topics[topic]; !ok {
		return
	}

	tree.Topics[topic].Delete()

	for _, c := range tree.Topics[topic].Children {
		delete(tree.Topics, c.ID)
	}

	delete(tree.Topics, topic)

	atomic.SwapInt32(&snapshotCacheInvalidated, 1)
}

// AddConnection
func AddConnection(c *websocket.Conn) {
	connections.Mutex.Lock()
	defer connections.Mutex.Unlock()

	s := &Subscriber{
		ID: c.RemoteAddr().String(),
		c:  c,
	}

	connections.connections[s.ID] = s

	go s.Listen()

}

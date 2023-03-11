package publisher

import (
	"encoding/json"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
	"c3statsapi/log"
)

type ISubscriber interface {
	Listen()
	Update(b []byte)
}

type Connection struct {
	ID string
	c  *websocket.Conn
}

func (c *Connection) Update(b []byte) {
	c.c.WriteMessage(2, b)
}

func (s *Connection) Listen() {

	for {

		socketMsgType, b, err := s.c.ReadMessage()
		if err != nil {
			log.Logf("connectionRead error %v", err)
			break
		}

		log.Logf("socketMsgType: %v, b:[%s]", socketMsgType, b)

		msgType := int(b[0])

		switch msgType {

		case 48: //data.MsgIDSnapshot:
			topic := string(b[1:])
			s.c.WriteMessage(2, tree.Snapshot(topic))

		case data.MsgIDDelete:

			var msg data.DeleteMsg
			err := json.Unmarshal(b[1:], &msg)
			if err != nil {
				log.Logf("error parsing delete message err=%v b=%s", err, b)
				continue
			}

			tree.DeleteTopic(msg.TopicID)

		case 50: //data.MsgIDUpdate
			var msg data.UpdateMsg
			err := json.Unmarshal(b[1:], &msg)
			if err != nil {
				log.Logf("error parsing update message err=%v b=%s", err, b)
				continue
			}

			tree.UpdateTopic(msg.TopicID, msg.Data)

		}

	}

	delete(subscribers.subscriber, s.ID)

}

package publisher

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"

	"c3statsapi/data"
)

type Subscriber struct {
	ID string
	c  *websocket.Conn
}

func (s *Subscriber) Listen() {

	for {

		socketMsgType, b, err := s.c.ReadMessage()
		if err != nil {
			fmt.Printf("connectionRead error %v", err)
			break
		}

		fmt.Printf("socketMsgType: %v, b:[%s]", socketMsgType, b)

		msgType := int(b[0])

		switch msgType {

		case 48: //data.MsgIDSnapshot:
			topic := string(b[1:])
			s.c.WriteMessage(2, tree.Snapshot(topic))

		case data.MsgIDDelete:

			var msg data.DeleteMsg
			err := json.Unmarshal(b[1:], &msg)
			if err != nil {
				fmt.Printf("error parsing delete message err=%v b=%s", err, b)
				continue
			}

			tree.DeleteTopic(msg.TopicID)

		case 50:
			var msg data.UpdateMsg
			err := json.Unmarshal(b[1:], &msg)
			if err != nil {
				fmt.Printf("error parsing update message err=%v b=%s", err, b)
				continue
			}

			tree.UpdateTopic(msg.TopicID, msg.Data)

		}

	}

	delete(connections.connections, s.ID)

}

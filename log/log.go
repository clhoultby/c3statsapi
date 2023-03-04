package log

import (
	"fmt"
	"log"
	"time"
)

var logger = log.Default()

func Logf(template string, args ...interface{}) {
	logger.Println(time.Now().UTC().Format(time.RFC3339) + ": " + fmt.Sprintf(template, args...))
}

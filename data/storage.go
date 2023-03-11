package data

import "os"

const (
	filePath = "./storage.json"
)

// replace this will database / AWS date store?

func Write(data []byte) error {
	return os.WriteFile(filePath, data, 0755)
}

func Read() ([]byte, error) {
	return os.ReadFile(filePath)
}

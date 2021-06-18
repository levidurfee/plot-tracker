all: clean compile package

compile:
	GOOS=linux GOARCH=arm64 go build -o bin/pt-linux-arm64 main.go
	GOOS=linux GOARCH=amd64 go build -o bin/pt-linux-amd64 main.go
	GOOS=windows GOARCH=amd64 go build -o bin/pt-windows-amd64.exe main.go

package:
	mkdir -p ./pkg
	tar -czf ./pkg/linux-arm64.tar.gz bin/pt-linux-arm64 config.yml LICENSE
	tar -czf ./pkg/linux-amd64.tar.gz bin/pt-linux-amd64 config.yml LICENSE
	tar -czf ./pkg/linux-windows.tar.gz bin/pt-windows-amd64.exe config.yml LICENSE

clean:
	rm -Rf bin
	rm -Rf pkg

.PHONY: all compile package clean

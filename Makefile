all: clean compile package

compile:
	GOOS=linux GOARCH=arm64 go build -o bin/pt-linux-arm64 main.go
	GOOS=linux GOARCH=amd64 go build -o bin/pt-linux-amd64 main.go
	GOOS=windows GOARCH=amd64 go build -o bin/pt-windows-amd64.exe main.go

package:
	cp config.yml LICENSE ./bin

	cd bin; tar -czf ./linux-arm64.tar.gz ./pt-linux-arm64 LICENSE
	cd bin; tar -czf ./linux-amd64.tar.gz ./pt-linux-amd64 LICENSE
	cd bin; tar -czf ./linux-windows.tar.gz ./pt-windows-amd64.exe LICENSE

clean:
	rm -Rf bin

.PHONY: all compile package clean

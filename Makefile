VERSION=`git describe --tags`
LDFLAGS=-ldflags "-X main.Version=${VERSION}"

DIR_LINUX_ARM64="plot-tracker-linux-arm64"
DIR_LINUX_AMD64="plot-tracker-linux-amd64"
DIR_WINDOWS="plot-tracker-windows"

all: clean compile package

compile:
	GOOS=linux   GOARCH=arm64 go build ${LDFLAGS} -o bin/${DIR_LINUX_ARM64}-${VERSION}/plottracker main.go
	GOOS=linux   GOARCH=amd64 go build ${LDFLAGS} -o bin/${DIR_LINUX_AMD64}-${VERSION}/plottracker main.go
	GOOS=windows GOARCH=amd64 go build ${LDFLAGS} -o bin/${DIR_WINDOWS}-${VERSION}/plottracker.exe main.go

package:
	cp LICENSE ./bin/${DIR_LINUX_ARM64}-${VERSION}
	cp LICENSE ./bin/${DIR_LINUX_AMD64}-${VERSION}
	cp LICENSE ./bin/${DIR_WINDOWS}-${VERSION}

	cp ./assets/config.yml ./bin/${DIR_LINUX_ARM64}-${VERSION}
	cp ./assets/config.yml ./bin/${DIR_LINUX_AMD64}-${VERSION}
	cp ./assets/config.yml ./bin/${DIR_WINDOWS}-${VERSION}

	cd bin; tar -czf ./plot-tracker-linux-arm64-${VERSION}.tar.gz ${DIR_LINUX_ARM64}-${VERSION}
	cd bin; tar -czf ./plot-tracker-linux-amd64-${VERSION}.tar.gz ${DIR_LINUX_AMD64}-${VERSION}
	cd bin; zip -r   ./plot-tracker-windows-${VERSION}.zip        ${DIR_WINDOWS}-${VERSION}/

clean:
	rm -Rf bin

.PHONY: all compile package clean

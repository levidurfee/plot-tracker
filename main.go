package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	yaml "gopkg.in/yaml.v2"

	"github.com/nxadm/tail"
)

const (
	// SearchLineFor determines what lines of the log file we're interested in.
	SearchLineFor = "eligible"

	// LogColumn is used for splitting the log line into two slices.
	//
	// The log files have a timestamp, module name, name space, and log level on
	// the left side of the column. We aren't interested in any of that. So, we
	// split the log line using the LogColumn.
	LogColumn = "     "

	// APIURL is where we send the data.
	APIURL = "https://plot-tracker.app/api/v1/counter"

	// ChiaDateFormat is how Chia formats the dates in the logs.
	//
	// https://golang.org/pkg/time/#pkg-constants
	ChiaDateFormat = "2006-01-02T15:04:05.000"
)

// Config contains the fields we need for running the client.
type Config struct {
	LogFile string `yaml:"log_file"`
	APIKey  string `yaml:"api_key"`
	FarmKey string `yaml:"farm_key"`
}

var cfg Config

func init() {
	f, err := os.Open("./config.yml")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(&cfg)
	if err != nil {
		panic(err)
	}
}

// LogData is a type for keeping our log data together.
type LogData struct {
	Plots    int `json:"plots"`
	Eligible int `json:"eligible"`
	Proofs   int `json:"proofs"`

	Timestamp *time.Time `json:"timestamp"`

	// @TODO - Add these fields
	// AverageTime         float64 `json:"average_time"`
	// AverageEligibleTime float64 `json:"average_eligible_time"`

	// EligibilityHistory []bool `json:"eligibility_history"`
}

// Send sends the data to the API.
func (ld LogData) Send() {
	// Turn LogData into a JSON string
	js, err := json.Marshal(&ld)
	if err != nil {
		log.Println(err)
	}

	// fmt.Println(string(js))
	// return

	// Create a new HTTP Request
	req, err := http.NewRequest("POST", APIURL, bytes.NewBuffer(js))
	if err != nil {
		log.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", cfg.APIKey)
	req.Header.Set("X-Farmer-ID", cfg.FarmKey)

	tr := &http.Transport{
		MaxIdleConns:       10,
		IdleConnTimeout:    30 * time.Second,
		DisableCompression: true,
	}

	// Send it away!
	client := &http.Client{Transport: tr}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.Status == "200 OK" {
		log.Println(resp.Status)
		return
	}

	body, _ := ioutil.ReadAll(resp.Body)
	log.Println(resp.Status, string(body))
}

// GetTimestamp parses the left side of the log column to get the timestamp.
//
//     2021-06-18T08:28:35.589 harvester chia.harvester.harvester: INFO
//
// https://golang.org/pkg/time/#example_Parse
func GetTimestamp(line string) (time.Time, error) {
	pieces := strings.Split(line, " ")
	textTimestamp := pieces[0]

	return time.Parse(ChiaDateFormat, textTimestamp)
}

func main() {
	log.Println("Starting...")

	// https://github.com/nxadm/tail
	// https://pkg.go.dev/github.com/nxadm/tail#Config
	tailer, err := tail.TailFile(
		cfg.LogFile, // The file we're reading
		tail.Config{
			Follow: true, // Continue looking for new lines (tail -f)
			ReOpen: true, // Reopen recreated files (tail -F)
		},
	)

	// If something went wrong with TailFile, we panic, and quit. Hopefully this
	// never happens, but it might and can be useful for debugging.
	if err != nil {
		panic(err)
	}

	// This is the main event loop. When a new line is written to the file, this
	// loop will start an iteration.
	for line := range tailer.Lines {
		// We're only interested in certain lines in the log file, the rest of
		// them can be ignored.
		if strings.Contains(line.Text, SearchLineFor) {
			logColumns := strings.Split(line.Text, LogColumn)

			// The log files are fairly verbose so we split the part we want by
			// spaces, it makes it easier to grab the information we want. We
			// also need to convert the data from a `string` type to an `int`
			// type.
			//
			// 0 plots were eligible for farming 2ce35966c9... Found 0 proofs. Time: 0.02905 s. Total 172 plots
			data := strings.Split(logColumns[1], " ")
			plots, _ := strconv.Atoi(data[14])
			eligible, _ := strconv.Atoi(data[0])
			proofs, _ := strconv.Atoi(data[8])

			// Get the timestamp of the log. Using the timestamp helps us from
			// adding data sent more than once. When this program starts, the
			// tail package reads a few of the last lines of the log file and
			// sends those. So, in the API, we can check if the log entry is
			// greater than or equal to the last timestamp sent from the client.
			t, err := GetTimestamp(logColumns[0])
			if err != nil {
				log.Println(err)
			}

			logData := &LogData{
				Plots:     plots,
				Eligible:  eligible,
				Proofs:    proofs,
				Timestamp: &t,
			}

			// Create a new goroutine and send the data to the API.
			go logData.Send()

			// @TODO re-eval this.
			time.Sleep(500 * time.Millisecond)
		}
	}
}

package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
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

	// EligibilityHistorySize is the max number of items in our History slice. I
	// like using 100 because it looks nice in the UI and it's easy to show the
	// percentage. Since the history slice is boolean, we're only measuring if
	// the farm had any eligible plots for that signage point.
	EligibilityHistorySize = 100

	DefaultSleepBetweenIrations time.Duration = 500

	// MaxBackoff is the maximum amount of time we want to back off before we
	// panic and decide that there is something wrong that can't be fixed by
	// slowing down our HTTP POST requests.
	MaxBackoff time.Duration = 2000
)

// SleepBetweenIterations is a number in milliseconds that we want to sleep
// before moving on to the next iteration. The first time you run this app
// it reads your log file from the very beginning and sends all of those
// applicable logs to the server, while the server could handle it, we
// think it's better to pause for a moment before sending the next load.
// Right now, it's only sleeping 0.5 seconds. It will eventually catch up
// and then listen to live updates from the log file.
var SleepBetweenIterations time.Duration = DefaultSleepBetweenIrations

// BackoffIncrease is the amount we add to SleepBetweenIterations each time a
// HTTP POST fails.
var BackoffIncrease time.Duration = 100

// Version is the version of the program
var Version = "dev"

// Config contains the fields we need for running the client.
type Config struct {
	LogFile string `yaml:"log_file"`
	APIKey  string `yaml:"api_key"`
	FarmKey string `yaml:"farm_key"`
}

var cfg Config

// LoadConfig loads the YAML config from a file and sets the global Config var.
func LoadConfig(filename string) {
	log.Printf("Loading config %s\n", filename)
	f, err := os.Open(filename)
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
	Plots     int     `json:"plots"`
	Eligible  int     `json:"eligible"`
	Proofs    int     `json:"proofs"`
	TimeTaken float64 `json:"time_taken"`

	Timestamp *time.Time `json:"timestamp"`

	EligibilityHistory []bool `json:"eligibility_history"`
}

// UpdateHistoryQueue uses the EligibilityHistorySize to keep the most recent
// data in regards to if a farm had any eligible plots for a signage point.
func UpdateHistoryQueue(queue []bool, eligible bool) []bool {
	queue = append(queue, eligible)

	if len(queue) > EligibilityHistorySize {
		queue = queue[1:]
	}

	return queue
}

// Send sends the data to the API.
func (ld LogData) Send() {
	// Turn LogData into a JSON string
	js, err := json.Marshal(&ld)
	if err != nil {
		log.Println(err)
	}

	// Create a new HTTP Request
	req, err := http.NewRequest("POST", APIURL, bytes.NewBuffer(js))
	if err != nil {
		log.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", cfg.APIKey)
	req.Header.Set("X-Farmer-ID", cfg.FarmKey)

	// Sending a custom User-Agent in the request headers. The User-Agent header
	// is a characteristic string that lets servers and network peers identify
	// the client making the request.
	//
	// User-Agent: <product> / <product-version> <comment>
	//
	// <product>
	// A product identifier — its name or development codename.
	//
	// <product-version>
	// Version number of the product.
	//
	// <comment>
	// Zero or more comments containing more details; sub-product information, for example.
	//
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
	req.Header.Set("User-Agent", "PlotTracker/"+Version)

	tr := &http.Transport{
		MaxIdleConns:       10,
		IdleConnTimeout:    30 * time.Second,
		DisableCompression: true,
	}

	// Send it away!
	client := &http.Client{Transport: tr}
	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		if SleepBetweenIterations > MaxBackoff {
			panic("Error sending data to API, tried backing off")
		}

		// Backoff
		// We wait to increase how long we sleep between iterations since we had
		// an error POST'ing to the API.
		SleepBetweenIterations += BackoffIncrease
		return
	}
	defer resp.Body.Close()

	// API returned a status that indicates everything went well, so we're done.
	if resp.Status == "200 OK" {
		log.Println(resp.Status)

		// Backoff
		// We want to reset the SleepBetweenIterations to the default value of
		// DefaultSleepBetweenIrations since we had a successful POST.
		SleepBetweenIterations = DefaultSleepBetweenIrations
		return
	}

	// If we make it here, then we might have had a problem either on the client
	// or server side. We print out the response status and body in the logs to
	// help identify where the problem may be. Please report any issues to the
	// repo: https://github.com/levidurfee/plot-tracker/issues
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
	fmt.Printf("Plot Tracker %s\n", Version)
	fmt.Println("==============================")
	log.Println("Starting...")

	// Optionally specify config file.
	cfgFlag := flag.String("config", "config.yml", "location of the config file")
	flag.Parse()
	LoadConfig(*cfgFlag)

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

	// We want to keep track of the latest signage points and know if they were
	// eligible or not. It allows for easy visual grepping.
	var EligibilityHistory []bool

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
			timeTaken, _ := strconv.ParseFloat(data[11], 64)

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
				TimeTaken: timeTaken,
			}

			// Set wasEligible to false by default
			wasEligible := false

			// Check if any plots were eligible
			if eligible > 0 {
				// If 1 or more plots were eligible, set wasEligible to true
				wasEligible = true
			}

			// Add eligibility to queue
			EligibilityHistory = UpdateHistoryQueue(EligibilityHistory, wasEligible)
			logData.EligibilityHistory = EligibilityHistory

			// Create a new goroutine and send the data to the API.
			go logData.Send()

			// @TODO re-eval this.
			time.Sleep(SleepBetweenIterations * time.Millisecond)
		}
	}
}

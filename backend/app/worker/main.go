// main.go
package main

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/base32"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/joho/godotenv"

	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"github.com/araddon/dateparse"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	calendar "google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

// Payload your Zap should send (customize fields as you like)
type ZapPayload struct {
    Subject   string `json:"Subject"`
    Body      string `json:"Body"`
    Date      string `json:"Date"`
    End       string `json:"End,omitempty"`
    Company   string `json:"Company"`
    MessageID string `json:"MessageID"`
    
    DurationMinutes int    `json:"DurationMinutes,omitempty"`
    Link            string `json:"Link,omitempty"`
    Timezone        string `json:"Timezone,omitempty"`
}

type HealthStatus struct {
	Status string `json:"status"`
	Message string `json:"message"`
}

// Environment variables expected:
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_SECRET
// GOOGLE_REFRESH_TOKEN   (an offline refresh token for your Google account)
// CALENDAR_ID            (e.g., "primary" or a specific calendar id)
// PORT                   (Heroku will set this)
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		data := HealthStatus{
			Status:  "OK", 
			Message: "server is live",
		}

		err := json.NewEncoder(w).Encode(data)

		if err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}



		
	})


	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	fmt.Printf("The following are the enciormental variables: %s, %s, %s  ", os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), os.Getenv("GOOGLE_REFRESH_TOKEN"))

	http.HandleFunc("/zap", handleZap)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Listening on :%s ...", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func matchPlatform(body string) string {

	matchedCodesignal, _ := regexp.MatchString(`^https:\/\/app\.codesignal\.com\/pre-screen\/evaluation\/[a-zA-Z0-9]+$`, body)

	//Create a dictionary of the words now 

	body_split := strings.Fields(body)

	matchedHackerank := false 


	for _, word := range body_split{
		similarity := strutil.Similarity(word, "hackerank", metrics.NewHamming())
		if similarity >= 0.50 {
			matchedHackerank = true
			break
		}
		
	}


	if matchedCodesignal{
		return "Codesignal Assesment"
	}

	if matchedHackerank{
		return "Hackerank"
	}


	return "Other Coding Platform"

}

func handleZap(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	raw, _ := io.ReadAll(r.Body)
	fmt.Println("Raw body:", string(raw))

	// reset body so JSON decoder can still read it
	r.Body = io.NopCloser(bytes.NewBuffer(raw))

	var p ZapPayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "invalid json: "+err.Error(), http.StatusBadRequest)
		return
	}
	
	fmt.Print("Made it passed here")

	//Match the platform 
	platform := matchPlatform(p.Body)



	// Build times
	startTime, endTime, tz, err := resolveTimes(p)
	if err != nil {
		http.Error(w, "time parse error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Calendar client
	svc, err := calendarService(r.Context())
	if err != nil {
		http.Error(w, "calendar auth error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Idempotency: stable event ID from message_id or (subject+start)
	// eventID := stableEventID(p.MessageID, p.Subject, startTime)

	// Build event description
	desc := strings.TrimSpace(strings.Join([]string{
		p.Body,
		func() string {
			if p.Link != "" {
				return "\nLink: " + p.Link
			}
			return ""
		}(),
	}, ""))

	// Build Google Calendar Event
	ev := &calendar.Event{
		Summary: func() string {
			if strings.TrimSpace(p.Subject) == "" {
				return  fmt.Sprintf("Interview / Assessment for %d on %d", p.Company, platform) 
			}
			return p.Subject
		}(),
		Location: "remote",
		Description: desc,
		Start: &calendar.EventDateTime{
			DateTime: startTime.Format(time.RFC3339),
			TimeZone: tz,
		},
		End: &calendar.EventDateTime{
			DateTime: endTime.Format(time.RFC3339),
			TimeZone: tz,
		},
		Reminders: &calendar.EventReminders{
			UseDefault: true,
		
		},
	}

	// Insert into calendar
	calID := os.Getenv("CALENDAR_ID")
	if calID == "" {
		calID = "primary"
	}

	fmt.Printf("inserting into calander ID: %s ", calID)

	created, err := svc.Events.Insert("primary", ev).Do()
	if err != nil {
		fmt.Printf("Error occured in the backend side for inserting the event: ", err.Error())
		http.Error(w, "calendar insert error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond to Zapier
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":   "created",
		// "eventId":  created.Id,
		"htmlLink": created.HtmlLink,
	})
}


// Auth helpers

func calendarService(ctx context.Context) (*calendar.Service, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	refresh := os.Getenv("GOOGLE_REFRESH_TOKEN")
	if clientID == "" || clientSecret == "" || refresh == "" {
		return nil, fmt.Errorf("missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN")
	}

	fmt.Print("the secret keyys: ", clientID, clientSecret, refresh)

	conf := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint,
		Scopes: []string{
			calendar.CalendarScope, // full calendar access; you can narrow to CalendarEventsScope if preferred
		},
		RedirectURL: "urn:ietf:wg:oauth:2.0:oob", // not used at runtime (refresh token only)
	}

	tok := &oauth2.Token{
		RefreshToken: refresh,
		Expiry:       time.Now().Add(-time.Hour), // force refresh
	}
	httpClient := conf.Client(ctx, tok)
	return calendar.NewService(ctx, option.WithHTTPClient(httpClient))
}

// Time parsing

func resolveTimes(p ZapPayload) (time.Time, time.Time, string, error) {
	tz := p.Timezone
	if tz == "" {
		tz = "America/New_York"
	}
	loc, err := time.LoadLocation(tz)
	if err != nil {
		return time.Time{}, time.Time{}, "", fmt.Errorf("invalid timezone: %s", tz)
	}

	parse := func(s string) (time.Time, error) {
		if s == "" {
			return time.Time{}, fmt.Errorf("empty time string")
		}
		// Prefer strict RFC3339 if provided
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			return t, nil
		}
		// Fallback to flexible parsing
		t, err := dateparse.ParseIn(s, loc)
		if err != nil {
			return time.Time{}, err
		}
		return t, nil
	}

	var start time.Time
	var end time.Time

	if p.Date != "" {
		st, err := parse(p.Date)
		if err != nil {
			return time.Time{}, time.Time{}, "", fmt.Errorf("start parse: %w", err)
		}
		start = st
	} else {
		return time.Time{}, time.Time{}, "", fmt.Errorf("start is required")
	}

	//Just make date 5 days after the OA was received 

	


	if p.End != "" {
		et, err := parse(p.End)
		if err != nil {
			return time.Time{}, time.Time{}, "", fmt.Errorf("end parse: %w", err)
		}
		end = et
	} else {
		// default to 5 days for the oa to expire 
		end = start.Add(5 * 24 * time.Hour)
	}

	return start, end, tz, nil
}

// Idempotent stable event id (letters/digits only)
func stableEventID(messageID, subject string, start time.Time) string {
    key := messageID
    if strings.TrimSpace(key) == "" {
        key = fmt.Sprintf("%s-%s", subject, start.UTC().Format(time.RFC3339))
    }
    sum := sha1.Sum([]byte(key))
    enc := base32.StdEncoding.EncodeToString(sum[:])
    enc = strings.ToLower(strings.TrimRight(enc, "="))
    if len(enc) > 64 {
        enc = enc[:64]
    }
    return "zap" + enc
}

// Small adapter so we can inspect 409s cleanly
type googleapiError struct {
	Code int
	Err  error
}

func (g *googleapiError) Error() string { return g.Err.Error() }

func init() {
	// Wrap default logger with timestamps
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

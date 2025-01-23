package main

import (
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"

    "a21hc3NpZ25tZW50/service"

    "github.com/gorilla/mux"
    "github.com/gorilla/sessions"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
)

// Initialize services
var fileService = &service.FileService{}
var aiService = &service.AIService{Client: &http.Client{}}
var translationService = &service.TranslationService{Client: &http.Client{}}
var store = sessions.NewCookieStore([]byte("my-key"))

func getSession(r *http.Request) *sessions.Session {
    session, _ := store.Get(r, "chat-session")
    return session
}

func main() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Get Hugging Face token
    token := os.Getenv("HUGGINGFACE_TOKEN")
    if token == "" {
        log.Fatal("HUGGINGFACE_TOKEN is not set in .env file")
    }

    router := mux.NewRouter()

    // File upload endpoint
    router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        err := r.ParseMultipartForm(10 << 20)
        if err != nil {
            http.Error(w, "Unable to parse form", http.StatusBadRequest)
            return
        }

        file, _, err := r.FormFile("file")
        if err != nil {
            http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
            return
        }
        defer file.Close()

        fileContent, err := io.ReadAll(file)
        if err != nil {
            http.Error(w, "Unable to read file", http.StatusInternalServerError)
            return
        }

        query := r.FormValue("query")
        processedData, err := fileService.ProcessFile(string(fileContent))
        if err != nil {
            http.Error(w, "Failed to process file: "+err.Error(), http.StatusInternalServerError)
            return
        }

        analysisResult, err := aiService.AnalyzeData(processedData, query, token)
        if err != nil {
            http.Error(w, "Failed to analyze data: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status": "success",
            "answer": analysisResult,
        })
    }).Methods("POST")

    // Chat endpoint
    router.HandleFunc("/chat", func(w http.ResponseWriter, r *http.Request) {
        var requestBody struct {
            Query string `json:"query"`
        }
        
        if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        session := getSession(r)
        context, _ := session.Values["context"].(string)

        chatResponse, err := aiService.ChatWithAI(context, requestBody.Query, token)
        if err != nil {
            http.Error(w, "Failed to chat with AI: "+err.Error(), http.StatusInternalServerError)
            return
        }

        session.Values["context"] = context + "\n" + requestBody.Query + "\n" + chatResponse.GeneratedText
        session.Save(r, w)

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status": "success",
            "answer": chatResponse.GeneratedText,
        })
    }).Methods("POST")

    // Translation endpoint
    router.HandleFunc("/translate", func(w http.ResponseWriter, r *http.Request) {
        var requestBody struct {
            Text string `json:"text"`
        }
        
        if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        translatedText, err := translationService.TranslateText(requestBody.Text, token)
        if err != nil {
            http.Error(w, "Translation failed: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status": "success",
            "translatedText": translatedText,
        })
    }).Methods("POST")

    // CORS configuration
    corsHandler := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:3000"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type", "Authorization"},
    }).Handler(router)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server running on port %s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
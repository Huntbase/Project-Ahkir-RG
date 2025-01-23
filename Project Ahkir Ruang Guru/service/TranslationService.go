package service

import (
    "bytes"
    "encoding/json"
    "errors"
    "io"
    "log"
    "net/http"
    "strings"
)

type TranslationService struct {
    Client *http.Client
}

func (ts *TranslationService) TranslateText(text, token string) (string, error) {
    text = strings.TrimSpace(text)
    if text == "" {
        return "", errors.New("input text is empty")
    }
    
    // Using Helsinki-NLP's Indonesian-English model
    url := "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-id-en"
    requestBody := map[string]string{
        "inputs": text,
    }
    payload, err := json.Marshal(requestBody)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        return "", err
    }
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")

    resp, err := ts.Client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }

    var response []map[string]interface{}
    if err := json.Unmarshal(body, &response); err != nil {
        log.Printf("Error unmarshaling response: %v", err)
        return "", err
    }

    if len(response) > 0 {
        if translatedText, ok := response[0]["translation_text"].(string); ok {
            return translatedText, nil
        }
    }

    return "", errors.New("failed to get translation")
}
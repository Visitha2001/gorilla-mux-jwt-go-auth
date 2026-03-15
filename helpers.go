package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type key int

const (
	userContextKey key = iota
)

func mustGetenv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("%s environment variable not set.\n", k)
	}
	return v
}

func JSONError(w http.ResponseWriter, r *http.Request, errorMessage string, code int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	resp := map[string]string{
		"error": errorMessage,
	}
	message := errorMessage
	userName := ""
	user, ok := r.Context().Value(userContextKey).(User)
	if ok && user.Email != "" {
		userName = user.Email
	}
	log.Println(r.Method, r.RequestURI, userName, message)
	w.WriteHeader(code)
	err = json.NewEncoder(w).Encode(resp)
	if err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}
}

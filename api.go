package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func setRoutes(router *mux.Router) {
	api := router.PathPrefix("/api").Subrouter()

	api.HandleFunc("/register", register).Methods("POST")
	api.HandleFunc("/login", login).Methods("POST")

	protected := api.PathPrefix("/").Subrouter()
	protected.Use(authMiddleware)
	protected.HandleFunc("/me", me).Methods("GET")

	protected.HandleFunc("/tasks", getTasks).Methods("GET")
	protected.HandleFunc("/tasks", createTask).Methods("POST")
	protected.HandleFunc("/tasks/{id}", getTask).Methods("GET")
	protected.HandleFunc("/tasks/{id}", editTask).Methods("PUT")
	protected.HandleFunc("/tasks/{id}", deleteTask).Methods("DELETE")
}

func me(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey)
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}
}

package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func getTasks(w http.ResponseWriter, r *http.Request) {
	var tasks []Task
	if err := json.NewDecoder(r.Body).Decode(&tasks); err != nil {
		JSONError(w, r, "Invalid request", http.StatusBadRequest)
		return
	}
	search := r.URL.Query().Get("search")
	query := db.Order("tasks desc")

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}
	query.Find(&tasks)
	json.NewEncoder(w).Encode(tasks)
}

func getTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	id := mux.Vars(r)["id"]
	if id == "" {
		JSONError(w, r, "Invalid request: id is required", http.StatusBadRequest)
		return
	}
	if err := db.First(&t, "id = ?", id).Error; err != nil {
		JSONError(w, r, "Task not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(t)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		JSONError(w, r, "Invalid input: failed to decode request body", http.StatusBadRequest)
		return
	}
	if err := db.Create(&t).Error; err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(t)
}

func editTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}
	if err := db.Save(&t).Error; err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(t)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}
	if err := db.Delete(&t).Error; err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(t)
}

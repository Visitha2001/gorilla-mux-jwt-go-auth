package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func getTasks(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	var tasks []Task

	search := r.URL.Query().Get("search")
	query := db.Where("user_id = ?", user.ID).Order("created_at desc")

	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
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
	user, ok := r.Context().Value(userContextKey).(User)
	if !ok {
		JSONError(w, r, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}

	t.ID = uuid.New().String()
	t.UserId = user.ID

	if err := db.Create(&t).Error; err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(t)
}

func editTask(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	vars := mux.Vars(r)
	id := vars["id"]

	var t Task
	if err := db.Where("id = ? AND user_id = ?", id, user.ID).First(&t).Error; err != nil {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}

	t.ID = id
	t.UserId = user.ID

	db.Save(&t)
	json.NewEncoder(w).Encode(t)
}

func deleteTask(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)

	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		JSONError(w, r, "Task ID is required", http.StatusBadRequest)
		return
	}
	result := db.Where("id = ? AND user_id = ?", id, user.ID).Delete(&Task{})

	if result.Error != nil {
		JSONError(w, r, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

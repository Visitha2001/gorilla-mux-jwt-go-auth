package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func getSubTasks(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	vars := mux.Vars(r)
	taskId := vars["task_id"]

	// Ensure the parent task belongs to the user
	var task Task
	if err := db.Where("id = ? AND user_id = ?", taskId, user.ID).First(&task).Error; err != nil {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	var subTasks []SubTasks
	db.Where("task_id = ?", taskId).Order("created_at asc").Find(&subTasks)
	
	json.NewEncoder(w).Encode(subTasks)
}

func createSubTask(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	vars := mux.Vars(r)
	taskId := vars["task_id"]

	// Ensure the parent task belongs to the user
	var task Task
	if err := db.Where("id = ? AND user_id = ?", taskId, user.ID).First(&task).Error; err != nil {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	var st SubTasks
	if err := json.NewDecoder(r.Body).Decode(&st); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}

	st.ID = uuid.New().String()
	st.TaskId = taskId

	if err := db.Create(&st).Error; err != nil {
		JSONError(w, r, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(st)
}

func editSubTask(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	vars := mux.Vars(r)
	taskId := vars["task_id"]
	id := vars["id"]

	// Ensure the parent task belongs to the user
	var task Task
	if err := db.Where("id = ? AND user_id = ?", taskId, user.ID).First(&task).Error; err != nil {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	var st SubTasks
	if err := db.Where("id = ? AND task_id = ?", id, taskId).First(&st).Error; err != nil {
		JSONError(w, r, "Subtask not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&st); err != nil {
		JSONError(w, r, "Invalid input", http.StatusBadRequest)
		return
	}

	st.ID = id
	st.TaskId = taskId

	db.Save(&st)
	json.NewEncoder(w).Encode(st)
}

func deleteSubTask(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userContextKey).(User)
	vars := mux.Vars(r)
	taskId := vars["task_id"]
	id := vars["id"]

	// Ensure the parent task belongs to the user
	var task Task
	if err := db.Where("id = ? AND user_id = ?", taskId, user.ID).First(&task).Error; err != nil {
		JSONError(w, r, "Task not found or unauthorized", http.StatusNotFound)
		return
	}

	result := db.Where("id = ? AND task_id = ?", id, taskId).Delete(&SubTasks{})

	if result.Error != nil {
		JSONError(w, r, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		JSONError(w, r, "Subtask not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

package main

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Email     string         `gorm:"uniqueIndex" json:"email"`
	Name      string         `json:"name"`
	Password  string         `json:"-"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Task struct {
	ID          string         `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Status      string         `json:"status"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
	UserId      string         `json:"user_id"`
	User        User           `json:"user"`
}

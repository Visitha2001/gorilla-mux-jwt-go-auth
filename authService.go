package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, r, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	user := User{
		ID:       uuid.New().String(),
		Email:    req.Email,
		Name:     req.Name,
		Password: string(hashedPassword),
	}

	if err := db.Create(&user).Error; err != nil {
		JSONError(w, r, "User already exists or database error", http.StatusConflict)
		return
	}

	json.NewEncoder(w).Encode(user)
}

func login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	json.NewDecoder(r.Body).Decode(&req)

	var user User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		JSONError(w, r, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		JSONError(w, r, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	})

	t, _ := token.SignedString([]byte(jwtSecret))
	json.NewEncoder(w).Encode(map[string]string{"token": t})
}

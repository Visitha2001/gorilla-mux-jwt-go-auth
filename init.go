package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	port          string
	baseUrl       string
	adminUrl      string
	dbHost        string
	dbName        string
	dbUser        string
	dbPass        string
	jwtSecret     string
	bucketName    string
	sessionSecret string
	googleId      string
	googleSecret  string

	instanceConnectionName string
	socketDir              string

	ctx context.Context
)

func loadEnv() {
	if dev {
		err = godotenv.Load()
		if err != nil {
			log.Fatalln(err.Error())
		}
	}
	port = os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	baseUrl = os.Getenv("BASE_URL")
	if baseUrl == "" {
		baseUrl = "http://localhost"
	}
	adminUrl = mustGetenv("ADMIN_URL")
	dbName = mustGetenv("DB_NAME")
	dbUser = mustGetenv("DB_USER")
	googleId = mustGetenv("GOOGLE_CLIENT_ID")
	googleSecret = mustGetenv("GOOGLE_CLIENT_SECRET")
	dbPass = os.Getenv("DB_PASS")
	if dev {
		dbHost = mustGetenv("DB_HOST")
	} else {
		instanceConnectionName = mustGetenv("INSTANCE_CONNECTION_NAME")
		var isSet bool
		socketDir, isSet = os.LookupEnv("DB_SOCKET_DIR")
		if !isSet {
			socketDir = "/cloudsql"
		}
	}
	jwtSecret = mustGetenv("JWT_SECRET")
	sessionSecret = mustGetenv("SESSION_SECRET")
	bucketName = mustGetenv("BUCKET_NAME")
}

func dbInit() {
	dbLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Error,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)
	var dsn string
	if dev {
		dsn = fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable", dbUser, dbPass, dbHost, dbName)
	} else {
		dsn = fmt.Sprintf("user=%s password=%s database=%s host=%s/%s", dbUser, dbPass, dbName, socketDir, instanceConnectionName)
	}
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: dbLogger,
		TranslateError: true})
	if err != nil {
		log.Panicln(err)
	}
	err = db.AutoMigrate(&User{}, &Task{}, &SubTasks{})
	if err != nil {
		log.Fatalln("Error migrating database.")
	}
}

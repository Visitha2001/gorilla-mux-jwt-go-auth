// main.go
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/gorm"
)

var (
	dev bool
	err error
	db  *gorm.DB
)

type ProviderIndex struct {
	Providers    []string
	ProvidersMap map[string]string
}

func init() {
	dev = true
	if len(os.Args) > 1 && os.Args[1] == "dev" {
		dev = true
	}
	loadEnv()
}

func main() {
	dbInit()

	router := mux.NewRouter().StrictSlash(true)
	setRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Print("Server started on port " + "http://localhost:" + port)
	var handler http.Handler
	if dev {
		handler = cors.AllowAll().Handler(router)
	} else {
		c := cors.New(cors.Options{
			AllowedOrigins:   []string{adminUrl},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
		})
		handler = c.Handler(router)
	}
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

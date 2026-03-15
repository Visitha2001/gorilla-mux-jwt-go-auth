
---

# Go + Gorilla Mux + Air Setup

This project is a boilerplate for a Go web application featuring **Gorilla Mux** for powerful routing and **Air** for hot-reloading during development.

## 🛠 Prerequisites

* **Go**: 1.18 or higher
* **Air**: Live reload utility ([Installation Guide](https://github.com/air-verse/air))

## 🚀 Getting Started

### 1. Project Initialization

If starting from scratch, initialize your module and install the router:

```bash
# Initialize the module
go mod init my-go-app

# Install Gorilla Mux
go get -u github.com/gorilla/mux

```

### 2. File Structure

Your project directory should look like this:

```text
.
├── main.go          # Application entry point
├── go.mod           # Go module file
├── go.sum           # Checksums for dependencies
└── .air.toml        # Air configuration file

```

### 3. Application Code

Create a `main.go` file with the following content:

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	// Route Handlers
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Server is live with Air!")
	}).Methods("GET")

	// Server Configuration
	srv := &http.Server{
		Handler:      r,
		Addr:         "127.0.0.1:8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("Starting server on %s", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}

```

---

## ⚡ Development with Air

To enable live-reloading (auto-recompile on save), follow these steps:

1. **Initialize Air** (if `.air.toml` doesn't exist):
```bash
air init

```


2. **Run the App**:
```bash
air

```



The server will start, and any changes you make to `.go` files will trigger an automatic rebuild.

## 📋 Useful Commands

| Command | Description |
| --- | --- |
| `go run main.go` | Run the application once without reload. |
| `air` | Start the development server with hot-reload. |
| `go build -o bin/main` | Build a production binary. |
| `go mod tidy` | Clean up unused dependencies. |

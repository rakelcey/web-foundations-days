# Library REST API Design

A REST API design for managing books in a library resource system.

## Endpoints

### 1. List All Books
* **Method:** `GET`
* **Path:** `/api/books`
* **Description:** Retrieves a list of all books in the library catalog. Optional query parameter `?author=Name` filters books by a specific author.
* **Success Status Code:** `200 OK`

### 2. Get a Single Book
* **Method:** `GET`
* **Path:** `/api/books/{id}`
* **Description:** Retrieves details for a specific book by its unique ID.
* **Success Status Code:** `200 OK`

### 3. Create a Book
* **Method:** `POST`
* **Path:** `/api/books`
* **Description:** Adds a new book to the library inventory.
* **Example Request Body:**
  ```json
  {
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "publishedYear": 1999,
    "isbn": "978-0201616224"
  }




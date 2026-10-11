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
### 4. Update a Book
* **Method:** `PUT`
* **Path:** `/api/books/{id}`
* **Description:** Updates existing book information fully or partially by ID.
* **Example Request Body:**
  ```json
  {
    "title": "The Pragmatic Programmer (20th Anniversary Edition)",
    "author": "Andrew Hunt",
    "publishedYear": 2019,
    "isbn": "978-0135957059"
  }
### 5. Delete a Book
* **Method:** `DELETE`
* **Path:** `/api/books/{id}`
* **Description:** Removes a book record from the library catalog by its ID.
* **Success Status Code:** `204 No Content`

### 6. List Books by Author (via Query Parameter)
* **Method:** `GET`
* **Path:** `/api/books?author=Orwell`
* **Description:** Filters the list of books to only show those written by the specified author query string.
* **Success Status Code:** `200 OK`

---

## Error Handling

* **`400 Bad Request`**
  * *When it happens:* Occurs when a client sends a `POST` or `PUT` request with missing required fields (e.g., missing title) or malformed JSON syntax.
* **`404 Not Found`**
  * *When it happens:* Occurs when a client tries to `GET`, `PUT`, or `DELETE` a book using an `id` that does not exist in the database.


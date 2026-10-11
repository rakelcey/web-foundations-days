# School Database Design

## Table Explanations & Relationships

### Tables
* **`students`**: Stores personal details for each student, uniquely identified by a primary key (`student_id`). It enforces a `UNIQUE` constraint on the `email` column to prevent duplicate accounts.
* **`courses`**: Stores available academic courses, identified by a primary key (`course_id`), along with metadata like course name and credits.
* **`enrolments`**: A junction (join) table that links `students` and `courses`. It tracks which student is registered in which course and stores their performance via the `grade` column.

### Relationships & Why a Join Table is Needed
* **Students to Courses (Many-to-Many)**: A single student can enroll in multiple courses, and a single course can have many students. 
* **Why a Join Table is Needed**: Relational databases cannot directly represent a many-to-many relationship in a single table without data redundancy. The `enrolments` table resolves this by breaking the many-to-many relationship into two one-to-many relationships: one from `students` to `enrolments`, and one from `courses` to `enrolments`. It also safely stores relationship-specific attributes like grades and composite uniqueness (`UNIQUE(student_id, course_id)`).

## Proposed Index
* **Index on `enrolments(student_id)`**: 
  * **Reason**: Frequently, queries will look up all courses or enrolments associated with a specific student. Adding an index on `student_id` inside the `enrolments` table speeds up lookups, joins, and filtering operations without requiring a full table scan.

## SQL vs. NoSQL Justification
For a school management system tracking students, courses, and structured academic records (grades), **SQL** is the superior choice. Relational databases enforce strict schemas, referential integrity (foreign keys), and ACID compliance, which are critical for maintaining accurate academic histories, preventing orphan records, and ensuring grades or enrolments cannot be corrupted. NoSQL would be better suited for unstructured, high-velocity log data or flexible document stores, but a school database relies heavily on structured relationships and precise tabular queries.
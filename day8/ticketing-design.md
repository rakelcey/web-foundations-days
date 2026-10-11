# TicketHub: System Design Document

## 1. Requirements

### Functional Requirements
* **Browse Events:** Users can search and view available concerts, categories, dates, and venues.
* **View Seats:** Users can view a real-time seat map showing available, held, and booked seats for an event.
* **Hold Seats:** Users can temporarily lock specific seats for a limited window (e.g., 10 minutes) while completing payment.
* **Payment & Purchase:** Users can securely process payments to convert held seats into confirmed orders.
* **View Tickets:** Users can view their purchase history and digital tickets with QR codes.

### Non-Functional Requirements
* **Speed (Low Latency):** Event listings and static seat maps must load in under 200 milliseconds.
* **Correctness & Consistency:** Zero tolerance for double-booking. If two users try to buy the exact same seat simultaneously, only one must succeed.
* **Fairness (High Concurrency):** Under extreme traffic surges ("big sale" drops), the system must handle the load gracefully using virtual waiting rooms (queues) rather than crashing.

---

## 2. Traffic Estimates

### Normal Day Traffic
* **Registered Users:** 2,000,000 total users.
* **Daily Visitors:** 50,000 visitors per day.
* **Page Views:** Each visitor views 10 pages $\rightarrow$ $50,000 \times 10 = 500,000$ page views/day.
* **Normal QPS (Queries Per Second):** $500,000 \div 86,400\text{ seconds} \approx 5.79\text{ requests/sec}$.
* **Normal Ticket Sales:** 5,000 tickets sold per day.

### Big Sale Peak Traffic
* **Scenario:** A very popular concert goes on sale.
* **Traffic Surge:** 200,000 people try to buy its 20,000 seats within the first 10 minutes (600 seconds).
* **Peak Write/Checkout QPS:** $200,000 \div 600\text{ seconds} \approx 333.33\text{ requests/sec}$ (pure seat-grabbing attempts), with read traffic spiking much higher as users refresh seat maps.
* **Comparison:** Peak checkout and browsing traffic is over **50x to 100x** higher than normal day averages, requiring specialized queuing and caching strategies to prevent database crashes.

---

## 3. API Design

### 1. List Events
* **Method:** `GET`
* **Path:** `/api/events`
* **Description:** Retrieves a paginated list of upcoming concerts and events.
* **Success Status Code:** `200 OK`

### 2. View Event Seats
* **Method:** `GET`
* **Path:** `/api/events/{eventId}/seats`
* **Description:** Returns real-time status (available, held, booked) for all seats at a specific event.
* **Success Status Code:** `200 OK`

### 3. Hold Seats
* **Method:** `POST`
* **Path:** `/api/seats/hold`
* **Description:** Temporarily locks selected seats for a user for 10 minutes.
* **Request Body Example:**
  ```json
  {
    "userId": 42,
    "eventId": 101,
    "seatIds": [12, 13]
  }

  Success Status Code: 200 OK (or 201 Created)

4. Process Payment & Complete Order
Method: POST

Path: /api/orders

Description: Finalizes payment for held seats and generates tickets.

Request Body Example:

JSON
{
  "userId": 42,
  "holdId": "hold_998877",
  "paymentToken": "tok_visa_debit"
}
Success Status Code: 201 Created

5. View User Tickets
Method: GET

Path: /api/users/{userId}/tickets

Description: Retrieves all confirmed tickets purchased by a specific user.

Success Status Code: 200 OK

4. Data Model & Database Schema
Tables
users: Stores user account details (user_id, name, email, password_hash, created_at).

events: Stores concert/event metadata (event_id, title, venue, date, total_seats).

seats: Stores individual seats linked to events (seat_id, event_id, seat_number, status [available, held, booked]).

orders: Stores transaction records (order_id, user_id, event_id, total_amount, status, created_at).

Relationships
Users to Orders (One-to-Many): One user can place multiple orders over time.

Events to Seats (One-to-Many): One event contains many individual seats.

Events to Orders (One-to-Many): One event can have many customer orders.

5. Preventing Double-Booking
To guarantee that two users can never buy the same seat, TicketHub uses a combination of Database Transactions, Row-Level Locking (SELECT ... FOR UPDATE), and Unique Constraints:

Atomic Transactions: When a user attempts to hold or buy a seat, the operation is wrapped inside a strict ACID database transaction.

Pessimistic Locking / Row-Level Locks: When user A queries a seat to purchase it, the database issues a lock on that specific row (SELECT * FROM seats WHERE seat_id = 12 FOR UPDATE). If user B tries to access seat 12 at the exact same millisecond, user B's request is forced to wait until user A's transaction completes.

Status Check & Conditional Update: Once locked, the database verifies if status == 'available'. If yes, it immediately updates the status to held or booked. If another concurrent transaction sneaks through, a composite unique constraint or conditional check rejects the second write, ensuring zero double-bookings.

6. Architecture Diagram & Component Explanation
Plaintext
       [ Clients / Web Browsers ]
                  │
                  ▼
         [ CDN (Cloudflare) ] ──> (Serves static frontend assets)
                  │
                  ▼
         [ Load Balancer ]
                  │
                  ▼
       [ Virtual Waiting Room / Queue ] ──> (Throttles big sale spikes)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ App Server 1 ]    [ App Server 2 ] 
        │                   │
   ┌────┴────┬──────────────┴────┐
   ▼         ▼                   ▼
[Cache]   [Message Queue]   [Primary DB (Writes & Locks)]
(Redis)   (Background Jobs)       │
                                  ▼
                           [Read Replica (Reads)]
Component Breakdown
CDN: Caches static images, CSS, and JavaScript at edge locations globally.

Load Balancer: Distributes incoming HTTP traffic evenly across application servers.

Virtual Waiting Room (Queue): During big sales, excess traffic is held in a virtual queue (e.g., Redis-backed token bucket) so users enter the checkout flow in an orderly, throttled manner instead of crashing the servers.

App Servers: Stateless servers running API business logic.

Cache (Redis): Stores temporary session data, rate-limiting tokens, and cached event metadata.

Primary DB: Relational database handling strict ACID transactions, row-level locks, and order writes.

Read Replica: Handles high-volume read traffic (like browsing events and viewing seat maps) to relieve pressure from the primary database.

7. Trade-Offs
Strong Consistency vs. Availability (Consistency Prioritized for Checkout):

Trade-off: During checkout and seat holding, we enforce strict relational database consistency (ACID) to prevent double-booking. This means checkout requests may experience slightly higher latency under load, but it guarantees absolute correctness of ticket ownership.

Virtual Waiting Room vs. Immediate Access:

Trade-off: Forcing 180,000 users into a virtual waiting room queue during a big sale creates friction and makes users wait, but it trades away instant access in exchange for system stability and preventing complete server crashes.
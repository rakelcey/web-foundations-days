# SnapShare: Scaling Plan & Architecture

## 1. Assumptions & Daily Active Users (DAU)
* **Registered Users:** 10,000,000 total users.
* **Activity Rate:** 10% of registered users are active each day.
* **User Actions:** Each active user uploads 1 photo per day and views 50 feed pages per day.
* **File Sizes:** Average photo size is 2 MB, and each photo also has a 50 KB (0.05 MB) thumbnail.
* **Peak Multiplier:** Peak traffic is calculated at 5x the average load.

### Daily Active Users (DAU) Calculation:
* DAU = 10,000,000 × 0.10 = 1,000,000 active users/day

---

## 2. Traffic & Storage Calculations

### Uploads Per Second
* **Total Uploads/Day:** 1,000,000 users × 1 photo/day = 1,000,000 uploads/day
* **Average Uploads/Sec:** 1,000,000 ÷ 86,400 seconds ≈ 11.57 uploads/sec
* **Peak Uploads/Sec (5×):** 11.57 × 5 ≈ 58 uploads/sec

### Feed Views Per Second
* **Total Feed Views/Day:** 1,000,000 users × 50 feed views/day = 50,000,000 views/day
* **Average Feed Views/Sec:** 50,000,000 ÷ 86,400 seconds ≈ 578.7 views/sec
* **Peak Feed Views/Sec (5×):** 578.7 × 5 ≈ 2,894 views/sec

### Photo Storage Per Year
* **Storage Per Photo:** 2 MB (original) + 0.05 MB (thumbnail) = 2.05 MB
* **Total Photos Per Year:** 1,000,000 photos/day × 365 days = 365,000,000 photos/year
* **Total Storage Per Year:** 365,000,000 × 2.05 MB = 748,250,000 MB ≈ 748.25 TB/year

---

## 3. Read-Heavy vs. Write-Heavy Analysis
* **Classification:** The system is **heavily read-heavy**. With 50,000,000 feed views per day compared to only 1,000,000 photo uploads per day, read operations outnumber write operations by a ratio of 50 to 1.
* **Design Implications:** Because reads vastly outnumber writes, our architecture prioritizes read scalability via caching layers, read replicas, and CDNs.

---

## 4. Photo Storage Strategy
* **Why photos should not be stored inside the database:** Relational databases are optimized for structured tabular data and transactional integrity. Storing binary photo files directly in a database bloats its size, degrades query performance, slows down backups, and wastes expensive database compute resources.
* **Where they should go instead:** Photo files and thumbnails should be stored in **distributed object storage** (such as AWS S3), which is infinitely scalable, cost-effective for raw binary files, and designed specifically for high-throughput media retrieval.

---

## 5. Architecture Text Diagram

```text
       [ Clients / Mobile Apps ]
                  │
                  ▼
                [ CDN ] ──────────────┐ (Serves static photos/thumbnails close to users)
                  │                   │
                  ▼                   │
           [ Load Balancer ]          │
                  │                   │
         ┌────────┴────────┐          │
         ▼                 ▼          │
   [ App Server 1 ]  [ App Server 2 ] │
         │                 │          │
    ┌────┴────┬────────────┴────┐     │
    ▼         ▼                 ▼     │
 [ Cache ] [ Queue ]   [ Object Storage ]
             │             (S3 Buckets)
             ▼
         [ Worker ] (Generates thumbnails)
             │
             ▼
  [ Primary DB (Writes) ] ──(Replication)──> [ Read Replica (Reads) ]



  6. Component Explanations
CDN: Caches and serves static photo files and thumbnails from edge locations physically close to users to minimize latency.

Load Balancer: Distributes incoming HTTP client traffic evenly across multiple backend application servers to prevent overloading.

App Servers: Stateless servers that process core business logic, handle API requests, and authenticate users.

Cache: In-memory key-value store (such as Redis) that caches recent feed metadata to deliver rapid response times.

Primary Database (Writes): Handles all write operations such as new records, user accounts, and follow relationships.

Read Replica: Synchronized copy of the primary database dedicated strictly to handling high-volume read queries for feeds.

Object Storage: Scalable cloud storage bucket system optimized to securely store raw binary photo files and thumbnails.

Queue: Asynchronous message queue that decouples the upload response from heavy background processing tasks.

Worker: Background service that pulls image-processing jobs from the queue to resize images and generate thumbnails.

7. Step-by-Step Upload Flow
Initiation: The client sends an HTTP POST request containing the photo file to the Load Balancer.

Routing: The Load Balancer forwards the request to an available App Server.

Storage Upload: The App Server uploads the raw, high-resolution photo file directly into Object Storage.

Metadata Insertion: The App Server writes the photo's metadata records to the Primary Database.

Queue Offloading: The App Server pushes an asynchronous image processing job containing the photo reference into the Message Queue.

Immediate Response: The App Server returns a 201 Created success response back to the client immediately.

Thumbnail Generation: A background Worker pulls the job from the Queue, downloads the raw photo from Object Storage, generates a 50 KB thumbnail, and uploads the thumbnail back to Object Storage.

8. Trade-offs
Asynchronous Thumbnail Processing vs. Immediate Availability: Offloading thumbnail creation to a background queue ensures fast upload response times for users, but means thumbnails might take a few seconds to appear after an upload completes.

Database Replication Lag vs. Read Scalability: Using a Read Replica offloads heavy feed queries from the primary database, but introduces eventual consistency where a user might experience a brief delay before seeing their newly posted photo reflected in feed reads.
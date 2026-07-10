# PostgreSQL Engineering Handbook

_A practical, example-driven reference — from fundamentals to production-scale PostgreSQL._

---

## Table of Contents

0.  Database Fundamentals
1.  Introduction to PostgreSQL
2.  PostgreSQL Architecture
3.  Installation & Setup
4.  Data Types
5.  Database Design
6.  SQL Fundamentals
7.  Joins
8.  Constraints
9.  Indexes
10. Query Planning
11. Transactions
12. MVCC
13. Isolation Levels
14. Locks
15. Deadlocks
16. Views & Materialized Views
17. Sequences
18. Triggers
19. Functions & Stored Procedures
20. CTEs
21. Window Functions
22. JSON & JSONB
23. Full Text Search
24. Partitioning
25. Replication
26. High Availability
27. Performance Optimization
28. Connection Pooling
29. Backups & Recovery
30. Security
31. Monitoring
32. PostgreSQL Extensions
33. Production Architecture
34. Scaling PostgreSQL
35. Interview Questions
36. Decision Trees
37. Best Practices
38. Real Production Stories
39. Building a Production Database (End-to-End Walkthrough)

---

## 00. Database Fundamentals

### What is it / Why do we need it?

A database exists to solve one problem: **application memory is temporary, but data needs to outlive the process.**

```
Without a database:
Application → Memory → Process restarts → Data lost

With a database:
Application → Database → Disk (persistent storage) → Data survives restarts
```

### Structured vs Unstructured Data

- **Structured**: fits rows/columns, fixed schema (e.g., `users`, `orders`).
- **Unstructured**: free-form (documents, images, logs). Often stored as blobs or in NoSQL/JSONB.

### OLTP vs OLAP

|                | OLTP                        | OLAP                                                 |
| -------------- | --------------------------- | ---------------------------------------------------- |
| Purpose        | Day-to-day transactions     | Analytics / reporting                                |
| Query pattern  | Many small reads/writes     | Few large aggregations                               |
| Example        | Placing an order            | "Revenue by region, last 12 months"                  |
| PostgreSQL fit | Excellent (native use case) | Good, with extensions (Citus, TimescaleDB) for scale |

### Relational vs NoSQL

- **Relational (PostgreSQL, MySQL)**: fixed schema, strong consistency, JOINs, ACID guarantees.
- **NoSQL (MongoDB, DynamoDB)**: flexible schema, horizontal scaling by design, often eventual consistency.
- PostgreSQL blurs the line — it supports JSONB, so you often don't need to choose.

### ACID

- **Atomicity** — a transaction fully happens or not at all.
- **Consistency** — the database moves from one valid state to another (constraints hold).
- **Isolation** — concurrent transactions don't see each other's uncommitted changes.
- **Durability** — once committed, data survives crashes (via WAL).

### CAP Theorem (high level)

In a distributed system, you can only guarantee two of three:

- **Consistency** — every read gets the latest write.
- **Availability** — every request gets a response.
- **Partition tolerance** — system keeps working despite network splits.

> Single-node PostgreSQL sidesteps CAP mostly (no partitions to tolerate). Once you replicate/shard it (Patroni, Citus), CAP tradeoffs become real — e.g., synchronous replication favors consistency over availability during a network split.

**Note:** This chapter is the "why" chapter — no syntax yet. Everything from Chapter 01 onward builds on these concepts.

---

## 01. Introduction to PostgreSQL

### History

PostgreSQL began as **POSTGRES** at UC Berkeley (Michael Stonebraker, 1986), evolved to support SQL in the early 1990s, and was renamed **PostgreSQL** in 1996. It's one of the oldest actively-developed open-source databases — 25+ years of continuous releases.

### Why PostgreSQL?

- Strict SQL standards compliance
- True ACID transactions
- Extensible type system (you can create your own types, operators, index types)
- Excellent JSON/JSONB support — relational + document DB in one
- Rich indexing (GIN, GiST, BRIN, etc.)
- Free, open-source, huge extension ecosystem (PostGIS, TimescaleDB, Citus)

### Why companies love it

- No licensing cost at massive scale (unlike Oracle)
- Handles both OLTP and semi-structured data well
- Strong community + managed offerings (RDS, Cloud SQL, Supabase, Neon)
- Battle-tested for complex, high-integrity workloads (finance, healthcare)

### When NOT to use PostgreSQL

- Pure key-value caching at extreme throughput → Redis
- Massive write-heavy time-series at huge scale without a specialized extension → consider TimescaleDB (still Postgres!) or dedicated TSDBs
- Fully schema-less, horizontally-sharded from day one at web scale → MongoDB/DynamoDB might be simpler operationally
- Extremely simple embedded/local use → SQLite is lighter

### Comparison

|               | PostgreSQL                    | MySQL                          | MongoDB                           | SQLite                | Oracle                    |
| ------------- | ----------------------------- | ------------------------------ | --------------------------------- | --------------------- | ------------------------- |
| Type          | Relational                    | Relational                     | Document (NoSQL)                  | Relational (embedded) | Relational                |
| ACID          | Full                          | Full (InnoDB)                  | Multi-doc since 4.0               | Full                  | Full                      |
| JSON support  | Excellent (JSONB + indexing)  | Basic                          | Native                            | Basic                 | Good                      |
| Extensibility | Very high                     | Moderate                       | Low                               | Low                   | High                      |
| Licensing     | Free (PostgreSQL License)     | Free/Commercial (Oracle-owned) | Free/Commercial                   | Free (public domain)  | Commercial, expensive     |
| Best for      | General-purpose, complex apps | Web apps, read-heavy           | Flexible schemas, rapid iteration | Embedded/local apps   | Enterprise legacy systems |

---

## 02. PostgreSQL Architecture

### Why this chapter matters

Understanding the architecture explains almost every performance question later — why VACUUM exists, why connections are expensive, why WAL matters for durability and replication.

### High-level flow

```
Client
  ↓
Postmaster (listens for connections)
  ↓
Backend Process (forked per connection)
  ↓
Parser → Rewriter → Planner/Optimizer → Executor
  ↓
Shared Buffers (in-memory cache of disk pages)
  ↓
WAL (Write-Ahead Log) — every change logged before applied
  ↓
Disk (heap files, indexes)
```

### Key components

- **Postmaster** — the main supervisor process. Listens on a port, forks a new **backend process** per client connection (this is why PostgreSQL connections are relatively "heavy" — hence connection pooling matters, see Ch. 28).
- **Backend Process** — handles one client's queries: parsing → planning → execution.
- **Shared Buffers** — PostgreSQL's own cache of disk pages in memory, separate from the OS page cache. Tuned via `shared_buffers` (typically 25% of RAM).
- **WAL (Write-Ahead Log)** — every modification is written to a sequential log _before_ the actual data file is changed. This guarantees durability (if PostgreSQL crashes, WAL is replayed on restart) and powers replication.
- **Checkpointer** — periodically flushes dirty (modified) pages from shared buffers to disk, so recovery after a crash doesn't need to replay the entire WAL history.
- **Background Writer** — proactively writes dirty buffers to disk in the background, smoothing I/O spikes.
- **Autovacuum** — background process that reclaims space from dead tuples (see Ch. 12 MVCC) and updates planner statistics.
- **Statistics Collector / `pg_stat` views** — tracks table/index usage, row counts, cache hits — feeds both the planner and monitoring tools.
- **WAL Writer** — flushes WAL buffers to disk.

### Example: seeing this in practice

```sql
-- See active backend processes (one per connection)
SELECT pid, usename, state, query FROM pg_stat_activity;

-- See how much of a table is cached vs read from disk
SELECT relname, heap_blks_read, heap_blks_hit
FROM pg_statio_user_tables
WHERE relname = 'orders';
```

### Common mistakes

- Treating every connection as "cheap" — each is a full OS process with memory overhead. This is why apps with thousands of concurrent users need PgBouncer (Ch. 28).
- Ignoring autovacuum tuning on high-write tables, leading to bloat (see Ch. 38, Story 3).

---

## 03. Installation & Setup

### Quick install options

**Docker (recommended for learning/dev):**

```bash
docker run --name pg-dev -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=appdb -p 5432:5432 -d postgres:16
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

**macOS (Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Connecting

```bash
psql -h localhost -U postgres -d appdb
```

### Useful psql meta-commands

```
\l         list databases
\c dbname  connect to a database
\dt        list tables
\d table   describe a table (columns, indexes, constraints)
\du        list roles/users
\x         toggle expanded display (great for wide rows)
\timing    show query execution time
\q         quit
```

### Key config files

- `postgresql.conf` — main settings (memory, connections, WAL, logging)
- `pg_hba.conf` — host-based authentication (who can connect, from where, with what method)
- `pg_ident.conf` — OS-to-DB user mapping

### First things to tune on a fresh install

```conf
shared_buffers = 25% of RAM
work_mem = 4MB–64MB (per sort/hash operation, scale carefully — it's per-operation, not global)
maintenance_work_mem = 256MB–1GB (speeds up VACUUM, index creation)
max_connections = 100–200 (use PgBouncer instead of raising this too high)
effective_cache_size = 50–75% of RAM (planner hint, not an allocation)
```

### Common mistakes

- Bumping `max_connections` to "fix" connection errors instead of adding a pooler — each connection reserves memory, so this can make things worse under load.
- Leaving default `work_mem` (4MB) on analytics-heavy workloads with big sorts/joins, causing disk spills.

---

## 04. Data Types

### Numeric

```sql
SMALLINT      -- 2 bytes, -32768 to 32767
INTEGER       -- 4 bytes, ~±2.1 billion
BIGINT        -- 8 bytes, use for IDs at scale
DECIMAL(p,s)  -- exact, for money/precision-critical values
NUMERIC(10,2) -- same as DECIMAL
REAL          -- 4-byte floating point (imprecise)
DOUBLE PRECISION -- 8-byte floating point
```

### Character

```sql
CHAR(n)     -- fixed length, padded with spaces (rarely the right choice)
VARCHAR(n)  -- variable length with a limit
TEXT        -- variable length, unlimited — use this by default in PostgreSQL
```

> Unlike other databases, `VARCHAR` and `TEXT` have virtually identical performance in PostgreSQL. Prefer `TEXT` unless you have a real business reason to cap length (then add a `CHECK` constraint instead).

### Boolean

```sql
is_active BOOLEAN DEFAULT true  -- values: true, false, null
```

### UUID

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
-- Or, PostgreSQL 13+ built-in:
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

### ENUM

```sql
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'cancelled');
CREATE TABLE orders (status order_status DEFAULT 'pending');
```

> Adding a value later is easy (`ALTER TYPE ... ADD VALUE`), but removing/reordering is painful. For statuses that change often, a lookup table is often more flexible.

### Array

```sql
tags TEXT[]
INSERT INTO posts (tags) VALUES (ARRAY['postgres','sql']);
SELECT * FROM posts WHERE 'postgres' = ANY(tags);
```

### JSON / JSONB

```sql
metadata JSONB
-- Always prefer JSONB over JSON (binary, indexable, faster) — see Ch. 22.
```

### Date / Timestamp / Interval

```sql
created_at TIMESTAMPTZ DEFAULT now()  -- always prefer TIMESTAMPTZ over TIMESTAMP
birth_date DATE
duration INTERVAL  -- e.g. INTERVAL '2 days 3 hours'
```

> `TIMESTAMPTZ` stores in UTC internally and converts on display — this avoids timezone bugs. Default to it unless you have a specific reason not to.

### Money, Network, Geometric, Custom Types

```sql
price MONEY               -- generally avoid; use NUMERIC(10,2) instead (locale-dependent formatting issues)
ip_address INET            -- native IP type with operators (<<, >>, etc.)
mac MACADDR
location POINT              -- geometric type; for real geo work, use PostGIS (Ch. 32)

-- Custom composite type
CREATE TYPE address AS (street TEXT, city TEXT, zip TEXT);
```

### When to use each — quick guide

| Need                         | Use                                    |
| ---------------------------- | -------------------------------------- |
| Money                        | `NUMERIC(12,2)`, never `FLOAT`/`MONEY` |
| Unique external-facing ID    | `UUID`                                 |
| Fixed set of known states    | `ENUM` or lookup table                 |
| Flexible/evolving attributes | `JSONB`                                |
| Free text                    | `TEXT`                                 |
| Any timestamp                | `TIMESTAMPTZ`                          |

---

## 05. Database Design

### Normalization

The process of organizing data to reduce redundancy.

- **1NF** — atomic values, no repeating groups (no comma-separated lists in a column).
- **2NF** — 1NF + every non-key column depends on the _whole_ primary key (relevant for composite keys).
- **3NF** — 2NF + no transitive dependencies (non-key columns depend only on the key, not on other non-key columns).
- **BCNF** — a stricter version of 3NF, handles edge cases with overlapping candidate keys.

**Example — fixing a 1NF violation:**

```sql
-- Bad (violates 1NF)
CREATE TABLE orders (id INT, product_names TEXT); -- 'Shoes,Socks,Hat'

-- Good
CREATE TABLE orders (id INT PRIMARY KEY);
CREATE TABLE order_items (order_id INT REFERENCES orders(id), product_name TEXT);
```

### Denormalization

Deliberately introducing redundancy for read performance (common in reporting tables, caches). Tradeoff: faster reads, more complex writes (must keep copies in sync).

### ER Diagrams

Visual representation of entities and relationships:

```
Users (1) ────< (many) Orders (1) ────< (many) OrderItems
```

### Keys

```sql
-- Primary Key: uniquely identifies a row
id SERIAL PRIMARY KEY

-- Foreign Key: references another table's key
user_id INT REFERENCES users(id)

-- Composite Key: multiple columns together form uniqueness
PRIMARY KEY (order_id, product_id)

-- Surrogate Key: artificial key with no business meaning (id, uuid)
-- Natural Key: a real-world unique attribute (e.g., email, SSN) used as the key
```

### Surrogate vs Natural Key — quick guide

|                  | Surrogate (`id SERIAL`/`UUID`) | Natural (`email`, `ISBN`)     |
| ---------------- | ------------------------------ | ----------------------------- |
| Stability        | Never changes                  | Can change (email updates)    |
| Join performance | Fast (small int/uuid)          | Can be slower (strings)       |
| Recommendation   | Default choice                 | Use only when truly immutable |

### Best practices

- Prefer surrogate keys (`id BIGSERIAL` or `UUID`) as primary keys.
- Always add foreign keys — don't rely on application code alone for referential integrity.
- Normalize first, denormalize deliberately (and document why) when performance demands it.

---

## 06. SQL Fundamentals

### Logical execution order

SQL is _written_ in one order but _executed_ in another — this trips up almost everyone at first.

```
FROM        (get the base tables, apply joins)
  ↓
WHERE       (filter rows before grouping)
  ↓
GROUP BY    (group remaining rows)
  ↓
HAVING      (filter groups)
  ↓
SELECT      (pick/compute columns)
  ↓
ORDER BY    (sort final result)
  ↓
LIMIT/OFFSET (take a slice)
```

> This is why you can't reference a `SELECT` alias in `WHERE` (WHERE runs before SELECT), but you _can_ in `ORDER BY` (it runs after).

### Core statements

```sql
SELECT id, name FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10;

INSERT INTO users (name, email) VALUES ('Ana', 'ana@example.com');

UPDATE users SET active = false WHERE last_login < now() - INTERVAL '1 year';

DELETE FROM users WHERE id = 42;
```

### GROUP BY / HAVING

```sql
SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5;   -- filters groups, not rows
```

### DISTINCT

```sql
SELECT DISTINCT city FROM customers;
SELECT DISTINCT ON (customer_id) *  -- Postgres-specific: first row per group
FROM orders ORDER BY customer_id, created_at DESC;
```

### Aliases

```sql
SELECT u.name AS customer_name, COUNT(o.id) AS total_orders
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.name;
```

### Common mistakes

- Using `WHERE` to filter aggregate results (use `HAVING`).
- Forgetting `ORDER BY` with `LIMIT` — without it, "top 10" is undefined/non-deterministic.
- `SELECT *` in production code — breaks when columns change, wastes bandwidth.

---

## 07. Joins

### Why joins exist

Normalized data is spread across tables — joins recombine it at query time.

### Visual reference

```
A ●●●●          B     ●●●
   (users)          (orders)

INNER JOIN  →  only matching rows:      ●●   (users WITH orders)
LEFT JOIN   →  all of A + matches:      ●●●● + nulls where no match
RIGHT JOIN  →  all of B + matches:      ●●● + nulls where no match
FULL JOIN   →  everything from both, matched where possible
```

### Syntax & examples

```sql
-- INNER JOIN: only users who have orders
SELECT u.name, o.id AS order_id
FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- LEFT JOIN: all users, with order info if it exists
SELECT u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- RIGHT JOIN: all orders, with user info if it exists (rare in practice — usually rewritten as LEFT JOIN with tables swapped)
SELECT u.name, o.id
FROM users u
RIGHT JOIN orders o ON o.user_id = u.id;

-- FULL JOIN: everything from both sides
SELECT u.name, o.id
FROM users u
FULL JOIN orders o ON o.user_id = u.id;

-- SELF JOIN: comparing a table to itself (e.g., employees and their managers)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- CROSS JOIN: cartesian product (every row × every row) — use deliberately, rarely by accident
SELECT s.size, c.color FROM sizes s CROSS JOIN colors c;
```

### How joins actually work internally

The planner picks one of three physical strategies based on table size, indexes, and statistics:

- **Nested Loop** — for each row in the outer table, scan the inner table (or use an index). Best for small tables or when an index makes the inner lookup cheap.
- **Hash Join** — build a hash table from the smaller table, then probe it with the larger table. Best for large, unsorted datasets with equality joins.
- **Merge Join** — both inputs are sorted on the join key, then merged like a zipper. Best when data is already sorted (e.g., via an index).

```sql
EXPLAIN ANALYZE
SELECT u.name, o.id FROM users u JOIN orders o ON o.user_id = u.id;
-- Look at the plan: Nested Loop / Hash Join / Merge Join
```

### Common mistakes

- Forgetting the `ON` clause → accidental cross join.
- Using `RIGHT JOIN` when a `LEFT JOIN` with swapped table order reads more naturally (purely stylistic, but affects readability).
- Joining on unindexed columns on large tables → forces sequential scans (see Ch. 09).

---

## 08. Constraints

### Why they matter

Constraints enforce data integrity **at the database level** — they don't rely on application code being correct, so they protect against bugs, race conditions, and multiple applications writing to the same DB.

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,                          -- Primary Key
    user_id BIGINT NOT NULL REFERENCES users(id),       -- Foreign Key + Not Null
    total NUMERIC(10,2) CHECK (total >= 0),             -- Check
    coupon_code TEXT UNIQUE,                            -- Unique
    status TEXT NOT NULL DEFAULT 'pending',             -- Default + Not Null
    CONSTRAINT valid_status CHECK (status IN ('pending','paid','shipped','cancelled'))
);
```

### Each type

- **Primary Key** — uniquely identifies each row; implies `NOT NULL` + `UNIQUE`; creates an index automatically.
- **Foreign Key** — enforces that a value must exist in the referenced table. Supports `ON DELETE CASCADE`, `ON DELETE SET NULL`, `ON DELETE RESTRICT`.
- **Check** — arbitrary boolean expression that must hold (`CHECK (age >= 18)`).
- **Unique** — no two rows can share the same value(s) in the specified column(s).
- **Not Null** — column can't be null.
- **Default** — value used when no explicit value is provided on insert.
- **Exclusion** — generalizes uniqueness to non-equality operators (e.g., no overlapping date ranges):

```sql
CREATE TABLE bookings (
    room_id INT,
    during TSRANGE,
    EXCLUDE USING GIST (room_id WITH =, during WITH &&)  -- no double-booking a room
);
```

- **Deferred Constraints** — checked at the end of a transaction instead of immediately, useful for circular foreign keys or bulk operations:

```sql
ALTER TABLE orders
  ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
  DEFERRABLE INITIALLY DEFERRED;
```

### ON DELETE behavior example

```sql
user_id BIGINT REFERENCES users(id) ON DELETE CASCADE   -- delete orders when user is deleted
user_id BIGINT REFERENCES users(id) ON DELETE SET NULL   -- keep orders, null out user_id
user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT   -- block deleting a user with orders (default-like behavior)
```

### Common mistakes

- Relying only on application-level validation — a second service or a manual `psql` fix can silently corrupt data without DB constraints.
- Forgetting `ON DELETE` behavior, leading to orphaned rows or unexpected cascading deletes.
- Adding `UNIQUE` after the fact on a large table without checking existing duplicates first (the `ALTER TABLE` will fail).

---

## 09. Indexes

### Why indexes exist

```
Without an index:
Table → Scan all 10,000,000 rows → find matches (Sequential Scan)

With an index:
B-Tree → Jump straight to the matching entries → Read only those rows
```

An index is a separate data structure that trades write cost + storage for dramatically faster reads.

### Types of indexes

| Type                 | Best for                                                                         | Example                                          |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| **B-Tree** (default) | Equality & range queries (`=`, `<`, `>`, `BETWEEN`, sorting)                     | `CREATE INDEX ON orders(created_at);`            |
| **Hash**             | Pure equality only, rarely used over B-Tree today                                | `CREATE INDEX ON users USING HASH (email);`      |
| **GIN**              | Composite values: arrays, JSONB, full-text search                                | `CREATE INDEX ON posts USING GIN (tags);`        |
| **GiST**             | Geometric data, ranges, nearest-neighbor, exclusion constraints                  | `CREATE INDEX ON bookings USING GIST (during);`  |
| **SP-GiST**          | Non-balanced structures: IPs, phone number prefixes, quadtrees                   | `CREATE INDEX ON contacts USING SPGIST (phone);` |
| **BRIN**             | Very large tables with naturally sorted data (e.g., time-series by insert order) | `CREATE INDEX ON logs USING BRIN (created_at);`  |

### Expression, Partial, Composite, Covering indexes

```sql
-- Expression index: index the *result* of a function
CREATE INDEX idx_lower_email ON users (LOWER(email));
-- Now this uses the index:
SELECT * FROM users WHERE LOWER(email) = 'ana@example.com';

-- Partial index: only index a subset of rows
CREATE INDEX idx_active_users ON users (id) WHERE active = true;
-- Great when most rows are inactive and you only ever query active ones.

-- Composite index: multiple columns, column order matters!
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at);
-- Works for: WHERE user_id = ?  AND  WHERE user_id = ? AND created_at > ?
-- Does NOT help: WHERE created_at > ? alone (leftmost column must be used)

-- Covering index (INCLUDE): avoid a table lookup entirely for certain queries
CREATE INDEX idx_orders_covering ON orders (user_id) INCLUDE (total, status);
-- A query selecting only user_id, total, status can be satisfied by the index alone (Index-Only Scan)
```

### When NOT to create an index

- Small tables (a sequential scan is often faster than the index overhead).
- Columns rarely used in `WHERE`/`JOIN`/`ORDER BY`.
- High-write tables where every extra index slows down every `INSERT`/`UPDATE`/`DELETE`.
- Low-cardinality columns (e.g., a boolean `is_active` alone) — usually better as part of a composite or partial index.

### Checking index usage

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Look for "Index Scan" or "Index Only Scan" vs "Seq Scan"

-- Find unused indexes (candidates for removal):
SELECT relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Common mistakes

- Indexing every column "just in case" — hurts write performance for no read benefit.
- Wrong column order in composite indexes.
- Not using partial indexes when a large fraction of rows are irrelevant to common queries.
- Forgetting that `CREATE INDEX` locks the table by default — use `CREATE INDEX CONCURRENTLY` in production to avoid blocking writes.

```sql
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders (user_id);
```

---

## 10. Query Planning

### The pipeline

```
Parser        → checks SQL syntax, builds a parse tree
Rewriter      → applies rules/views
Planner/Optimizer → generates multiple possible execution plans, estimates cost for each, picks cheapest
Executor      → runs the chosen plan, returns rows
```

### EXPLAIN and EXPLAIN ANALYZE

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
-- Shows the planned execution WITHOUT running the query (estimates only)

EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- ACTUALLY RUNS the query and shows real timing + row counts alongside estimates
```

Example output:

```
Index Scan using idx_orders_user_id on orders  (cost=0.29..8.31 rows=5 width=120)
                                                (actual time=0.02..0.03 rows=5 loops=1)
  Index Cond: (user_id = 42)
Planning Time: 0.15 ms
Execution Time: 0.05 ms
```

- **cost=0.29..8.31** — estimated startup cost .. total cost (arbitrary units, not ms)
- **rows=5** — estimated rows vs **actual rows=5** — if these diverge a lot, statistics are stale (`ANALYZE` the table).
- **Seq Scan** appearing on a large table is often (not always) a red flag — check if an index should exist.

### Statistics

The planner relies on statistics (`pg_stats`) about data distribution to estimate costs. These are refreshed by `ANALYZE` (run automatically by autovacuum, or manually):

```sql
ANALYZE orders;
```

Stale statistics after a bulk load can lead to terrible plan choices — always `ANALYZE` after large data changes.

### Scan types

- **Sequential Scan** — reads the entire table, row by row. Fine for small tables or when most rows match.
- **Index Scan** — uses an index to find matching rows, then fetches each from the heap.
- **Index Only Scan** — satisfies the query entirely from the index (no heap fetch needed) — fastest, requires a covering index and an up-to-date visibility map.
- **Bitmap Scan** — builds a bitmap of matching pages from the index, then fetches them in physical order; good middle-ground when many (but not too many) rows match.
- **Parallel Scan** — splits work across multiple background workers for large scans/aggregations.

### Common mistakes

- Reading only the estimated `cost`, ignoring `actual time` in `EXPLAIN ANALYZE`.
- Not re-running `ANALYZE` after large imports.
- Assuming an index will always be used — the planner may choose a sequential scan if it estimates that's cheaper (e.g., low selectivity).

---

## 11. Transactions

### What is a transaction?

A group of one or more SQL statements executed as a single unit — either **all** succeed (COMMIT) or **none** do (ROLLBACK).

```
BEGIN
  ↓
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  ↓
INSERT INTO ledger (account_id, amount) VALUES (1, -100);
  ↓
COMMIT
```

### Syntax

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- or ROLLBACK; to undo everything since BEGIN
```

### Savepoints

Allow partial rollback within a transaction:

```sql
BEGIN;
INSERT INTO orders (id) VALUES (1);
SAVEPOINT before_risky_step;

INSERT INTO orders (id) VALUES (1); -- fails: duplicate key
ROLLBACK TO SAVEPOINT before_risky_step;  -- undo just the failed part

INSERT INTO orders (id) VALUES (2);  -- continue safely
COMMIT;
```

### Why transactions matter

Without them, a classic money-transfer bug: if the app crashes between the debit and the credit, money simply disappears. Transactions guarantee it's all-or-nothing.

### Best practices

- Keep transactions **short** — long-running transactions hold locks and block VACUUM (see Ch. 12).
- Never do slow external work (API calls, emails) inside an open transaction.
- Always handle errors explicitly — an aborted transaction in Postgres rejects all further statements until `ROLLBACK`.

---

## 12. MVCC (Multi-Version Concurrency Control)

> This topic alone separates junior from senior developers.

### Without MVCC

Readers and writers block each other — a long-running read can stall writes and vice versa.

### With MVCC

Each transaction sees a **consistent snapshot** of the data as of when it started. Writers don't block readers; readers don't block writers.

```
Transaction A updates a row:
  Old Row (still visible to transactions that started earlier)
      ↓
  New Row (visible to transactions starting after the update commits)
      ↓
  VACUUM eventually removes the old row version once nothing needs it
```

### How it actually works

PostgreSQL never overwrites a row in place on `UPDATE`. Instead:

1. The old row version is marked as expired (but not deleted).
2. A new row version is inserted.
3. Each row has hidden system columns `xmin` (creating transaction ID) and `xmax` (expiring transaction ID) that determine visibility.

```sql
SELECT xmin, xmax, * FROM accounts WHERE id = 1;
```

### Why VACUUM exists

Because old row versions ("dead tuples") aren't deleted immediately, they accumulate. **VACUUM** reclaims that space so it can be reused. Without regular vacuuming, tables **bloat** — growing far larger than the actual live data (see Ch. 38, Story 3).

```sql
VACUUM orders;             -- reclaim dead tuple space for reuse (doesn't shrink file size)
VACUUM FULL orders;        -- rewrites the table, actually shrinks file size, but takes an exclusive lock
VACUUM ANALYZE orders;     -- vacuum + refresh planner statistics
```

### Autovacuum

A background process that runs `VACUUM`/`ANALYZE` automatically based on thresholds (`autovacuum_vacuum_threshold`, `autovacuum_vacuum_scale_factor`). Almost never disable it — instead, tune it more aggressively for high-write tables:

```sql
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05);
```

### Common mistakes

- Disabling autovacuum "to reduce load" — leads to severe bloat and, eventually, transaction ID wraparound risk (a serious outage scenario).
- Running `VACUUM FULL` on a live production table without realizing it takes an exclusive lock.
- Long-running transactions preventing VACUUM from reclaiming rows (an open transaction can keep old versions "possibly needed" indefinitely).

---

## 13. Isolation Levels

### The four SQL standard levels (PostgreSQL implements 3 distinctly)

| Level                        | Dirty Read                                      | Non-Repeatable Read | Phantom Read                                  |
| ---------------------------- | ----------------------------------------------- | ------------------- | --------------------------------------------- |
| Read Uncommitted             | Possible (but PG treats this as Read Committed) | Possible            | Possible                                      |
| Read Committed (**default**) | Prevented                                       | Possible            | Possible                                      |
| Repeatable Read              | Prevented                                       | Prevented           | Prevented (PG is stricter than standard here) |
| Serializable                 | Prevented                                       | Prevented           | Prevented                                     |

### The anomalies explained

- **Dirty Read** — reading another transaction's _uncommitted_ changes. (PostgreSQL never allows this, even at its lowest level.)
- **Non-Repeatable Read** — you read a row twice in the same transaction and get different values because another transaction committed a change in between.
- **Phantom Read** — you run the same query twice and get a _different set of rows_ (not just changed values) because another transaction inserted/deleted matching rows.

### Setting isolation level

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM accounts WHERE id = 1;
-- ... other transaction commits a change here ...
SELECT * FROM accounts WHERE id = 1;  -- same result as before, guaranteed
COMMIT;
```

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- Behaves as if transactions ran one at a time, in some serial order.
-- If a conflict is detected, PostgreSQL aborts one transaction with a
-- "could not serialize access" error — your app must retry it.
COMMIT;
```

### Visual example — Non-Repeatable Read under Read Committed

```
T1: SELECT balance FROM accounts WHERE id=1;  → 100
T2: UPDATE accounts SET balance = 50 WHERE id=1; COMMIT;
T1: SELECT balance FROM accounts WHERE id=1;  → 50   (different! not repeatable)
```

### Practical guidance

- **Read Committed** (default) is fine for most CRUD apps.
- **Repeatable Read** for reports that must be internally consistent across multiple queries.
- **Serializable** for financial/inventory logic where true correctness under concurrency matters — but your application must handle retry-on-conflict.

---

## 14. Locks

### Why locks exist

To prevent two transactions from making conflicting changes to the same data at the same time.

### Types

- **Row-level locks** — acquired automatically by `UPDATE`/`DELETE`/`SELECT FOR UPDATE`; only block operations on the _same row_.
- **Table-level locks** — acquired by DDL (`ALTER TABLE`), `LOCK TABLE`, or certain bulk operations; block wider operations.
- **Share Lock** — allows others to also read/share-lock, but blocks exclusive locks (e.g., `SELECT FOR SHARE`).
- **Exclusive Lock** — blocks all other locks on the same resource (e.g., `SELECT FOR UPDATE`, `UPDATE`).
- **Advisory Locks** — application-defined locks not tied to any table row; useful for coordinating app-level logic (e.g., "only one job of this type runs at a time"):

```sql
SELECT pg_advisory_lock(12345);
-- ... do exclusive work ...
SELECT pg_advisory_unlock(12345);
```

### Explicit row locking

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;  -- locks this row until COMMIT/ROLLBACK
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

### How blocking happens

```
Transaction A: UPDATE accounts SET balance=90 WHERE id=1;  -- row locked, uncommitted
Transaction B: UPDATE accounts SET balance=80 WHERE id=1;  -- BLOCKS, waits for A
Transaction A: COMMIT;                                     -- B proceeds
```

### Inspecting locks

```sql
SELECT pid, locktype, relation::regclass, mode, granted
FROM pg_locks
WHERE relation = 'accounts'::regclass;

-- Find blocking queries
SELECT blocked_locks.pid AS blocked_pid, blocking_locks.pid AS blocking_pid
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.relation = blocked_locks.relation
  AND blocking_locks.pid != blocked_locks.pid
WHERE NOT blocked_locks.granted;
```

### Common mistakes

- Holding a transaction open (e.g., waiting on user input) while holding row locks.
- Using `SELECT FOR UPDATE` on a wide range of rows unnecessarily, serializing what could be concurrent work.

---

## 15. Deadlocks

> One of the best interview topics.

### What is a deadlock?

Two (or more) transactions each hold a lock the other needs — neither can proceed.

```
Transaction A                    Transaction B
  ↓                                ↓
Lock Row 1                       Lock Row 2
  ↓                                ↓
Waiting for Row 2  ←──────────→  Waiting for Row 1
        (circular wait — deadlock!)
```

### Example that causes it

```sql
-- Transaction A
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 1;  -- locks row 1
-- (pauses)
UPDATE accounts SET balance = balance + 10 WHERE id = 2;  -- wants row 2, blocks

-- Transaction B (running concurrently)
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 2;  -- locks row 2
-- (pauses)
UPDATE accounts SET balance = balance + 10 WHERE id = 1;  -- wants row 1, blocks
-- DEADLOCK: PostgreSQL detects this and aborts one transaction automatically
```

### Detection

PostgreSQL runs a **deadlock detector** periodically (`deadlock_timeout`, default 1s). When a cycle is found, it kills one transaction with:

```
ERROR: deadlock detected
```

The application must catch this and retry.

### Resolution

- PostgreSQL resolves it for you — it always aborts one of the transactions.
- Your job is to **catch the error and retry** the aborted transaction.

### Avoidance (the real fix)

- **Always acquire locks/rows in the same order** across all code paths (e.g., always update the lower `id` first).
- Keep transactions short.
- Use lower isolation levels when correctness allows.
- Avoid interactive/user-input steps inside a transaction.

```sql
-- Safe pattern: always lock in ascending ID order
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = LEAST(1,2);
UPDATE accounts SET balance = balance + 10 WHERE id = GREATEST(1,2);
COMMIT;
```

---

## 16. Views & Materialized Views

### Views

A saved query that behaves like a virtual table — always reflects live data, no storage of its own.

```sql
CREATE VIEW active_users AS
SELECT id, name, email FROM users WHERE active = true;

SELECT * FROM active_users WHERE name LIKE 'A%';
```

- Great for simplifying repeated complex queries and for access control (expose a view, not the raw table).
- Every query against it re-runs the underlying SQL — no performance benefit by itself.

### Materialized Views

Like a view, but the result is **physically stored** — a snapshot, not live.

```sql
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
FROM orders
GROUP BY 1;

-- Refresh when you want updated data:
REFRESH MATERIALIZED VIEW monthly_revenue;

-- Refresh without blocking reads (requires a unique index on the view):
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;
```

### Performance tradeoff

|                | View                            | Materialized View                           |
| -------------- | ------------------------------- | ------------------------------------------- |
| Data freshness | Always current                  | Stale until refreshed                       |
| Query speed    | Same as underlying query        | Fast (pre-computed)                         |
| Storage        | None                            | Uses disk space                             |
| Best for       | Simplifying/abstracting queries | Expensive aggregations, dashboards, reports |

### Common mistakes

- Expecting a materialized view to auto-update — it doesn't; you must schedule refreshes (e.g., via `pg_cron` or an app job).
- Forgetting the unique index needed for `REFRESH ... CONCURRENTLY`.

---

## 17. Sequences

### What is it?

An auto-incrementing number generator, most commonly used to back `SERIAL`/`BIGSERIAL` primary keys.

```sql
CREATE SEQUENCE order_id_seq START 1 INCREMENT 1;

SELECT nextval('order_id_seq');  -- 1
SELECT nextval('order_id_seq');  -- 2
SELECT currval('order_id_seq');  -- 2 (current session's last value)
SELECT setval('order_id_seq', 1000);  -- reset/jump the sequence
```

### SERIAL / BIGSERIAL (syntactic sugar over a sequence)

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,   -- creates orders_id_seq automatically
    ...
);
-- Modern equivalent, preferred since PG 10:
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ...
);
```

### Key facts

- Sequences are **not transactional** — if a transaction rolls back, the sequence value it consumed is _not_ returned. This is intentional (avoids blocking concurrent inserts) but means gaps in IDs are normal and expected.
- Sequences are safe under high concurrency — no locking contention like a naive `MAX(id)+1` approach would cause.

### Common mistakes

- Panicking about "gaps" in auto-incremented IDs — this is normal, not a bug.
- Using `SELECT MAX(id) + 1` to generate IDs manually — this is a race condition under concurrency; always use sequences/identity columns.

---

## 18. Triggers

### What is it?

A function that automatically fires in response to `INSERT`/`UPDATE`/`DELETE` on a table.

### Example: auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

### Example: audit log

```sql
CREATE TABLE order_audit (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    old_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_audit (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_status
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_status_change();
```

### Trigger timing & scope

- **BEFORE** — can modify `NEW` before it's written; good for validation/defaults.
- **AFTER** — row is already written; good for side effects (audit logs, notifications).
- **FOR EACH ROW** — fires once per affected row.
- **FOR EACH STATEMENT** — fires once per statement, regardless of row count.

### Common mistakes

- Overusing triggers for business logic that's hard to trace/debug — "invisible" side effects surprise other engineers. Prefer explicit application code except for cross-cutting concerns (audit, timestamps, cache invalidation).
- Expensive logic in `FOR EACH ROW` triggers on bulk inserts — can silently make batch operations very slow.

---

## 19. Functions & Stored Procedures

### Functions (return a value, can be used in SELECT)

```sql
CREATE OR REPLACE FUNCTION get_total_spent(p_user_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM orders WHERE user_id = p_user_id;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

SELECT get_total_spent(42);
```

### Procedures (perform actions, support transaction control, called with CALL)

```sql
CREATE OR REPLACE PROCEDURE transfer_funds(from_id BIGINT, to_id BIGINT, amount NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
  COMMIT;  -- procedures CAN manage transactions; functions cannot
END;
$$;

CALL transfer_funds(1, 2, 100);
```

### Function vs Procedure — key difference

|                                           | Function                                   | Procedure                                               |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Called with                               | `SELECT fn(...)`                           | `CALL proc(...)`                                        |
| Returns a value                           | Yes (or void)                              | No (use OUT params if needed)                           |
| Can manage transactions (COMMIT/ROLLBACK) | No                                         | Yes                                                     |
| Use case                                  | Computed values, reusable logic in queries | Multi-step operations with explicit transaction control |

### Common mistakes

- Trying to `COMMIT` inside a `FUNCTION` — not allowed; use a `PROCEDURE` if you need transaction control.
- Overusing PL/pgSQL for logic that's clearer and more testable in the application layer — reserve DB functions for things that genuinely benefit from running close to the data (integrity-critical, performance-critical).

---

## 20. CTEs (Common Table Expressions)

### What is it?

A named, temporary result set defined with `WITH`, usable within a single query — makes complex queries readable.

```sql
WITH big_spenders AS (
  SELECT user_id, SUM(total) AS spent
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 1000
)
SELECT u.name, b.spent
FROM big_spenders b
JOIN users u ON u.id = b.user_id
ORDER BY b.spent DESC;
```

### Recursive CTEs (for hierarchical/graph data)

```sql
WITH RECURSIVE org_chart AS (
  -- Anchor: top-level employees (no manager)
  SELECT id, name, manager_id, 1 AS level
  FROM employees WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: employees whose manager is already in the result
  SELECT e.id, e.name, e.manager_id, oc.level + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY level;
```

### Materialized vs Not Materialized (PG 12+)

```sql
WITH cte AS MATERIALIZED (...)     -- forces PostgreSQL to compute the CTE once, store it
WITH cte AS NOT MATERIALIZED (...) -- allows inlining into the outer query (can be faster)
```

> Since PG 12, the planner can inline simple CTEs automatically (`NOT MATERIALIZED` is now often the default behavior) — use `MATERIALIZED` explicitly if you need the old "always compute once" behavior (e.g., for a CTE with side effects like `INSERT ... RETURNING`).

### Common use case: multi-step data pipelines in one statement

```sql
WITH updated AS (
  UPDATE orders SET status = 'shipped' WHERE status = 'paid' AND created_at < now() - INTERVAL '2 days'
  RETURNING id, user_id
)
INSERT INTO notifications (user_id, message)
SELECT user_id, 'Your order has shipped!' FROM updated;
```

### Common mistakes

- Assuming a CTE is always materialized (pre-PG12 mental model) — check `EXPLAIN` if performance matters.
- Using deeply nested CTEs for simple filters where a plain subquery or JOIN would be clearer.

---

## 21. Window Functions

### What is it?

Computes a value across a "window" of related rows **without** collapsing them into a single row (unlike `GROUP BY`).

```sql
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rank_with_ties,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank_with_ties,
  LAG(salary)  OVER (PARTITION BY department ORDER BY salary DESC) AS next_lower_salary,
  LEAD(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS next_higher_salary,
  FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS highest_in_dept,
  SUM(salary)  OVER (PARTITION BY department) AS dept_total
FROM employees;
```

### ROW_NUMBER vs RANK vs DENSE_RANK

```
salary: 100, 90, 90, 80

ROW_NUMBER(): 1, 2, 3, 4    -- always unique, no ties
RANK():       1, 2, 2, 4    -- ties share rank, next rank skips
DENSE_RANK(): 1, 2, 2, 3    -- ties share rank, no gap after
```

### Real example: top 3 orders per customer

```sql
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn
  FROM orders
) ranked
WHERE rn <= 3;
```

### Real example: running total

```sql
SELECT date, amount,
  SUM(amount) OVER (ORDER BY date) AS running_total
FROM transactions;
```

### Real example: month-over-month change

```sql
SELECT month, revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) AS change_from_last_month
FROM monthly_revenue;
```

### Common mistakes

- Confusing window functions with `GROUP BY` — window functions keep every row; `GROUP BY` collapses rows.
- Forgetting `PARTITION BY` when you actually want per-group calculations (without it, the window spans the whole result set).

---

## 22. JSON & JSONB

### JSON vs JSONB

|                      | JSON                                              | JSONB              |
| -------------------- | ------------------------------------------------- | ------------------ |
| Storage              | Text, exact copy of input                         | Binary, decomposed |
| Whitespace/key order | Preserved                                         | Not preserved      |
| Speed                | Slower to query                                   | Faster to query    |
| Indexable            | No                                                | Yes (GIN)          |
| Recommendation       | Rarely — only if exact input preservation matters | **Default choice** |

### Basic usage

```sql
CREATE TABLE events (id BIGSERIAL PRIMARY KEY, payload JSONB);

INSERT INTO events (payload) VALUES ('{"type": "click", "user": {"id": 42, "name": "Ana"}}');

-- Operators:
SELECT payload->'user'->>'name' FROM events;      -- ->> returns text, -> returns jsonb
SELECT payload->'user'->'id' FROM events;
SELECT payload #>> '{user,name}' FROM events;     -- path-based access

-- Containment / existence
SELECT * FROM events WHERE payload @> '{"type": "click"}';   -- contains
SELECT * FROM events WHERE payload ? 'type';                  -- key exists
SELECT * FROM events WHERE payload -> 'user' ? 'id';
```

### Indexing JSONB

```sql
CREATE INDEX idx_events_payload ON events USING GIN (payload);
-- Speeds up @>, ?, ?&, ?| operators

-- Or index a specific extracted path (expression index) if you only ever query one field:
CREATE INDEX idx_events_type ON events ((payload->>'type'));
```

### Updating JSONB

```sql
UPDATE events
SET payload = jsonb_set(payload, '{user,name}', '"Ana Lopez"')
WHERE id = 1;

-- Remove a key
UPDATE events SET payload = payload - 'type' WHERE id = 1;

-- Merge/patch
UPDATE events SET payload = payload || '{"processed": true}' WHERE id = 1;
```

### When JSON is appropriate

- Semi-structured or evolving fields (e.g., third-party webhook payloads, user preferences).
- Data whose shape genuinely varies per row.
- **Not** appropriate as a substitute for proper columns/tables just to avoid migrations — that trades short-term convenience for long-term query pain and lost constraint enforcement.

### Common mistakes

- Using plain `JSON` instead of `JSONB` "because it sounds simpler" — you lose indexing and speed for no real benefit.
- Storing relational data (that should be its own table) inside JSONB just to avoid a migration.
- Forgetting a GIN index, then wondering why JSONB queries are slow on large tables.

---

## 23. Full Text Search

### Core concepts

- **`tsvector`** — a preprocessed, searchable representation of text (words reduced to lexemes, stripped of stop words).
- **`tsquery`** — a parsed search query, matched against a `tsvector`.

```sql
SELECT to_tsvector('english', 'The quick brown foxes are jumping');
-- 'brown':3 'fox':4 'jump':6 'quick':2  (stop words removed, words stemmed)

SELECT to_tsquery('english', 'fox & jump');

SELECT to_tsvector('english', 'The quick brown foxes are jumping')
       @@ to_tsquery('english', 'fox & jump');  -- true
```

### Setting up search on a table

```sql
ALTER TABLE articles ADD COLUMN search_vector TSVECTOR;

UPDATE articles SET search_vector = to_tsvector('english', title || ' ' || body);

-- Keep it up to date automatically:
CREATE TRIGGER trg_search_vector
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title, body);

CREATE INDEX idx_articles_search ON articles USING GIN (search_vector);
```

### Searching

```sql
SELECT title FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgres & performance');
```

### Ranking results

```sql
SELECT title,
  ts_rank(search_vector, to_tsquery('english', 'postgres & performance')) AS rank
FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgres & performance')
ORDER BY rank DESC;
```

### Alternatives

- **`pg_trgm`** extension — trigram-based fuzzy/similarity search, good for typo-tolerant search and `LIKE '%term%'` acceleration.
- **Dedicated search engines** (Elasticsearch, Meilisearch, Typesense) — better for very large-scale, faceted, or highly relevance-tuned search; PostgreSQL FTS is excellent for small-to-medium scale search without adding infrastructure.

### Common mistakes

- Using `LIKE '%term%'` on large tables instead of FTS — forces sequential scans.
- Forgetting to keep `search_vector` updated on every insert/update (always use a trigger or generated column).

---

## 24. Partitioning

### Why partition?

Splitting one logically huge table into physically smaller pieces improves query performance (scan only relevant partitions), maintenance (drop old partitions instantly), and vacuum efficiency.

```
orders (partitioned by year)
  ↓
orders_2024   orders_2025   orders_2026
```

### Range partitioning (most common — dates, IDs)

```sql
CREATE TABLE orders (
    id BIGSERIAL,
    created_at TIMESTAMPTZ NOT NULL,
    total NUMERIC(10,2)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2025 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE orders_2026 PARTITION OF orders
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### List partitioning (discrete categories)

```sql
CREATE TABLE orders (
    id BIGSERIAL,
    region TEXT NOT NULL
) PARTITION BY LIST (region);

CREATE TABLE orders_us PARTITION OF orders FOR VALUES IN ('US');
CREATE TABLE orders_eu PARTITION OF orders FOR VALUES IN ('EU', 'UK');
```

### Hash partitioning (even distribution, no natural range/list key)

```sql
CREATE TABLE orders (
    id BIGSERIAL,
    customer_id BIGINT
) PARTITION BY HASH (customer_id);

CREATE TABLE orders_p0 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE orders_p1 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 1);
-- ... etc for p2, p3
```

### Benefits

- Query pruning: `WHERE created_at >= '2026-01-01'` only scans the 2026 partition.
- Easy data lifecycle management: `DROP TABLE orders_2020;` instantly removes old data (much faster than a `DELETE`).
- Smaller indexes per partition → faster vacuum, faster index scans.

### Tradeoffs

- Adds schema complexity — must plan partition key upfront, and it's hard to change later.
- Cross-partition queries (no partition key in `WHERE`) may need to scan every partition.
- Foreign keys _referencing_ a partitioned table have restrictions in older PG versions (mostly resolved in modern PostgreSQL).

### Common mistakes

- Partitioning too early on a small table — adds overhead with no benefit; a rule of thumb is to consider it once a table nears tens of millions of rows or has a clear archival need.
- Forgetting to create future partitions ahead of time (a `pg_cron` job to auto-create next month's partition is standard practice).

---

## 25. Replication

### Why replicate?

- Read scaling (spread read traffic across replicas)
- Disaster recovery / high availability (failover if primary dies)
- Zero-downtime backups (backup from a replica instead of the primary)

```
Primary  ──streams WAL──►  Replica 1
   │
   └──streams WAL──►  Replica 2
```

### Physical (streaming) replication

Replicates the entire cluster byte-for-byte via WAL — replicas are exact copies, read-only.

```conf
# On primary, postgresql.conf
wal_level = replica
max_wal_senders = 10

# pg_hba.conf — allow replica to connect
host replication replicator_user <replica_ip>/32 md5
```

```bash
# On replica: base backup + start streaming
pg_basebackup -h <primary_host> -D /var/lib/postgresql/data -U replicator_user -P --wal-method=stream
```

### Logical replication

Replicates specific tables at the row/change level (not the whole cluster) — allows replicating between different PostgreSQL versions, filtering specific tables, or even PostgreSQL → non-PostgreSQL targets.

```sql
-- On publisher (source)
CREATE PUBLICATION my_pub FOR TABLE orders, users;

-- On subscriber (target)
CREATE SUBSCRIPTION my_sub
  CONNECTION 'host=primary_host dbname=appdb user=replicator_user password=secret'
  PUBLICATION my_pub;
```

### Physical vs Logical

|               | Physical                    | Logical                                                  |
| ------------- | --------------------------- | -------------------------------------------------------- |
| Granularity   | Entire cluster              | Specific tables                                          |
| Cross-version | No (same major version)     | Yes                                                      |
| Use case      | HA, failover, read replicas | Selective sync, migrations, ETL, multi-master-ish setups |

### Read Replica usage

```sql
-- App routes read-only queries to a replica connection string
-- Writes always go to the primary
```

### Failover

When the primary fails, a replica is promoted to become the new primary:

```bash
pg_ctl promote -D /var/lib/postgresql/data
```

In production, this promotion + traffic redirection is automated by tools like **Patroni** (Ch. 26), not done manually.

### Common mistakes

- Assuming replicas are always instantly caught up — streaming replication is typically async by default, meaning **replication lag** exists; check `pg_stat_replication`.
- Sending write queries to a read replica (fails — replicas are read-only).

---

## 26. High Availability

### The goal

Keep the database available even when a server fails — automatically, with minimal data loss and downtime.

### Key components

- **Patroni** — an HA orchestrator for PostgreSQL. Monitors the primary, coordinates leader election (usually via etcd/Consul/ZooKeeper as a distributed configuration store), and automates failover/promotion.
- **PgBouncer** — lightweight connection pooler sitting in front of PostgreSQL (see Ch. 28); often paired with HA setups so the pooler can redirect traffic after a failover.
- **Load Balancer / HAProxy** — routes traffic to the current primary (and optionally distributes reads across replicas), re-checking health continuously.
- **Automatic Failover** — when Patroni detects the primary is down, it promotes the most up-to-date replica and reconfigures routing — ideally within seconds.

### Typical topology

```
        Clients
           │
       HAProxy
       /       \
  PgBouncer   PgBouncer
      │           │
  Patroni-managed cluster:
  Primary ──WAL──► Replica 1
     │
     └──WAL──► Replica 2
  (etcd/Consul stores cluster leader state)
```

### RTO / RPO — the two numbers that matter

- **RTO (Recovery Time Objective)** — how long can you be down? (seconds with automated failover, hours with manual restore)
- **RPO (Recovery Point Objective)** — how much data can you afford to lose? (near-zero with synchronous replication, minutes with async)

### Sync vs Async replication tradeoff

```sql
-- Synchronous: primary waits for at least one replica to confirm before committing
synchronous_standby_names = 'replica1'
-- Guarantees zero data loss on failover, but adds latency and availability risk
-- (if the sync replica is down, writes can stall)
```

### Common mistakes

- Treating "we have a replica" as equivalent to "we have HA" — without automated failover (Patroni or managed cloud service), a replica alone still means manual, slow recovery.
- Not testing failover regularly — an HA setup that's never been tested is a guess, not a guarantee.

---

## 27. Performance Optimization

> The biggest, most practical chapter — this is where most real-world tuning lives.

### The checklist, in order of impact

1. **Indexes** — the #1 lever. Confirm `EXPLAIN ANALYZE` shows index usage for your hot queries (see Ch. 09, 10).
2. **`EXPLAIN ANALYZE` everything slow** — never guess; measure.
3. **Vacuum / Autovacuum** — bloated tables and stale statistics quietly wreck performance (see Ch. 12).
4. **Connection Pooling** — avoid connection storms (see Ch. 28).
5. **Prepared statements** — reduce repeated parse/plan overhead for frequently-run queries.
6. **Batch inserts** — avoid one round-trip per row.
7. **Pagination strategy** — `OFFSET` gets progressively slower; use keyset pagination for large datasets.
8. **Avoid N+1 queries** — the most common app-level performance bug.

### Prepared statements

```sql
PREPARE get_user (BIGINT) AS SELECT * FROM users WHERE id = $1;
EXECUTE get_user(42);
```

Most ORMs/drivers do this automatically under the hood.

### Batch inserts

```sql
-- Slow: 10,000 round trips
INSERT INTO logs (message) VALUES ('a');
INSERT INTO logs (message) VALUES ('b');

-- Fast: one round trip
INSERT INTO logs (message) VALUES ('a'), ('b'), ('c'), ...;

-- Fastest for huge bulk loads:
COPY logs (message) FROM '/path/to/file.csv' WITH (FORMAT csv);
```

### Pagination: OFFSET vs Keyset

```sql
-- OFFSET pagination — gets slower as offset grows (must scan+discard all skipped rows)
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;

-- Keyset (cursor-based) pagination — constant speed regardless of page depth
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;
```

### Avoiding N+1 queries

```sql
-- Bad: 1 query for users, then N queries (one per user) for their orders
SELECT * FROM users;
-- then, in application code, loop: SELECT * FROM orders WHERE user_id = ?

-- Good: one query with a JOIN, or one query with WHERE user_id = ANY(...)
SELECT * FROM orders WHERE user_id = ANY(ARRAY[1,2,3,4,5]);
```

### Finding slow queries

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Common mistakes

- Optimizing based on intuition instead of `EXPLAIN ANALYZE`.
- Adding indexes without checking their actual effect (some queries don't benefit; some indexes just add write overhead).
- Never revisiting `work_mem`/`shared_buffers` as data volume grows.

---

## 28. Connection Pooling

### Why pooling matters

```
1,000 concurrent users
       ↓
  PgBouncer (pool of, say, 50 real connections)
       ↓
   PostgreSQL (only 50 backend processes needed, not 1,000)
```

Each raw PostgreSQL connection is a full OS process with real memory overhead (several MB each) — thousands of direct connections can exhaust server memory and CPU context-switching long before you hit any query-level bottleneck.

### PgBouncer — the standard solution

```ini
# pgbouncer.ini
[databases]
appdb = host=127.0.0.1 port=5432 dbname=appdb

[pgbouncer]
listen_port = 6432
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 50
```

### Pool modes

| Mode                          | Behavior                                           | Use case                                                                                      |
| ----------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **session**                   | Connection held for the entire client session      | Needed for session-level features (e.g., `LISTEN/NOTIFY`, prepared statements across queries) |
| **transaction** (most common) | Connection returned to pool after each transaction | Best balance of efficiency and compatibility                                                  |
| **statement**                 | Connection returned after each statement           | Max efficiency, but breaks multi-statement transactions                                       |

### App configuration

```
# App connects to PgBouncer's port, not PostgreSQL directly
DATABASE_URL=postgres://user:pass@pgbouncer-host:6432/appdb
```

### Common mistakes

- Setting `max_connections` in PostgreSQL very high instead of adding a pooler — the underlying resource contention problem doesn't go away, it just moves.
- Using `pool_mode = transaction` while relying on session-level features like advisory locks held across statements or `SET` variables — these can break silently.

---

## 29. Backups & Recovery

### Logical Backup — `pg_dump` / `pg_restore`

Exports SQL statements (or a custom-format archive) that recreate the data.

```bash
# Full database dump
pg_dump -U postgres -d appdb -F c -f appdb.backup

# Restore
pg_restore -U postgres -d appdb_restored appdb.backup

# Just schema, no data
pg_dump -U postgres -d appdb --schema-only -f schema.sql

# Single table
pg_dump -U postgres -d appdb -t orders -f orders.sql
```

- Good for: portability (can restore into a different PG version), selective restores, smaller databases.
- Downside: slower for very large databases; doesn't capture a byte-for-byte point-in-time state easily.

### Physical Backup — `pg_basebackup`

Copies the actual data files (bit-for-bit) — faster for huge databases, and the basis of streaming replication.

```bash
pg_basebackup -U postgres -h localhost -D /backups/base -F tar -z -P
```

### Point-in-Time Recovery (PITR)

Combines a physical base backup with continuous WAL archiving, so you can restore to **any specific moment** (e.g., "5 minutes before someone ran a bad DELETE").

```conf
# postgresql.conf
archive_mode = on
archive_command = 'cp %p /wal_archive/%f'
```

```bash
# Recovery: restore base backup, then replay WAL up to a target time
# recovery.signal + postgresql.conf on the restored data directory:
restore_command = 'cp /wal_archive/%f %p'
recovery_target_time = '2026-07-10 14:00:00'
```

### Backup strategy summary

|                                                | Logical (`pg_dump`)    | Physical (`pg_basebackup`) | PITR                          |
| ---------------------------------------------- | ---------------------- | -------------------------- | ----------------------------- |
| Granularity                                    | Table/schema/DB level  | Entire cluster             | Entire cluster, any timestamp |
| Speed at scale                                 | Slower                 | Fast                       | Fast + flexible               |
| Restore to different PG version                | Yes                    | No                         | No                            |
| Protects against "oops, bad DELETE 10 min ago" | No (only to last dump) | No (only to backup time)   | **Yes**                       |

### Best practices

- Automate backups; never rely on manual runs.
- **Test restores regularly** — an untested backup is not a backup.
- Store backups off-server (separate region/provider) to survive a full server/datacenter loss.
- For anything business-critical, PITR + WAL archiving is the gold standard.

---

## 30. Security

### Roles & Users

In PostgreSQL, "users" and "roles" are the same underlying concept (`ROLE ... LOGIN` = user).

```sql
CREATE ROLE app_user WITH LOGIN PASSWORD 'secret';
CREATE ROLE readonly_analyst WITH LOGIN PASSWORD 'secret';

-- Group roles (no login, just a permission bundle)
CREATE ROLE analytics_team;
GRANT analytics_team TO readonly_analyst;
```

### Privileges

```sql
GRANT SELECT ON orders TO readonly_analyst;
GRANT SELECT, INSERT, UPDATE ON orders TO app_user;
GRANT ALL PRIVILEGES ON DATABASE appdb TO admin_user;

REVOKE INSERT ON orders FROM app_user;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_analyst;
```

### Row Level Security (RLS)

Restrict which _rows_ a role can see/modify, enforced by the database itself — critical for multi-tenant apps.

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);

-- App sets this per-connection/session before querying:
SET app.current_tenant = '42';
SELECT * FROM orders;  -- only returns rows where tenant_id = 42, automatically
```

### SSL / Encryption

```conf
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

```
# Client connection string requiring SSL
postgres://user:pass@host:5432/db?sslmode=require
```

- **Encryption at rest** — typically handled at the filesystem/disk level (LUKS, cloud provider disk encryption) or via extensions like `pgcrypto` for column-level encryption of specific sensitive fields.

```sql
CREATE EXTENSION pgcrypto;
INSERT INTO users (ssn_encrypted) VALUES (pgp_sym_encrypt('123-45-6789', 'encryption_key'));
SELECT pgp_sym_decrypt(ssn_encrypted, 'encryption_key') FROM users;
```

### Auditing

```sql
-- pgAudit extension logs detailed statement activity
CREATE EXTENSION pgaudit;
```

```conf
pgaudit.log = 'write, ddl'
```

### Common mistakes

- Using one shared "superuser" DB credential for the whole application — no least-privilege, no auditability.
- Forgetting `ALTER DEFAULT PRIVILEGES`, so newly created tables silently lack the intended grants.
- Storing sensitive data (SSNs, card numbers) in plaintext when `pgcrypto` or app-layer encryption should be used.

---

## 31. Monitoring

### The essential views

```sql
-- What's happening right now
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle';

-- Slow / frequent queries (requires pg_stat_statements extension)
SELECT query, calls, mean_exec_time, total_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Table-level I/O stats — cache hit ratio matters a lot
SELECT relname,
       heap_blks_read, heap_blks_hit,
       round(heap_blks_hit::numeric / NULLIF(heap_blks_hit + heap_blks_read, 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_tables
ORDER BY heap_blks_read DESC;

-- Index usage — find unused indexes
SELECT relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Table bloat / dead tuples
SELECT relname, n_dead_tup, n_live_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Long-running queries and locks
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > INTERVAL '5 minutes';
```

### What to watch (the short list)

- **CPU** — sustained high CPU often means missing indexes or an inefficient query pattern.
- **Cache hit ratio** — should be >99% for OLTP workloads; low ratio means `shared_buffers` is undersized or queries scan too much data.
- **Locks / blocking queries** — investigate anything blocked for more than a few seconds.
- **Replication lag** — `pg_stat_replication` on the primary.
- **Connections** — approaching `max_connections` is a red flag (add pooling).
- **Autovacuum activity** — tables that haven't been vacuumed in a long time relative to their write rate.

### Tooling

- **pg_stat_statements** — the single most valuable extension for performance monitoring.
- **pgAdmin / DataDog / Grafana + postgres_exporter** — dashboards for the above metrics over time.

---

## 32. PostgreSQL Extensions

PostgreSQL's extensibility is one of its biggest advantages — functionality that would be a separate product elsewhere is often just `CREATE EXTENSION` away.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Key extensions

- **PostGIS** — geospatial data types and functions (points, polygons, distance queries, spatial indexes). Turns PostgreSQL into a full GIS database.

```sql
SELECT ST_Distance(
  ST_MakePoint(-122.4194, 37.7749)::geography,
  ST_MakePoint(-73.9857, 40.7484)::geography
);  -- distance in meters between San Francisco and NYC
```

- **pg_trgm** — trigram similarity matching; powers fast fuzzy text search and accelerates `LIKE '%term%'`.

```sql
CREATE INDEX idx_name_trgm ON products USING GIN (name gin_trgm_ops);
SELECT * FROM products WHERE name % 'postgre'; -- similarity match, typo-tolerant
```

- **uuid-ossp** — UUID generation functions (largely superseded by built-in `gen_random_uuid()` in PG 13+).
- **pgcrypto** — cryptographic functions (hashing, symmetric/asymmetric encryption) for column-level protection.
- **TimescaleDB** — turns PostgreSQL into a high-performance time-series database (automatic partitioning by time, continuous aggregates, compression).
- **Citus** — distributed PostgreSQL; shards tables across multiple nodes for horizontal scale while keeping the Postgres interface.

### Listing installed / available extensions

```sql
SELECT * FROM pg_extension;                 -- installed
SELECT * FROM pg_available_extensions;      -- available to install
```

### Common mistakes

- Reaching for a separate specialized database (geo DB, time-series DB) before checking whether a PostgreSQL extension already solves it — often it does, with far less operational overhead.

---

## 33. Production Architecture

### A realistic reference architecture

```
             Application Servers
                     │
                PgBouncer (pooling)
                     │
        ┌────────────┴────────────┐
   Primary PostgreSQL         Read Replicas
   (writes)                  (read-heavy queries,
        │                     reporting, analytics)
        │
   WAL Archiving ──► Backup Storage (S3/GCS, off-server)
        │
   Monitoring (pg_stat_statements, Grafana/DataDog)
        │
   Patroni + etcd (HA orchestration, automated failover)
```

### Why each layer exists

- **PgBouncer** — protects PostgreSQL from connection storms (Ch. 28).
- **Primary + Read Replicas** — separates write load from read load; replicas can absorb reporting/analytics traffic that would otherwise compete with transactional writes.
- **WAL Archiving + Backups** — enables PITR and disaster recovery (Ch. 29), stored off the primary server so a full server loss doesn't take backups with it.
- **Monitoring** — catches problems (slow queries, replication lag, bloat) before they become outages (Ch. 31).
- **Patroni/HA layer** — automates failover so a primary failure doesn't require a human at 3am (Ch. 26).

### A note on environment separation

Production architecture should mirror down to staging (smaller scale) so performance issues and migration problems surface before they hit production.

---

## 34. Scaling PostgreSQL

### The scaling ladder (in the order most teams actually walk it)

1. **Vertical scaling** — bigger box (more CPU/RAM/faster disk). Simplest, works surprisingly far, but has a ceiling and a single point of failure.
2. **Read Replicas** — offload read traffic (Ch. 25). Doesn't help write scaling.
3. **Caching** — put a cache (Redis, application-level) in front of expensive/hot reads to reduce load on Postgres entirely.
4. **Partitioning** — improve query/maintenance performance on huge tables without adding nodes (Ch. 24).
5. **Connection Pooling** — not scaling data volume, but scaling concurrent client capacity (Ch. 28).
6. **CQRS (Command Query Responsibility Segregation)** — separate write-optimized and read-optimized models/stores, often using replicas or materialized views as the "read side."
7. **Sharding (Citus, or custom application-level sharding)** — split data horizontally across multiple PostgreSQL nodes by a shard key (e.g., `tenant_id`), enabling true horizontal write scaling.

```
Single Node → Vertical Scale → Read Replicas → Caching → Partitioning → Sharding (Citus)
   (simplest)                                                              (most complex)
```

### Citus example (distributed tables)

```sql
CREATE EXTENSION citus;

CREATE TABLE orders (id BIGSERIAL, tenant_id BIGINT, total NUMERIC);
SELECT create_distributed_table('orders', 'tenant_id');
-- Rows are now sharded across worker nodes by tenant_id
```

### Decision guide

- Read-heavy? → Read replicas + caching first.
- Write-heavy at truly massive scale? → Sharding (Citus) or reconsidering data model.
- Huge historical data, mostly time-ordered? → Partitioning (+ TimescaleDB if time-series specifically).
- "It's slow" without evidence? → Don't scale yet — profile with `EXPLAIN ANALYZE` and `pg_stat_statements` first. Most "scaling problems" are actually missing-index problems.

---

## 35. Interview Questions

### Beginner

- **What is PostgreSQL?** An open-source, object-relational database system known for standards compliance, extensibility, and strong ACID guarantees.
- **What is a primary key?** A column (or set of columns) that uniquely identifies each row; implies `NOT NULL` + `UNIQUE`.
- **CHAR vs VARCHAR?** `CHAR(n)` is fixed-length (space-padded); `VARCHAR(n)` is variable-length with a cap. In PostgreSQL, prefer `TEXT` — performance is essentially identical to `VARCHAR`.
- **What is a foreign key?** A column that references a primary key in another table, enforcing referential integrity.
- **What is normalization?** Organizing tables to reduce data redundancy and improve integrity, typically through 1NF → 3NF.

### Intermediate

- **B-Tree vs Hash Index?** B-Tree supports equality _and_ range queries plus sorting; Hash only supports equality and is rarely chosen over B-Tree in practice.
- **Explain MVCC.** Each transaction sees a consistent snapshot via row versioning (`xmin`/`xmax`), so readers and writers don't block each other; old versions are cleaned up by VACUUM.
- **What does a transaction guarantee?** ACID — atomicity, consistency, isolation, durability.
- **What does EXPLAIN ANALYZE show?** The actual execution plan chosen, with real timing/row counts, vs `EXPLAIN` alone which only estimates.
- **When would you use a composite index?** When queries commonly filter/sort by multiple columns together — remember, column order matters (leftmost-prefix rule).
- **JSON vs JSONB?** JSONB is binary, indexable (GIN), and faster to query; JSON preserves exact text/whitespace/key order but is slower — default to JSONB.
- **What's a materialized view?** A view whose result is physically stored, giving fast reads at the cost of staleness until refreshed.
- **Name a window function and what it does.** `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` assigns a unique sequential number within each partition without collapsing rows.

### Senior

- **Design a database for a SaaS application.** Consider multi-tenancy strategy (shared table + `tenant_id` + RLS vs schema-per-tenant vs database-per-tenant), indexing on `tenant_id`, audit trails, soft deletes, and how you'll scale (partitioning/sharding by tenant).
- **Reduce a query from 3 seconds to 20ms.** Standard approach: `EXPLAIN ANALYZE` to find the bottleneck → check for missing/wrong indexes → check statistics freshness (`ANALYZE`) → check for N+1 patterns → consider a covering index or materialized view for repeated expensive aggregations.
- **Handle 50,000 concurrent users.** Connection pooling (PgBouncer) is non-negotiable at this scale; read replicas for read traffic; caching layer for hot data; consider partitioning for very large tables.
- **Scale PostgreSQL globally.** Read replicas per region for reads; consider Citus/sharding for writes; be explicit about consistency tradeoffs (sync vs async replication) per CAP theorem.
- **Diagnose blocking transactions.** Query `pg_locks` joined against `pg_stat_activity` to find blocking vs blocked PIDs; look at how long the blocking transaction has been open; consider `pg_terminate_backend()` as a last resort.
- **Design backup and disaster recovery.** Automated logical backups for portability + physical base backups with continuous WAL archiving for PITR; store off-server; test restores regularly; define RTO/RPO targets explicitly.
- **Partition a 5TB table.** Identify a natural partition key (usually time-based for large historical tables); use range partitioning; automate creation of future partitions; migrate data in batches to avoid long locks.
- **Optimize a slow JOIN across millions of rows.** Ensure both join columns are indexed; check `EXPLAIN ANALYZE` for the chosen join strategy (Nested Loop vs Hash vs Merge) and whether estimated vs actual rows diverge (stale stats); consider denormalizing or a materialized view if it's a recurring expensive aggregation.

---

## 36. Decision Trees

### Which Index?

```
Exact match search?           → B-Tree
Range/sort query?             → B-Tree
Searching inside JSON/Array?  → GIN
Huge table, naturally ordered data (e.g. append-only by time)? → BRIN
Only care about a subset of rows (e.g. active=true)? → Partial Index
Geometric / range overlap / nearest-neighbor? → GiST
Fuzzy text match / typo tolerance? → GIN with pg_trgm
```

### Which Pagination?

```
Small dataset, page number needed (e.g. "jump to page 5")? → OFFSET/LIMIT
Large dataset, infinite scroll / "load more"?              → Keyset (cursor) pagination
```

### JSON or Columns?

```
Known, stable structure, needs strong typing/constraints? → Real columns
Structure varies per row / evolves frequently / sparse fields? → JSONB
Need to query/index a specific nested field heavily?         → Consider promoting it to a real column even if the rest stays JSONB
```

### Replication Strategy?

```
Need read scaling only?                      → Streaming (physical) read replica
Need HA / automatic failover?                → Streaming replication + Patroni
Need selective table sync / cross-version?   → Logical replication
Need to migrate to a new PG version with near-zero downtime? → Logical replication
```

### Scaling Path?

```
"It's slow" but haven't measured? → EXPLAIN ANALYZE first, don't scale yet
Read-heavy?  → Read replicas + caching
Write-heavy, moderate scale? → Vertical scale + partitioning
Write-heavy, massive scale, natural shard key (e.g. tenant_id)? → Citus / sharding
```

### Isolation Level?

```
Standard CRUD app?                              → Read Committed (default)
Reports needing internal consistency across queries? → Repeatable Read
Financial/inventory logic requiring strict correctness under concurrency? → Serializable (+ retry logic)
```

### Backup Strategy?

```
Small DB, need portability across PG versions?  → pg_dump (logical)
Large DB, need fast full-cluster backup?        → pg_basebackup (physical)
Need to restore to "any point in time"?          → PITR (base backup + WAL archiving)
```

---

## 37. Best Practices

### Schema design

- Use `BIGINT`/`BIGSERIAL` or `UUID` for primary keys — `INTEGER` can run out at ~2.1 billion rows.
- Prefer `TEXT` over `VARCHAR(n)`; add `CHECK` constraints for length only when there's a real business rule.
- Always use `TIMESTAMPTZ`, never bare `TIMESTAMP`.
- Add foreign keys — don't rely on application code alone for integrity.
- Normalize by default; denormalize deliberately and document why.

### Indexing

- Index foreign key columns — PostgreSQL does **not** do this automatically (unlike some other databases).
- Use `CREATE INDEX CONCURRENTLY` in production to avoid locking writes.
- Periodically check `pg_stat_user_indexes` for unused indexes and drop them.

### Querying

- Always run `EXPLAIN ANALYZE` on anything suspected slow before changing anything.
- Avoid `SELECT *` in application code.
- Use keyset pagination for large, frequently-paginated datasets.
- Batch writes; avoid one round trip per row.

### Transactions & concurrency

- Keep transactions short — no external API calls or user waits inside `BEGIN`/`COMMIT`.
- Always lock resources in a consistent order to avoid deadlocks.
- Handle serialization failures and deadlocks with retry logic in the application layer.

### Operations

- Never disable autovacuum; tune it instead for high-write tables.
- Automate and **test** backups regularly (an untested backup isn't a backup).
- Use a connection pooler (PgBouncer) before raising `max_connections`.
- Monitor cache hit ratio, replication lag, and long-running queries continuously.

### Security

- Principle of least privilege — dedicated roles per application/service, not one shared superuser.
- Enable Row Level Security for multi-tenant data.
- Require SSL for all connections; encrypt genuinely sensitive columns with `pgcrypto`.

### Migrations

- Make schema migrations backward-compatible where possible (add nullable columns first, backfill, then add `NOT NULL`) to avoid long locks / downtime on large tables.
- Avoid `ALTER TABLE ... ADD COLUMN ... DEFAULT <value>` on very large tables in older PG versions without checking whether it requires a full table rewrite (PG 11+ made most default-add operations instant, but volatile defaults or type changes still rewrite).

---

## 38. Real Production Stories

### Story 1 — The 900ms API endpoint

**Problem:** An API endpoint slowed down as a table grew. `EXPLAIN ANALYZE` revealed a sequential scan over 20 million rows for a query filtering on two columns.
**Solution:** Added a composite index matching the exact `WHERE` clause column order.
**Result:** Latency dropped from **900ms → 12ms**.
**Lesson:** Always check `EXPLAIN ANALYZE` before assuming you need more hardware — a missing index is often the entire problem.

### Story 2 — CPU pegged at 100%

**Problem:** Database CPU usage stayed at 100% during peak hours.
**Cause:** Deep-page pagination using `OFFSET 500000 LIMIT 20` — PostgreSQL had to scan and discard half a million rows on every request.
**Solution:** Switched to keyset pagination (`WHERE id > last_seen_id ORDER BY id LIMIT 20`).
**Lesson:** `OFFSET` pagination cost grows linearly with page depth — fine for page 2, disastrous for page 5,000.

### Story 3 — The bloated database

**Problem:** Queries slowed down dramatically over weeks, with no code changes.
**Cause:** Autovacuum had been disabled "to reduce load" during a previous incident — and never re-enabled. Dead tuples accumulated, table files grew far larger than actual live data (bloat).
**Solution:** Re-enabled autovacuum, ran `VACUUM FULL` during a maintenance window to reclaim space.
**Lesson:** Never disable autovacuum permanently — tune it, don't turn it off.

### Story 4 — Crash under load

**Problem:** The application crashed whenever traffic spiked.
**Cause:** One raw PostgreSQL connection was opened per incoming request, with no pooling — connections piled up faster than PostgreSQL (and the server's memory) could handle.
**Solution:** Introduced PgBouncer in transaction pooling mode in front of the database.
**Lesson:** Connection pooling isn't optional at any real scale — it's one of the cheapest, highest-leverage fixes available.

### Story 5 — Read traffic overwhelming the primary

**Problem:** Analytics dashboards and reporting queries were competing with transactional writes for the same database resources, causing app slowdowns during business hours.
**Solution:** Set up streaming read replicas; routed all reporting/analytics traffic to replicas, keeping writes and critical reads on the primary.
**Lesson:** Separating read and write workloads early prevents "a slow report" from becoming "checkout is down."

---

## 39. Building a Production Database (End-to-End Walkthrough)

This chapter evolves **one schema** from a bare users table to a scaled, production-grade multi-tenant SaaS database — tying together every chapter above.

### Step 1 — Users table

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Step 2 — Add authentication

```sql
ALTER TABLE users
    ADD COLUMN password_hash TEXT NOT NULL,
    ADD COLUMN last_login_at TIMESTAMPTZ;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Store password hashes with a proper algorithm (bcrypt/argon2 in app layer),
-- pgcrypto shown here only for illustration of hashing utilities.
```

### Step 3 — Add organizations (multi-tenancy)

```sql
CREATE TABLE organizations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    org_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, org_id)
);
```

### Step 4 — Add projects and tasks

```sql
CREATE TABLE projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    org_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status task_status NOT NULL DEFAULT 'todo',
    assigned_to BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> Note `org_id` is denormalized onto `tasks` even though it's derivable via `project_id` — this is deliberate, so Row Level Security policies and tenant-scoped indexes don't require a join (see Step 6 and Step 9).

### Step 5 — Optimize indexes

```sql
CREATE INDEX CONCURRENTLY idx_memberships_org ON memberships (org_id);
CREATE INDEX CONCURRENTLY idx_projects_org ON projects (org_id);
CREATE INDEX CONCURRENTLY idx_tasks_org_status ON tasks (org_id, status);
CREATE INDEX CONCURRENTLY idx_tasks_assigned ON tasks (assigned_to) WHERE assigned_to IS NOT NULL;
```

### Step 6 — Add transactions (business logic that must be atomic)

```sql
BEGIN;
INSERT INTO projects (org_id, name) VALUES (1, 'Website Redesign') RETURNING id;
-- ... use returned id to insert initial tasks in the same transaction ...
COMMIT;
```

### Step 7 — Introduce JSONB (flexible task metadata)

```sql
ALTER TABLE tasks ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}';
CREATE INDEX idx_tasks_metadata ON tasks USING GIN (metadata);
-- e.g. custom fields per org: {"priority": "high", "labels": ["urgent","bug"]}
```

### Step 8 — Partition audit logs (high-volume, time-ordered)

```sql
CREATE TABLE task_audit (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    task_id BIGINT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    old_status task_status,
    new_status task_status
) PARTITION BY RANGE (changed_at);

CREATE TABLE task_audit_2026_07 PARTITION OF task_audit
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

### Step 9 — Row Level Security for tenant isolation

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON tasks
    USING (org_id = current_setting('app.current_org')::BIGINT);

-- App sets this per request/session:
SET app.current_org = '1';
SELECT * FROM tasks;  -- automatically scoped to org 1
```

### Step 10 — Add read replicas

```
Primary (writes: task creation, updates)
   ↓ streaming replication
Replica (reads: dashboards, reporting queries, org-wide analytics)
```

Application routes read-only, non-latency-sensitive queries (e.g., "tasks completed this month") to the replica connection string.

### Step 11 — Implement backups

```bash
# Nightly logical backup
pg_dump -U postgres -d appdb -F c -f /backups/appdb_$(date +%F).backup

# Continuous WAL archiving for PITR
archive_command = 'cp %p /wal_archive/%f'
```

### Step 12 — Scale to millions of rows

- Add `pg_stat_statements`, monitor for new slow queries as data grows.
- Revisit indexes — some early indexes may no longer be optimal at 10x the data volume.
- Consider Citus sharding by `org_id` if a single primary can no longer handle write throughput.
- Add PgBouncer if concurrent connections have grown past what direct connections can handle.
- Automate creation of future `task_audit` partitions (e.g., via `pg_cron`) so the pipeline never falls behind.

### The full journey, summarized

```
Users
  → + Authentication
  → + Organizations (multi-tenancy)
  → + Projects & Tasks
  → + Optimized indexes
  → + Transactional integrity
  → + JSONB for flexible metadata
  → + Partitioned audit logs
  → + Row Level Security
  → + Read replicas
  → + Backups & PITR
  → Scaled to millions of rows (pooling, sharding, monitoring)
```

---

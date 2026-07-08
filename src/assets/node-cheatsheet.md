# Backend Engineering Cheatsheet

> Written to actually explain _why_ things work the way they do, not just define them — so revision builds understanding, not memorization.

---

## Table of Contents

0.  [Backend Fundamentals](#00-backend-fundamentals)
1.  [HTTP](#01-http)
2.  [REST APIs](#02-rest-apis)
3.  [Node.js](#03-nodejs)
4.  [Express.js](#04-expressjs)
5.  [Databases](#05-databases)
6.  [SQL](#06-sql)
7.  [PostgreSQL](#07-postgresql)
8.  [MongoDB](#08-mongodb)
9.  [ORMs](#09-orms)
10. [Authentication](#10-authentication)
11. [Authorization](#11-authorization)
12. [Security](#12-security)
13. [Caching](#13-caching)
14. [Performance](#14-performance)
15. [API Design](#15-api-design)
16. [Validation](#16-validation)
17. [Logging](#17-logging)
18. [Error Handling](#18-error-handling)
19. [File Uploads](#19-file-uploads)
20. [Background Jobs](#20-background-jobs)
21. [Message Queues](#21-message-queues)
22. [WebSockets](#22-websockets)
23. [Microservices](#23-microservices)
24. [Backend System Design](#24-backend-system-design)
25. [Testing](#25-testing)
26. [Docker](#26-docker)
27. [Kubernetes](#27-kubernetes)
28. [CI/CD](#28-cicd)
29. [AWS](#29-aws)
30. [Observability](#30-observability)
31. [Architecture](#31-architecture)
32. [Interview Questions](#32-interview-questions)
33. [Project Structure](#33-project-structure)
34. [Best Practices](#34-best-practices)

- [Bonus: Full Diagrams & Decision Trees](#bonus-sections)

---

## 00 Backend Fundamentals

Every backend, no matter how complex, is doing one basic job: a client asks for something, and the server figures out the right answer and hands it back.

```
Client → Request → Server → Business Logic → Database → Response
```

The reason this simple picture matters is that almost every backend bug or design decision traces back to one of these arrows breaking down — a request that never arrives, business logic that runs twice, a database that can't keep up.

**Client vs Server** — the client (browser, mobile app, another service) _initiates_ things; it doesn't own the source of truth. The server owns the data and the rules, which is exactly why you never trust anything the client sends without re-checking it server-side — the client can be tampered with, the server is your only real gatekeeper.

**Stateless vs Stateful** — this distinction decides how easily you can scale. A stateless server keeps no memory of who you are between requests; every request must carry everything needed to understand it (like a JWT with your identity baked in). That's powerful because you can throw the _same_ request at any server instance and get the same result — which is exactly what horizontal scaling needs. A stateful server remembers you (e.g., an in-memory session), which means a specific user has to keep hitting the _same_ server instance, or you need to share that state somewhere all instances can reach (Redis) — otherwise a user logs in on server A and appears logged out on server B.

**Monolith vs Distributed System** — a monolith is simpler to build, test, and deploy because everything lives in one process talking to itself through function calls. The tradeoff shows up as you grow: one team's bug can take down the whole app, and you can't scale just the "search" part without scaling everything else. A distributed system splits things into independent services so you _can_ scale and deploy pieces independently — but now function calls become network calls, which can fail, time out, or arrive out of order. You're trading simplicity for scalability, and that tradeoff is the whole reason microservices exist (see §23).

**Horizontal vs Vertical Scaling** — vertical scaling (a bigger machine) is the easy first move, but it has a hard ceiling and a single point of failure: that one machine dies, everything dies. Horizontal scaling (more machines) has no real ceiling and survives individual machine failures, but it only works cleanly if your app is stateless — which is why "make it stateless" is one of the first things you hear in system design interviews.

### Layered backend architecture

```
Client → API Layer → Service Layer → Repository Layer → Database
```

Each layer exists to answer a different question, and keeping them separate is what makes a codebase testable and changeable later:

- **API layer** answers "how does this request come in and go out" — routing, request parsing, response shaping. It shouldn't know _why_ the business does what it does.
- **Service layer** answers "what should actually happen" — the business rules. It doesn't care whether the data comes from Postgres or an API call.
- **Repository layer** answers "how do I get/store this data" — it's the only layer that knows what database you're using.

The payoff: if you need to unit-test your business logic, you can swap the repository for a fake one in memory and test the service layer without touching a real database. And if you migrate from Postgres to Mongo later, only the repository layer changes — the service layer never notices.

---

## 01 HTTP

HTTP is the language a client and server speak to exchange a request for a response. What's genuinely worth understanding — and what interviewers love probing — is _why_ the protocol changed shape over three major versions. Each version exists because the previous one hit a real, specific bottleneck.

### HTTP/1.1 → HTTP/2 → HTTP/3 — the actual story

**HTTP/1.1** sends one request, waits for its response, before it can reuse that connection for the next request (in practice — pipelining technically exists but browsers don't really use it because it's fragile). So if you need to load 30 assets for a page, and one of them is slow, it queues up behind that one on the same connection. This is called **head-of-line (HOL) blocking at the application layer**. Browsers hacked around it by opening ~6 parallel TCP connections per host — which works, but each new TCP connection means a fresh handshake, fresh congestion-control ramp-up, and real overhead.

**HTTP/2** fixed that specific problem with **multiplexing**: many requests and responses now share a _single_ TCP connection at the same time, each broken into small frames tagged with a stream ID so the receiving end can reassemble them independently. A slow request no longer blocks a fast one at the application level. HTTP/2 also introduced **HPACK header compression** — since HTTP headers (cookies, user-agent, etc.) repeat on almost every request to the same host, compressing them (and only sending the _diff_ from previous headers) saves real bandwidth on chatty APIs.

But HTTP/2 didn't actually escape head-of-line blocking — it just moved where it happens. TCP itself guarantees **strictly ordered, reliable byte delivery**. So if a single packet gets lost anywhere on the network, TCP will not hand _any_ of the multiplexed streams to the application until that lost packet is retransmitted and the byte order is restored — even though the other streams' bytes already arrived. One lost packet now stalls every request sharing that connection. This is **HOL blocking at the transport layer**, and it's structurally impossible to fix while still using TCP, because it's baked into what TCP promises.

**HTTP/3** solves this by ditching TCP entirely and running over **QUIC**, a transport protocol built on top of UDP. QUIC implements its own reliability and ordering, but crucially, it does so **per stream**, not for the whole connection — so a lost packet only stalls the one stream it belonged to, and every other stream keeps flowing. QUIC also merges what used to be two separate round trips (TCP handshake, then TLS handshake) into essentially one combined handshake — on a repeat connection it can even resume with **0-RTT**. This matters a lot in practice on mobile networks, where packet loss and connection re-establishment (e.g., switching from WiFi to cellular) are common; QUIC also identifies connections by a connection ID rather than the IP/port 4-tuple, so switching networks doesn't even require a new handshake.

**The one-liner to keep in memory:**

> HTTP/1.1 blocked at the app layer → HTTP/2 fixed that with multiplexing but inherited TCP's transport-layer blocking → HTTP/3 replaced TCP with QUIC/UDP to fix blocking at the transport layer too, and to make handshakes fast and resilient on unreliable networks.

### Methods — and what "idempotent" actually buys you

The methods aren't just labels — the guarantees attached to them (safe, idempotent) are what allow browsers, proxies, and retry logic to behave correctly without knowing anything about your specific API. If a method is **idempotent**, a client (or a retry mechanism, or a flaky network) can safely resend the exact same request multiple times and the end state is the same as sending it once — which is exactly why GET requests get cached and retried freely, but POST requests don't (retrying a POST could mean creating the same order twice).

| Method  | Idempotent?    | Safe? | Use                                                                                               |
| ------- | -------------- | ----- | ------------------------------------------------------------------------------------------------- |
| GET     | Yes            | Yes   | Fetch a resource, no side effects                                                                 |
| POST    | No             | No    | Create a resource / trigger a non-repeatable action                                               |
| PUT     | Yes            | No    | Replace a resource entirely — sending it twice leaves the same end state                          |
| PATCH   | Not guaranteed | No    | Partial update — depends on how you write it (`set x=5` is idempotent, `increment x by 1` is not) |
| DELETE  | Yes            | No    | Remove a resource — deleting twice still ends with it gone                                        |
| OPTIONS | Yes            | Yes   | Browser asks "what am I allowed to do here" before a real request (CORS preflight)                |
| HEAD    | Yes            | Yes   | Same as GET but headers only — useful to check if something exists/changed without downloading it |

### Status codes — grouped by what they're telling the caller

```
1xx  "Hold on, still working"     100 Continue
2xx  "It worked"                  200 OK, 201 Created, 204 No Content
3xx  "Go look somewhere else"     301 Moved Permanently, 304 Not Modified
4xx  "You (the client) messed up" 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests
5xx  "I (the server) messed up"   500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
```

The 4xx vs 5xx split matters operationally: a spike in 4xx usually means a client bug or bad input (not your pager-worthy emergency), while a spike in 5xx means _your_ system is failing and is exactly what alerting should be tuned to catch.

### Headers, cookies & caching — why each flag exists

Cookie flags aren't arbitrary — each one closes a specific attack. `HttpOnly` means JavaScript running on the page can't read the cookie at all, which matters because if an attacker manages to inject a script (XSS), they still can't steal your session token through `document.cookie`. `Secure` means the cookie is only ever sent over HTTPS, so it can't be sniffed on plain HTTP. `SameSite=Strict/Lax` stops the browser from attaching your cookie to requests that originate from _other_ sites, which is the core defense against CSRF (§12).

Caching headers exist so the client and any proxies in between don't have to re-fetch (or re-generate) something that hasn't changed. `ETag` is a fingerprint of the response body; the client sends it back next time via `If-None-Match`, and if it still matches, the server replies `304 Not Modified` with an _empty_ body — you save the bandwidth of re-sending data the client already has.

```http
GET /users/42 HTTP/2
Accept: application/json
Authorization: Bearer <token>

HTTP/2 200 OK
Content-Type: application/json
Cache-Control: max-age=60
ETag: "abc123"
```

---

## 02 REST APIs

REST isn't a protocol or a library — it's a set of conventions for designing APIs around **resources** (nouns) instead of actions (verbs), so that once you learn how one endpoint in a REST API behaves, you can guess how the rest of them behave too. That predictability is the entire value proposition: `/users/42` combined with `DELETE` should mean "delete user 42" everywhere, in every API, without you needing to read custom documentation for each one.

### Why statelessness specifically matters here

Because each request in REST is expected to carry everything the server needs to understand it (auth token, all relevant params), any server instance can handle any request — which is what lets you put a load balancer in front of a fleet of identical servers and not worry about which one a given user's request lands on.

### Versioning — why you need it at all

APIs change, but you can't force every client to upgrade the instant you change something — mobile apps in particular can be stuck on old versions for months. Versioning lets you evolve the API while old clients keep working against the version they were built for.

```
/api/v1/users        (URI versioning — simplest, most common, visible in every log line)
Accept: application/vnd.myapi.v2+json   (header versioning — cleaner URLs, less visible/debuggable)
```

### Pagination — why offset pagination breaks at scale

`?page=2&limit=20` (offset pagination) is simple to implement, but under the hood the database still has to scan and discard the first N rows to get to your page — that gets slower as the offset grows. Worse, if rows are being inserted/deleted while someone pages through, they can see the same row twice or skip one entirely, because "page 2" is a moving target defined by position, not by identity. Cursor pagination fixes both: it says "give me everything _after_ this specific row," which is a stable position anchored to an actual row rather than a shifting offset.

```
GET /orders?page=2&limit=20                  (offset — simple, degrades at scale, inconsistent under writes)
GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20   (cursor — stable, scales, standard for infinite-scroll feeds)
```

### Idempotency Keys — the pattern that stops double-charging

Here's the actual problem this solves: your client calls `POST /payments/charge`. The server processes the charge successfully — but the response gets lost on the way back (timeout, dropped connection, whatever). The client has no idea if the charge went through, so its retry logic — reasonably — tries again. Without anything to recognize "wait, I already did this," the server just runs the charge a second time, and the customer gets billed twice. POST is _not_ idempotent by default, which is exactly the gap idempotency keys are built to close.

The fix: the client generates a unique key (a UUID) _once_ per logical operation, sends it in a header, and reuses that _same_ key if it retries. The server's job is to remember "have I seen this key before" and, if so, hand back the original result instead of executing the logic again.

```js
// idempotency.middleware.js
const redis = require("./redisClient");

async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: "Idempotency-Key header is required" });
  }

  const cacheKey = `idempotency:${idempotencyKey}`;
  const existing = await redis.get(cacheKey);

  if (existing) {
    // Seen this key before — replay the stored response instead of re-running the charge
    const cached = JSON.parse(existing);
    return res.status(cached.statusCode).json(cached.body);
  }

  // Lock the key immediately — this guards against a second request for the SAME key
  // arriving concurrently (e.g. a client that double-clicks "Pay" before the first
  // request even finishes), not just sequential retries.
  const acquired = await redis.set(
    cacheKey,
    JSON.stringify({ status: "processing" }),
    "NX",
    "EX",
    60,
  );
  if (!acquired) {
    return res.status(409).json({ error: "Request already in progress" });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.set(
      cacheKey,
      JSON.stringify({ statusCode: res.statusCode, body }),
      "EX",
      24 * 60 * 60, // keep the result around for 24h so even a late retry gets the original outcome
    );
    return originalJson(body);
  };

  next();
}

module.exports = idempotencyMiddleware;
```

```js
app.post("/payments/charge", idempotencyMiddleware, chargeController);
```

The two-state design (short-lived "processing" lock, then a longer-lived "completed" result) is deliberate: the lock prevents two _simultaneous_ requests with the same key from both running the business logic, and the longer TTL on the final result means a retry that shows up hours later (a mobile client reconnecting after being offline) still gets the correct original response instead of a second charge. The exact same idea protects queue consumers from processing a redelivered message twice — see §21.

---

## 03 Node.js

Node.js exists to solve a specific problem: traditional server models spin up a thread per connection, and threads are expensive (memory, context-switch overhead) — so a server handling thousands of concurrent connections (most of which are just _waiting_ on I/O, not doing CPU work) wastes enormous resources on idle threads. Node instead runs your JavaScript on a **single thread**, and hands off anything that would block (disk reads, network calls, DNS lookups) to the operating system or a background thread pool, getting notified via a callback when the result is ready. This is why Node is a great fit for I/O-heavy APIs and a poor fit for CPU-heavy work (image processing, heavy computation) — CPU work still blocks that one thread, and there's no second thread picking up the slack unless you explicitly ask for one (Worker Threads).

```
JavaScript → V8 Engine → Node Runtime (bindings, Node APIs) → libuv (event loop, thread pool) → OS
```

**V8** is the engine that actually compiles and executes your JavaScript (same engine Chrome uses). **libuv** is the C library underneath that gives Node its event loop and a thread pool — it's what actually talks to the OS for async file I/O, DNS, and some crypto operations that the OS itself can't do non-blocking.

### The Event Loop — what it's actually doing, phase by phase

The event loop is the mechanism that lets a single thread juggle many pending operations without blocking on any of them. On each pass, it walks through fixed phases, and each phase has its own queue of callbacks to run:

```
   ┌───────────────────────┐
┌─>│        timers          │  setTimeout / setInterval callbacks whose time has come
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │   pending callbacks    │  I/O callbacks deferred from the previous loop iteration
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │      poll              │  waits for new I/O events and runs their callbacks — this is
│  │                        │  where most of your actual work (reading a file, a socket
│  │                        │  event) gets processed
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │      check             │  setImmediate() callbacks — designed to run right after poll
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤   close callbacks      │  cleanup, e.g. socket.on('close', ...)
   └────────────────────────┘
```

### The nuance almost everyone gets wrong: microtasks are not a phase

It's tempting to slot `process.nextTick()` and resolved-`Promise` `.then()` callbacks (collectively called **microtasks**) into this diagram as if they were their own phase. They aren't, and treating them that way will give you the wrong mental model for ordering bugs.

What's actually happening: after **any single callback finishes running** — whether that's a timer callback, an I/O callback, anything — Node checks two queues before moving on to the next callback or the next phase: first the `process.nextTick` queue (fully drained), then the Promise microtask queue (fully drained). Only once _both_ are empty does Node continue with whatever callback or phase was next in line. This happens **between every single phase transition and after every single callback**, not once per full loop iteration — so microtasks can interleave many times within what looks like "one tick."

```js
console.log("1: sync");

setTimeout(() => console.log("5: timer (macrotask - timers phase)"), 0);

setImmediate(() => console.log("6: immediate (macrotask - check phase)"));

Promise.resolve().then(() => console.log("3: promise microtask"));

process.nextTick(() => console.log("2: nextTick microtask - highest priority"));

console.log("1b: sync");

// Output order:
// 1: sync
// 1b: sync
// 2: nextTick microtask - highest priority   <- entire nextTick queue drains before anything else
// 3: promise microtask                        <- then the entire promise queue drains
// 5: timer (macrotask - timers phase)         <- only now does Node move to actual phases
// 6: immediate (macrotask - check phase)
```

Why this matters in practice: if you recursively call `process.nextTick` inside a `nextTick` callback, you can literally starve the event loop — timers and I/O never get a chance to run because the microtask queue never empties. That's a real production bug, not a trivia question.

**The takeaway to say out loud in an interview:**

> The event loop has phases — timers, pending callbacks, poll, check, close. Microtasks aren't one of those phases; they drain completely in between every phase transition and after every callback, with `nextTick` always draining before Promises.

### Modules, Streams, and the concurrency primitives

```js
// CommonJS — loaded synchronously, the original Node module system
const fs = require("fs");
module.exports = myFunction;

// ES Modules — loaded asynchronously, the modern standard
import fs from "fs";
export default myFunction;
```

**Streams** exist because loading an entire large file (or response body) into memory before you can start processing it is wasteful and slow — a stream lets you process data in small chunks as they arrive, so memory usage stays flat regardless of the total size. `Readable` produces data, `Writable` consumes it, `Duplex` does both (like a TCP socket), and `Transform` is a duplex stream that modifies the data as it passes through (like a gzip compressor). `.pipe()` wires a readable into a writable, handling backpressure automatically so a fast producer doesn't overwhelm a slow consumer.

**Cluster vs Worker Threads** solve two different problems and it's a common interview mix-up. **Cluster** forks multiple _full Node processes_ (one per CPU core is typical), each with its own memory and its own event loop, and load-balances incoming connections across them — this is how you use multiple cores for an I/O-bound HTTP server, since one process's event loop can only use one core. **Worker Threads** give you true multi-threading _within_ a single process, sharing memory via `SharedArrayBuffer` — this is what you reach for when you have genuinely CPU-bound work (e.g., image resizing) that would otherwise block the main thread's event loop and stall every other request being handled by that process.

```js
// Worker threads — offloading CPU-bound work off the main event loop
const { Worker, isMainThread, parentPort } = require("worker_threads");

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on("message", (result) => console.log("Result:", result));
} else {
  const heavyComputation = () => {
    /* CPU-bound work that would otherwise block the loop */ return 42;
  };
  parentPort.postMessage(heavyComputation());
}
```

---

## 04 Express.js

Express is deliberately thin — it's Node's raw HTTP module plus routing and a middleware chain, and not much else. That minimalism is the point: it doesn't force a folder structure, an ORM, or a validation library on you, which is exactly why almost every Node backend, regardless of its actual architecture, still ends up built on top of it.

```
src/
├── controllers/
├── routes/
├── middlewares/
├── services/
├── repositories/
├── config/
├── validators/
├── utils/
├── models/
└── app.js
```

### Request lifecycle

```
Request → Route → Middleware → Validation → Controller → Service → Repository → Database → Response
```

### Middleware — the one concept Express is really built around

A middleware is just a function `(req, res, next)` that runs before your final route handler. What makes it powerful is that it's _composable_: you can stack as many as you want, each one either passing control forward (`next()`), short-circuiting the response early (e.g., `401` if unauthenticated), or attaching something to `req` for the next function to use. This is what lets you write auth, logging, and validation _once_ and apply it consistently across dozens of routes instead of repeating that logic in every controller.

```js
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet()); // sets secure headers by default, closes several common attack vectors in one line
app.use(cors({ origin: "https://myapp.com", credentials: true })); // controls which other origins are allowed to call this API from a browser
app.use(compression()); // gzip/brotli the response bodies — smaller payloads, faster page loads
app.use(morgan("combined")); // logs every request — first thing you want when debugging "why did this fail in prod"
app.use(express.json()); // parses JSON request bodies into req.body
app.use(cookieParser());

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // caps each IP at 100 requests / 15 min — the first line of defense against abuse

// Custom middleware — the pattern every auth/validation middleware follows
function requireAuth(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.get("/protected", requireAuth, (req, res) => res.json({ ok: true }));

// Error-handling middleware — Express recognizes this specifically because it has 4 arguments,
// and routes every error passed to next(err) here instead of crashing the process
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});
```

Order matters here — middleware runs top to bottom, so `helmet()` and `cors()` need to run before your routes, and the error handler has to be registered _last_ so Express knows it's the fallback for anything that throws.

---

## 05 Databases

Picking a database is really about picking which guarantees you need and which you're willing to give up — there's no universally "best" database, only the right tradeoff for your access pattern.

**SQL vs NoSQL** — SQL databases enforce a strict schema and relationships up front, which costs you flexibility but buys you strong consistency guarantees and the ability to run complex JOINs across related data. NoSQL databases relax the schema (documents can vary in shape) and often relax consistency too, in exchange for being easier to scale horizontally and faster to iterate on when your data model is still evolving.

**CAP Theorem** — in a distributed system, you can't simultaneously guarantee Consistency (every read sees the latest write), Availability (every request gets a response), and Partition tolerance (the system keeps working even if nodes can't talk to each other). The reason this ends up being framed as "pick 2 of 3" is a bit misleading, though — network partitions _will_ happen eventually in any real distributed system, so partition tolerance isn't really optional. The actual decision you're making is: when a partition happens, do you sacrifice consistency (keep serving, might return stale data) or availability (refuse to serve rather than risk an inconsistent answer)?

**ACID vs BASE** — ACID (Atomicity, Consistency, Isolation, Durability) is the guarantee that a transaction either fully happens or doesn't happen at all, and that concurrent transactions don't corrupt each other's view of the data — this is what SQL databases are built around, and it's why you reach for Postgres when correctness (money, inventory counts) matters more than raw throughput. BASE (Basically Available, Soft state, Eventually consistent) is the looser guarantee many NoSQL systems make instead: the system stays available and _will_ converge to a consistent state, just not necessarily instantly — a reasonable tradeoff when a few seconds of staleness (like a "like count" being slightly behind) genuinely doesn't matter.

**Indexes** — without one, the database has to scan every row to find a match (a full table scan), which is fine for a thousand rows and catastrophic for a hundred million. An index is a separate, sorted data structure (usually a B-tree) that lets the database jump straight to the matching rows — the cost is that every write now also has to update the index, so indexes are a deliberate tradeoff of write speed for read speed, and you shouldn't index every column "just in case."

**Normalization vs Denormalization** — normalizing (splitting data into related tables so nothing is duplicated) protects you from a very real bug class: if a user's name is stored in 5 places and you update one, the other 4 are now wrong. The cost is that reading a "complete" view of something now requires JOINing multiple tables. Denormalizing (duplicating data) flips that tradeoff: reads get faster and simpler because everything you need is in one place, but now you own the responsibility of keeping every copy in sync whenever it changes.

**Replication vs Sharding vs Partitioning** — these solve three different scaling problems, and mixing them up is a common interview stumble. Replication copies the _same_ data onto multiple nodes — its main purpose is redundancy (survive a node dying) and scaling _reads_ (route read queries to replicas). Sharding splits _different_ data across multiple independent database instances by some shard key — its purpose is scaling _writes_, since no single machine has to hold or write all the data. Partitioning is the same idea as sharding but usually refers to splitting a table into smaller physical chunks _within_ a single database instance (e.g., partitioning a huge `orders` table by month) — mainly for manageability and query performance, not for spreading load across machines.

**Connection Pooling** — opening a new database connection isn't free: it's a TCP handshake plus, often, an authentication round trip, every single time. If you open a fresh connection per request, that overhead dominates on high-traffic APIs. A connection pool keeps a fixed number of connections open and hands them out to requests as needed, reusing them instead of paying that setup cost repeatedly — this is standard on any production backend.

---

## 06 SQL

```sql
-- Basic query
SELECT id, name, email FROM users WHERE created_at > '2025-01-01' ORDER BY created_at DESC;

-- JOINs — INNER only keeps rows that match on both sides; LEFT keeps everything from the
-- left table even if there's no match, filling the right side with NULLs.
-- Picking the wrong one is a classic source of "why did some rows disappear" bugs.
SELECT o.id, u.name
FROM orders o
INNER JOIN users u ON o.user_id = u.id;

SELECT o.id, u.name
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;

-- GROUP BY + HAVING — GROUP BY collapses rows into groups, HAVING filters those groups
-- (WHERE can't do this because WHERE filters rows before grouping happens)
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;

-- Subquery — useful, but can be slow if the DB re-runs it per row; a JOIN is often faster
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- CTE — same as a subquery in spirit, but named and readable top-to-bottom,
-- which matters a lot once queries get complex
WITH high_value_orders AS (
  SELECT user_id, SUM(total) AS spend FROM orders GROUP BY user_id
)
SELECT * FROM high_value_orders WHERE spend > 5000;

-- Window function — lets you compute an aggregate (rank, running total) WITHOUT collapsing
-- rows the way GROUP BY does — you keep every row and just attach a computed value to it
SELECT
  user_id, total,
  RANK() OVER (PARTITION BY user_id ORDER BY total DESC) AS rank_by_user
FROM orders;
```

**Views** are just saved queries you can query like a table — handy for hiding complexity, but they don't store data themselves (a materialized view does, at the cost of needing to be refreshed). **Triggers** run automatically on INSERT/UPDATE/DELETE — powerful, but overused triggers make it genuinely hard to trace "wait, what actually changed this row," so use them sparingly. **Deadlocks** happen when transaction A is holding a lock transaction B needs, while B is holding a lock A needs — neither can proceed. The database detects this cycle and forcibly aborts one of the transactions rather than let both hang forever; your application code needs to be ready to retry a transaction that got killed this way.

---

## 07 PostgreSQL

**JSONB** exists for the case where you want most of your schema strict (SQL's strength) but need one column that's genuinely flexible — like a `metadata` field that varies per row. Plain `JSON` in Postgres is stored as text and re-parsed every time you query it; `JSONB` is stored in a decomposed binary format that's slightly slower to _write_ but much faster to _query_, and — critically — it can actually be indexed, which plain JSON can't.

```sql
SELECT * FROM events WHERE payload @> '{"type": "click"}';
CREATE INDEX idx_payload ON events USING GIN (payload);
```

**GIN vs GiST indexes** — GIN is built for cases where a single column can contain many values to search within (JSONB keys, arrays, full-text search tokens); GiST is built for cases like geometric/spatial data or range types where "nearest neighbor" or "does this range overlap" queries matter more than exact matches.

**MVCC** is the mechanism that lets Postgres avoid the classic "readers block writers" problem: instead of locking a row so only one transaction can touch it, Postgres keeps multiple versions of a row and gives each transaction a consistent snapshot as of when it started. This is _why_ a long-running read query doesn't get blocked by (or block) a concurrent write — they're literally looking at different row versions.

**EXPLAIN ANALYZE** is the single most useful tool for query performance work — it doesn't just show you the _planned_ query strategy, it actually runs the query and shows real timing per step, so you can see exactly whether it used an index or fell back to a full table scan.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
```

**VACUUM** exists because of MVCC's downside: old row versions that are no longer visible to any active transaction still take up disk space until something cleans them up — that's what VACUUM does, reclaiming that dead space. If autovacuum falls behind on a high-write table, you'll see real performance degradation, which is a common production gotcha.

---

## 08 MongoDB

MongoDB stores data as flexible JSON-like documents (BSON under the hood) instead of rigid rows, which is genuinely useful when your data doesn't naturally fit a fixed set of columns — think user-generated content, event logs, or anything whose shape evolves as the product does.

```js
// Aggregation pipeline — MongoDB's answer to SQL's JOIN + GROUP BY, expressed as a
// sequence of stages the data flows through, each one transforming it further
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
]);
```

**Indexes** work the same conceptually as SQL — but with compound indexes, the _order_ of fields in the index has to match how your queries filter/sort, or the index won't get used the way you expect; this trips people up constantly.

**Replication (replica sets)** — one primary node accepts writes, secondaries replicate from it, and if the primary goes down, the replica set automatically elects a new primary — this is what gives you both redundancy and read scaling (you can route reads to secondaries).

**Transactions — the assumption worth correcting.** A very common (and outdated) belief is "MongoDB doesn't have real transactions, so use Postgres if you need them." That was true a long time ago, but MongoDB has supported **multi-document ACID transactions since version 4.0, released in 2018**, and extended that across sharded clusters in 4.2. So "I need transactions" is no longer, by itself, a reason to rule Mongo out — the better question is about your data's _shape_ and _write pattern_, which is exactly the corrected decision tree in the Bonus section below.

```js
const session = client.startSession();
session.startTransaction();
try {
  await accounts.updateOne(
    { _id: fromId },
    { $inc: { balance: -amount } },
    { session },
  );
  await accounts.updateOne(
    { _id: toId },
    { $inc: { balance: amount } },
    { session },
  );
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction(); // if either update fails, roll back both — no half-completed transfer
} finally {
  session.endSession();
}
```

---

## 09 ORMs

An ORM exists to close the gap between how you think in code (objects, classes) and how relational data is actually stored (rows, foreign keys) — without it, you're hand-writing SQL strings everywhere, which is both tedious and a common source of SQL injection bugs if done carelessly.

| ORM           | Ecosystem | Style                                                                                                                                                                                         |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**    | Node/TS   | Schema-first — you define your schema in a dedicated file, and it generates a fully type-safe client from it, catching mismatches at compile time rather than at runtime                      |
| **TypeORM**   | Node/TS   | Decorator-based — you annotate classes directly to define the schema, supports both ActiveRecord (model manages itself) and DataMapper (separate repository) styles                           |
| **Sequelize** | Node/JS   | The older, mature option — model-based, huge ecosystem, less type-safety by default                                                                                                           |
| **Mongoose**  | MongoDB   | Adds an enforced schema layer on top of MongoDB's naturally schemaless documents — useful because "totally flexible" data often turns into "totally inconsistent" data without some structure |

```js
const user = await prisma.user.create({
  data: { name: "Rupesh", email: "r@example.com" },
});

// Repository pattern — wrapping the ORM behind your own interface, so your service
// layer doesn't depend directly on Prisma/TypeORM/whatever — see §00 for why this matters
class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }
  async create(data) {
    return prisma.user.create({ data });
  }
}
```

**Migrations** exist because your schema changes over time, and you need those changes to be version-controlled and reproducible across every environment (your laptop, staging, production) — running a migration script is far safer than manually running ALTER TABLE by hand on production. **Seeders** populate a fresh database with baseline/test data so a new developer (or a test suite) doesn't start from a completely empty DB.

---

## 10 Authentication

Authentication answers one question: **who is this?** It's easy to conflate with authorization (§11), but they're genuinely separate concerns — you can be authenticated (I know who you are) without being authorized to do a specific thing.

**Session-based auth** keeps the actual user state on the server — when you log in, the server creates a session record (in memory or in Redis) and gives your browser just an opaque session ID in a cookie. Every request, the server looks up that ID to figure out who you are. This is easy to revoke instantly (just delete the session record) but means every server instance needs access to the same session store — it's inherently stateful.

**JWT (JSON Web Token)** flips this: the token itself _is_ the proof, self-contained and cryptographically signed. The server can verify it's genuine just by checking the signature — no database lookup required — which is what makes JWTs a natural fit for stateless, horizontally-scaled APIs. The tradeoff is revocation: since the server isn't tracking issued tokens, you can't instantly invalidate one that's already out in the wild (a leaked or stolen token stays valid until it expires). This is why access tokens are kept short-lived, and paired with a longer-lived refresh token that's used specifically to mint new access tokens — limiting how long a compromised access token stays dangerous.

```js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Never store plaintext passwords — bcrypt hashes with a built-in salt, so even if your
// DB leaks, an attacker can't just read passwords straight out of it
const hashed = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(password, user.hashedPassword);

const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: "15m",
});
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" },
);

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // throws if signature/expiry is invalid
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

**OAuth** is a different problem entirely — it's not about proving who _you_ are to your own server, it's about letting a _third-party app_ access your data on another service (like "let this app see my Google Calendar") without ever handing that app your Google password. That's the whole reason it exists — delegated, scoped access without credential sharing.

---

## 11 Authorization

If authentication is "who are you," authorization is "**what are you allowed to do now that I know who you are**." Getting this split right matters because it's a common security bug source — checking that a token is valid (authenticated) is not the same as checking that this specific user is allowed to delete this specific resource.

**RBAC (Role-Based Access Control)** is the most common approach: you don't assign permissions to individual users one by one (that doesn't scale), you assign users to roles, and permissions to roles. Give someone the `admin` role and they inherit everything admins can do. Simple to reason about, but can get awkward when permissions don't map cleanly onto a small set of roles.

**ABAC (Attribute-Based Access Control)** is more flexible: the decision depends on _attributes_ at request time — is this user the owner of the resource, is it currently business hours, what department are they in. This handles cases RBAC struggles with (like "users can edit their own posts but not others'") without needing a separate role per possible condition.

```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" }); // 403, not 401 — we know who they are, they're just not allowed
    }
    next();
  };
}

app.delete(
  "/admin/users/:id",
  verifyToken,
  requireRole("admin"),
  deleteUserController,
);
```

---

## 12 Security

Each of these vulnerabilities exists because of a specific gap in trust — the fix always closes that specific gap, which is worth understanding rather than memorizing as a checklist.

**XSS (Cross-Site Scripting)** happens when user-supplied input gets rendered back into a page _as if it were trusted HTML/JS_ — e.g., a comment containing `<script>` actually executes in other users' browsers. The fix is to never trust that input is safe to render raw: encode output, and set a Content-Security-Policy header restricting which scripts are even allowed to run at all, as defense in depth.

**CSRF (Cross-Site Request Forgery)** exploits the fact that browsers automatically attach cookies to _any_ request to a domain, even one triggered by a malicious site you happen to have open in another tab. So a hidden form on `evil.com` can silently submit a request to `yourbank.com`, and your browser happily attaches your login cookie. `SameSite` cookies close this by telling the browser "don't attach this cookie to requests that originated from a different site" — which is why modern apps rarely need explicit CSRF tokens anymore if `SameSite=Strict/Lax` is set correctly.

**SQL Injection** happens when user input gets concatenated directly into a SQL string, letting an attacker inject their own SQL logic. Parameterized queries fix this at the root — the database treats the input strictly as _data_, never as executable SQL, no matter what characters are in it.

```js
// The database engine keeps the query structure and the values completely separate —
// there's no way for $1 to be interpreted as SQL syntax, however it's crafted
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

**Brute force / rate limiting** — without a limit, an attacker can just try millions of password guesses against your login endpoint. Rate limiting (and lockouts after N failed attempts) makes that approach too slow to be practical.

**Helmet** is really a bundle of small header fixes rather than one big feature — things like disabling browsers from guessing (sniffing) content types incorrectly, or forcing HTTPS via HSTS — each closing a narrow but real gap, and it's a one-line way to get most of them at once.

---

## 13 Caching

The entire point of caching is that recomputing or re-fetching the same thing repeatedly is wasteful when the answer hasn't changed — a cache trades a little staleness risk for a lot of speed and reduced database load.

**Cache-aside (lazy loading)** is the default pattern almost everyone uses: the app checks the cache first, and only on a miss does it go to the database — then it writes the result into the cache for next time. It's simple and naturally self-healing (a cache that's wiped just repopulates itself on the next request), but it means the _first_ request after an expiry always pays the full cost.

**Write-through** writes to the cache and the database at the same time, synchronously — the cache is never stale, but every write now costs more because it's doing two things instead of one.

**Write-back** writes to the cache immediately and flushes to the database later, asynchronously — writes feel fast to the user, but if the server crashes before that flush happens, that data is gone. You're trading durability for write latency, which is only acceptable for data you can afford to lose a little of.

```js
async function getUser(id) {
  const cacheKey = `user:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached); // cache hit — skip the database entirely

  const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  await redis.set(cacheKey, JSON.stringify(user), "EX", 3600); // cache miss — fetch, then remember for next time
  return user;
}
```

**TTL and eviction** exist because a cache has finite memory — TTL auto-expires entries you know become stale after some time, and eviction policies like LRU (throw out whatever hasn't been used recently) decide what to remove when the cache fills up and something has to go, even before its TTL is reached.

---

## 14 Performance

Most backend performance work boils down to removing unnecessary work, not making the necessary work faster — which is why the highest-leverage fixes are usually indexes and caching (§05, §13), not clever code-level micro-optimizations.

**Pagination and lazy loading** both attack the same root cause: fetching more data than you actually need right now. An unbounded query that returns every row is fine with 100 rows and a real problem with 10 million.

**Load balancing** matters once you have multiple server instances — the strategy you pick changes behavior under load. Round robin is simple but blind to actual server load; least-connections routes to whichever instance currently has the fewest active requests, which handles uneven request costs better; IP hash sends the same client to the same server consistently, useful if you still have any per-server state.

---

## 15 API Design

Good API design is really about minimizing surprise — a consumer of your API should be able to predict how an endpoint they've never used behaves, based on patterns they've seen elsewhere in the same API.

**REST vs GraphQL vs RPC/gRPC** — REST is the default because it's cacheable (GET requests map naturally onto HTTP caching) and universally understood. GraphQL earns its complexity when clients have genuinely different data needs (a mobile app wants a thin payload, a dashboard wants a nested, heavy one) — it solves the "over-fetching / under-fetching" problem REST has when one fixed endpoint shape has to serve every consumer. gRPC/RPC trades human-readability for raw performance and strict typed contracts (via Protobuf) — a good fit for internal service-to-service calls where both sides are code you control, not a public-facing API third parties will read by hand.

**Consistent error shapes** matter because client code has to branch on errors — if every endpoint formats errors differently, every integration has to special-case each one.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email is required",
    "fields": ["email"]
  }
}
```

**OpenAPI/Swagger** exists so the API's contract is machine-readable, not just described in a doc someone forgets to update — it can generate documentation, validate requests, and even generate client SDKs automatically, all from a single source of truth.

---

## 16 Validation

Validation exists to reject bad input _before_ it reaches your business logic — catching a missing field at the edge is far cheaper (and safer) than discovering it three layers deep as a cryptic database error.

```js
const { z } = require("zod");

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().positive().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ errors: result.error.flatten() });
    }
    req.body = result.data; // downstream code can now trust req.body matches the schema exactly
    next();
  };
}

app.post("/signup", validate(signupSchema), signupController);
```

Validation and **sanitization** solve related but different problems: validation _rejects_ input that doesn't meet the rules (422 error, nothing proceeds), while sanitization _cleans_ input so it's safe to use even if it wasn't perfectly formed (e.g., stripping `<script>` tags from a comment rather than rejecting the whole comment). You often want both — reject what's clearly wrong, sanitize what's merely messy.

---

## 17 Logging

Logs are what you actually have to debug a production incident _after the fact_ — you can't attach a debugger to a server that already crashed at 3am, but you can read what it logged right before it did.

```js
const pino = require("pino");
const logger = pino();

// A correlation ID lets you trace one single request as it flows through multiple
// services/log lines — without this, a distributed system's logs are just a pile of
// unrelated lines with no way to reconstruct what happened to one specific request
const { AsyncLocalStorage } = require("async_hooks");
const als = new AsyncLocalStorage();

app.use((req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  als.run({ correlationId }, () => {
    res.setHeader("x-correlation-id", correlationId);
    next();
  });
});

function log(message, extra = {}) {
  const store = als.getStore();
  logger.info({ correlationId: store?.correlationId, ...extra }, message);
}
```

**Log levels** exist so you can control verbosity per environment without changing code — you'd drown in noise running `debug`-level logs in production at scale, but you desperately want them while developing locally. **Structured logging** (logging JSON objects instead of free-text sentences) matters once you have enough logs that a human can't just scroll through them — structured fields are what make logs actually _queryable_ in a tool like Grafana Loki or the ELK stack ("show me every error where `userId = 42`"), which plain text can't do reliably.

---

## 18 Error Handling

The most useful distinction here is **operational errors** (expected, recoverable failures — bad input, a downstream timeout) vs **programmer errors** (actual bugs — calling a method on `undefined`). You want to handle the first gracefully and return a clean response; the second is a signal something in your code is actually broken and probably shouldn't be silently swallowed — you want it logged loudly so it gets fixed.

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as an expected error, safe to show the client
  }
}

app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  logger.error(err); // an unexpected bug — log the full stack for debugging, but never leak internals to the client
  res.status(500).json({ error: "Something went wrong" });
});

// Retry with exponential backoff — useful for transient failures (a downstream API
// blipping for a second), harmful for permanent ones (retrying a 404 forever gains nothing) —
// so retries should generally be limited to errors you expect to be temporary
async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2); // backing off doubles the wait each time, giving the failing dependency room to recover
  }
}
```

**Circuit breaker** takes this a step further: if a downstream dependency is _consistently_ failing, retrying every single request against it just adds load to something already struggling, and makes your own service slow while it waits on doomed calls. A circuit breaker notices the failure pattern and "opens" — short-circuiting calls to that dependency immediately (failing fast) for a cooldown window, instead of hammering it, then cautiously tests if it's recovered before fully reconnecting.

---

## 19 File Uploads

```js
const multer = require("multer");
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // caps upload size — without this, a huge file can exhaust server memory/disk
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

app.post("/upload", upload.single("avatar"), async (req, res) => {
  // Upload straight to S3 rather than saving to local disk — local disk doesn't survive
  // a server restart or scale across multiple instances, object storage does
  const result = await s3
    .upload({
      Bucket: "my-bucket",
      Key: req.file.originalname,
      Body: req.file.buffer,
    })
    .promise();
  res.json({ url: result.Location });
});
```

Never trust the client-reported MIME type or filename — an attacker can label a malicious file as `image/png` trivially, so real validation checks the actual file content, not just the header the client claims. **Chunked upload** matters for large files on unreliable connections: splitting the file into pieces client-side means a dropped connection only costs you the current chunk's progress, not the entire upload starting over from zero.

---

## 20 Background Jobs

The core idea: some work doesn't need to happen _before_ you respond to the user — sending a welcome email shouldn't make someone wait an extra 2 seconds for their signup request to return. Background jobs let you acknowledge the request immediately and do the slower work asynchronously.

```js
const { Queue, Worker } = require("bullmq");

const emailQueue = new Queue("emails", { connection: redisConnection });

// Producer — instead of calling sendEmail() directly (which would block the request
// and risk being lost if the process crashes mid-send), we hand it off to a durable queue
await emailQueue.add(
  "welcome-email",
  { userId: user.id },
  {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
);

// Consumer — runs independently of the web server, picks up jobs whenever it's free
new Worker(
  "emails",
  async (job) => {
    await sendWelcomeEmail(job.data.userId);
  },
  { connection: redisConnection },
);
```

A **dead letter queue** is where a job lands once it's exhausted every retry attempt — the alternative (silently dropping a job that keeps failing) means you'd never even know a welcome email never got sent. A DLQ turns silent failure into something you can actually see and investigate.

---

## 21 Message Queues

A message queue decouples the thing producing work from the thing doing the work — the producer doesn't need to know or care whether a consumer is even online right now, it just drops a message and moves on.

**RabbitMQ vs Kafka vs SQS** solve overlapping but distinct needs. RabbitMQ shines when you need flexible routing logic (exchanges deciding which queue a message goes to based on rules) and classic task-queue semantics — a message is consumed once and gone. Kafka is built around an append-only, replayable log — messages aren't deleted on consumption, so multiple independent consumer groups can all read the same stream at their own pace, which is exactly what you want for event streaming or when you might need to reprocess history later. SQS is the "don't want to run any of this yourself" option — fully managed, simple, and tightly integrated if you're already on AWS.

```js
// Queues typically guarantee "at-least-once" delivery — meaning the SAME message can
// legitimately be delivered twice (e.g., the consumer crashed right after processing but
// before acknowledging). "Exactly-once" delivery is extremely hard to guarantee in a
// distributed system, so in practice you approximate it: accept that duplicates can
// arrive, and make your processing logic idempotent so a duplicate is harmless —
// literally the same idea as the idempotency keys in §02, applied to queue consumers.
async function processPayment(message) {
  const alreadyProcessed = await redis.get(`processed:${message.id}`);
  if (alreadyProcessed) return; // duplicate delivery — safely skip re-processing

  await chargeCustomer(message.payload);
  await redis.set(`processed:${message.id}`, "1", "EX", 86400);
}
```

**Ordering** is another common gotcha: Kafka only guarantees order _within a single partition_, not across an entire topic — if strict ordering matters for a given entity (e.g., all events for one user), you need to make sure they're always routed to the same partition (usually by keying on that entity's ID).

---

## 22 WebSockets

HTTP is fundamentally request-then-response — the server can't just decide to push you something without you asking first. WebSockets exist for the cases where that's the wrong model: chat, live notifications, collaborative editing — anything where the server needs to push data to the client the moment something happens, not whenever the client next happens to ask.

```js
const { Server } = require("socket.io");
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.join(`room:${socket.handshake.query.roomId}`); // groups connections so you can broadcast to a subset, not everyone

  socket.on("message", (data) => {
    io.to(`room:${data.roomId}`).emit("message", data);
  });

  socket.on("disconnect", () => {
    /* cleanup */
  });
});
```

**Why scaling WebSockets is genuinely trickier than scaling REST**: a WebSocket connection is a long-lived, stateful connection to _one specific server instance_. If you have 3 server instances behind a load balancer and user A is connected to server 1 while user B is connected to server 2, and A sends B a chat message, server 1 has no direct way to push that message to a socket that's only open on server 2 — they're separate processes with separate memory. The fix is a **Redis adapter**: every server instance subscribes to Redis pub/sub, so when server 1 needs to broadcast something, it publishes to Redis, and every instance (including server 2) receives it and pushes it out to whichever of _its own_ connected sockets need it.

---

## 23 Microservices

Microservices exist to solve organizational and scaling problems that a monolith runs into as it grows — not because splitting things up is inherently better (it adds real complexity: network calls can fail in ways function calls never do, and you now need to reason about consistency across services instead of one shared database transaction).

```
Client → API Gateway → Service Discovery → [Service A, Service B, Service C]
                                                 │ REST/gRPC/Message Queue
```

The **API Gateway** exists so clients don't need to know about your internal service topology — they hit one entry point, and it handles cross-cutting concerns (auth, rate limiting, routing) centrally instead of every service reimplementing them. **Service discovery** solves a very practical problem: in a system where services scale up/down and get redeployed constantly, hardcoding "Service B lives at `10.0.0.5`" breaks the moment it moves — discovery lets services find each other's current location dynamically.

The **Saga pattern** exists because you can't wrap a transaction across multiple independent databases the way you could with a single-database ACID transaction — there's no single commit that spans services. Instead, a saga breaks a multi-service operation into a sequence of local transactions, each with a defined "undo" (compensating action) if a later step fails — e.g., if charging the customer succeeds but reserving inventory fails, the saga runs a compensating "refund the customer" step rather than leaving things half-done.

The **Outbox pattern** solves a subtler problem: if a service needs to both update its database _and_ publish an event about that update, doing these as two separate operations creates a window where one can succeed and the other fail (DB commit succeeds, but the process crashes before publishing the event — now other services never find out). The fix is writing the event into an "outbox" table in the _same_ local transaction as the actual data change, then having a separate process reliably publish outbox rows afterward — guaranteeing the event is never lost even if publishing itself has to be retried.

---

## 24 Backend System Design

System design questions are really asking: can you translate a vague requirement ("build a payment system") into concrete component choices, and can you justify each choice against the requirement's actual constraints (consistency needs, scale, latency)?

### Idempotency keys belong in almost every payment/order design answer

Any design involving payments, order creation, or queue-based processing should explicitly mention: client generates a UUID key per logical operation → server checks Redis for that key before executing → retries (client-side timeout retry, or queue redelivery) replay the cached result instead of re-running the operation. This is specifically what prevents a network retry from turning into a double charge — see the full implementation in §02.

### Quick mental models for common prompts

- **Notification system**: producers push into a message queue → fan-out to workers per channel (email/SMS/push) → track delivery status → failed sends go through retry logic and eventually a dead-letter queue rather than vanishing silently.
- **Rate limiter**: almost always backed by Redis, using either a token bucket (allows bursts up to a cap, refills over time) or a sliding window counter (`INCR` + `EXPIRE`) — enforced at the API Gateway so it protects every service behind it, not just one.
- **Chat system**: WebSockets for real-time push (§22), an append-heavy data store for message history (Cassandra/Mongo handle high write volume well), and presence tracked via short-TTL keys in Redis refreshed by a heartbeat — if the heartbeat stops, the key expires and the user is considered offline automatically.
- **Payment system**: idempotency keys, an append-only ledger table (you never mutate a historical financial record, you only ever add a new entry — this is what makes an audit trail trustworthy), and webhook retries that verify a cryptographic signature before trusting the payload.

---

## 25 Testing

The three testing levels exist because each one catches a different class of bug, and none of them alone is sufficient — unit tests are fast but can't catch integration mistakes, while E2E tests catch real bugs but are slow and expensive to run constantly.

```js
const request = require("supertest");
const app = require("../app");

describe("POST /users", () => {
  it("creates a user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@test.com");
  });
});

// Mocking lets you test the service layer's LOGIC without actually hitting a database —
// this is only possible because of the layered architecture from §00: the service layer
// depends on a repository interface, so a fake repository is a legitimate stand-in
jest.mock("../repositories/userRepository");
test("service calls repository with correct args", async () => {
  userRepository.create.mockResolvedValue({ id: 1 });
  await userService.createUser({ email: "a@b.com" });
  expect(userRepository.create).toHaveBeenCalledWith({ email: "a@b.com" });
});
```

**Unit tests** isolate one function/module and mock everything it depends on — fast, precise about _what_ broke, but they can't tell you if two correctly-tested pieces actually work together. **Integration tests** exercise multiple real layers together (often against a real test database) — slower, but they catch the seams unit tests miss. **E2E tests** drive the whole system the way a real user would — the most realistic, but also the slowest and most brittle, so they're usually reserved for critical user flows rather than every edge case. Coverage percentage is a useful smell test (very low coverage is a red flag) but isn't itself the goal — 100% coverage with weak assertions still misses real bugs.

---

## 26 Docker

Docker solves the "it works on my machine" problem by packaging your app together with its exact runtime environment (OS libraries, dependencies, versions) into one portable image — so what runs in your container is guaranteed identical whether it's your laptop, a teammate's machine, or production.

```dockerfile
# Multi-stage build — the build stage has all the tools needed to compile/build
# (which can be large), but the final image only copies over the finished output,
# so the shipped production image doesn't carry around build tools it'll never need again
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml — defines a whole multi-container setup (app + its dependencies)
# as one file, so `docker compose up` gives every developer the identical local stack
services:
  api:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:7
volumes:
  pgdata:
```

An **image** is the immutable blueprint; a **container** is a running instance of it — you can start many containers from the same image. **Volumes** exist because a container's own filesystem is wiped when the container is removed — anything you actually need to persist (like a database's data) has to live in a volume mounted from outside the container's lifecycle.

---

## 27 Kubernetes

Kubernetes exists for the problem Docker alone doesn't solve: once you have dozens or hundreds of containers across many machines, you need something to decide _where_ they run, restart them when they crash, scale them up under load, and route traffic to healthy ones — doing that by hand doesn't work past a certain scale.

| Object                 | What it's actually for                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pod**                | The smallest thing Kubernetes schedules — usually one container, sometimes a couple of tightly-coupled ones that need to share network/storage                                                                                        |
| **Deployment**         | Keeps a target number of pod replicas running, and manages rolling out new versions without downtime (and rolling back if something's wrong)                                                                                          |
| **Service**            | A stable network address for a _set_ of pods — since individual pods come and go (crash, redeploy), you need something whose address doesn't change even as the actual pods behind it do                                              |
| **Ingress**            | Routes external HTTP(S) traffic into the cluster based on rules (hostnames, paths)                                                                                                                                                    |
| **ConfigMap / Secret** | Externalize configuration/sensitive values from the container image itself, so the same image can run in dev/staging/prod just by swapping what's injected                                                                            |
| **HPA**                | Automatically adds/removes pod replicas based on real load (CPU, memory, or a custom metric) — the horizontal scaling idea from §00, automated                                                                                        |
| **StatefulSet**        | Like a Deployment, but for workloads that need a stable identity and stable storage across restarts (databases) — a plain Deployment's pods are interchangeable and disposable, which doesn't work for something like a database node |
| **Job / CronJob**      | For work that's meant to run to completion or on a schedule, rather than run forever like a web server                                                                                                                                |

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: myrepo/api:latest
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: "250m", memory: "256Mi" } # what it's guaranteed to get
            limits: { cpu: "500m", memory: "512Mi" } # the ceiling it can't exceed
```

---

## 28 CI/CD

The point of CI/CD is to remove humans from repetitive, error-prone steps (running tests, building, deploying) and to catch problems _before_ they reach production, automatically, on every single change — instead of relying on someone remembering to run the test suite before merging.

```yaml
name: CI/CD
on: { push: { branches: [main] } }
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: ./deploy.sh
```

**Blue-green vs canary** are two different answers to "how do I deploy without risking downtime." Blue-green keeps two complete environments running and switches all traffic from the old one to the new one instantly — the appeal is that rollback is just switching back, immediately. Canary instead sends a small slice of real traffic to the new version first, watches for problems, and only then gradually increases that slice — the appeal is catching a bad deploy while it's only affecting a small fraction of users, rather than everyone at once.

---

## 29 AWS

Rather than memorizing a service list, it helps to group AWS services by the actual problem each one removes from your plate:

- **Compute**: EC2 gives you a raw virtual machine you fully manage; Lambda goes the opposite direction — you just supply a function, and AWS handles provisioning, scaling, and you only pay per invocation. ECS/EKS sit in between — managed container orchestration (ECS is AWS's own system, EKS is managed Kubernetes) for when you want containers without running your own cluster control plane.
- **Storage**: S3 is durable object storage for files/backups/static assets — not a database, but often used alongside one. RDS is a managed relational database (Postgres/MySQL) where AWS handles backups, patching, and failover for you.
- **Networking/delivery**: CloudFront is a CDN — it caches your content at edge locations physically close to users, cutting latency for anyone far from your actual server region. API Gateway is a managed front door for your APIs, commonly used to front Lambda functions.
- **Messaging**: SNS is pub/sub — one message fans out to many subscribers. SQS is a managed queue for point-to-point work distribution (see §21 for why queues exist at all).
- **Operations**: CloudWatch is your logs/metrics/alarms system on AWS. IAM is the permissions layer controlling exactly what any given user, service, or role is allowed to touch — misconfigured IAM is one of the most common real-world cloud security incidents.

```js
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // ... business logic
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
```

---

## 30 Observability

Observability is what lets you answer "why is this broken" _without already knowing the answer in advance_ — it's the difference between a system you can only debug by guessing, and one where the data to diagnose almost anything is already being collected.

The three pillars each answer a different question, which is why you generally need all three, not just one:

- **Logs** answer "what exactly happened, in detail, at this one point in time" — the most granular, but the least structured for spotting trends.
- **Metrics** answer "how is the system behaving over time" — error rate, latency, throughput — good for noticing _that_ something's wrong and roughly when it started, but not _why_.
- **Traces** answer "where, across multiple services, did this one specific request spend its time" — essential in a microservices world where a slow response might be caused by any one of five downstream calls, and you need to see which one.

```js
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });
sdk.start();
```

**Liveness vs readiness health checks** solve different problems: liveness (`/health`) asks "is this process alive at all, or should it be restarted" — readiness (`/ready`) asks "is this instance actually able to serve traffic right now" (e.g., can it reach its database) — a process can be alive but not ready, and routing traffic to it anyway would just produce errors.

---

## 31 Architecture

Each of these patterns is really an answer to "where should business logic live, and what should it be allowed to depend on" — the specific names matter less than the underlying goal: keep the core logic isolated from things that change for unrelated reasons (which database you use, which framework you're on).

**MVC** splits concerns into Model (data), View (presentation), Controller (request handling) — the original separation-of-concerns pattern, still the mental model behind most simple CRUD apps.

**Hexagonal / Ports & Adapters** and **Clean Architecture** both push the same idea further: your core business logic shouldn't depend on any specific framework or database at all — it defines interfaces ("ports") that outside things (a specific database, a specific web framework) implement ("adapters"). The payoff is that swapping your database, or even your web framework, becomes a change at the edges, not a rewrite of your actual business rules.

**DDD (Domain-Driven Design)** is less about a specific code structure and more about a discipline: model your code around the language and concepts your actual business/domain uses, and draw clear boundaries ("bounded contexts") around different subdomains so a term like "Order" doesn't quietly mean five different things in five different parts of the codebase.

**CQRS** separates the model used for writes (commands) from the model used for reads (queries) — worth reaching for when your read and write patterns are genuinely very different (e.g., writes are simple but reads need a heavily denormalized, fast-to-query shape) — trying to serve both from one model can force awkward compromises on both sides.

**Event-driven architecture** has services react to _events_ rather than call each other directly — the producer of an event doesn't need to know who's listening or what they'll do about it, which is what allows services to be added or changed independently over time, at the cost of it being harder to trace the full flow of "what happens when X occurs" just by reading code.

---

## 32 Interview Questions

Short, interview-ready answers — but each is worth being able to _explain_, not just recite, since a good interviewer will ask "why" as a follow-up.

1. **Explain the Event Loop.** It processes fixed phases (timers → pending callbacks → poll → check → close) one at a time, but microtasks (`process.nextTick`, resolved Promises) aren't one of those phases — they drain completely between every phase transition and after every callback, with `nextTick` always draining first. See §03 for the full example.
2. **What is libuv?** The C library beneath Node that provides the event loop itself and a background thread pool for operations the OS can't do non-blocking (file I/O, DNS).
3. **Streams vs Buffers?** A Buffer holds an entire chunk of binary data in memory at once; a Stream processes data incrementally in small chunks, which is why streams keep memory usage flat even for very large files.
4. **JWT vs Session?** Session auth is stateful (server tracks it, trivially revocable, needs a shared store across servers); JWT is stateless (self-verifying via signature, scales horizontally with no lookup, but hard to revoke early — mitigated with short expiry + refresh tokens).
5. **PUT vs PATCH?** PUT replaces the entire resource and is idempotent (send it twice, same end state); PATCH applies a partial update and is only idempotent if you design it that way (`set` is, `increment` isn't).
6. **Redis vs Memcached?** Redis supports richer data structures (lists, sets, sorted sets), persistence, and pub/sub; Memcached is simpler and purely key-value, but multi-threaded out of the box.
7. **Kafka vs RabbitMQ?** Kafka is an append-only, replayable log built for high-throughput streaming with multiple independent consumers; RabbitMQ offers more flexible routing and classic "consume once and it's gone" task-queue semantics.
8. **Cluster vs Worker Threads?** Cluster forks separate processes (own memory each) to use multiple cores for I/O-bound work; Worker Threads share memory within one process and are for offloading genuinely CPU-bound work off the main thread.
9. **Why connection pooling?** Opening a DB connection costs a real handshake (and often auth) every time — a pool reuses a fixed set of already-open connections instead of paying that cost per request.
10. **CAP Theorem?** You can't have Consistency, Availability, and Partition tolerance all at once in a distributed system — and since partitions are basically inevitable, the real day-to-day tradeoff is consistency vs availability _during_ a partition.
11. **Circuit Breaker?** Detects that a dependency is consistently failing and stops calling it for a cooldown period, failing fast instead of piling on load to something already struggling — then cautiously tests recovery before reconnecting fully.
12. **Horizontal scaling — what does it require?** The app has to be stateless (or externalize its state to something shared, like Redis), otherwise a given user has to stick to one specific instance, defeating the purpose.
13. **Why did HTTP move from 1.1 to 2 to 3?** 1.1 had head-of-line blocking at the application layer; 2 fixed that with multiplexing but still had TCP's transport-layer HOL blocking; 3 replaced TCP with QUIC/UDP to fix blocking at the transport layer too and speed up handshakes on flaky networks. Full breakdown in §01.
14. **Does MongoDB support transactions?** Yes, multi-document ACID transactions since v4.0 (2018) — "no transactions" is an outdated assumption, and shouldn't be the deciding factor between SQL and Mongo anymore (see the corrected decision tree below).
15. **What's an idempotency key, and why do payment APIs need one?** A client-generated unique ID per logical operation, checked server-side (typically Redis) before executing — retries return the original cached result instead of re-executing, which is exactly what prevents a network retry from double-charging a customer. Full pattern in §02.

---

## 33 Project Structure

**Small project** — grouped by _technical layer_, which is fine while the codebase is small enough that "where's the auth logic" is easy to answer by scanning a handful of folders:

```
src/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── models/
├── utils/
├── config/
└── validators/
```

**Enterprise / feature-based** — grouped by _business capability_ instead. The reasoning: as a codebase grows, "everything auth-related" scattered across `controllers/`, `services/`, `routes/` etc. becomes harder to navigate than having one `auth/` folder containing its own controller, service, and routes together. This also happens to be a natural stepping stone toward microservices later, since each module is already reasonably self-contained.

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   └── orders/
├── shared/
├── config/
├── database/
├── jobs/
├── events/
└── common/
```

---

## 34 Best Practices

These principles aren't rules to follow blindly — each one is a guard against a specific failure mode you've probably already experienced without naming it.

**SOLID** — mainly guards against code that's technically working but painful to change; e.g., Single Responsibility means a class/function changes for exactly one reason, so a change to how you send emails doesn't also risk breaking how you validate user input, just because they were tangled together in the same function.

**DRY** exists because duplicated logic drifts — you fix a bug in one copy and forget the other three exist, and now you have three different behaviors where you meant to have one.

**YAGNI** is a direct counter to over-engineering: building flexibility for a requirement that doesn't exist yet usually guesses wrong about what that future requirement will actually look like, and just adds complexity you have to maintain in the meantime for no real benefit.

**12-Factor App** principles (config in environment variables, stateless processes, logs treated as event streams, dev/prod parity) are really all pointed at the same goal: making an app that's trivially portable and scalable across environments, because none of its identity is baked into one specific machine or one specific config file checked into git.

---

## Bonus Sections

### Complete Request Lifecycle

```
Browser
  │
  ▼
DNS Lookup
  │
  ▼
TCP Handshake
  │
  ▼
TLS Handshake (HTTPS)
  │
  ▼
HTTP Request  (HTTP/1.1, /2, or /3 — see §01 for why the version genuinely changes behavior here)
  │
  ▼
Load Balancer
  │
  ▼
Reverse Proxy (Nginx)
  │
  ▼
Express Server
  │
  ▼
Middleware
  │
  ▼
Authentication
  │
  ▼
Validation
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository
  │
  ▼
Database / Cache
  │
  ▼
Response
```

### Backend Decision Tree

```
Need Real-Time?
│
├── Yes
│   ├── Few users → WebSockets
│   ├── Massive scale → Kafka + WebSockets
│   └── Notifications only → SSE (server pushes updates over a single long-lived HTTP
│                                  connection — simpler than WebSockets when you only
│                                  need one-way server-to-client updates)
│
└── No
    └── REST API
```

### Database Selection — corrected, with the reasoning

The original version of this tree asked **"Need Transactions? → Yes → PostgreSQL / No → MongoDB,"** and the problem with that isn't just a factual gap — it teaches the wrong mental model for choosing a database. It implies transactions are a SQL-exclusive feature, which hasn't been true since MongoDB added multi-document ACID transactions in **v4.0 (2018)**. The actual decision should be about your data's _shape_ and _write pattern_, not about a feature both databases now have.

```
Relational Data & Strict Schema?
   (your data has well-defined relationships, foreign keys genuinely matter,
    and you'll be running complex JOINs/reporting queries across them)
│
├── Yes → PostgreSQL
│         (strong consistency, real JOINs, and JSONB available for the few fields
│          that do need flexibility — see §07)
│
└── No
    │
    Polymorphic / Unstructured Data & High Write Throughput?
       (documents vary in shape between records, the schema evolves often,
        and you need to scale writes horizontally via sharding)
    │
    ├── Yes → MongoDB
    │         (flexible schema, horizontal scaling via sharding, and ACID
    │          transactions are available here too if you need them — see §08)
    │
    ├── Mainly need a fast, ephemeral cache layer? → Redis
    │
    ├── Mainly need full-text / relevance search? → Elasticsearch
    │
    └── Mainly need analytics / OLAP at scale? → ClickHouse
```

**The line worth saying out loud in an interview:** "Transactions alone shouldn't be the deciding factor between SQL and NoSQL anymore — MongoDB has had them since 2018. The real question is whether the data is relational and schema-strict, or polymorphic and write-heavy."

### Authentication Flow

```
User Login
    │
    ▼
Validate Credentials
    │
    ▼
Generate Access Token (short-lived — limits damage if it's ever stolen)
    │
    ▼
Generate Refresh Token (long-lived — its only job is minting new access tokens)
    │
    ▼
Store Refresh Token (DB/Redis, usually hashed — so even a DB leak doesn't hand out usable tokens)
    │
    ▼
Client Sends Access Token (Authorization header, on every request)
    │
    ▼
Middleware Verifies Token (just checks the signature — no DB lookup needed, which is the whole point of JWT)
    │
    ▼
Protected Route
```

### Caching Strategy

```
Request
    │
    ▼
  Redis
 ┌──┴──┐
 │ Hit │──────────► Return Data (fast path — database never touched)
 └──┬──┘
   Miss
    │
    ▼
 Database (slow path — only happens when the cache doesn't have it yet)
    │
    ▼
 Store in Redis (so the NEXT request for the same thing takes the fast path)
    │
    ▼
 Return Response
```

### Scaling Strategy — roughly in the order you'd actually reach for them

```
High Traffic
│
├── Optimize Queries        (cheapest fix, usually the highest leverage — do this first)
├── Add Indexes
├── Add Cache
├── Load Balancer
├── Multiple Servers        (only works cleanly once the app is stateless — see §00)
├── Queue Heavy Tasks       (move slow work out of the request/response cycle — see §20)
├── CDN                     (offload static content delivery entirely)
└── Database Replicas       (scale reads once the database itself becomes the bottleneck)
```

### Idempotency in the Request Lifecycle (payments/queues — see §02, §21, §24)

```
Client generates Idempotency-Key (UUID)
    │
    ▼
POST /payments/charge  (header: Idempotency-Key)
    │
    ▼
Middleware checks Redis for key
    │
 ┌──┴───────────────┐
 │ Key exists        │ Key new
 │ (seen before)      │
 ▼                    ▼
Return cached      Lock key (SET NX + TTL) — guards against a
response instantly  concurrent duplicate arriving at the same time
(no re-execution)         │
                           ▼
                    Run business logic
                    (charge card, etc.)
                         │
                         ▼
                    Store result in Redis
                    (24h TTL — so even a LATE retry gets the
                     original outcome, not a second charge)
                         │
                         ▼
                    Return response
```

---

_Built iteratively — extend any section with deeper drilling or more code samples as you revise._

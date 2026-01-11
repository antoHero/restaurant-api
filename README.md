# Restaurant Reservation API

A high-performance Node.js & Express API for managing restaurant table reservations with built-in conflict resolution and architectural scalability.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
The project uses SQLite for development. Initialize the schema and seed data:
```bash
# Run migrations
npm run migrate

# Seed initial restaurants and tables
npm run seed
```

### 3. Run the Application
```bash
# Development mode with tsx
npm run dev
```

### 3. Generate Swagger API Docs
```bash
# Development mode with tsx
npm run swagger
```
The server will start on `http://localhost:3000` or `http://localhost:9000`. 
Explore the interactive API docs at `http://localhost:3000/api-docs` or `http://localhost:9000/api-docs`.

### 4. Run Tests
The suite includes critical path tests for double-booking prevention and availability logic.
```bash
npm test
```

---

## 🛠 API Documentation

### Restaurant Management
- **POST `/api/restaurants`**: Create a new restaurant profile.
- **POST `/api/restaurants/:slug/tables`**: Add specific tables (capacity/number) to a restaurant.
- **GET `/api/restaurants/:slug`**: Retrieve details and operating hours.

### Reservation System
- **POST `/api/reservations`**: Book a table.
- **PATCH `/api/reservations/:reference/cancel`**: Cancel an existing booking.
- **GET `/api/reservations/slots`**: Query available 30-minute intervals for a specific party size and date.
- **POST `/api/waitlist`**: Join the queue if no tables are available.

#### Example: Create Reservation
**Request:** `POST /api/reservations`
```json
{
  "slug": "gourmet-bistro",
  "customerName": "Alice Smith",
  "phone": "5550123456",
  "partySize": 4,
  "startDateTime": "2024-12-25T19:00:00Z",
  "durationMinutes": 90
}
```

---

## 🧠 Design Decisions

1. **ACID Transactions**: Reservation creation is wrapped in a Sequelize transaction. This ensures that the "check-then-book" logic is atomic, preventing two users from grabbing the last table simultaneously.
2. **Slug-Based Routing**: Uses URL-friendly slugs (e.g., `/pasta-palace`) instead of internal IDs to improve SEO and API readability.
3. **Idempotent Migrations**: Migrations use existence checks (`if (!tables.includes...)`). This allows `sequelize.sync()` in tests to coexist with Umzug migrations in production without conflicts.
4. **Validation Layer**: Zod middleware validates request shapes before they hit controllers, ensuring 422 errors are returned before expensive DB operations.

---

## Scaling for High Traffic

### 1. Caching with Redis (Vital)
To handle 10,000+ users checking availability simultaneously during peak hours:
- **Slot Caching**: Store pre-calculated availability slots in Redis with a 1-minute TTL.
- **Distributed Locking**: Use `Redlock` to manage table assignments across multiple server instances where local DB transactions might be insufficient in a distributed setup.

### 2. Multi-Restaurant Scaling
Currently, the API supports multiple restaurants in one DB. To scale to thousands:
- **Database Sharding**: Shard the `reservations` table by `restaurantId`.
- **Search Grounding**: Implement an ElasticSearch/OpenSearch layer for "Restaurants near me" queries instead of hitting the relational DB.

---

## ⚠️ Known Limitations & Future Improvements

- **Current Limitations**: 
  - SQLite is single-process; multi-instance deployments require PostgreSQL.
  - Notifications (SMS/Email) are currently mocked to console logs.
- **What I would improve with more time**:
  - **Redis Cache Layer**: Implement a read-through cache for the `/slots` endpoint.
  - **Table Optimization**: Add an algorithm to suggest "best-fit" tables (e.g., don't put a 2-person party at a 6-person table if a 2-person table is free).
  - **Auth**: Add JWT-based authentication for restaurant managers to view their own dashboard.
  - **Waitlist Automation**: Automatically notify the first person on the waitlist via webhook when a reservation is cancelled.

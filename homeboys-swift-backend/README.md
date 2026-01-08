# Homeboys Swift Backend (MongoDB)

This backend is configured to use MongoDB via Mongoose.

Quick start (recommended using Docker):

1. Copy `.env` and set variables (already includes `MONGO_URI` default for local Docker):

   - `.env` should contain `MONGO_URI=mongodb://localhost:27017/homeboys_swift_db` and your `JWT_SECRET`.

2. Start MongoDB with Docker Compose (from `homeboys-swift-backend` directory):

```powershell
docker compose up -d
```

This will start a `mongo` service on `localhost:27017` and a `backend` service (if you build it with Docker).

3. Install dependencies locally (if not running backend in Docker):

```bash
npm install
```

4. Seed the database with sample data:

```bash
npm run seed
```

5. Start the server locally (development):

```bash
npm run dev
```

Or, if you prefer to build and run the backend container via Docker Compose (will build image):

```powershell
docker compose up -d --build
```

Notes:
- The seed script creates an admin user (`admin@example.com` / `adminpass`) and sample buses, routes and trips.
- If you run Docker Compose, the backend will be configured to use the internal Docker network to reach MongoDB at `mongodb://mongo:27017/homeboys_swift_db`.
- If you want to use MongoDB Atlas, set `MONGO_URI` in `.env` to your Atlas connection string.

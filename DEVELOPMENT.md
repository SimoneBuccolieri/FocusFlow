# Local Development Guide

This project supports two development workflows. Use the **Hybrid Workflow** for the best experience (fastest reloads).

## 1. Hybrid Workflow (Recommended)
Run the database in Docker, but run the Next.js app on your local machine.

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Setup
1.  **Start the Database**:
    ```bash
    docker-compose up db -d
    ```
    *(This starts just the Postgres container in the background)*

2.  **Install Dependencies** (if you haven't yet):
    ```bash
    npm install
    ```

3.  **Run the App**:
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000).
    Changes to your code will reflect instantly.

> **Note**: This works because we created a `.env.local` file that points the database to `localhost:5432`.

---

## 2. Full Docker Workflow
Run everything (App + DB) inside Docker. Useful if you don't want to install Node.js locally.

### Setup
1.  **Start everything**:
    ```bash
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
    ```
    *(The `-f docker-compose.dev.yml` flag enables "Hot Reload" by mounting your code into the container)*

2.  Acccess the app at [http://localhost:3000](http://localhost:3000).

### Stopping
Press `Ctrl+C` to stop. To remove containers:
```bash
docker-compose down
```

## Database Management
- **Run Migrations**: `npx prisma migrate dev` (local) or `docker-compose exec app npx prisma migrate dev` (docker).
- **View Data**: `npx prisma studio` (local).

# CaseFlow 🚀

> **"Import → Validate → Fix → Submit → Track"**

CaseFlow is a high-performance, full-stack data ingestion platform designed to handle large datasets (50k+ rows) with a focus on User Experience, Accessibility, and Data Integrity. It allows operations teams to upload CSVs, clean data in a virtualized grid, and bulk-import cases into a PostgreSQL database with robust validation and audit trails.

Getty ImagesExplore

## 📺 Demo & Links

- **Live Demo:** \[Link to your deployed URL\]
- **Demo Video:** \[Link to your Loom/YouTube video\]

## 🏗️ Architecture Overview

CaseFlow follows a **Three-Tier Architecture** containerized with Docker.

1.  **Presentation Layer (Frontend):**

    - Built with **React 18 + TypeScript + Vite**.
    - Uses **TanStack Table** (Headless UI) + **Virtualization** to render 50,000+ rows at 60 FPS.
    - State managed by **Zustand** (persisted locally).
    - Styling via **Tailwind CSS** & **Radix UI** primitives (shadcn/ui).

2.  **Application Layer (Backend):**

    - **Node.js + Express** (TypeScript).
    - Implements **RBAC** (Role-Based Access Control) for Admins vs Operators.
    - Handles batch processing, validation (Zod), and idempotency logic.

3.  **Data Layer:**

    - **PostgreSQL** database managed via **Prisma ORM**.
    - Stores Users, Cases, Imports, and comprehensive Audit Logs (CaseHistory).

## 🛠️ Tech Stack

| **Category**   | **Technology**           | **Rationale**                                                             |
| -------------- | ------------------------ | ------------------------------------------------------------------------- |
| **Frontend**   | React, Vite, TypeScript  | Industry standard for performance and type safety.                        |
| **Grid/Data**  | TanStack Table + Virtual | Headless control for maximum customization & 50k row performance.         |
| **State**      | Zustand                  | Lightweight, boilerplate-free state management with built-in persistence. |
| **UI/Styling** | Tailwind CSS, Radix UI   | Accessible, theme-able (Dark/Light), and responsive design.               |
| **Backend**    | Express, Node.js         | robust, event-driven architecture.                                        |
| **Database**   | PostgreSQL, Prisma       | Relational data integrity with excellent TypeScript integration.          |
| **Validation** | Zod, Libphonenumber-js   | Isomorphic validation (shared logic) and strict phone parsing.            |
| **Testing**    | Playwright, Vitest, Jest | Full coverage: E2E, Component Unit, and Backend Service tests.            |
| **DevOps**     | Docker, GitHub Actions   | Containerization for consistent dev/prod environments.                    |

## 🚀 Getting Started (Run Locally)

The project is fully Dockerized. You can spin up the Database, Backend, and Frontend with a single command.

### Prerequisites

- Docker & Docker Compose installed.

### Steps

### Steps

1.  **Clone the repository:**

        git clone https://github.com/yourusername/caseflow.git
        cd caseflow

2.  **Environment Setup:**

        # Create backend env file (defaults provided are safe for local docker)
        cp backend/.env.example backend/.env

        # Create frontend env file
        cp frontend/.env.example frontend/.env

3.  **Start the Application:**

        docker-compose up --build

4.  **Seed the Database (Crucial):** Open a new terminal window and run:

        # 1. Create Tables
        docker-compose exec backend npx prisma migrate dev --name init

        # 2. Seed Admin User
        docker-compose exec backend npx prisma db seed

5.  **Access the App:**

    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:3001`

**Default Credentials:**

- **Admin:** admin@caseflow.com / Admin@123
- **Operator:** operator@caseflow.com / Operator@123

## 📂 Project Structure

` **caseflow/**

**├── backend/**

**│   ├── prisma/             # Schema & Migrations**

**│   ├── src/**

**│   │   ├── controllers/    # Request handlers (Auth, Import, Case)**

**│   │   ├── middleware/     # Auth checks, Error handling**

**│   │   ├── services/       # Business logic**

**│   │   └── utils/          # Zod schemas, Logger**

**│   └── tests/              # Jest unit tests**

**├── frontend/**

**│   ├── e2e/                # Playwright End-to-End tests**

**│   ├── src/**

**│   │   ├── components/     # Reusable UI (DataGrid, Inputs)**

**│   │   ├── pages/          # Route views (Import, List, Details)**

**│   │   ├── store/          # Zustand logic (CSV processing)**

**│   │   └── lib/            # API client, Utils**

**│   └── styles/             # Tailwind & Global CSS**

**└── infrastructure/         # Terraform / AWS configs**
`

## 🧠 Design Decisions & Tradeoffs

### 1\. Grid Choice: Headless (TanStack) vs. Component (AG Grid)

- **Decision:** Used **TanStack Table** (Headless).
- **Why:** While AG Grid is powerful, it is heavy. A "Frontend-Lean" requirement implies building performant UI logic. TanStack gave us full control over the DOM, allowing us to build a custom **Virtualizer** and accessible inputs without fighting a framework's styles.
- **Tradeoff:** Required implementing features like "Row Selection" and "Edit Inputs" manually, which took more dev time but resulted in a lighter bundle.

### 2\. Handling 50k Rows (Performance)

- **Virtualization:** We do NOT render 50,000 DOM nodes. We use tanstack-virtual to render only the ~20 rows visible in the viewport. This keeps the UI thread unblocked at 60fps.
- **Batching:** Data is sent to the backend in chunks (e.g., 1000 rows) rather than one massive payload, preventing request timeouts.

### 3\. Idempotency & Upserts

- **Strategy:** Instead of failing on duplicate IDs, the backend uses an **Upsert** strategy.
- **Logic:** If a Case ID exists, we compare the data fields. If data changed, we update it and log an UPDATED event. If data is identical, we SKIP it. This makes the import process robust and re-runnable.

## 🔒 Security Measures

1.  **RBAC (Role-Based Access Control):**

    - **Admins** can Delete cases and manage data.
    - **Operators** can only Import and View.
    - Enforced via Middleware (requireRole('ADMIN')) on the backend.

2.  **Input Sanitization:** All incoming data (Auth & CSV) is parsed via **Zod** schemas before touching the database.
3.  **Rate Limiting:** express-rate-limit protects Auth and Import endpoints from brute force.
4.  **JWT Auth:** Stateless authentication using Access (Short-lived) and Refresh tokens.

## 🧪 Testing Strategy

We employ a "Testing Trophy" approach:

1.  **E2E Tests (Playwright):** Covers the critical path.

    - _Flow:_ Login -> Upload CSV -> Fix Validation Error -> Submit -> Verify in List.
    - Run: cd frontend && npx playwright test

2.  **Frontend Unit Tests (Vitest):** Tests complex logic in csvStore.

    - Verifies: Validation rules, "Fix All" logic, and Duplicate detection.
    - Run: cd frontend && npm test

3.  **Backend Integration Tests (Jest):** Tests API endpoints and health checks.

    - Run: docker-compose exec backend npm test

**Coverage:** Core business logic (Validation/Import) has >90% coverage.

## 🚢 Deployment

The application is designed to be deployed on **AWS EC2** using Docker Compose.

### Environment Variables (.env)

Ensure these are set in your production environment:

##

| **Variable**         | **Description**                                            |
| -------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`       | Connection string for PostgreSQL (RDS or Docker)           |
| `JWT_SECRET`         | Strong random string for signing tokens                    |
| `JWT_REFRESH_SECRET` | Strong random string for refresh tokens                    |
| `CORS_ORIGIN`        | The URL of your frontend (e.g., `https://caseflow.com`)    |
| `VITE_API_URL`       | The URL of your backend (e.g., `https://api.caseflow.com`) |

### Quick Deploy (EC2)

1.  SSH into instance.
2.  Install Docker & Docker Compose.
3.  Clone repo.
4.  Set .env files.
5.  Run sudo docker-compose up -d --build.
6.  Run migrations: sudo docker-compose exec backend npx prisma migrate deploy.

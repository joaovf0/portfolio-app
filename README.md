# QA Engineering Portfolio

[![CI](https://github.com/joaovf0/portfolio-app/actions/workflows/ci.yml/badge.svg)](https://github.com/joaovf0/portfolio-app/actions/workflows/ci.yml)

A full-stack application and test automation project designed to demonstrate practical skills in **Quality Engineering, Test Automation, and Software Development Engineering in Test (SDET)**.

The project combines a real backend application, a relational database, automated testing at different levels, and a continuous integration pipeline.

The focus is not only on writing automated tests, but also on building maintainable test architecture, validating business rules, managing test data, preventing regressions, and integrating quality checks into the development workflow.

---

## 1. Project Overview

This project is being developed as a practical demonstration of modern QA and SDET engineering practices.

The application currently provides a user management API, including user creation, listing, input validation, email normalization, duplicate detection, and password hashing.

The project will progressively evolve into a more complete application, providing opportunities to implement and demonstrate additional testing strategies.

### Engineering objectives

- Design and maintain reusable automation architecture.
- Apply a risk-based testing strategy.
- Implement unit, API, integration, and end-to-end tests.
- Validate business rules and data integrity.
- Build reliable test data management and test isolation.
- Integrate automated quality checks into CI/CD.
- Design and analyze performance tests.
- Document technical decisions and engineering trade-offs.

---

## 2. Technology Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js 24 |
| Language | JavaScript |
| Backend | Express.js 5 |
| Database | PostgreSQL 17 |
| Package Manager | pnpm |
| API Automation | Playwright |
| Unit Testing | Node.js Test Runner (`node:test`) |
| Assertions | `node:assert/strict` |
| Password Security | bcrypt |
| Database Migrations | node-pg-migrate |
| Static Analysis | ESLint 10 |
| Containers | Docker |
| CI | GitHub Actions |

---

## 3. Current Application Features

The backend currently implements the following functionality:

### User Management

- Retrieve the list of registered users.
- Create new users through the API.
- Validate required fields and input formats.
- Enforce name length constraints (2–120 characters).
- Enforce a minimum password length of 8 characters.
- Reject empty and whitespace-only passwords.
- Normalize email addresses by trimming whitespace and converting them to lowercase.
- Prevent duplicate email addresses.
- Hash passwords using bcrypt before persistence.
- Exclude passwords and password hashes from API responses.

### Health Checks

| Endpoint | Description |
|---|---|
| `GET /health` | Checks whether the API server is responding. |
| `GET /api/health/db` | Checks connectivity to PostgreSQL. |

### API Endpoints

| Method | Endpoint | Expected behavior |
|---|---|---|
| GET | `/api/users` | Retrieve users |
| POST | `/api/users` | Create a user |

---

## 4. Architecture

The backend follows a layered architecture to separate HTTP handling, business rules, and data persistence.

```text
Client
  |
  v
Express Routes
  |
  v
Controllers
  |
  v
Services
  |
  v
Repositories
  |
  v
PostgreSQL
```

### Architectural responsibilities

**Routes**

Define HTTP endpoints and connect requests to their respective controllers.

**Controllers**

Handle HTTP requests and responses, delegating business operations to services.

**Services**

Contain business rules, including user creation, email normalization, duplicate detection, and password hashing.

**Repositories**

Encapsulate database queries and persistence operations.

**Utils**

Contain reusable functions such as input validation and password operations.

### Architectural principles

- Separation of concerns.
- Reusable business logic.
- Parameterized database queries.
- Explicit input validation.
- Centralized database configuration.
- Maintainable application and testing boundaries.

---

## 5. Repository Structure

```text
portfolio-app/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── apps/
│   └── backend/
│       ├── migrations/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── repositories/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── app.js
│       │   └── server.js
│       │
│       ├── tests/
│       │   └── unit/
│       │
│       ├── eslint.config.js
│       ├── package.json
│       └── .env.example
│
├── tests/
│   └── api/
│       ├── fixtures/
│       ├── helpers/
│       ├── specs/
│       │   └── users/
│       ├── playwright.config.js
│       └── package.json
│
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## 6. Testing Strategy

The project adopts a layered testing approach, selecting the appropriate test level according to the behavior and risks being validated.

### Unit Tests

**Framework:** Node.js Test Runner (`node:test`)

Unit tests validate individual functions and business rules without requiring an HTTP server or database connection.

Current coverage includes:

- User input validation.
- Required fields.
- Name length boundaries.
- Email format validation.
- Password requirements.
- Whitespace handling.
- Multiple validation errors.

### API Tests

**Framework:** Playwright

API tests validate the application through HTTP requests, exercising the backend and its interaction with PostgreSQL.

Current testing scenarios include:

- Successful user creation.
- User listing.
- Input validation.
- Duplicate email detection.
- Email normalization.
- Boundary value analysis.
- Password validation.
- API response validation.
- Database-backed user creation and cleanup.

### Test Data Management

Reusable Playwright fixtures and helper functions are used to manage test data.

The current approach includes:

- Creating test users through the API.
- Generating unique email addresses.
- Providing reusable test fixtures.
- Removing created users during teardown.
- Using direct database access for test data cleanup.

The objective is to keep test execution isolated and repeatable, reducing dependencies between test scenarios.

---

## 7. Continuous Integration

**CI Platform:** GitHub Actions

The project includes an automated CI workflow that runs on pushes and pull requests targeting the `main` branch.

### Current CI workflow

```text
Push / Pull Request
        |
        v
Install Dependencies
        |
        v
ESLint
        |
        v
Unit Tests
        |
        v
Start PostgreSQL
        |
        v
Apply Database Migrations
        |
        v
Start Backend API
        |
        v
API and Database Health Checks
        |
        v
API Tests
        |
        v
CI Result
```

### Quality Gates

The CI workflow currently validates:

- ESLint execution.
- Unit test execution.
- PostgreSQL availability.
- Database migration execution.
- Backend startup and health checks.
- API automated test execution.

The `main` branch is protected by requiring the CI status check to pass before merging pull requests.

The pipeline uses a temporary PostgreSQL service, making database-backed tests independent of the developer's local database.

---

## 8. Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js 24
- pnpm 11
- Docker
- Git

### 1. Clone the repository

```bash
git clone https://github.com/joaovf0/portfolio-app.git

cd portfolio-app
```

### 2. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 3. Configure environment variables

Create the local environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

The example configuration uses:

```env
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=portfolio_db
POSTGRES_USER=portfolio_user
POSTGRES_PASSWORD=change_me

DATABASE_URL=postgres://portfolio_user:change_me@localhost:5432/portfolio_db
```

Adjust the values if necessary to match your local PostgreSQL configuration.

**Do not commit `.env` files or real credentials to the repository.**

### 4. Start PostgreSQL using Docker

For a fresh local environment, create a PostgreSQL 17 container:

```bash
docker run --name portfolio-postgres \
  -e POSTGRES_DB=portfolio_db \
  -e POSTGRES_USER=portfolio_user \
  -e POSTGRES_PASSWORD=change_me \
  -p 5432:5432 \
  -d postgres:17
```

If the container already exists and is stopped:

```bash
docker start portfolio-postgres
```

### 5. Apply database migrations

```bash
pnpm --filter backend migrate:up
```

This creates the required database schema.

### 6. Start the backend

```bash
pnpm --filter backend dev
```

The API will be available at:

```text
http://localhost:3001
```

Health checks:

```text
http://localhost:3001/health

http://localhost:3001/api/health/db
```

---

## 9. Running Tests

Run the following commands from the repository root.

### Lint

```bash
pnpm lint
```

### Unit Tests

```bash
pnpm test:unit
```

### API Tests

Make sure PostgreSQL is running, migrations have been applied, and the backend API is available.

Then execute:

```bash
pnpm test:api
```

### Complete Current Quality Checks

For the current implementation, run:

```bash
pnpm lint

pnpm test:unit

pnpm test:api
```

---

## 10. Roadmap

The project is continuously evolving.

The following items represent planned development, not necessarily implemented functionality.

| Area | Planned improvements |
|---|---|
| Backend | Authentication and authorization |
| Business Logic | Products, shopping cart, and orders |
| Unit Testing | Expanded isolated testing of services and business rules |
| API Testing | Advanced integration, edge cases, and concurrency scenarios |
| E2E Testing | Complete user journeys using Playwright |
| Performance Testing | Load and performance testing using k6 |
| CI/CD | Expanded test pipeline and deployment automation |
| Observability | Test execution diagnostics and application monitoring |
| Documentation | Architecture Decision Records and detailed test strategy |

---

## 11. Engineering Principles

This project is built around the following principles:

- Quality is part of the development lifecycle.
- Test coverage should be driven by risk and business requirements.
- Automation should be maintainable, reusable, and reliable.
- Test data should be isolated and controlled.
- Failures should be reproducible and diagnosable.
- CI should provide fast and actionable feedback.
- Technical decisions should be documented and justified.

---

## Repository

**GitHub:** https://github.com/joaovf0/portfolio-app


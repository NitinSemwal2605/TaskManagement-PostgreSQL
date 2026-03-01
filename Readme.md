# 🚀 Task Management API (PostgreSQL + Sequelize)

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-3949AB?logo=sequelize)](https://sequelize.org/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-010101?logo=socket.io)](https://socket.io/)

A premium, enterprise-grade Task Management REST API. Built with a focus on **Security, Scalability, and Developer Experience.**

---

## ✨ Key Features

-   **🔒 Secure Authentication**: JWT-based access tokens with secure Refresh Token rotation.
-   **📂 Project & Task CRUD**: Full management of projects and hierarchical tasks.
-   **💬 Real-Time Collaboration**: Integrated **Socket.IO** for instant project updates and messaging.
-   **⚡ High Performance**: Caching layer implemented using **Redis** to reduce DB load.
-   **🛑 Robust Security**:
    -   **Rate Limiting**: Integrated Redis-based rate limiter to prevent API abuse.
    -   **Input Validation**: Strict schema validation using **Joi**.
-   **🛠️ Developer Experience**:
    -   **Convention over Configuration**: Standardized camelCase naming and modular structure.
    -   **Idempotent Migrations**: Sequelize CLI migrations with built-in safety checks.
    -   **Code Quality**: Integrated **ESLint, Prettier, Husky**, and **Commitlint**.

---

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js (v5+)
-   **Database**: PostgreSQL
-   **ORM**: Sequelize
-   **Caching**: Redis
-   **Real-time**: Socket.IO
-   **Security**: Bcrypt, JWT, Joi
-   **Tooling**: Sequelize-CLI, Nodemon, ESLint, Prettier

---

## 📂 Project Architecture

```text
TaskManagement.PostgreSQL/
├── config/                     # Sequelize CLI Database configuration
├── migrations/                 # Idempotent DB migrations
├── seeders/                    # Initial database seed scripts
├── src/
│   ├── config/                 # Redis & Sequelize instance setup
│   ├── controllers/            # Business logic handlers
│   ├── middlewares/            # Auth, RateLimiting, Validation handlers
│   ├── models/                 # Sequelize definitions & Associations
│   ├── routes/                 # Express route definitions
│   ├── sockets/                # Socket.IO logic & Event handlers
│   ├── utils/                  # Shared helper functions
│   ├── validators/             # Joi validation schemas
│   ├── App.js                  # Main app setup
│   └── Server.js               # Entry point & dependency injection
├── .env                        # Environment configuration
└── .sequelizerc                # CLI Configuration
```

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18+)
-   **PostgreSQL**
-   **Redis**

### 1. Installation

```bash
git clone <your-repo-link>
cd TaskManagement.PostgreSQL
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=task_management_sql
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=your_long_secure_string
REFRESH_TOKEN_SECRET=your_another_secure_string
```

### 3. Database Migration

Sync your DB schema using the built-in idempotent migrations:

```bash
npx sequelize-cli db:migrate
```

### 4. Running the App

```bash
# Development mode
npm run start

# Production mode
node src/Server.js
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint              | Description                      |
| :----- | :-------------------- | :------------------------------- |
| `POST` | `/auth/register`      | Create a new user account        |
| `POST` | `/auth/login`         | Authenticate and receive tokens  |
| `POST` | `/auth/refresh-token` | Renew an expired access token    |

### 📁 Projects

| Method   | Endpoint                | Description                       |
| :------- | :---------------------- | :-------------------------------- |
| `POST`   | `/projects/add`         | Create a new project              |
| `GET`    | `/projects/list`        | List all projects (with Caching)  |
| `GET`    | `/projects/list/:id`    | Get specific project details      |
| `DELETE` | `/projects/delete/:id`  | Remove a project                  |

### ✔️ Tasks

| Method   | Endpoint                    | Description                       |
| :------- | :-------------------------- | :-------------------------------- |
| `POST`   | `/tasks/addTask/:projectId` | Assign a task to a project        |
| `PUT`    | `/tasks/updateTask/:id`     | Modify task details               |
| `PATCH`  | `/tasks/updateStatus/:id`   | Update progress (Pending/Done)    |
| `DELETE` | `/tasks/deleteTask/:id`     | Remove a task                     |

---

## 🧪 Development Workflow

To maintain high code standards, we use:

-   **Commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
-   **Git Hooks**: Managed by **Husky**; runs linting before every commit.
-   **Styling**: Use `npm run lint:fix` to automatically format code.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

Created with ❤️ by **Nitin Semwal**

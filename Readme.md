
# TaskManagement.PostgreSQL

A task management REST API built with Node.js, Express, Sequelize ORM, and PostgreSQL.
This project supports user authentication, project management, and task tracking with secure token-based login and refresh tokens.

---

## Features

* User registration and login with JWT access and refresh tokens
* CRUD operations for Projects and Tasks
* Authorization checks ensuring users can only manage their own projects and tasks
* Input validation using Joi
* Pagination support for listing projects
* Soft deletes (is_deleted flag) and hard deletes for tasks and projects
* Structured and modular codebase for easy maintenance and scalability

---

## Tech Stack

* **Node.js**
* **Express.js**
* **Sequelize ORM**
* **PostgreSQL**
* **bcrypt** for password hashing
* **jsonwebtoken** for JWT-based authentication
* **Joi** for input validation

---

## Folder Structure

```
TaskManagement.PostgreSQL/
│
├── config/
│   └── config.json              # Sequelize CLI config
├── migrations/
│   └── xyz.cjs              # Automatically Created Files
├── seeders/                 # Seed scripts for initial data
├── models/                  # Automatically Generated
    └── index.js
├── node_modules/
├── src/
│   ├── config/
│   │   └── sequelize.js         # Sequelize instance setup
│   ├── models/                  # Sequelize models and initialization
│   ├── routes/                  # Express routes grouped by resource
│   ├── middlewares/             # Authentication, validation, error handlers
│   ├── validators/              # Joi validation schemas
│   ├── utils/                   # Utility helper functions (token, hashing)
│   ├── App.js                   # Express app setup
│   └── Server.js                # Server entry point
│
├── .env                        # Environment variables
├── package.json
├── README.md
└── PgadminScript.sql            # DB setup scripts
```

---

## Setup & Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd TaskManagement.PostgreSQL
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file at project root with content like:

```env
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=5000
```

4. **Setup database**

* Ensure PostgreSQL is installed and running.
* Run migrations and seeders if using Sequelize CLI:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

* Or manually run the `PgadminScript.sql` if provided.

5. **Start the server**

```bash
npm run start
```

The server runs at `http://localhost:5000` (or the port you configured).

---

## API Endpoints

### Auth

* `POST /auth/register` - Register new user
* `POST /auth/login` - Login user and get access & refresh tokens
* `POST /auth/refresh-token` - Refresh access token

### Projects

* `POST /projects/add` - Add new project
* `POST /projects/add-multiple` - Add multiple projects
* `GET /projects/list` - List projects with pagination
* `GET /projects/list/:id` - Get project by ID
* `PATCH /projects/update/:id` - Update project
* `DELETE /projects/delete/:id` - Delete project

### Tasks

* `POST /tasks/addTask/:projectId` - Add task to a project
* `GET /tasks/list/:projectId` - List tasks by project
* `PUT /tasks/updateTask/:id` - Update task details
* `PATCH /tasks/updateStatus/:id` - Update task status
* `DELETE /tasks/deleteTask/:id` - Delete task

---

## Notes

* Authentication middleware protects all routes except registration and login.
* Passwords are securely hashed with bcrypt.
* Refresh tokens are hashed before storing in the database for security.
* All date fields are stored in UTC.

---

## Contribution

Feel free to fork, raise issues, or submit pull requests.
Please ensure consistent code style and include tests for new features.

---

## License

This project is licensed under the MIT License.

---

If you want, I can generate a detailed API documentation or Postman collection next!

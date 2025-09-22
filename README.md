# Expense Tracker with AI/ML Insights

[![Java CI with Maven](https://github.com/21Aditya08/expense-tracker-ai/actions/workflows/maven.yml/badge.svg?branch=main)](https://github.com/21Aditya08/expense-tracker-ai/actions/workflows/maven.yml)

A comprehensive full-stack expense tracking application with AI-powered insights and analytics. This Spring Boot backend provides robust APIs for expense management, user authentication, and data analytics.

## 🚀 Features

### Core Features
- **User Management**: Secure user registration and authentication with JWT
- **Expense Tracking**: Create, read, update, and delete expenses
- **Category Management**: Organize expenses with custom categories
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Data Persistence**: MySQL database integration with JPA/Hibernate

### Future AI/ML Features
- Expense pattern analysis and insights
- Spending predictions and recommendations
- Automated expense categorization
- Budget optimization suggestions
- Financial health scoring

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.1.5
- **Language**: Java 17
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven
- **Additional Libraries**: Lombok, Bean Validation

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **UI**: Tailwind CSS
- **Routing**: React Router
- **HTTP**: Axios

## 📁 Project Structure

```
expense-tracker-ai/
├── src/
│   ├── main/
│   │   ├── java/com/expensetracker/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── repository/      # Data repositories
│   │   │   ├── security/        # Security configurations
│   │   │   ├── service/         # Business logic
│   │   │   └── ExpenseTrackerAiApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## 🏗️ Database Schema

### Core Entities

1. **User**: User account information and authentication
2. **Category**: Expense categories for organization
3. **Expense**: Individual expense/income records

### Entity Relationships
- User → Categories (One to Many)
- User → Expenses (One to Many)
- Category → Expenses (One to Many)

## 🚦 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Git

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE expense_tracker_db;
```

2. Update `application.properties` with your database credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Installation & Running

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker-ai
```

2. Set environment variables (optional):
```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export JWT_SECRET=your_secret_key
```

3. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## �️ Frontend (React + Vite)

The repository includes a React frontend in the `frontend/` directory.

### Prerequisites
- Node.js 18+ and npm

### Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment (optional): create `frontend/.env` with:
```bash
VITE_API_BASE_URL=http://localhost:8080
```
If not set, the app defaults to `http://localhost:8080`.

3. Run the dev server:
```bash
npm run dev
```

Open the app at the URL printed by Vite (default `http://localhost:5173`).

### Pages
- Login (`/login`) — authenticates via `POST /auth/login` and saves JWT to `localStorage`
- Signup (`/signup`) — registers via `POST /auth/signup`
- Dashboard (`/dashboard`) — protected route that calls `GET /users/me`
	- Expenses: list with date/category filters, create/edit/delete
	- Categories: list, create/edit/delete (type = EXPENSE)

The JWT is stored in `localStorage` under the key `token`. Axios automatically includes it as `Authorization: Bearer <token>` for API calls.

### CORS
Ensure the backend CORS configuration allows the frontend origin (e.g., `http://localhost:5173`). If you encounter 403/CORS errors, update the CORS settings in your Spring Security configuration to include the Vite dev server origin.

## 📸 Screenshots (placeholders)

> Replace these with actual screenshots after running the frontend.

1. Login Page — ![Login Screenshot](docs/screenshots/login.png)
2. Signup Page — ![Signup Screenshot](docs/screenshots/signup.png)
3. Dashboard (Expenses) — ![Dashboard Expenses](docs/screenshots/dashboard-expenses.png)
4. Dashboard (Categories) — ![Dashboard Categories](docs/screenshots/dashboard-categories.png)

## 🧭 Usage Steps (UI)

1. Open the frontend at `http://localhost:5173`
2. Sign up a user, then log in
3. On Dashboard:
	- Create a few categories (type EXPENSE)
	- Add expenses using the form (select a category)
	- Use filters to narrow by date range and category
	- Edit or delete items via the actions

## �🔐 Authentication Module

This backend includes JWT-based authentication with BCrypt password hashing.

### Endpoints

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive a JWT access token

### Signup Request

```json
{
	"username": "jdoe",
	"email": "jdoe@example.com",
	"password": "StrongPass123",
	"name": "John Doe",
	"firstName": "John",
	"lastName": "Doe",
	"phoneNumber": "+1-555-0100"
}
```

### Login Request

```json
{
	"usernameOrEmail": "jdoe",
	"password": "StrongPass123"
}
```

### Login Response

```json
{
	"accessToken": "<JWT_TOKEN>",
	"tokenType": "Bearer",
	"user": {
		"id": 1,
		"username": "jdoe",
		"email": "jdoe@example.com",
		"name": "John Doe",
		"firstName": "John",
		"lastName": "Doe",
		"phoneNumber": "+1-555-0100",
		"role": "USER",
		"isActive": true
	}
}
```

### Authorization

- Include the token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <JWT_TOKEN>
```

All endpoints other than `/auth/**` require authentication by default.

## 👤 User Endpoint

- `GET /users/me` — Returns the currently authenticated user's profile. Requires a valid `Authorization: Bearer <JWT>` header.

## 🗂️ Category APIs

- `GET /categories` — List categories for current user (supports: `type`, `page`, `size`, `sort`)
- `POST /categories` — Create a category
- `PUT /categories/{id}` — Update a category
- `DELETE /categories/{id}` — Soft-delete a category

Example create request:

```json
{
	"name": "Food",
	"description": "Meals and dining",
	"iconName": "utensils",
	"colorCode": "#FF9900",
	"type": "EXPENSE"
}
```

## 💸 Expense APIs

- `GET /expenses` — List expenses for current user (supports: `startDate`, `endDate`, `categoryId`, `type`, `minAmount`, `maxAmount`, `page`, `size`, `sort`)
- `POST /expenses` — Create an expense
- `PUT /expenses/{id}` — Update an expense
- `DELETE /expenses/{id}` — Delete an expense

Example create request:

```json
{
	"title": "Lunch",
	"description": "Burger and fries",
	"amount": 12.50,
	"expenseDate": "2025-09-22",
	"type": "EXPENSE",
	"paymentMethod": "CASH",
	"categoryId": 1
}
```

All Category and Expense endpoints require `Authorization: Bearer <JWT>` and only operate on the authenticated user's data.

### Docker Setup (Coming Soon)
Docker configurations will be added for easy deployment.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Core Endpoints (Coming Soon)
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create new category

## 🔧 Configuration

### Environment Variables
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret

### Application Properties
Key configurations can be found in `src/main/resources/application.properties`

## 🧪 Testing

This project’s integration tests are designed to run anywhere:

- Default: Uses an in-memory H2 database (no Docker required)
- Optional: Use Testcontainers with a real MySQL if you enable it

### Quick start (H2, no Docker)

Run the test suite:

```bash
mvn test
```

or on Windows PowerShell:

```powershell
mvn test
```

The tests automatically configure an H2 in-memory database in MySQL compatibility mode and set all required properties (including a strong JWT secret) via DynamicPropertySource.

### Use Testcontainers (MySQL)

If you have Docker available and want to test against a real MySQL via Testcontainers, enable it explicitly:

Linux/macOS (bash):

```bash
export USE_TESTCONTAINERS=true
mvn test
```

Windows PowerShell:

```powershell
$env:USE_TESTCONTAINERS = "true"
mvn test
```

Alternatively, pass a system property:

```bash
mvn -DuseTestcontainers=true test
```

Notes:
- When enabled, tests will start a MySQL 8 container and wire datasource properties dynamically.
- When disabled (default), tests use H2 with `ddl-auto=create-drop` so each run starts fresh.
- CI runs with the default H2 mode for speed and portability.

## 🔒 Security

- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Role-based access control

## 🚀 Deployment

### Production Considerations
1. Set strong JWT secret
2. Configure production database
3. Enable HTTPS
4. Set up monitoring and logging
5. Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Support

For support, email support@expensetracker.com or create an issue in this repository.

## 🗺️ Roadmap

- [ ] Complete basic CRUD operations
- [ ] Add expense analytics endpoints
- [ ] Implement AI/ML insights
- [x] Add frontend React application
- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Budget management tools
- [ ] Expense sharing capabilities

---

**Note**: This is an active development project. Features and documentation are continuously being updated.
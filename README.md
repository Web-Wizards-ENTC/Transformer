# Transformer Management System

This project is a full-stack application for managing transformers and inspections. It consists of a Spring Boot backend and a React frontend.

## Project Structure

- `Backend/` - Spring Boot REST API for transformer and inspection management
- `Frontend/` - React app for user interface

---

## Getting Started

### Backend (Spring Boot)

1. **Install Java (JDK 17+) and Maven**
2. Open a terminal and navigate to the `Backend` directory:
	```sh
	cd Backend
	```
3. Run the backend server:
	```sh
	mvn spring-boot:run
	```
4. The backend will start on [http://localhost:8080](http://localhost:8080)

### Frontend (React)

1. Open a terminal and navigate to the `Frontend` directory:
	```sh
	cd Frontend
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Start the frontend development server:
	```sh
	npm start
	```
4. The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Usage

- Add, view, and filter transformers and inspections
- Data is stored in a PostgreSQL database (see `Backend/src/main/resources/application.properties` for DB config)
- Frontend communicates with backend via REST API endpoints

---

## Troubleshooting

- Ensure Java and Maven are installed and added to your PATH
- If you encounter port conflicts, change the port in `application.properties` or `package.json` as needed

---

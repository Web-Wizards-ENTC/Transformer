# Backend

This folder contains the Spring Boot backend for the Transformer Management System.

## Prerequisites

### Software
- Java JDK 17 or newer
- Maven
- PostgreSQL

### VS Code Extensions
- Extension Pack for Java
- Spring Boot Extension Pack
- Maven for Java
- Spring Boot Tools

You can find and install these extensions from the VS Code Extensions Marketplace.

## Setup & Run

1. Open this folder in VS Code.
2. Install the required extensions listed above.
3. Ensure Java and Maven are installed and added to your PATH.
4. Configure your database in `src/main/resources/application.properties`.
5. Open a terminal and run:
	 ```sh
	 mvn spring-boot:run
	 ```
6. The backend will start on [http://localhost:8080](http://localhost:8080)

## Useful Commands

- Build the project:
	```sh
	mvn clean install
	```
- Run tests:
	```sh
	mvn test
	```

## Troubleshooting

- Make sure all required extensions are installed in VS Code
- Ensure your database is running and credentials are correct
- If you encounter port conflicts, change the port in `application.properties`

---

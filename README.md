# API to MCP

This project serves as an API layer to interact with the MCP (Model Context Protocol) system. It provides a set of endpoints to manage various entities such as attachments, customers, invoices, and work orders.

## Project Structure

- `src/`: Contains the main application logic, including API routes, database schema, and utility functions.
- `drizzle/`: Drizzle ORM migrations and schema snapshots.
- `seed/`: SQL seed files for initial database population.
- `src/auth/`: Authentication related logic.
- `src/db/`: Database connection and schema definitions.
- `src/modules/`: Business logic for different entities (e.g., attachment, customer).
- `src/routers/`: API route definitions for different modules.
- `src/utils/`: Utility functions and type definitions.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- PostgreSQL database

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd api-to-mcp
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory based on `.env.example` (if available) and fill in the necessary database connection details and other configurations.

    Example `.env` content:

    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    PORT=3000
    ```

### Database Setup

1.  **Run Drizzle migrations:**

    ```bash
    pnpm drizzle-kit migrate
    ```

2.  **Seed the database (optional):**
    ```bash
    pnpm ts-node seed.ts
    ```

### Running the Application

```bash
pnpm start
```

The API will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Swagger UI documentation is available at `/swagger` endpoint when the application is running.

## Scripts

- `pnpm start`: Starts the application.
- `pnpm dev`: Starts the application in development mode with hot-reloading.
- `pnpm build`: Builds the application for production.
- `pnpm drizzle-kit migrate`: Runs Drizzle migrations.
- `pnpm drizzle-kit generate`: Generates new Drizzle migration files.
- `pnpm drizzle-kit push`: Pushes the schema to the database without migrations.
- `pnpm ts-node seed.ts`: Seeds the database.

## Technologies Used

- Node.js
- Express.js
- Drizzle ORM
- PostgreSQL
- TypeScript
- Swagger/OpenAPI

## Contributing

Contributions are welcome! Please follow the standard GitHub flow:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.

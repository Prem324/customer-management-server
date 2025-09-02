# Customer Management App - Server

This is the backend server for the Customer Management System. It provides RESTful API endpoints for managing customer information and their addresses.

## Features

- **Customer Management**: Create, retrieve, update, and delete customer records
- **Address Management**: Manage multiple addresses for each customer
- **Search & Filter**: Find customers by name, phone number, or city
- **Pagination**: Paginated API responses for better performance
- **Error Handling**: Comprehensive error handling and validation

## Project Structure

```
server/
├── database.js        # Database connection and initialization
├── database.db        # SQLite database file
├── index.js           # Main application entry point
├── routes/            # API route handlers
│   ├── customers.js   # Customer-related endpoints
│   └── addresses.js   # Address-related endpoints
└── package.json       # Project dependencies and scripts
```

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **SQLite3**: Lightweight database
- **CORS**: Cross-Origin Resource Sharing middleware

## API Endpoints

### Customers

- `GET /api/customers` - Get all customers (with pagination, search, filtering)
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Addresses

- `GET /api/customers/:id/addresses` - Get all addresses for a customer
- `GET /api/addresses/:id` - Get a specific address
- `POST /api/customers/:id/addresses` - Add a new address for a customer
- `PUT /api/addresses/:id` - Update an address
- `DELETE /api/addresses/:id` - Delete an address

## Database Schema

### Customers Table

- `id`: INTEGER (Primary Key)
- `first_name`: TEXT
- `last_name`: TEXT
- `phone_number`: TEXT (Unique)
- `created_at`: DATETIME

### Addresses Table

- `id`: INTEGER (Primary Key)
- `customer_id`: INTEGER (Foreign Key)
- `address_details`: TEXT
- `city`: TEXT
- `state`: TEXT
- `pin_code`: TEXT
- `created_at`: DATETIME

## Available Scripts

- `npm start`: Start the server
- `npm run dev`: Start the server in development mode

## Getting Started

1. Ensure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. The server will be available at http://localhost:5000
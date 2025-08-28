# Project Name

This project is a web application with admin and cashier roles.

## Database Schema

Here is the SQL schema for the project. You can execute this on your PostgreSQL database.

```sql
-- Create the admins table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the cashiers table
CREATE TABLE cashiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Default Admin Login

- **Email:** admin@example.com
- **Password:** adminpassword
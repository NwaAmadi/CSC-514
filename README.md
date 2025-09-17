# CSC-514 Project

**Group Members:**
UKEGBU, Chibuisi Gospel
Ogali, Victor Onucheojo
Ogunewe, Freedom Dimkpa

This document provides instructions on how to set up and run this project on a new system.

## Architecture

This project is a monorepo containing two main components:

-   **Frontend (`apps` directory):** A Next.js application that serves as the user interface.
-   **Backend (`server` directory):** An Express.js application that provides the API for the frontend.

The project uses [Supabase](https://supabase.com/) for its backend services, including the database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [pnpm](https://pnpm.io/installation) (v10.11.0 or later)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/NwaAmadi/CSC-514
    cd CSC-514
    ```

2.  **Install dependencies:**

    Install all the project dependencies from the root directory using `pnpm`:

    ```bash
    pnpm install
    ```

3.  **Set up Supabase:**

    -   Create a new project on [Supabase](https://supabase.com/).
    -   In your Supabase project, navigate to **Project Settings > API**.

4.  **Configure environment variables:**

    You will need to create two environment files: one for the frontend and one for the backend.

    -   **Frontend (`apps/.env.local`):**

        Create a file named `.env.local` in the `apps` directory and add the following, replacing the placeholder values with your Supabase API credentials:

        ```
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```

    -   **Backend (`server/.env`):**

        Create a file named `.env` in the `server` directory and add the following, replacing the placeholder values with your Supabase API credentials:

        ```
        SUPABASE_URL=your-supabase-project-url
        SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
        ```

## Running the Development Servers

To run both the frontend and backend development servers concurrently, use the following command from the root of the project:

```bash
pnpm dev
```

This will start:

-   The Next.js frontend on `http://localhost:3000`
-   The Express.js backend on a specified port (check the server's console output, it is usually on `http://localhost:3001` or a similar port).

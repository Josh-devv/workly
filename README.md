# Workly

Workly is a lightweight CRM for managing clients, projects, tasks, invoices, and team collaboration in one workspace.

## Stack

- Next.js and React
- TypeScript
- Tailwind CSS
- Supabase authentication and database

## Features

- Organization workspaces with owner and member roles
- Client and project management
- Task assignment, status tracking, editing, and deletion
- Invitation links with email verification and expiration
- Responsive dashboard with mobile navigation

## Environment

Set `WORKLY_API_URL` to the C# API base URL (without an `/api` suffix). The
included `.env.example` points to the deployed API; copy that value into
`.env.local` for local frontend development, or use your local API URL when
running the API locally. Configure the same variable in the frontend's
deployment environment.

`WORKLY_API_URL` is server-side configuration and must not be renamed to a
`NEXT_PUBLIC_` variable. Client requests to the API are made by the Next.js
server with the signed-in user's Supabase access token. Continue to configure
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as required by
the Supabase authentication setup.

# Chat Application

## Overview
A modern web-based group chat application built with **Next.js**, **Supabase**, **TailwindCSS**, and **TypeScript**.  
Supports OTP-based login, group management, real-time messaging, file attachments, and notes per group.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)

---

## Features
- Login & Autentikasi OTP via API Next.js (`/api/otp/send` & `/api/otp/verify`) 
- Profile management: update name, email, avatar
- Dashboard with sidebar navigation
- Group creation, deletion, and management
- Real-time chat messaging with attachments
- Reply to messages and view message threads
- Notes management per group
- File upload preview and handling

---

## Tech Stack
- **Frontend**: Next.js 15.5.3, React 19.1, TypeScript, TailwindCSS 4.1
- **Backend / Realtime / Storage**: Supabase (Auth, Realtime, Storage, PostgreSQL)
- **Icons**: Lucide-react, React-icons
- **Utilities**: bcrypt for password hashing (optional for additional backend logic)
- **Linting**: ESLint with Next.js config

---

## Installation

1. Clone the repository:
```bash
- git clone <your-repo-url>
- cd chat

2. Install dependencies:
- npm install

3. Set up environment variables (.env.local):
- NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
- NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

4. Run the development server:
- npm run dev

## Usage

- Access the app at http://localhost:3000
- Login using OTP
- Complete profile if first login
- Navigate groups via sidebar
- Chat, reply, upload attachments, and manage notes in real-time

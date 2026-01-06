# Neuralinker

Neuralinker is a collaborative project-based platform that connects users through shared projects, smart join requests, and AI-assisted decision-making. The platform focuses on building meaningful teams, not random connections.

## 🌐 Live Website

[🚀 Visit Neuralinker](https://neuralinker-sadl.vercel.app)

---

## 🚀 Overview

Neuralinker allows users to:
- Create projects
- Request to join projects
- Accept or reject join requests
- Collaborate with approved members
- Chat inside projects
- Receive real-time notifications
- Use AI-powered insights to support better team formation

Every user can be both:
- Project Owner
- Project Member

---

## ✨ Core Features

### Projects
- Create, edit, and delete owned projects
- Explore public projects
- View project details
- Track project members

### Join Requests
- Users can request to join projects
- Project owners receive notifications
- Owners can accept or reject requests
- Request status is stored in the database
- Users receive notifications after decision

### Project Chat
- Chat available for accepted members only
- Messages stored in the database
- Notifications sent on new messages

### AI-Powered Assistance
- Smart Join Insights based on skills and project needs
- Helps project owners make better decisions
- Improves team compatibility

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **Prisma ORM** with **PostgreSQL**
- **JWT Authentication**

### Frontend
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS** (if applicable)
- **Axios** for API requests

---

<<<<<<< HEAD
## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** (running locally or a cloud instance)

### Installation

#### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/neuralinker?schema=public"
JWT_SECRET="your_secure_jwt_secret"
PORT=4000
```

Run Prisma migrations to set up the database:

```bash
npx prisma migrate dev --name init
```

Start the backend server:

```bash
npm run dev
```
The server will start on `http://localhost:4000`.

#### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional if backend is on port 4000):

```env
VITE_API_URL="http://localhost:4000/api"
```

Start the frontend development server:

```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

=======
## 📂 Project Structure

>>>>>>> 336bfdc6a4ae7373d6cc73a751b6a65ffb3be2e7
```
neuralinker/
├── backend/            # Express.js API & Database
│   ├── prisma/         # Database schema & migrations
│   ├── src/            # Source code (Controllers, Routes, Models)
├── frontend/           # React Client
│   ├── src/            # Source code (Components, Pages, API)
│   ├── public/         # Static assets
├── docs/               # Documentation files
└── README.md           # Project documentation
```

---

## 📄 License

This project is developed for educational and demonstration purposes.

# Backend Functions Documentation

## Auth Service (`auth.service.ts`)

| Function | Params | Return | Description |
|----------|--------|--------|-------------|
| `register(data: Prisma.UserCreateInput)` | `name, email, password` | `User` | Creates a new user and hashes the password |
| `login(email: string, password: string)` | `email, password` | `{ token: string; user: User }` | Authenticates user and returns JWT token |

---

## Project Service (`projects.service.ts`)

| Function | Params | Return | Description |
|----------|--------|--------|-------------|
| `createProject(ownerId: string, data: Prisma.ProjectCreateInput)` | `ownerId, project data` | `Project` | Creates a new project and adds owner as admin member |
| `getProjects(limit?: number, offset?: number)` | `limit, offset` | `Project[]` | Fetches projects with pagination |
| `getProjectById(id: string)` | `id` | `Project | null` | Fetch project by ID including members and owner info |
| `updateProject(projectId: string, userId: string, data: Prisma.ProjectUpdateInput)` | `projectId, userId, data` | `Project` | Updates project if user is owner |
| `deleteProject(projectId: string, userId: string)` | `projectId, userId` | `Project` | Deletes project if user is owner |

---

## Join Requests Service (`joinRequests.service.ts`)

| Function | Params | Return | Description |
|----------|--------|--------|-------------|
| `createRequest(userId: string, projectId: string)` | `userId, projectId` | `JoinRequest` | Creates a new join request if user is not already a member or requested |
| `getProjectRequests(projectId: string)` | `projectId` | `JoinRequest[]` | Fetch all join requests for a project including user info and AI insight |
| `updateStatus(requestId: string, status: 'accepted' | 'rejected')` | `requestId, status` | `JoinRequest` | Accepts or rejects a join request, adds user as member if accepted, sends notification |

---

## Notifications Service (`notifications.service.ts`)

| Function | Params | Return | Description |
|----------|--------|--------|-------------|
| `createNotification({ userId, title, message })` | `userId, title, message` | `Notification` | Creates a new notification for a user |
| `getUserNotifications(userId: string)` | `userId` | `Notification[]` | Fetch all notifications for a specific user |

---

## Controllers (`projects.controller.ts`)

| Function | Route | HTTP Method | Description |
|----------|-------|------------|-------------|
| `create` | `/api/projects` | POST | Calls `createProject` to create project |
| `list` | `/api/projects` | GET | Calls `getProjects` to fetch all projects |
| `get` | `/api/projects/:id` | GET | Fetch single project by ID |
| `update` | `/api/projects/:id` | PUT | Update project if current user is owner |
| `remove` | `/api/projects/:id` | DELETE | Delete project if current user is owner |

---

## Controllers (`joinRequests.controller.ts`)

| Function | Route | HTTP Method | Description |
|----------|-------|------------|-------------|
| `create` | `/api/join-requests` | POST | Calls `createRequest` to create join request |
| `listProjectRequests` | `/api/projects/:projectId/join-requests` | GET | Lists all join requests for a project (owner only) |
| `respond` | `/api/join-requests/:id/respond` | PATCH | Accepts or rejects join request (owner only) |

---

## Controllers (`notifications.controller.ts`)

| Function | Route | HTTP Method | Description |
|----------|-------|------------|-------------|
| `listUserNotifications` | `/api/notifications` | GET | Fetch all notifications for the logged-in user |

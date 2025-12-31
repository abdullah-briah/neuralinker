👤 User
Represents all platform users (students – developers – idea owners)

User

id (PK)
name
email
password
avatarUrl
bio
skills        (string / JSON)
role          (user | admin)
createdAt


📦 Project
Represents technical projects

Project

id (PK)
title
description
category        (Web | AI | Data | etc.)
ownerId (FK → User.id)
createdAt


📨 JoinRequest
Represents a request to join a project

JoinRequest

id (PK)
userId    (FK → User.id)
projectId (FK → Project.id)
status    (pending | accepted | rejected)
createdAt


🤝 ProjectMember
Represents project members after acceptance

ProjectMember

id (PK)
userId    (FK → User.id)
projectId (FK → Project.id)
role      (member | admin)
joinedAt


🔔 Notification
Represents in-platform notifications

Notification

id (PK)
userId (FK → User.id)
title
message
isRead
createdAt


🤖 AIInsight ✅ (NEW)
Represents AI-generated insights (Match Score)

AIInsight

id (PK)
type            (match_score)
joinRequestId   (FK → JoinRequest.id)
result          (JSON)
createdAt


Example result:

{
  "score": 82,
  "strengths": [
    "Python",
    "Data Analysis"
  ],
  "weaknesses": [
    "SQL basics"
  ]
}


🔗 Relations

User    1 ───── * Project
User    1 ───── * JoinRequest
Project 1 ───── * JoinRequest

User    1 ───── * ProjectMember
Project 1 ───── * ProjectMember

User    1 ───── * Notification

JoinRequest 1 ── 0..1 AIInsight


🧠 Final Textual ERD

User
 ├─ id
 ├─ name
 ├─ email
 ├─ skills
 └─ bio
    │
    ├───────────────* Project
    │                ├─ id
    │                ├─ title
    │                └─ ownerId
    │
    ├───────────────* JoinRequest
    │                ├─ id
    │                ├─ userId
    │                ├─ projectId
    │                └─ status
    │                     │
    │                     └────── 0..1 AIInsight
    │                              ├─ id
    │                              ├─ type
    │                              └─ result
    │
    ├───────────────* ProjectMember
    │                ├─ id
    │                ├─ userId
    │                └─ projectId
    │
    └───────────────* Notification
                     ├─ id
                     ├─ userId
                     └─ isRead
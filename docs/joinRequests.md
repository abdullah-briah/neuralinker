Join Requests API Documentation
1️⃣ Create Join Request

Endpoint:

POST /api/join-requests


Headers:

Authorization: Bearer <USER_TOKEN>
Content-Type: application/json


Request Body:

{
  "projectId": "b752db09-5e30-4491-98fd-52a411c7d90f"
}


Response (201 Created):

{
  "id": "7b41f365-e0a1-49a8-bcfe-245982c9af8e",
  "userId": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
  "projectId": "b752db09-5e30-4491-98fd-52a411c7d90f",
  "status": "pending",
  "createdAt": "2025-12-26T21:04:00.124Z",
  "updatedAt": "2025-12-26T21:04:00.124Z",
  "user": {
    "id": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
    "name": "Second User",
    "email": "test2@example.com"
  },
  "aiInsight": null
}


Errors:

400 – Already requested or already a member.

2️⃣ List Project Join Requests (Owner Only)

Endpoint:

GET /api/projects/:projectId/join-requests


Headers:

Authorization: Bearer <OWNER_TOKEN>


Response (200 OK):

[
  {
    "id": "7b41f365-e0a1-49a8-bcfe-245982c9af8e",
    "userId": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
    "projectId": "b752db09-5e30-4491-98fd-52a411c7d90f",
    "status": "pending",
    "createdAt": "2025-12-26T21:04:00.124Z",
    "updatedAt": "2025-12-26T21:04:00.124Z",
    "user": {
      "id": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
      "name": "Second User",
      "email": "test2@example.com"
    },
    "aiInsight": null
  }
]


Errors:

404 – Project not found.

403 – Forbidden if not owner.

3️⃣ Respond to Join Request (Accept / Reject, Owner Only)

Endpoint:

PATCH /api/join-requests/:id/respond


Headers:

Authorization: Bearer <OWNER_TOKEN>
Content-Type: application/json


Request Body:

{
  "status": "accepted"
}


or

{
  "status": "rejected"
}


Response (200 OK):

{
  "id": "7b41f365-e0a1-49a8-bcfe-245982c9af8e",
  "userId": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
  "projectId": "b752db09-5e30-4491-98fd-52a411c7d90f",
  "status": "accepted",
  "createdAt": "2025-12-26T21:04:00.124Z",
  "updatedAt": "2025-12-26T21:05:00.124Z",
  "user": {
    "id": "aba8c7cf-981d-46b5-8ec6-2c3b26fe18f5",
    "name": "Second User",
    "email": "test2@example.com"
  },
  "aiInsight": null
}


Errors:

400 – Invalid status value.

404 – Join request not found.

403 – Forbidden if not project owner.
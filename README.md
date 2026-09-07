# StageDoor 🎟️

StageDoor is a full-stack ticket booking system built using Next.js, TypeScript, MongoDB, Mongoose, Firebase Authentication, and Tailwind CSS.

The application allows users to browse events, view event details, check seat availability, select seats, book tickets, view booking history, and cancel bookings.

Administrators can manage events, venues, seats, and bookings through a dedicated admin dashboard.

---

## Features

### User Features

- User registration and login
- Firebase Authentication
- Browse available events
- Search events by title or description
- Filter events by category and city
- View detailed event information
- View venue, date, time, and ticket price
- View seat availability
- Interactive seat selection
- Book one or multiple seats
- View booking history
- Cancel confirmed bookings
- Seats become available again after cancellation
- Responsive design for mobile, tablet, and desktop

### Admin Features

- Secure admin authentication
- Admin dashboard
- Create events
- Edit events
- Delete events
- Create venues
- Edit venues
- Delete venues
- Generate seats for events
- View event seats
- View all bookings
- Protected admin APIs

### Booking Protection

StageDoor prevents double booking using an atomic MongoDB seat update.

When a seat is being booked, the backend only changes its status from `available` to `booked` if it is still available.

The booking operation is also performed inside a MongoDB transaction.

If two clients attempt to book the same seat simultaneously:

1. One request successfully reserves the seat.
2. The other request finds that the seat is no longer available.
3. The second request receives a `409 Conflict` response.
4. If a multi-seat booking fails partway through, the transaction can roll back the changes.

---

## Tech Stack

### Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

### Backend

- Next.js Route Handlers
- REST APIs
- Node.js
- Mongoose

### Database

- MongoDB Atlas

### Authentication

- Firebase Authentication
- Firebase Admin SDK

### Validation

- Zod

---

## Architecture

StageDoor follows a layered MVC-style architecture.

```text
Frontend
React / Next.js Pages
        |
        v
API Route Handler
        |
        v
Controller
        |
        v
Service
        |
        v
Model
        |
        v
MongoDB
```

### View

The React and Next.js pages provide the user interface.

**Examples:**

- Home page
- Events page
- Event details page
- Booking history
- Admin dashboard

### Controller

Controllers receive API requests, perform authentication and authorization checks, validate input, call services, and return HTTP responses.

**Location:**

`src/controllers/`

### Service

Services contain the application's business logic.

**Examples:**

- Event management
- Venue management
- Seat generation
- Booking creation
- Booking cancellation

**Location:**

`src/services/`

### Model

Mongoose models define the structure of data stored in MongoDB.

**Location:**

`src/models/`

---

## Project Structure

```text
stagedoor/
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── bookings/
│   │   │   ├── events/
│   │   │   ├── seats/
│   │   │   ├── venues/
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── bookings/
│   │   │   ├── events/
│   │   │   ├── seats/
│   │   │   ├── users/
│   │   │   └── venues/
│   │   │
│   │   ├── bookings/
│   │   ├── events/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── controllers/
│   ├── lib/
│   ├── models/
│   ├── services/
│   └── types/
│
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Design

StageDoor uses five main MongoDB collections.

### User

Stores application users synchronized with Firebase Authentication.

```text
User
├── firebaseUid
├── name
├── email
└── role
```

**Roles:**

- `user`
- `admin`

### Venue

Stores event venue information.

```text
Venue
├── name
├── address
└── city
```

### Event

Stores information about an event.

```text
Event
├── title
├── description
├── category
├── venueId
├── dateTime
├── price
└── posterUrl
```

`venueId` references a `Venue`.

### Seat

Stores individual seats belonging to an event.

```text
Seat
├── eventId
├── seatNumber
├── row
└── status
```

**Seat status can be:**

- `available`
- `booked`

A unique compound index on `eventId` and `seatNumber` prevents duplicate seat numbers within the same event.

### Booking

Stores ticket booking information.

```text
Booking
├── userId
├── eventId
├── seatIds
├── totalAmount
└── status
```

**Booking status can be:**

- `confirmed`
- `cancelled`

---

## Database Relationships

```text
User
│
└── Booking
    │
    ├── Event
    │   │
    │   ├── Venue
    │   └── Seats
    │
    └── Seats
```

### Main Relationships

- `User 1 ──── * Booking`
- `Venue 1 ──── * Event`
- `Event 1 ──── * Seat`
- `Event 1 ──── * Booking`
- `Booking * ──── * Seat`

---

## Authentication

StageDoor uses Firebase Authentication for user authentication.

The application supports:

- Email/password registration
- Email/password login
- Firebase ID tokens
- Firebase Admin SDK verification

### Authentication Flow

```text
User
  │
  ▼
Firebase Authentication
  │
  ▼
Firebase ID Token
  │
  ▼
Authorization Header
  │
  ▼
Next.js Backend
  │
  ▼
Firebase Admin SDK
  │
  ▼
MongoDB User
```

Authenticated API requests send the Firebase ID token using:

```text
Authorization: Bearer <Firebase ID Token>
```

The backend verifies the token using Firebase Admin SDK.

The user's role is then checked using the MongoDB `User` document.

The backend does not rely on an admin role supplied by the frontend.

---

## REST API Documentation

### Events

#### Get All Events

**Endpoint:**

```text
GET /api/events
```

**Access:** Public

Supports search and filtering using query parameters.

**Examples:**

```text
/api/events?search=music
/api/events?category=Music
/api/events?city=Kolkata
```

#### Create Event

**Endpoint:**

```text
POST /api/events
```

**Access:** Admin

#### Get Event Details

**Endpoint:**

```text
GET /api/events/:eventId
```

**Access:** Public

#### Update Event

**Endpoint:**

```text
PATCH /api/events/:eventId
```

**Access:** Admin

#### Delete Event

**Endpoint:**

```text
DELETE /api/events/:eventId
```

**Access:** Admin

An event with existing bookings cannot be deleted.

---

### Venues

#### Get Venues

**Endpoint:**

```text
GET /api/venues
```

**Access:** Public

#### Create Venue

**Endpoint:**

```text
POST /api/venues
```

**Access:** Admin

#### Update Venue

**Endpoint:**

```text
PATCH /api/venues/:venueId
```

**Access:** Admin

#### Delete Venue

**Endpoint:**

```text
DELETE /api/venues/:venueId
```

**Access:** Admin

A venue currently used by an event cannot be deleted.

---

### Seats

#### Get Event Seats

**Endpoint:**

```text
GET /api/events/:eventId/seats
```

**Access:** Public

Returns seats associated with the event.

#### Generate Seats

**Endpoint:**

```text
POST /api/seats
```

**Access:** Admin

The administrator specifies the event, rows, and number of seats per row.

---

### Bookings

#### Create Booking

**Endpoint:**

```text
POST /api/bookings
```

**Access:** Authenticated User

**Example Request:**

```json
{
  "eventId": "EVENT_ID",
  "seatIds": [
    "SEAT_ID_1",
    "SEAT_ID_2"
  ]
}
```

The backend calculates the total amount using:

**Event price × Number of seats**

The client does not control the final booking amount.

#### Get User's Bookings

**Endpoint:**

```text
GET /api/bookings
```

**Access:** Authenticated User

Returns the booking history of the currently authenticated user.

#### Cancel Booking

**Endpoint:**

```text
PATCH /api/bookings/:bookingId/cancel
```

**Access:** Authenticated User

Cancellation changes the booking status to `cancelled` and releases the seats back to `available`.

---

### Admin Bookings

#### Get All Bookings

**Endpoint:**

```text
GET /api/admin/bookings
```

**Access:** Admin

Returns booking information for all users.

---

### User Synchronization

#### Synchronize Firebase User

**Endpoint:**

```text
POST /api/users/sync
```

**Access:** Authenticated User

This endpoint creates or synchronizes the corresponding MongoDB `User` document after Firebase authentication.

---

## Validation and Error Handling

StageDoor uses **Zod** for runtime request validation.

Validation includes:

- Required fields
- String length limits
- MongoDB ObjectId format
- Numeric price validation
- Seat selection validation
- URL validation for poster URLs

The backend returns appropriate HTTP status codes.

### Examples

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

---

## Admin Authorization

Admin-only operations are protected on the backend.

### Authorization Flow

```text
Request
   │
   ▼
Verify Firebase Token
   │
   ▼
Find MongoDB User
   │
   ▼
Check Role
   │
   ├── user  → 403 Forbidden
   │
   └── admin → Continue
```

This prevents normal users from accessing protected administrative operations.

---

## Seat Booking and Concurrency

Seat booking uses MongoDB transactions.

When reserving a seat, the backend checks that:

```text
seat.status === "available"
```

and changes it to:

```text
booked
```

as part of the database update.

Therefore, simultaneous requests for the same seat cannot both successfully reserve it.

If the seat has already been reserved, the API returns:

```text
409 Conflict
```

For multiple-seat bookings, the transaction ensures that a failed booking does not leave partially reserved seats.

---

## Responsive Design

The application is designed to work across:

- Mobile phones
- Tablets
- Desktop computers

Responsive layouts are implemented using **Tailwind CSS**.

The interactive seating layout also supports horizontal scrolling on smaller screens so that larger seat rows remain usable on mobile devices.

---

## Environment Variables

Create a `.env.local` file in the project root.

**Example structure:**

```env
MONGODB_URI=your_mongodb_connection_string

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

> **Security:** Never commit `.env.local` or Firebase private credentials to GitHub.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd stagedoor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and add the required MongoDB and Firebase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Create a Production Build

```bash
npm run build
```

---

## Main Application Pages

### Public/User Pages

- `/` — Home page
- `/login` — User login
- `/register` — User registration
- `/events` — Browse events
- `/events/:eventId` — Event details and seat selection
- `/bookings` — Booking history

### Admin Pages

- `/admin` — Admin dashboard
- `/admin/events` — Manage events
- `/admin/venues` — Manage venues
- `/admin/seats` — Manage seats
- `/admin/bookings` — Manage bookings

---

## Security Considerations

- Firebase Authentication handles user authentication.
- Firebase Admin SDK verifies authentication tokens on the backend.
- Admin authorization is checked server-side.
- Sensitive credentials are stored in environment variables.
- Client-provided booking totals are not trusted.
- Seat availability is verified on the server.
- MongoDB transactions protect booking operations.
- Duplicate seats are prevented using a unique compound index.
- Users can only cancel their own bookings.
- Admin APIs are protected from normal users.

---

## Future Improvements

Possible future enhancements include:

- Online payment integration
- Email booking confirmation
- QR-code based tickets
- Event image upload
- Booking expiration and temporary seat holds
- Advanced admin analytics
- Pagination for large event and booking lists
- Automated API documentation using Swagger/OpenAPI
- Deployment to a production hosting platform

---

## Project Status

StageDoor currently includes the core functionality required for a full-stack ticket booking system:

- Authentication
- Authorization
- Event management
- Venue management
- Seat management
- Seat selection
- Ticket booking
- Booking history
- Booking cancellation
- Double-booking protection
- Admin dashboard
- REST APIs
- MongoDB database integration
- Responsive UI
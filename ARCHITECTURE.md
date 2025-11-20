# VertrouwdBouwen - Escrow Platform Architecture

## Overview
VertrouwdBouwen is a Dutch escrow platform connecting customers (klanten) with contractors (aannemers) for construction projects. The platform manages projects, milestones, escrow payments, and approval workflows.

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **React**
- **Tailwind CSS** (for styling)
- **React Hook Form** (form management)
- **Zustand/Context API** (state management)

### Backend
- **Express.js** (REST API)
- **TypeScript**
- **PostgreSQL** (database)
- **Prisma** (ORM)
- **JWT** (authentication)
- **bcrypt** (password hashing)

### Infrastructure
- **Docker** (containerization)
- **Docker Compose** (local development)

## System Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Port 3000)
│   (Client)      │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │  (Backend - Port 5000)
│  (Server)       │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │  (Database - Port 5432)
│   (Database)    │
└─────────────────┘
```

## Database Schema

### Core Tables

#### 1. Users
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- role (Enum: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN')
- first_name (String)
- last_name (String)
- company_name (String, Nullable - for contractors)
- kvk_number (String, Nullable - Dutch Chamber of Commerce)
- phone (String)
- address (JSON)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 2. Projects
```sql
- id (UUID, Primary Key)
- customer_id (UUID, Foreign Key -> Users)
- contractor_id (UUID, Foreign Key -> Users)
- title (String)
- description (Text)
- total_budget (Decimal)
- status (Enum: 'DRAFT' | 'PENDING_CONTRACTOR' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED')
- start_date (Date, Nullable)
- end_date (Date, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 3. Milestones
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key -> Projects)
- title (String)
- description (Text)
- amount (Decimal)
- status (Enum: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID')
- order (Integer)
- due_date (Date, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 4. Escrow Payments
```sql
- id (UUID, Primary Key)
- milestone_id (UUID, Foreign Key -> Milestones)
- amount (Decimal)
- status (Enum: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED')
- held_at (Timestamp, Nullable)
- released_at (Timestamp, Nullable)
- transaction_reference (String, Unique)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 5. Approvals
```sql
- id (UUID, Primary Key)
- milestone_id (UUID, Foreign Key -> Milestones)
- approver_id (UUID, Foreign Key -> Users)
- status (Enum: 'PENDING' | 'APPROVED' | 'REJECTED')
- comments (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 6. Project Messages
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key -> Projects)
- sender_id (UUID, Foreign Key -> Users)
- message (Text)
- created_at (Timestamp)
```

#### 7. Disputes
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key -> Projects)
- milestone_id (UUID, Foreign Key -> Milestones, Nullable)
- initiator_id (UUID, Foreign Key -> Users)
- reason (Text)
- status (Enum: 'OPEN' | 'RESOLVED' | 'CLOSED')
- resolution (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## API Endpoints Structure

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
```

### Projects
```
GET    /api/projects              (List projects - filtered by user role)
POST   /api/projects              (Create project - customer only)
GET    /api/projects/:id          (Get project details)
PUT    /api/projects/:id          (Update project)
POST   /api/projects/:id/accept   (Contractor accepts project)
POST   /api/projects/:id/cancel   (Cancel project)
```

### Milestones
```
GET    /api/projects/:projectId/milestones
POST   /api/projects/:projectId/milestones
GET    /api/milestones/:id
PUT    /api/milestones/:id
POST   /api/milestones/:id/submit (Contractor submits milestone)
```

### Approvals
```
POST   /api/milestones/:id/approve    (Customer approves milestone)
POST   /api/milestones/:id/reject     (Customer rejects milestone)
GET    /api/milestones/:id/approvals
```

### Payments (Escrow)
```
POST   /api/milestones/:id/fund       (Customer funds milestone to escrow)
POST   /api/milestones/:id/release    (Release payment to contractor)
POST   /api/milestones/:id/refund     (Refund to customer)
GET    /api/payments                  (List payments)
GET    /api/payments/:id
```

### Messages
```
GET    /api/projects/:id/messages
POST   /api/projects/:id/messages
```

### Disputes
```
POST   /api/projects/:id/disputes
GET    /api/projects/:id/disputes
PUT    /api/disputes/:id/resolve
```

## Frontend Structure

```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /dashboard              (Overview)
    /projects
      /[id]                 (Project detail)
      /new                  (Create project)
    /milestones
    /payments
    /messages
  /api                     (Next.js API routes - proxy to Express)
/components
  /auth
  /projects
  /milestones
  /payments
  /common
/lib
  /api                    (API client functions)
  /auth                   (Auth utilities)
  /utils
```

## Authentication Flow

1. User registers/logs in → JWT token issued
2. Token stored in HTTP-only cookie (secure)
3. Each API request includes token in Authorization header
4. Express middleware validates token
5. User role determines access permissions

## Escrow Payment Flow

1. **Project Creation**: Customer creates project with milestones
2. **Contractor Acceptance**: Contractor reviews and accepts project
3. **Funding**: Customer funds each milestone to escrow (simulated)
4. **Work Progress**: Contractor marks milestone as "in progress"
5. **Submission**: Contractor submits milestone for approval
6. **Approval**: Customer reviews and approves/rejects
7. **Release**: Upon approval, payment released to contractor (simulated)
8. **Refund**: If rejected or cancelled, funds refunded to customer

## Approval Workflow

```
Milestone Status Flow:
PENDING → IN_PROGRESS → SUBMITTED → APPROVED → PAID
                              ↓
                          REJECTED → (back to IN_PROGRESS)
```

## Security Considerations

1. **Authentication**: JWT with secure HTTP-only cookies
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Validate all inputs (express-validator)
4. **SQL Injection**: Use Prisma ORM (parameterized queries)
5. **XSS Protection**: Sanitize user inputs
6. **CORS**: Configure properly for production
7. **Rate Limiting**: Implement on sensitive endpoints
8. **Password Security**: bcrypt with salt rounds

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vertrouwdbouwen

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Development Phases

### Phase 1: Foundation
- Project setup (Next.js + Express + PostgreSQL)
- Database schema and migrations
- Authentication system
- Basic user registration/login

### Phase 2: Core Features
- Project CRUD operations
- Milestone management
- User roles and permissions

### Phase 3: Escrow System
- Payment simulation
- Escrow holding logic
- Payment release/refund

### Phase 4: Approval Workflow
- Milestone submission
- Approval/rejection system
- Status transitions

### Phase 5: Communication
- Project messaging
- Notifications
- Email notifications (optional)

### Phase 6: Advanced Features
- Dispute resolution
- Dashboard analytics
- Reporting

## Next Steps

1. Initialize project structure
2. Set up database with Prisma
3. Create Express API server
4. Set up Next.js frontend
5. Implement authentication
6. Build core features incrementally


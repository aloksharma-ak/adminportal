# Admin Portal

A Next.js 16 admin portal for organisation management — auth, modules, employees, admissions, and role-based permissions.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Auth**: NextAuth.js v4 (JWT, Credentials provider)
- **UI**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Table**: TanStack Table v8

---

## Getting Started

### 1. Install

```bash
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable            | Description                              | Required |
|---------------------|------------------------------------------|----------|
| `NEXTAUTH_URL`      | App URL (e.g. `http://localhost:3000`)  | ✅       |
| `NEXTAUTH_SECRET`   | JWT signing secret (32+ chars)           | ✅       |
| `NEXTAUTH_MAX_AGE`  | Session duration in seconds (default 7d) | Optional |
| `API_URL`           | User-management API base URL             | ✅       |
| `ADMISSION_API_URL` | Admission service API base URL           | ✅       |

Generate a secret: `openssl rand -base64 32`

### 3. Run

```bash
pnpm dev     # http://localhost:3000
pnpm build   # production build
pnpm start   # production server
```

---

## Project Structure

```
src/
├── app/
│   ├── (home)/                 # Landing page (redirects authed users → /dashboard)
│   ├── api/auth/               # NextAuth route + config
│   ├── auth/
│   │   ├── login/              # Two-step login (OrgCode → credentials)
│   │   └── logout/             # Sign-out
│   ├── dashboard/
│   │   ├── layout.tsx          # Shell: navbar + footer (parallel fetch)
│   │   ├── page.tsx            # Module grid (from GetAllowModules)
│   │   ├── admission/          # Student admissions
│   │   │   ├── page.tsx        # Student list
│   │   │   ├── [id]/page.tsx   # Student detail
│   │   │   ├── enroll-student/ # Enroll new student (classes from API)
│   │   │   └── action.tsx      # Server actions: GetStudents, GetStudentDetail, EnrollStudent
│   │   ├── roles/              # Role & permission management
│   │   │   ├── page.tsx        # All roles list
│   │   │   └── [id]/page.tsx   # Edit permissions for a role
│   │   └── users/
│   │       ├── page.tsx        # User hub (employees / profile)
│   │       ├── employees/
│   │       │   ├── page.tsx    # Employee list (GetEmployeeList)
│   │       │   └── create/     # Create employee (roles from MasterData)
│   │       └── profile/        # Current user profile & permissions
│   └── utils.tsx               # ALL server actions / API calls
├── components/
│   ├── admission/              # Student-specific components
│   ├── roles/                  # RolePermissionsEditor
│   ├── users/                  # EmployeeListGrid, CreateEmployeeForm
│   ├── controls/               # DataGrid, InputField, Buttons, etc.
│   ├── providers/              # Auth + Theme
│   ├── shared-ui/              # Container, Loader, Navbar sub-pieces
│   └── ui/                     # shadcn/ui primitives
├── lib/
│   ├── utils.ts                # cn() helper
│   └── image-session.client.ts # sessionStorage image cache
└── shared-types/
    └── organisation.types.ts
```

---

## API Integration

All API calls live in `src/app/utils.tsx` (server actions).

### User Management API (`API_URL`)

| Endpoint | Function | Used by |
|---|---|---|
| `POST /api/Login/validate` | auth.ts authorize | Login |
| `POST /api/Organisation/GetDetail` | `getOrganisationDetail` | Login, Dashboard layout |
| `POST /api/Modules/GetAllowModules` | `getAllowModules` | Dashboard |
| `POST /api/MasterData/Get` | `getMasterData` | Create Employee (roles) |
| `POST /api/User/GetEmployee` | `getEmployee` | Dashboard layout, Profile |
| `POST /api/User/GetEmployeeList` | `getEmployeeList` | Employees list |
| `POST /api/User/CreateEmployee` | `createEmployee` | Create Employee form |
| `POST /api/RolePermission/GetRoles` | `getRoles` | Roles list |
| `POST /api/RolePermission/GetRolesPermissions` | `getRolePermissions` | Role detail |
| `POST /api/RolePermission/UpdateRolePermission` | `updateRolePermissions` | Role editor |
| `POST /api/RolePermission/CreatePermission` | `createPermission` | (available) |

### Admission API (`ADMISSION_API_URL`)

| Endpoint | Function | Used by |
|---|---|---|
| `POST /api/MasterData/Get` | `getAdmissionMasterData` | Enroll form (class list) |
| `POST /api/Student/GetStudents` | `getStudentsByOrgId` | Admissions list |
| `POST /api/Student/GetStudentDetail` | `getStudentDetail` | Student detail |
| `POST /api/Student/EnrollStudent` | `enrollStudent` | Enroll student form |

---

## Login Flow

1. Enter **Organisation Code** → fetches org branding (logo, colour)
2. Enter **username + password** → calls `/api/Login/validate`
3. JWT session created; redirected to `/dashboard`
4. Dashboard loads allowed modules from `/api/Modules/GetAllowModules`

## Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Add external image domains to `next.config.ts` → `images.remotePatterns`
- [ ] Set `NEXTAUTH_MAX_AGE` per your security policy (default: 7 days)
- [ ] Ensure `API_URL` and `ADMISSION_API_URL` are HTTPS in production

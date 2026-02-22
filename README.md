# Admin Portal — Next.js Frontend

A clean, professional admin portal integrating with the UserManagement and AdmissionManagement backend APIs.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pnpm install
# or: npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

**Required variables:**
| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | Full URL of this app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `API_URL` | User Management API base URL |
| `ADMISSION_API_URL` | Admission Management API base URL |

### 3. Run development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Integration

### User Management API (`API_URL`)
| Endpoint | Used For |
|---|---|
| `POST /api/Login/Validate` | Authenticate users |
| `POST /api/Organisation/GetDetail` | Fetch org details by org code |
| `POST /api/User/GetEmployee` | Get single employee details |
| `POST /api/User/GetEmployeeList` | List all employees |
| `POST /api/User/CreateEmployee` | Create/update employee |
| `POST /api/Modules/GetAllowModules` | Fetch allowed modules for dashboard |
| `POST /api/MasterData/Get` | Fetch roles and module master data |
| `POST /api/RolePermission/GetRoles` | List all roles |
| `POST /api/RolePermission/GetRolesPermissions` | Get role permissions |
| `POST /api/RolePermission/UpdateRolePermission` | Update role permissions |
| `POST /api/RolePermission/CreatePermission` | Create new permission |

### Admission Management API (`ADMISSION_API_URL`)
| Endpoint | Used For |
|---|---|
| `POST /api/MasterData/Get` | Fetch class list |
| `POST /api/Student/GetStudents` | List all students |
| `POST /api/Student/GetStudentDetail` | Get single student details |
| `POST /api/Student/EnrollStudent` | Enroll a new student |

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   # NextAuth config & route
│   ├── auth/login/               # Login page (2-step: org code → credentials)
│   ├── dashboard/
│   │   ├── admission/            # Student admissions module
│   │   ├── roles/                # Roles & permissions management
│   │   └── users/employees/      # Employee management
│   └── utils.tsx                 # All server-side API calls
├── components/
│   ├── admission/                # Student enroll form & grid
│   ├── controls/                 # Reusable UI controls
│   ├── roles/                    # Role permissions editor
│   └── users/                    # Employee forms & grid
└── shared-types/                 # TypeScript type definitions
```

---

## 🔑 Login Flow

1. User enters **Organisation Code** → calls `/api/Organisation/GetDetail`
2. User enters **username + password** → calls `/api/Login/Validate`
3. Session is created with `profileId`, `orgId`, `orgCode`, `brandColor`
4. Dashboard loads allowed modules via `/api/Modules/GetAllowModules`

> **Note:** The login endpoint currently returns `"Login successful"` as a plain string. The frontend handles this gracefully and falls back to using `orgId` as the session `profileId` until the backend returns a proper JSON response with `profileId`.

---

## 🛠 Known Backend Notes

- **Login response**: The backend `/api/Login/Validate` currently returns a plain string. The frontend is coded to handle both `"Login successful"` string and `{ data: { profileId, userName } }` JSON — it will work correctly once the backend returns JSON.
- **Org code casing**: The API accepts both `orgCode` and `OrgCode` — the frontend sends both.
- **Class selection**: If admission master data returns classes, a dropdown is shown. Otherwise a numeric input is shown as fallback.

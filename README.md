<div align="center">

# 🔐 SecureVault

### Your Personal Digital Fortress

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Push_Notifications-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

---

**SecureVault** is a full-stack mobile application built with React Native & Expo that brings together your **passwords**, **notes**, and **expenses** into one beautifully encrypted, offline-capable vault.

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Contributing](#-contributing) · [Demo](https://drive.google.com/drive/folders/1R0ux6_Kt1qIOs13FLRb2LCV8gC_VnVQj?usp=sharing)

</div>

---


## ✨ Glimpse of App



<br>


## ✨ Features

<table>
<tr>
<td width="50%">

### 🔑 Password Manager
- **AES-256 encryption** for all stored credentials
- Organize passwords into custom groups
- One-tap copy for username & password
- Master password protection

</td>
<td width="50%">

### 📝 Notes Manager
- Rich task-based notes with sections
- **Offline-first** — create and edit without internet
- Background sync with smart queue deduplication
- Swipe actions for quick delete

</td>
</tr>
<tr>
<td width="50%">

### 💰 Expense Tracker
- Track income & expenses with categories
- Transaction history with date filtering
- Visual spending insights
- Persistent data for offline access

</td>
<td width="50%">

### 🛡️ Security & Auth
- JWT-based authentication with refresh tokens
- OTP email verification on signup
- Forgot password flow with secure reset
- Auto-logout on token expiry

</td>
</tr>
<tr>
<td width="50%">

### 🔔 Push Notifications
- Firebase Cloud Messaging integration
- Reminder notifications for tasks
- Cron-scheduled server-side notifications
- Per-device token management

</td>
<td width="50%">

### 📡 Offline-First Design
- Non-blocking offline banner (no full-screen wall)
- Redux Persist for instant cold starts
- Smart offline queue with dedup
- Auto-sync on reconnection

</td>
</tr>
</table>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     📱 Mobile App                       │
│            React Native · Expo Router · Redux           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Password │  │  Notes   │  │ Expense  │  │Profile │  │
│  │ Manager  │  │ Manager  │  │ Tracker  │  │& Auth  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │             │             │       │
│  ┌────┴──────────────┴─────────────┴─────────────┴───┐  │
│  │          Redux Toolkit + Redux Persist            │  │
│  │        (Offline Queue · Reselect · Thunks)        │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │    Axios Instance (15s timeout · Auto-retry)      │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │  HTTPS / JWT
┌──────────────────────────┼──────────────────────────────┐
│                    🖥️  Backend                          │
│             Node.js · Express · Mongoose                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │   Todo   │  │ Expense  │  │Password│  │
│  │Controller│  │Controller│  │Controller│  │ Ctrl   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │             │             │       │
│  ┌────┴──────────────┴─────────────┴─────────────┴───┐  │
│  │              MongoDB (Mongoose ODM)               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Firebase   │  │  Nodemailer │  │  Cron Jobs      │  │
│  │  Admin SDK  │  │  (Email)    │  │  (Scheduled)    │  │
│  └─────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 18.x | Runtime |
| **npm** | ≥ 9.x | Package manager |
| **Expo CLI** | Latest | Mobile dev toolchain |
| **MongoDB** | ≥ 6.x | Database |
| **Android Studio** / **Xcode** | Latest | Emulators |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/secureVault.git
cd secureVault
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/securevault
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the server:

```bash
npm run dev        # Development (with nodemon)
# or
npm start          # Production
```

### 3️⃣ Mobile App Setup

```bash
cd secureVault     # Navigate to the Expo app directory
npm install
```

Start the development server:

```bash
npx expo start
```

Then choose your target:

| Command | Platform |
|---------|----------|
| `npx expo start --android` | Android Emulator |
| `npx expo start --ios` | iOS Simulator |
| `npx expo start --web` | Web Browser |
| Scan QR in **Expo Go** | Physical Device |

---

## 🛠 Tech Stack

<details>
<summary><strong>📱 Frontend</strong></summary>

| Technology | Usage |
|------------|-------|
| **React Native 0.81** | Cross-platform mobile UI |
| **Expo SDK 54** | Managed workflow, OTA updates |
| **Expo Router** | File-based routing with typed routes |
| **Redux Toolkit** | State management with async thunks |
| **Redux Persist** | Offline data persistence via AsyncStorage |
| **Reselect** | Memoized selectors for performance |
| **React Native Reanimated** | Smooth 60fps animations |
| **Expo Notifications** | Push notification handling |
| **Expo Linear Gradient** | Beautiful gradient backgrounds |
| **Expo Blur** | Glassmorphism effects |
| **Axios** | HTTP client with interceptors |

</details>

<details>
<summary><strong>🖥️ Backend</strong></summary>

| Technology | Usage |
|------------|-------|
| **Node.js + Express** | REST API server |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **CryptoJS** | AES encryption for sensitive data |
| **Firebase Admin** | Push notification dispatch |
| **Nodemailer** | Email OTP & password reset |
| **ImapFlow** | Email inbox integration |
| **node-cron** | Scheduled background jobs |
| **Morgan** | HTTP request logging |
| **Compression** | Gzip response compression |

</details>

---

## 📁 Project Structure

```
secureVault/
├── 📱 secureVault/               # Expo React Native App
│   ├── app/                      # File-based routing
│   │   ├── (tabs)/               # Tab navigator screens
│   │   │   ├── expense_manager   # 💰 Expense tracking
│   │   │   ├── notes_manager     # 📝 Notes & tasks
│   │   │   ├── password_manager  # 🔑 Password vault
│   │   │   └── profile           # 👤 User profile
│   │   ├── notifications         # 🔔 Notification center
│   │   └── data_privacy          # 🛡️ Privacy policy
│   ├── components/
│   │   ├── auth/                 # Login, Signup, Forgot Password
│   │   ├── expenseManager/       # Expense UI components
│   │   ├── notesManager/         # Notes list & editor
│   │   ├── passwordManager/      # Password CRUD components
│   │   ├── profile/              # Profile management
│   │   ├── ui/                   # Reusable UI primitives
│   │   └── utils/                # Offline banner, sharing, etc.
│   ├── redux/
│   │   ├── api/                  # Axios instance & API layer
│   │   ├── slice/                # Redux slices (auth, todo, etc.)
│   │   ├── reselect/             # Memoized selectors
│   │   └── store.ts              # Store config with persist
│   ├── constants/                # Theme colors, config values
│   ├── hooks/                    # Custom React hooks
│   └── assets/                   # Images, fonts, icons
│
├── 🖥️ backend/                    # Node.js Express API
│   ├── controller/               # Route handlers
│   │   ├── auth.controller       # Register, Login, OTP, Reset
│   │   ├── todo.controller       # Notes CRUD + batch sync
│   │   ├── expense-track.controller
│   │   └── passwordManager.controller
│   ├── models/                   # Mongoose schemas
│   │   ├── UserSchema            # User profile & auth
│   │   ├── TransactionSchema     # Expense records
│   │   ├── password-manager/     # Encrypted password store
│   │   └── todo/                 # Notes & task sections
│   ├── routes/                   # Express route definitions
│   ├── middleware/               # JWT auth middleware
│   ├── services/                 # Business logic layer
│   ├── validation/               # Input validation
│   ├── firebase/                 # FCM push notification setup
│   ├── mail/                     # Email templates & sender
│   ├── cronJob/                  # Scheduled tasks
│   ├── db/                       # Database connection
│   └── utils/                    # Helper utilities
│
└── test.js                       # API integration tests
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account with email OTP |
| `POST` | `/api/auth/login` | Login with email & password |
| `GET` | `/api/auth/user` | Get authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | Reset password with OTP |

### Notes Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todo` | Fetch all notes & tasks |
| `POST` | `/api/todo` | Create a new note |
| `PUT` | `/api/todo/:id` | Update note content |
| `DELETE` | `/api/todo/:id` | Delete a note |

### Password Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/passwords` | Fetch all encrypted passwords |
| `POST` | `/api/passwords` | Store new credential (encrypted) |
| `PUT` | `/api/passwords/:id` | Update credential |
| `DELETE` | `/api/passwords/:id` | Delete credential |

### Expense Tracker

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Fetch all transactions |
| `POST` | `/api/expenses` | Record new transaction |
| `DELETE` | `/api/expenses/:id` | Delete transaction |

> **Note:** All endpoints except `/auth/register` and `/auth/login` require a valid JWT Bearer token in the `Authorization` header.

---

## 🔒 Security Highlights

| Layer | Protection |
|-------|-----------|
| **Passwords at rest** | AES-256 encryption via CryptoJS |
| **User passwords** | bcrypt hashing (12 rounds) |
| **API authentication** | JWT tokens with expiration |
| **Data in transit** | HTTPS enforced |
| **Email verification** | OTP-based signup flow |
| **Input validation** | Server-side validation layer |
| **Sensitive data** | Excluded from Redux persistence |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and component patterns
- Write meaningful commit messages
- Test on both Android and iOS before submitting PRs
- Keep Redux slices modular and well-documented

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shubham Mishra**

---

<div align="center">

Built with ❤️ using React Native & Expo

**⭐ Star this repo if you found it useful!**

</div>

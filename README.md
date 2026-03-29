# 📚 Smart Library Management System

> **Your Gateway to Infinite Knowledge** — A full-stack, cross-platform library management solution with a modern React Native frontend and a robust Spring Boot backend powered by MongoDB.

![Smart Library System](./app-screenshot.png)



---

## 🌟 Overview

**Smart Library System** is a feature-rich, bilingual library management platform designed for both librarians (admins) and members (users). It provides seamless digital management of books, members, borrowing, reservations, payments, donations, and an interactive lottery reward system — all delivered through a sleek, dark-mode-first UI with multilingual support.

---

## 🚀 Key Features at a Glance

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-secured login, registration, forgot/reset password |
| 📖 Book Management | Full CRUD with rich metadata, cover images, and PDF digital versions |
| 👥 Member Management | Member profiles, membership plans, borrow limits |
| 🔄 Borrow & Return | Borrow, return, and renew books with auto fine calculation |
| 📅 Reservations | Reserve unavailable books and manage a waitlist |
| 💳 Payments | Payment intent creation, confirmation, and revenue tracking |
| 🎁 Donations | Anonymous or named donations with thank-you email receipts |
| 🎰 Lottery System | Spin-to-win reward system for active library members |
| 📊 Admin Analytics | Live charts: popular books, borrowing trends, revenue, member activity |
| 🌐 Multilingual | English, Sinhala (si), and Tamil (ta) via i18next |
| 🌙 Dark / Light Mode | Toggle between themes across the entire app |
| 🔔 Notifications | In-app notification bell component |
| 🔍 Search | Global book search bar with filter parameters |
| 📧 Email Alerts | Email confirmations for borrow, overdue, renewal, and donations |
| 📱 Cross-Platform | Runs on Web, Android, and iOS via Expo |

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2.4 |
| Language | Java 17 |
| Database | MongoDB (via Spring Data MongoDB) |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Email | Spring Boot Mail |
| Utilities | Lombok |
| Build Tool | Maven (Maven Wrapper included) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React Native (Expo ~55.0.6) |
| Language | JavaScript / TypeScript |
| Navigation | Tab-based sidebar navigation |
| Charts | react-native-chart-kit (Bar, Line, Pie) |
| Animations | Lottie (lottie-react-native, lottie-web) |
| i18n | i18next + react-i18next |
| Gradient | expo-linear-gradient |
| QR Scanner | expo-barcode-scanner |
| File Picker | expo-document-picker |
| Platforms | Web, Android, iOS |

---

## 📁 Project Structure

```
library management system/
├── backend/                         # Spring Boot backend
│   ├── src/main/java/com/library/management/
│   │   ├── Application.java         # Main entry point
│   │   ├── auth/                    # Authentication layer
│   │   │   ├── AuthenticationController.java
│   │   │   ├── AuthenticationService.java
│   │   │   ├── AuthenticationRequest.java
│   │   │   ├── AuthenticationResponse.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── ChangePasswordRequest.java
│   │   │   ├── ForgotPasswordRequest.java
│   │   │   └── ResetPasswordRequest.java
│   │   ├── config/                  # Security & CORS configuration
│   │   ├── controller/              # REST API controllers
│   │   │   ├── BookController.java
│   │   │   ├── BorrowController.java
│   │   │   ├── CategoryController.java
│   │   │   ├── DonationController.java
│   │   │   ├── FileController.java
│   │   │   ├── MemberController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── ReservationController.java
│   │   │   ├── ReviewController.java
│   │   │   └── StatsController.java
│   │   ├── entity/                  # MongoDB document models
│   │   │   ├── Book.java
│   │   │   ├── BorrowRecord.java
│   │   │   ├── Category.java
│   │   │   ├── Donation.java
│   │   │   ├── Member.java
│   │   │   ├── MembershipPlan.java
│   │   │   ├── Payment.java
│   │   │   ├── Reservation.java
│   │   │   ├── Review.java
│   │   │   ├── Role.java
│   │   │   └── User.java
│   │   ├── repository/              # Spring Data MongoDB repositories
│   │   ├── security/                # JWT filter & security config
│   │   ├── service/                 # Business logic layer
│   │   │   ├── BookService.java
│   │   │   ├── BorrowService.java
│   │   │   ├── CategoryService.java
│   │   │   ├── DonationService.java
│   │   │   ├── EmailService.java
│   │   │   ├── MemberService.java
│   │   │   ├── PaymentService.java
│   │   │   ├── ReservationService.java
│   │   │   └── ReviewService.java
│   │   └── specification/           # Query specifications
│   ├── uploads/                     # Uploaded book cover images / PDFs
│   └── pom.xml                      # Maven dependencies
│
└── frontend/                        # React Native / Expo frontend
    ├── App.js                        # Root app component + dashboard
    ├── ThemeContext.js               # Dark/Light theme provider
    ├── api.js                        # Centralized API service layer
    ├── i18n.js                       # i18next configuration
    ├── index.js                      # Expo entry point
    ├── app.json                      # Expo app configuration
    ├── package.json
    ├── components/
    │   ├── LoginScreen.js            # Login & registration screens
    │   ├── IntroductionScreen.js     # App introduction/splash
    │   ├── OnboardingScreen.js       # Post-login onboarding
    │   ├── BooksScreen.js            # Book catalog & management
    │   ├── BorrowScreen.js           # Borrow, return & renew
    │   ├── MembersScreen.js          # Member management (admin)
    │   ├── DonationsScreen.js        # Donation submission & history
    │   ├── PaymentsScreen.js         # Payment processing & records
    │   ├── LotteryScreen.js          # Lottery spin wheel
    │   ├── LotteryPrizes.js          # Prize catalog viewer
    │   ├── NotificationBell.js       # Notification bell UI
    │   └── SearchBar.js              # Global search input
    ├── locales/
    │   ├── en.json                   # English translations
    │   ├── si.json                   # Sinhala translations
    │   └── ta.json                   # Tamil translations
    └── assets/                       # Icons, splash screen, images
```

---

## ⚙️ Prerequisites

Before running this project, make sure you have the following installed:

| Requirement | Version | Notes |
|---|---|---|
| Java JDK | 17+ | Set `JAVA_HOME` environment variable |
| Maven | 3.8+ | Included via `mvnw.cmd` wrapper |
| MongoDB | 6.0+ | Running locally on port `27017` |
| Node.js | 18+ | Required for the frontend |
| npm | 9+ | Comes with Node.js |
| Expo CLI | Latest | Install: `npm install -g expo-cli` |

---

## 🛠️ Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd "library management system"
```

---

### Step 2 — Backend Setup

#### 2.1 Configure MongoDB

Make sure MongoDB is running locally on port `27017`. The application will auto-create the database on first launch.

> By default, the app connects to: `mongodb://localhost:27017/library_db`

To change the connection, edit:
```
backend/src/main/resources/application.properties
```

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/library_db
spring.data.mongodb.database=library_db
```

#### 2.2 Configure Email (Optional)

To enable email notifications for borrowing, overdue alerts, renewals, and donations, add your SMTP settings to `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

> 💡 For Gmail, use an **App Password** (not your regular password).

#### 2.3 Configure JWT Secret

```properties
application.security.jwt.secret-key=your-very-long-and-secure-secret-key-here
application.security.jwt.expiration=86400000
```

#### 2.4 Start the Backend

```bash
cd backend

# Using the Maven Wrapper (Windows)
.\mvnw.cmd spring-boot:run

# Or using Maven directly (if installed)
mvn spring-boot:run
```

✅ The backend will start on: **`http://localhost:8080`**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start for Web browser
npm run web

# Start for Android (requires Android Studio or device)
npm run android

# Start for iOS (requires macOS + Xcode)
npm run ios

# Start with Expo DevTools
npm start
```

✅ The web frontend will be available at: **`http://localhost:3001`**

> **Note:** The frontend API service (`api.js`) is configured to connect to `http://localhost:8080`. If your backend is on a different host or port, update the `BASE_URL` constant in `frontend/api.js`.

---

## 🔐 Authentication & Roles

The system supports two roles:

| Role | Access Level |
|---|---|
| **Admin** | Full access — manage books, members, payments, view analytics |
| **User** | Limited access — browse books, borrow/return, make donations, lottery |

### Default Admin Registration

Use the **Register** screen and the admin will be assigned based on backend role logic. Contact your system admin for initial admin credentials.

### API Endpoints (Auth)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/authenticate` | Login and receive JWT token |
| `POST` | `/api/v1/auth/change-password` | Change account password |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset email |
| `POST` | `/api/v1/auth/reset-password` | Reset password using token |

---

## 📖 Feature Descriptions

### 📚 Book Management (`/api/books`)

Full CRUD operations for the book catalog with rich metadata:

- **Title, subtitle, authors**, ISBN (10 & 13), publisher, edition, language, page count
- **Format**: Hardcover, Paperback, eBook, Audiobook, Magazine, Journal
- **Categorization**: Category, subcategory, genres, tags, reading level & age
- **Inventory**: Total copies, available copies, reserved copies, shelf location
- **Media**: Cover image URL, PDF digital version, preview URL
- **Ratings & Reviews**: Average rating, star counts (1–5), total reviews
- **Engagement**: Total borrows, total views, wishlist count, popularity flags
- **Status**: `AVAILABLE`, `CHECKED_OUT`, `RESERVED`, `COMING_SOON`, `LOST`, `DAMAGED`, `DISCONTINUED`
- **Pricing**: Purchase price, rental price, currency
- **Search** by title, author, ISBN, category, and genre

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books/search?title=...` | Search books |
| `POST` | `/api/books` | Add a new book (Admin) |
| `PUT` | `/api/books/{id}` | Update a book (Admin) |
| `DELETE` | `/api/books/{id}` | Delete a book (Admin) |

---

### 👥 Member Management (`/api/members`)

Manage library members and their membership plans:

- Member profile: name, email, phone, membership expiry
- Assign **Membership Plans** (max books allowed, duration, price)
- View and manage all members (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Create a member |
| `PUT` | `/api/members/{id}` | Update a member |
| `DELETE` | `/api/members/{id}` | Delete a member |
| `GET` | `/api/members/plans` | List membership plans |
| `POST` | `/api/members/{id}/membership/{planId}` | Assign plan to member |

---

### 🔄 Borrow, Return & Renew (`/api/borrow`)

Complete borrowing lifecycle management:

- **Borrow** a book — automatically decrements available copies, records borrow date and due date (14 days default)
- **Return** a book — restores available copies, marks record as RETURNED
- **Renew** a book — extends due date by 7 days (not allowed if overdue)
- **Borrowing limit** enforcement based on membership plan (`maxBooksAllowed`)
- **Overdue detection** — automatically marks records as OVERDUE and calculates fines ($1/day)
- **Email notifications** sent on: borrow confirmation, overdue reminder, renewal confirmation
- **Admin trigger** to manually run overdue checks (`POST /api/borrow/update-overdue`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/borrow` | List all borrow records |
| `POST` | `/api/borrow/{bookId}/{memberId}` | Borrow a book |
| `POST` | `/api/borrow/return/{recordId}` | Return a book |
| `POST` | `/api/borrow/renew/{recordId}` | Renew a loan |
| `POST` | `/api/borrow/update-overdue` | Trigger overdue check (Admin) |

---

### 📅 Reservations (`/api/reservations`)

Reserve unavailable books for future borrowing:

- Members can reserve a book only when **no copies are available**
- Reservations are tracked with status: `PENDING`, `CANCELLED`
- View reservations by book or by member

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reservations/{bookId}/{memberId}` | Reserve a book |
| `GET` | `/api/reservations/book/{bookId}` | Get reservations for a book |

---

### ⭐ Reviews & Ratings (`/api/reviews`)

Community-driven review system:

- Members can write reviews and assign star ratings (1–5) to books
- Book average rating and star-count breakdown updated automatically

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews/book/{bookId}` | Get reviews for a book |
| `POST` | `/api/reviews` | Submit a review |

---

### 💳 Payments (`/api/payments`)

Track and manage all library-related financial transactions:

- **Create Payment Intent** — generates a payment intent ID and client secret (simulated gateway)
- **Confirm Payment** — marks intent as `COMPLETED`, assigns a transaction ID
- **Process Payment** — creates and immediately confirms a payment (one-step)
- Supports payment methods: Card, Cash, Bank Transfer, etc.
- View full payment history with reference numbers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/payments` | List all payments |
| `POST` | `/api/payments` | Process a direct payment |
| `POST` | `/api/payments/create-intent` | Create a payment intent |
| `POST` | `/api/payments/confirm?intentId=` | Confirm a payment intent |

---

### 🎁 Donations (`/api/donations`)

Accept and track monetary donations to the library:

- Record donor name, email, amount, and a personal message
- Automatic **thank-you email** sent to the donor
- Anonymous donations supported (name/email optional)
- View full donation history and totals

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/donations` | List all donations |
| `POST` | `/api/donations` | Record a new donation |

---

### 🎰 Lottery System (`/api/lottery`)

Gamified engagement feature for library members:

- Members can **spin the lottery wheel** to win prizes
- Track spin history and prize redemption
- View available prize catalog
- Admins can configure prizes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/lottery/spins` | Get available spins |
| `POST` | `/api/lottery/spin` | Perform a spin |
| `GET` | `/api/lottery/history` | View spin history |
| `POST` | `/api/lottery/claim/{prizeId}` | Claim a won prize |

---

### 📊 Analytics Dashboard (`/api/stats`)

Real-time admin analytics dashboard with interactive charts:

| Metric | Visualization |
|---|---|
| Total Books, Members, Active Borrows, Donations, Revenue | Stat Cards |
| Top 5 Most Borrowed Books | Bar Chart |
| Trending Books This Week | Horizontal Scroll Cards with Rank Badges |
| Borrowing Trends (Last 6 Months) | Line Chart |
| Books by Category | Pie Chart |
| Top 5 Active Members | Ranked List |
| Revenue by Type (Donations vs Payments) | Pie Chart |
| Monthly Financial Performance | Grouped Bar Chart |
| Recently Added Books | Card List |

---

### 📁 File Uploads (`/api/files`)

Upload and serve book-related files:

- **Cover images** — uploaded and served via the backend
- **PDF digital versions** — upload and link to books for online reading

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/files/upload` | Upload a file (image or PDF) |
| `GET` | `/api/files/{filename}` | Serve an uploaded file |

---

### 🌐 Multilingual Support

The frontend supports **three languages** with seamless toggling from the header:

| Code | Language |
|---|---|
| `en` | English |
| `si` | Sinhala (සිංහල) |
| `ta` | Tamil (தமிழ்) |

Language is switched in real-time via the language toggle button. All UI labels, navigation items, and messages are fully translated.

---

### 🌙 Dark / Light Theme

The app features a full **Dark Mode (default)** and **Light Mode** toggle:

- Dark palette: Deep navy backgrounds (`#0A0E1A`, `#1E293B`) with indigo accents (`#6366F1`)
- Light palette: Clean white surfaces with matching accent colors
- Toggled via the moon/sun icon in the header — preference persists during the session

---

## 🖥️ Screens & UI Components

| Screen | Description |
|---|---|
| **Introduction Screen** | Animated landing screen shown before login |
| **Onboarding Screen** | Feature highlights shown post-login for new users |
| **Login Screen** | Sign in / Register with role-based access |
| **Home Dashboard** | Stats overview, charts, trending books, quick actions |
| **Books Screen** | Browse, search, add, edit, delete books; view details, reviews, reserve |
| **Borrow Screen** | Borrow/return/renew books; view active borrows and fines |
| **Members Screen** | Admin: manage member profiles and membership plans |
| **Donations Screen** | Submit and view donation records |
| **Payments Screen** | Process and view payment transactions |
| **Lottery Screen** | Spin the lottery wheel and view spin history |
| **Lottery Prizes** | Browse available prizes |
| **Search Bar** | Global book search (web header) |
| **Notification Bell** | In-app notification icon with badge count |

---

## 🔒 Security

- All API endpoints (except `/api/v1/auth/**`) require a **JWT Bearer Token** in the `Authorization` header.
- Tokens are issued on login and must be included in every subsequent request.
- Passwords are encrypted using **BCrypt**.
- Role-based access control enforced at the controller layer (`ADMIN` vs `USER`).

---

## 📧 Email Notification Triggers

The system sends automated emails for the following events:

| Trigger | Recipient | Content |
|---|---|---|
| Book borrowed | Member | Book title, borrow date, due date |
| Book overdue | Member | Days overdue, fine amount |
| Book renewed | Member | Book title, new due date |
| Donation received | Donor | Thank-you message, donation amount |

---

## 🧪 Running the Full Application

Open **two separate terminals** and run:

**Terminal 1 — Backend:**
```bash
cd "library management system/backend"
.\mvnw.cmd spring-boot:run
```

**Terminal 2 — Frontend:**
```bash
cd "library management system/frontend"
npm run web
```

Then open your browser at **`http://localhost:3001`**

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|---|---|
| `JAVA_HOME` not set | Set `JAVA_HOME` to your JDK 17 installation path |
| MongoDB connection refused | Ensure MongoDB service is running on port 27017 |
| Frontend can't reach backend | Confirm backend is running on port 8080; check CORS config |
| Email not sending | Verify SMTP credentials and enable Less Secure Apps / App Passwords |
| `expo-barcode-scanner` warning | Requires physical device or emulator; web uses fallback |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then re-run |

---

## 📜 License

This project is for educational and demonstration purposes.

---

## 🙏 Acknowledgements

- [Spring Boot](https://spring.io/projects/spring-boot) — Backend framework
- [MongoDB](https://www.mongodb.com/) — NoSQL database
- [Expo](https://expo.dev/) — React Native development platform
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) — Charts library
- [i18next](https://www.i18next.com/) — Internationalization framework
- [Lottie](https://airbnb.design/lottie/) — Animation library
- [Material Icons](https://fonts.google.com/icons) — Icon set

---

<div align="center">
  <strong>Built with ❤️ by the Library Team</strong>
</div>

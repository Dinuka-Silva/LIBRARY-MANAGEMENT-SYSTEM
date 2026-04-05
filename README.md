# 📚 Smart Library Management System

> **Your Gateway to Infinite Knowledge** — A full-stack, cross-platform library management solution with a modern React Native frontend and a robust Spring Boot backend powered by MongoDB.

![Smart Library System](./screen%20shot/hero_banner.png)

---

## 🌟 Overview

**Smart Library System** is a feature-rich, bilingual library management platform designed for both librarians (admins) and members (users). It provides seamless digital management of books, members, borrowing, reservations, payments, donations, and an interactive lottery reward system — all delivered through a sleek, dark-mode-first UI with multilingual support.

---

## 🚀 Key Features at a Glance

| Category | Features |
|:---|:---|
| **🔐 Authentication** | JWT-secured login, registration, forgot/reset password, role-based access |
| **📖 Inventory** | Full Book CRUD, cover image uploads, PDF previews, digital version management |
| **👥 Membership** | Profile management, membership plans, borrow limits, activity tracking |
| **🔄 Circulation** | Borrow, return, and renew books with automated fine calculation & email alerts |
| **📅 Planning** | Waitlist reservation system for unavailable books |
| **💳 Financials** | Integrated payment system for fines, membership, and one-time donations |
| **🎰 Gamification** | Spin-to-win lottery reward system for active community members |
| **📊 Analytics** | Live admin dashboard with Bar, Line, and Pie charts for trending data |
| **🌐 Globalization** | Fluent UI in English, Sinhala (si), and Tamil (ta) via i18next |
| **📱 Mobility** | Consistent experience across Web, Android, and iOS via Expo |

---

## 📸 Screenshots & UI Experience

| **User Dashboard** | **Book Collection** | **Lottery System** |
|:---:|:---:|:---:|
| ![Dashboard](./screen%20shot/03_dashboard_home.png) | ![Books](./screen%20shot/06_books_screen.png) | ![Lottery](./screen%20shot/08_lottery_screen.png) |

| **Donation Center** | **Branded Checkout** | **Global Search** |
|:---:|:---:|:---:|
| ![Donations](./screen%20shot/10_donations_screen.png) | ![Checkout](./screen%20shot/12_checkout_branding.png) | ![Search](./screen%20shot/05_header_navbar.png) |

---

## 🏗️ Architecture & Tech Stack

### 🔙 Backend
- **Framework:** Spring Boot 3.2.4 (Java 17)
- **Database:** MongoDB (Spring Data MongoDB)
- **Security:** Spring Security + JWT (Stateless)
- **Email:** Spring Boot Mail (SMTP Integration)
- **Storage:** Local filesystem for book covers and PDFs

### 🔜 Frontend
- **Framework:** React Native (Expo ~55.0.6)
- **Styling:** Premium Dark UI with glassmorphic accents
- **Navigation:** Multi-level sidebar & tab navigation
- **Charts:** `react-native-chart-kit`
- **Animations:** Lottie & Expo Linear Gradients
- **i18n:** `i18next` for English, Sinhala, and Tamil support

---

## ⚙️ Project Structure

```bash
library-management-system/
├── backend/                       # Java / Spring Boot Microservice
│   ├── src/main/java/             # Source code (Controllers, Services, Entities)
│   ├── src/main/resources/        # Configuration (application.properties)
│   └── uploads/                   # Media storage for books/PDFs
└── frontend/                      # React Native / Expo Application
    ├── components/                # Modular UI Screen components
    ├── locales/                   # Translation JSONs (en, si, ta)
    ├── App.js                     # Root navigation & state
    └── api.js                     # Centralized Axios service layer
```

---

## 🚀 Quick Start Guide

### 1️⃣ Backend Setup
1. Ensure **MongoDB** is running on `:27017`.
2. Configure `application.properties` in `backend/src/main/resources`.
3. Launch with Maven:
   ```bash
   cd backend
   ./mvnw.cmd spring-boot:run
   ```

### 2️⃣ Frontend Setup
1. Navigate to frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start for your preferred platform:
   ```bash
   npm run web      # Open in browser
   npm run android  # Run on emulator/device
   ```

---

## 📧 Automated Notifications
The system keeps everyone in the loop with automated email triggers:
- ✅ **Borrow Confirmation:** Instant details on your new loan.
- ⚠️ **Overdue Alert:** Automatic fine calculation and reminder.
- 🔄 **Renewal Notice:** Confirmation of extended loan periods.
- ❤️ **Donation Receipt:** A personalized "Thank You" for contributors.

---

## 📜 License & Development
Created for demonstration and educational purposes.  
**Built with ❤️ by the Library Management Team**

---

<div align="center">
  <sub>Modern Library Management — 2026</sub>
</div>

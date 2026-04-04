# Spotify Clone

A full-stack Spotify clone built with React, Express, and PostgreSQL (Neon).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Neon](https://neon.tech/) (PostgreSQL)
- [Cloudinary](https://cloudinary.com/) (For media storage)

---

### 🛠️ Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=2222
   DATABASE_URL=your_neon_db_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. **Run Database Migrations:**
   ```bash
   npm run dbtest  # Verify connection
   node database/run_migrations.js
   ```
5. **Start the server:**
   ```bash
   npm run dev
   ```

---

### 💻 Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_URL=http://localhost:2222/api
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## ✨ Core Features

### 1. **Advanced Content Ecosystem**
- **Multi-Level Music**: Full support for Tracks and Albums with complex relationships (multiple artists per track/album).
- **Podcast Platform**: Dedicated podcast system with series management and episode tracking.
- **Genre System**: Categorization across all media types with theme-based styling.

### 2. **Secure Authentication**
- **Custom JWT Implementation**: Replaced third-party auth with a manual JWT system for full control.
- **Security-First**: Uses HttpOnly cookies for refresh tokens and standard headers for access tokens.

### 3. **Interactive User Features**
- **Smart Search**: Global search across songs, albums, artists, and podcasts.
- **Engagement Tools**: Like songs, follow artists/podcasts, and create custom playlists.
- **Listening History**: Precise tracking of listening progress for resume-play functionality.

### 4. **Dynamic Analytics & Leaderboards**
- **Weighted Trending System**: A custom "Trending" algorithm that calculates points based on recency, plays, and likes.
- **Metrics**: Leaderboards for "Most Liked," "Top Played," and "Least Listening Time."

### 5. **Admin Powerhouse**
- **Full CRUD Suite**: Holistic dashboard for managing every piece of content in the app.
- **Media Lab**: Seamless audio and image processing via Cloudinary integration.

---

## 🛠️ The Technical "Work Behind This"

### **The Backend (Engine Room)**
- **Architecture**: Node.js & Express with a modular route-controller-service pattern.
- **Database**: **Serverless PostgreSQL (Neon)** using Stored Procedures for atomic operations.
- **Media Strategy**: Direct integration with **Cloudinary** for scalable, cloud-based audio and image hosting.

### **The Frontend (Experience Layer)**
- **Framework**: **React** with **Vite** for lightning-fast delivery.
- **State Architecture**: **Zustand** stores for efficient, boilerplate-free state management.
- **Design System**: A premium UI built with **Tailwind CSS** and **Shadcn UI**.


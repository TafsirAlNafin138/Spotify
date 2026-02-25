# Backend-Frontend Connection Guide

## ✅ Connection Status: SUCCESSFUL

Both servers are running and connected:

- **Backend**: `http://localhost:2222` ✅
- **Frontend**: `http://localhost:5173` ✅
- **Database**: Neon PostgreSQL ✅

---

## 🔧 Configuration Summary

### Environment Variables

#### Backend (.env)

```env
PORT = 2222

CLOUDINARY_CLOUD_NAME='dzbantnnc'
CLOUDINARY_API_KEY='631316729954631'
CLOUDINARY_API_SECRET='8ZWqRZ-Xx-iqZHBIHKgtgGdSczo'

# This was inserted by `prisma init`:
# Environment variables declared in this file are NOT automatically loaded by Prisma.
# Please add `import "dotenv/config";` to your `prisma.config.ts` file, or use the Prisma CLI with Bun
# to load environment variables from .env files: https://pris.ly/prisma-config-env-vars.

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL='postgresql://neondb_owner:npg_Owk8vgDjnE2B@ep-lucky-firefly-a1j1og2c-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'


CLERK_PUBLISHABLE_KEY=pk_test_ZG9taW5hbnQtY2xhbS04NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_gCN0zBZsdK206ttGCQBr3Z38rhcpDs68aGQmuWGf8s
ADMIN_EMAIL1=tafsiral21@gmail.com
ADMIN_EMAIL2=afifsiddique.64drmc@gmail.com
CLERK_WEBHOOK_SECRET=whsec_GK7g+aTonnCIMaAdA5jgERwAtWlolxMK


# imp command npx localtunnel --port 2222 --subdomain my-spotify-dev




```

#### Frontend (.env)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZG9taW5hbnQtY2xhbS04NS5jbGVyay5hY2NvdW50cy5kZXYk
VITE_API_URL=http://localhost:2222/api
```

### Axios Configuration

**File**: `Frontend/src/services/axios.js`

```javascript
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:2222/api",
  withCredentials: true,
});
```

### CORS Configuration

**File**: `Backend/server.js`

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
```

---

## 📡 API Endpoints Reference

### Public Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/`                  | Health check        |
| GET    | `/api/albums`        | Get all albums      |
| GET    | `/api/albums/:id`    | Get album by ID     |
| GET    | `/api/tracks`        | Get all tracks      |
| POST   | `/api/auth/callback` | Clerk auth callback |

### Protected Admin Endpoints

All admin endpoints require authentication + admin role:

| Method | Endpoint                   | Description            |
| ------ | -------------------------- | ---------------------- |
| GET    | `/api/admin/check`         | Check if user is admin |
| GET    | `/api/admin/stats`         | Get admin statistics   |
| GET    | `/api/admin/trackscount`   | Get all tracks (admin) |
| GET    | `/api/admin/albumscount`   | Get all albums (admin) |
| GET    | `/api/admin/artistscount`  | Get all artists        |
| GET    | `/api/admin/genrescount`   | Get all genres         |
| GET    | `/api/admin/podcastscount` | Get all podcasts       |
| GET    | `/api/admin/episodescount` | Get all episodes       |
| POST   | `/api/admin/tracks`        | Create new track       |
| DELETE | `/api/admin/tracks/:id`    | Delete track           |
| POST   | `/api/admin/albums`        | Create new album       |
| DELETE | `/api/admin/albums/:id`    | Delete album           |
| POST   | `/api/admin/artists`       | Create new artist      |
| DELETE | `/api/admin/artists/:id`   | Delete artist          |
| POST   | `/api/admin/genres`        | Create new genre       |
| DELETE | `/api/admin/genres/:id`    | Delete genre           |
| POST   | `/api/admin/podcasts`      | Create new podcast     |
| DELETE | `/api/admin/podcasts/:id`  | Delete podcast         |

---

## 🔐 Authentication Flow

1. **User Signs In** via Clerk on frontend
2. **Frontend receives** Clerk token
3. **AuthProvider** (`Frontend/src/providers/AuthProvider.jsx`):
   - Gets token from Clerk
   - Sets token in axios headers
   - Calls `/api/auth/callback` to sync user with backend
4. **Backend** (`Backend/controllers/auth.controller.js`):
   - Receives user data from Clerk
   - Creates or updates user in database
   - Returns user object

### Code Example: Making Authenticated Requests

```javascript
import { axiosInstance } from "@/services/axios";

// The token is automatically added by AuthProvider
const response = await axiosInstance.get("/admin/albumscount");
console.log(response.data);
```

---

## 🎯 Testing the Connection

### Method 1: Browser Console

1. Open `http://localhost:5173` in your browser
2. Sign in with Clerk
3. Open browser console (F12)
4. Look for: `✅ User synced:` message
5. Check for connection test results

### Method 2: Manual API Test

Using PowerShell:

```powershell
# Test backend health
curl http://localhost:2222

# Test albums endpoint
curl http://localhost:2222/api/albums
```

### Method 3: Use Test Utility

The frontend includes a test utility at `src/utils/testConnection.js`:

```javascript
import { runAllTests } from "@/utils/testConnection";

// Run all connection tests
const results = await runAllTests();
```

---

## 🚀 How to Start the Application

### 1. Start Backend

```bash
cd "e:\SPOTIFY PROJECT\Spotify\Backend"
npm run dev
```

Expected output:

```
Server running on port 2222
Connected to Neon DB
```

### 2. Start Frontend

```bash
cd "e:\SPOTIFY PROJECT\Spotify\Frontend"
npm run dev
```

Expected output:

```
VITE v7.3.0  ready in 262 ms
➜  Local:   http://localhost:5173/
```

---

## 📊 Frontend State Management

The app uses **Zustand** stores for state management:

### Music Store

**File**: `Frontend/src/stores/useMusicStore.js`

```javascript
import { useMusicStore } from "@/stores/useMusicStore";

// In your component
const { albums, songs, fetchAlbums, fetchSongs } = useMusicStore();

// Fetch data
useEffect(() => {
  fetchAlbums();
  fetchSongs();
}, []);
```

### Other Stores

- `useAuthStore.js` - Authentication state
- `useArtistStore.js` - Artist data
- `useGenreStore.js` - Genre data
- `usePodcastStore.js` - Podcast data

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Symptom**: Browser console shows CORS policy error

**Solution**:

1. Ensure backend is running on port 2222
2. Check CORS config in `Backend/server.js`:
   ```javascript
   app.use(
     cors({
       origin: "http://localhost:5173",
       credentials: true,
     }),
   );
   ```

### Issue: 401 Unauthorized

**Symptom**: API requests return 401 status

**Solution**:

1. Make sure you're signed in via Clerk
2. Check that AuthProvider is wrapping your app in `main.jsx`
3. Verify token is being set in axios headers

### Issue: Connection Refused

**Symptom**: `ECONNREFUSED` error

**Solution**:

1. Verify backend is running: `curl http://localhost:2222`
2. Check if port 2222 is available
3. Restart backend server

### Issue: Environment Variables Not Loading

**Symptom**: API calls go to wrong URL

**Solution**:

1. **Restart Vite dev server** after changing `.env`
2. Verify `.env` is in root of Frontend folder
3. Check variable names start with `VITE_`

---

## 📝 Key Files Reference

### Backend

- `server.js` - Main server file, middleware, CORS
- `routes/auth.route.js` - Auth endpoints
- `routes/admin.route.js` - Admin endpoints
- `routes/album.route.js` - Album endpoints
- `routes/tracks.route.js` - Track endpoints
- `controllers/auth.controller.js` - Auth logic
- `middleware/auth.middleware.js` - Auth middleware

### Frontend

- `main.jsx` - App entry point
- `App.jsx` - Main app component
- `providers/AuthProvider.jsx` - Auth provider with token management
- `services/axios.js` - Axios instance configuration
- `services/api.js` - API helper functions
- `stores/useMusicStore.js` - Music state management
- `utils/testConnection.js` - Connection testing utility

---

## ✨ Next Steps

1. ✅ Both servers are running
2. ✅ Connection is configured
3. ✅ Authentication flow is set up
4. ✅ Test utility created

**Recommended Actions:**

1. Sign in to the app and verify user sync
2. Test fetching albums/songs
3. Test admin features (if you have admin access)
4. Monitor browser console for any errors

---

## 🔍 Connection Verification Checklist

- [✅] Backend running on port 2222
- [✅] Frontend running on port 5173
- [✅] Database connected (Neon PostgreSQL)
- [✅] CORS configured for localhost:5173
- [✅] Axios baseURL set to http://localhost:2222/api
- [✅] Environment variables configured
- [✅] AuthProvider integrated
- [✅] Test utilities created
- [✅] Stores using axiosInstance
- [✅] withCredentials enabled

**Status**: 🟢 **ALL SYSTEMS OPERATIONAL**

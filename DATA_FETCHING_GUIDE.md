# 📊 Data Fetching Guide - Frontend to Backend

Complete guide on how to fetch data from your backend API in the Spotify Clone project.

---

## 🎯 Table of Contents

1. [Quick Start](#quick-start)
2. [Custom Hooks](#custom-hooks)
3. [Component Examples](#component-examples)
4. [Advanced Patterns](#advanced-patterns)
5. [API Response Formats](#api-response-formats)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Method 1: Using Custom Hooks (Recommended)

```javascript
import { useAlbums } from "@/hooks/useAlbums";

function MyComponent() {
  const { albums, loading, error, refetch } = useAlbums();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {albums.map((album) => (
        <div key={album.id}>{album.title}</div>
      ))}
    </div>
  );
}
```

### Method 2: Using Generic useFetch Hook

```javascript
import { useFetch } from "@/hooks/useFetch";

function MyComponent() {
  const { data: albums, loading, error } = useFetch("/albums");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {albums?.map((album) => (
        <div key={album.id}>{album.title}</div>
      ))}
    </div>
  );
}
```

### Method 3: Direct Axios Call

```javascript
import { axiosInstance } from "@/services/axios";
import { useState, useEffect } from "react";

function MyComponent() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axiosInstance.get("/albums");
        setAlbums(response.data.data || response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return <div>{/* Render albums */}</div>;
}
```

---

## 🪝 Custom Hooks

### Available Hooks

| Hook                 | File                 | Purpose                        |
| -------------------- | -------------------- | ------------------------------ |
| `useAlbums()`        | `hooks/useAlbums.js` | Fetch all albums               |
| `useAlbum(id)`       | `hooks/useAlbums.js` | Fetch single album with tracks |
| `useTrendingSongs()` | `hooks/useTracks.js` | Fetch trending songs           |
| `useNewReleases()`   | `hooks/useTracks.js` | Fetch new releases             |
| `useMadeForYou()`    | `hooks/useTracks.js` | Fetch personalized tracks      |
| `useAllTracks()`     | `hooks/useTracks.js` | Fetch all tracks (admin)       |
| `useFetch(url)`      | `hooks/useFetch.js`  | Generic fetch hook             |
| `usePost(url)`       | `hooks/useFetch.js`  | Generic POST hook              |
| `useDelete()`        | `hooks/useFetch.js`  | Generic DELETE hook            |

### 1. useAlbums Hook

**Fetches all albums from the backend**

```javascript
import { useAlbums } from "@/hooks/useAlbums";

function AlbumsPage() {
  const { albums, loading, error, refetch } = useAlbums();

  return (
    <div>
      <button onClick={refetch}>Refresh Albums</button>

      {loading && <div>Loading albums...</div>}
      {error && <div>Error: {error}</div>}

      {albums.map((album) => (
        <div key={album.id}>
          <img src={album.image_url} alt={album.title} />
          <h3>{album.title}</h3>
          <p>{album.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. useAlbum Hook

**Fetches a single album with its tracks**

```javascript
import { useAlbum } from "@/hooks/useAlbums";
import { useParams } from "react-router-dom";

function AlbumDetails() {
  const { id } = useParams();
  const { album, tracks, loading, error } = useAlbum(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{album.title}</h1>
      <img src={album.image_url} alt={album.title} />

      <h2>Tracks</h2>
      {tracks.map((track) => (
        <div key={track.id}>
          {track.title} - {track.duration}
        </div>
      ))}
    </div>
  );
}
```

### 3. useTrendingSongs Hook

```javascript
import { useTrendingSongs } from "@/hooks/useTracks";

function TrendingSection() {
  const { tracks, loading, error } = useTrendingSongs();

  return (
    <div>
      <h2>Trending Now 🔥</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        tracks.map((track) => <div key={track.id}>{track.title}</div>)
      )}
    </div>
  );
}
```

### 4. useFetch Hook (Generic)

**Most flexible - use for any endpoint**

```javascript
import { useFetch } from "@/hooks/useFetch";

// Basic usage
function Component1() {
  const { data, loading, error } = useFetch("/albums");
  // ...
}

// With options
function Component2() {
  const { data: stats, loading } = useFetch("/admin/stats", {
    immediate: true, // fetch on mount (default: true)
    errorMessage: "Failed to load stats",
    showErrorToast: true,
    onSuccess: (data) => {
      console.log("Stats loaded:", data);
    },
  });
  // ...
}

// Conditional fetch
function Component3({ userId }) {
  const { data: user, loading } = useFetch(userId ? `/users/${userId}` : null, {
    immediate: !!userId,
  });
  // Only fetches when userId is available
}
```

### 5. usePost Hook (For Creating Data)

```javascript
import { usePost } from "@/hooks/useFetch";

function CreateSongForm() {
  const { mutate: createSong, loading } = usePost("/admin/tracks", {
    successMessage: "Song created successfully!",
    errorMessage: "Failed to create song",
    onSuccess: (newSong) => {
      console.log("Created:", newSong);
      // Maybe navigate or refetch list
    },
  });

  const handleSubmit = async (formData) => {
    const result = await createSong({
      title: formData.title,
      artist: formData.artist,
      duration: formData.duration,
      // ... other fields
    });

    if (result) {
      // Success!
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 6. useDelete Hook

```javascript
import { useDelete } from "@/hooks/useFetch";
import { useAlbums } from "@/hooks/useAlbums";

function AlbumsList() {
  const { albums, refetch } = useAlbums();
  const { deleteItem, loading: deleting } = useDelete({
    successMessage: "Album deleted!",
    onSuccess: () => refetch(), // Refresh the list
  });

  const handleDelete = async (albumId) => {
    const confirmed = window.confirm("Delete this album?");
    if (confirmed) {
      await deleteItem(`/admin/albums/${albumId}`);
    }
  };

  return (
    <div>
      {albums.map((album) => (
        <div key={album.id}>
          {album.title}
          <button onClick={() => handleDelete(album.id)} disabled={deleting}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📦 Component Examples

### Example 1: Display Albums with Loading State

```javascript
import React from "react";
import { useAlbums } from "@/hooks/useAlbums";
import AlbumItem from "./AlbumItem";

function FeaturedAlbums() {
  const { albums, loading, error, refetch } = useAlbums();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading albums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load albums</div>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">No albums available</div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mt-6 mb-4">Featured Albums</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {albums.map((album) => (
          <AlbumItem
            key={album.id}
            image={album.image_url}
            name={album.title}
            desc={album.description}
            id={album.id}
          />
        ))}
      </div>
    </div>
  );
}

export default FeaturedAlbums;
```

### Example 2: Search with Dynamic Fetching

```javascript
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";

function SearchBar() {
  const [query, setQuery] = useState("");

  const { data: results, loading } = useFetch(
    query ? `/search?q=${query}` : null,
    {
      immediate: false,
      showErrorToast: false,
    },
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {loading && <div>Searching...</div>}

      {results?.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Example 3: Pagination

```javascript
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";

function PaginatedList() {
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(`/albums?page=${page}&limit=20`);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {data?.results.map((item) => (
            <div key={item.id}>{item.title}</div>
          ))}

          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </>
      )}
    </div>
  );
}
```

---

## 🔄 Advanced Patterns

### Pattern 1: Parallel Fetching

```javascript
import { useAlbums } from "@/hooks/useAlbums";
import { useTrendingSongs } from "@/hooks/useTracks";

function Dashboard() {
  const { albums, loading: albumsLoading } = useAlbums();
  const { tracks, loading: tracksLoading } = useTrendingSongs();

  const loading = albumsLoading || tracksLoading;

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <section>
        <h2>Albums ({albums.length})</h2>
        {/* Render albums */}
      </section>

      <section>
        <h2>Trending Songs ({tracks.length})</h2>
        {/* Render tracks */}
      </section>
    </div>
  );
}
```

### Pattern 2: Dependent Fetching

```javascript
import { useFetch } from "@/hooks/useFetch";

function UserProfile({ userId }) {
  // First fetch user
  const { data: user, loading: userLoading } = useFetch(`/users/${userId}`);

  // Then fetch user's playlists (only when user is loaded)
  const { data: playlists, loading: playlistsLoading } = useFetch(
    user ? `/users/${userId}/playlists` : null,
    { immediate: !!user },
  );

  if (userLoading) return <div>Loading user...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>

      {playlistsLoading ? (
        <div>Loading playlists...</div>
      ) : (
        <div>{playlists?.length} playlists</div>
      )}
    </div>
  );
}
```

### Pattern 3: Optimistic Updates

```javascript
import { useDelete } from "@/hooks/useFetch";
import { useAlbums } from "@/hooks/useAlbums";

function AlbumList() {
  const { albums, setAlbums } = useAlbums();

  const { deleteItem } = useDelete({
    showSuccessToast: true,
    onError: () => {
      // Revert optimistic update on error
      refetch();
    },
  });

  const handleDelete = async (albumId) => {
    // Optimistically update UI
    const previousAlbums = albums;
    setAlbums(albums.filter((a) => a.id !== albumId));

    // Attempt delete
    const success = await deleteItem(`/admin/albums/${albumId}`);

    if (!success) {
      // Revert on failure
      setAlbums(previousAlbums);
    }
  };

  return (
    <div>
      {albums.map((album) => (
        <div key={album.id}>
          {album.title}
          <button onClick={() => handleDelete(album.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📄 API Response Formats

Your backend uses the `ApiResponse` class which returns:

```javascript
{
  "statusCode": 200,
  "data": [ /* actual data */ ],
  "message": "Success message"
}
```

### Handling in Components

The custom hooks automatically extract the `data` property:

```javascript
// Backend returns:
{
  "statusCode": 200,
  "data": [{ id: 1, title: "Album 1" }],
  "message": "Albums fetched successfully"
}

// Hook gives you:
const { albums } = useAlbums();
// albums = [{ id: 1, title: "Album 1" }]
```

### Manual Handling

If using axios directly:

```javascript
const response = await axiosInstance.get("/albums");

// Extract data
const albums = response.data.data || response.data;
```

---

## ⚠️ Error Handling

### Hook-Level Error Handling

```javascript
const { data, loading, error } = useFetch("/albums", {
  errorMessage: "Failed to load albums",
  showErrorToast: true,
  onError: (err) => {
    console.error("Custom error handler:", err);
    // Maybe send to error tracking service
  },
});

if (error) {
  return <div>Error: {error}</div>;
}
```

### Try-Catch with Axios

```javascript
try {
  const response = await axiosInstance.get("/albums");
  setAlbums(response.data.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error("Status:", error.response.status);
    console.error("Message:", error.response.data.message);
  } else if (error.request) {
    // Request made but no response
    console.error("No response from server");
  } else {
    // Other errors
    console.error("Error:", error.message);
  }
}
```

### Global Error Interceptor

Already set up in axios if you want to add one:

```javascript
// In services/axios.js
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  },
);
```

---

## ✅ Best Practices

### 1. Use Custom Hooks for Common Data

✅ **Good:**

```javascript
const { albums, loading } = useAlbums();
```

❌ **Avoid:**

```javascript
// Don't repeat the same fetch logic everywhere
const [albums, setAlbums] = useState([]);
useEffect(() => {
  axiosInstance.get('/albums').then(...)
}, []);
```

### 2. Handle All States

```javascript
function Component() {
  const { data, loading, error } = useFetch("/albums");

  // ✅ Handle loading
  if (loading) return <LoadingSpinner />;

  // ✅ Handle error
  if (error) return <ErrorMessage error={error} />;

  // ✅ Handle empty
  if (!data || data.length === 0) return <EmptyState />;

  // ✅ Handle success
  return <DataDisplay data={data} />;
}
```

### 3. Memo expensive computations

```javascript
import { useMemo } from "react";

function Component() {
  const { albums } = useAlbums();

  const sortedAlbums = useMemo(() => {
    return albums.sort((a, b) => a.title.localeCompare(b.title));
  }, [albums]);

  return <div>{/* render sortedAlbums */}</div>;
}
```

### 4. Cleanup on Unmount

```javascript
useEffect(() => {
  const controller = new AbortController();

  axiosInstance
    .get("/albums", {
      signal: controller.signal,
    })
    .then(/* ... */);

  return () => {
    controller.abort(); // Cancel request on unmount
  };
}, []);
```

### 5. Use Loading Skeletons

```javascript
function AlbumGrid() {
  const { albums, loading } = useAlbums();

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}
```

---

## 🎓 Summary

### Quick Reference

| Task                 | What to Use                      |
| -------------------- | -------------------------------- |
| Fetch albums         | `useAlbums()`                    |
| Fetch single album   | `useAlbum(id)`                   |
| Fetch trending songs | `useTrendingSongs()`             |
| Fetch any endpoint   | `useFetch('/endpoint')`          |
| Create data          | `usePost('/endpoint')`           |
| Delete data          | `useDelete()`                    |
| Manual request       | `axiosInstance.get('/endpoint')` |

### Common Endpoints

| Endpoint                   | Method | Description       | Auth Required |
| -------------------------- | ------ | ----------------- | ------------- |
| `/api/albums`              | GET    | All albums        | No            |
| `/api/albums/:id`          | GET    | Album with tracks | No            |
| `/api/tracks/trending`     | GET    | Trending songs    | Yes           |
| `/api/tracks/new-releases` | GET    | New releases      | Yes           |
| `/api/tracks/made-for-you` | GET    | Personalized      | Yes           |
| `/api/admin/stats`         | GET    | Admin stats       | Admin         |
| `/api/admin/tracks`        | POST   | Create track      | Admin         |
| `/api/admin/tracks/:id`    | DELETE | Delete track      | Admin         |

---

## 🔗 Related Files

- `Frontend/src/hooks/useAlbums.js` - Album hooks
- `Frontend/src/hooks/useTracks.js` - Track hooks
- `Frontend/src/hooks/useFetch.js` - Generic hooks
- `Frontend/src/services/axios.js` - Axios configuration
- `Frontend/src/components/displayhome.jsx` - Example component
- `Backend/controllers/album.controller.js` - Backend album controller
- `Backend/controllers/tracks.controller.js` - Backend tracks controller

---

**Happy Coding! 🚀**

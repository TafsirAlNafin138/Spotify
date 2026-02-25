# 🚀 Data Fetching Cheat Sheet

Quick reference for fetching data from backend to frontend.

---

## 📝 Quick Examples

### 1. Fetch Albums

```javascript
import { useAlbums } from "@/hooks/useAlbums";

function MyComponent() {
  const { albums, loading, error, refetch } = useAlbums();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return albums.map((album) => <div key={album.id}>{album.title}</div>);
}
```

### 2. Fetch Single Album

```javascript
import { useAlbum } from "@/hooks/useAlbums";

function AlbumPage({ albumId }) {
  const { album, tracks, loading } = useAlbum(albumId);
  // album: album details
  // tracks: array of tracks in the album
}
```

### 3. Fetch Trending Songs

```javascript
import { useTrendingSongs } from "@/hooks/useTracks";

function Trending() {
  const { tracks, loading } = useTrendingSongs();
  return tracks.map((t) => <div key={t.id}>{t.title}</div>);
}
```

### 4. Fetch Any Endpoint

```javascript
import { useFetch } from "@/hooks/useFetch";

function Custom() {
  const { data, loading, error } = useFetch("/any/endpoint");
}
```

### 5. Create Data (POST)

```javascript
import { usePost } from "@/hooks/useFetch";

function CreateForm() {
  const { mutate, loading } = usePost("/admin/tracks");

  const handleSubmit = async (data) => {
    await mutate(data);
  };
}
```

### 6. Delete Data

```javascript
import { useDelete } from "@/hooks/useFetch";

function DeleteButton({ id }) {
  const { deleteItem, loading } = useDelete();

  const handleDelete = () => {
    deleteItem(`/admin/tracks/${id}`);
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## 🎣 Available Hooks

| Hook                 | Import              | Returns                               |
| -------------------- | ------------------- | ------------------------------------- |
| `useAlbums()`        | `@/hooks/useAlbums` | `{ albums, loading, error, refetch }` |
| `useAlbum(id)`       | `@/hooks/useAlbums` | `{ album, tracks, loading, error }`   |
| `useTrendingSongs()` | `@/hooks/useTracks` | `{ tracks, loading, error }`          |
| `useNewReleases()`   | `@/hooks/useTracks` | `{ tracks, loading, error }`          |
| `useMadeForYou()`    | `@/hooks/useTracks` | `{ tracks, loading, error }`          |
| `useFetch(url)`      | `@/hooks/useFetch`  | `{ data, loading, error, refetch }`   |
| `usePost(url)`       | `@/hooks/useFetch`  | `{ mutate, loading, error, data }`    |
| `useDelete()`        | `@/hooks/useFetch`  | `{ deleteItem, loading, error }`      |

---

## 🌐 API Endpoints

| Endpoint                   | Method | Description              |
| -------------------------- | ------ | ------------------------ |
| `/api/albums`              | GET    | All albums               |
| `/api/albums/:id`          | GET    | Single album with tracks |
| `/api/tracks/trending`     | GET    | Trending songs           |
| `/api/tracks/new-releases` | GET    | New releases             |
| `/api/tracks/made-for-you` | GET    | Personalized songs       |
| `/api/admin/stats`         | GET    | Admin statistics         |
| `/api/admin/tracks`        | GET    | All tracks (admin)       |
| `/api/admin/tracks`        | POST   | Create track (admin)     |
| `/api/admin/tracks/:id`    | DELETE | Delete track (admin)     |

---

## 💡 Common Patterns

### Loading State

```javascript
{
  loading ? <Spinner /> : <Content data={data} />;
}
```

### Error State

```javascript
{
  error && <div className="text-red-500">Error: {error}</div>;
}
```

### Empty State

```javascript
{
  data.length === 0 && <div>No items found</div>;
}
```

### Complete Pattern

```javascript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataDisplay data={data} />;
```

---

## 🔧 Direct Axios Usage

```javascript
import { axiosInstance } from "@/services/axios";

// GET
const response = await axiosInstance.get("/albums");
const albums = response.data.data;

// POST
const response = await axiosInstance.post("/admin/tracks", {
  title: "Song Name",
  artist: "Artist",
});

// DELETE
await axiosInstance.delete("/admin/tracks/123");

// PUT
await axiosInstance.put("/admin/tracks/123", { title: "New Title" });
```

---

## 📊 Data Formats

### Album Object

```javascript
{
  id: "uuid",
  title: "Album Name",
  description: "Description",
  image_url: "https://...",
  artist: "Artist Name",
  artistId: "uuid",
  created_at: "2024-01-01"
}
```

### Track Object

```javascript
{
  id: "uuid",
  title: "Track Name",
  artist: "Artist Name",
  duration: "3:45",
  image_url: "https://...",
  album_id: "uuid",
  audio_url: "https://..."
}
```

---

## ⚡ Pro Tips

1. **Always handle loading and error states**
2. **Use custom hooks for common data (albums, tracks)**
3. **Use generic `useFetch` for one-off endpoints**
4. **Memoize expensive computations** with `useMemo`
5. **Refetch after mutations** to keep data fresh
6. **Show loading skeletons** instead of plain "Loading..."

---

## 🎯 Real-World Example

```javascript
import { useAlbums } from "@/hooks/useAlbums";
import { useDelete } from "@/hooks/useFetch";

function AlbumManager() {
  const { albums, loading, refetch } = useAlbums();
  const { deleteItem, loading: deleting } = useDelete({
    successMessage: "Album deleted!",
    onSuccess: refetch,
  });

  const handleDelete = async (id) => {
    if (confirm("Delete this album?")) {
      await deleteItem(`/admin/albums/${id}`);
    }
  };

  if (loading) return <div>Loading albums...</div>;

  return (
    <div>
      {albums.map((album) => (
        <div key={album.id} className="flex justify-between">
          <div>
            <h3>{album.title}</h3>
            <p>{album.artist}</p>
          </div>
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

## 📚 Full Documentation

See `DATA_FETCHING_GUIDE.md` for complete documentation.

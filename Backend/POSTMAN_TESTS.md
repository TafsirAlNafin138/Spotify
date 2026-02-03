# Spotify Backend API Test Guide

Use this guide to verify your API endpoints using Postman.

## Authentication
All `/api/admin/*` routes require Authentication **AND** Admin privileges.
1. Obtain a JWT Token from your Frontend (Clerk) or use a testing token if you have disabled auth for testing.
2. In Postman, go to **Headers** and add:
   - Key: `Authorization`
   - Value: `Bearer <YOUR_CLERK_TOKEN>`

---

## 1. Admin: Create Genre
**Endpoint:** `POST http://localhost:5000/api/admin/genres`
**Type:** `JSON`
**Body:**
```json
{
  "name": "Pop"
}
```

## 2. Admin: Create Artist
**Endpoint:** `POST http://localhost:5000/api/admin/artists`
**Type:** `form-data`
**Body:**
| Key | Value | Type |
|---|---|---|
| `name` | `Taylor Swift` | Text |
| `bio` | `American singer-songwriter.` | Text |
| `imageFile` | [Select an image file] | File |

## 3. Admin: Create Album
**Endpoint:** `POST http://localhost:5000/api/admin/albums`
**Type:** `form-data`
**Body:**
| Key | Value | Type | Description |
|---|---|---|---|
| `name` | `1989` | Text | Album Name |
| `imageFile` | [Select an image file] | File | Cover Image |
| `artists` | `[{"id": 1, "is_primary": true}]` | Text | JSON Array of Artist IDs (Use ID from Step 2) |
| `genres` | `[{"id": 1}]` | Text | JSON Array of Genre IDs (Use ID from Step 1) |

> **Note:** Replace `1` with the actual **ID** returned from the previous steps.

## 4. Admin: Create Track (Song)
**Endpoint:** `POST http://localhost:5000/api/admin/tracks`
**Type:** `form-data`
**Body:**
| Key | Value | Type | Description |
|---|---|---|---|
| `name` | `Blank Space` | Text | Song Title |
| `duration` | `231` | Text | Duration in seconds |
| `album_id` | `1` | Text | Album ID (Use ID from Step 3) |
| `track_number` | `1` | Text | Number on album |
| `is_explicit` | `false` | Text | Explicit flag |
| `audio` | [Select audio file] | File | The MP3 file |
| `imageFile` | [Select an image file] | File | Cover Image |
| `artists` | `[{"id": 1, "role": "Vocalist"}]` | Text | JSON Array of Artist IDs |
| `genres` | `[{"id": 1}]` | Text | JSON Array of Genre IDs |

## 5. Admin: Create Podcast
**Endpoint:** `POST http://localhost:5000/api/admin/podcasts`
**Type:** `form-data`
**Body:**
| Key | Value | Type |
|---|---|---|
| `title` | `Tech Talk` | Text |
| `description` | `Latest tech news` | Text |
| `host` | `John Doe` | Text |
| `imageFile` | [Select image file] | File |

## 6. Admin: Upload Podcast Episode
**Endpoint:** `POST http://localhost:5000/api/admin/podcasts/:id/episodes`
**Type:** `form-data`
**Body:**
| Key | Value | Type |
|---|---|---|
| `title` | `Episode 1: AI` | Text |
| `description` | `Deep dive into AI` | Text |
| `duration` | `1200` | Text | Second |
| `podcast_id` | `1` | Text | Podcast ID from Step 5 |
| `audioFile` | [Select audio file] | File | The Episode Audio |

---

## 7. Public: Get All Tracks
**Endpoint:** `GET http://localhost:5000/api/tracks`

## 8. Public: Get All Albums
**Endpoint:** `GET http://localhost:5000/api/albums`

## 9. Admin: Get Stats
**Endpoint:** `GET http://localhost:5000/api/stats`
(Requires Admin Auth)

---

## 10. Update/Delete Operations
*   **Delete Song:** `DELETE http://localhost:5000/api/admin/tracks/:id`
*   **Delete Album:** `DELETE http://localhost:5000/api/admin/albums/:id`
*   **Update Artist:** `PUT http://localhost:5000/api/admin/artists/:id` (JSON Body)

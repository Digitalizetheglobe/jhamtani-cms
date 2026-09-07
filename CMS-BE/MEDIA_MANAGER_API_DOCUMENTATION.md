# Media Manager API Documentation

This document provides comprehensive information about the Media Manager APIs for the Rising CMS Backend.

## Overview

The Media Manager consists of three main modules:
1. **Gallery Photos** - Manage photo gallery with active/inactive status
2. **Video Uploads** - Manage video content with active/inactive status
3. **Happy Clients** - Manage client testimonials with photos and active/inactive status

---

## 1. Gallery Photos API

### Base URL: `/api/gallery-photos`

#### GET `/api/gallery-photos`
Get all gallery photos with pagination and filtering.

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `category` (string, optional): Filter by category
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response:**
```json
{
  "photos": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "altText": "string",
      "category": "string",
      "tags": ["string"],
      "isActive": true,
      "order": 0,
      "uploadedBy": "string",
      "fileSize": 123456,
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

#### GET `/api/gallery-photos/:id`
Get a single gallery photo by ID.

**Response:**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "altText": "string",
  "category": "string",
  "tags": ["string"],
  "isActive": true,
  "order": 0,
  "uploadedBy": "string",
  "fileSize": 123456,
  "dimensions": {
    "width": 1920,
    "height": 1080
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST `/api/gallery-photos`
Create a new gallery photo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file, optional): Image file (JPEG, PNG, GIF, WebP, max 10MB)
- `title` (string, optional): Photo title
- `description` (string, optional): Photo description
- `altText` (string, optional): Alt text for accessibility
- `category` (string, optional): Photo category
- `tags` (string, optional): Comma-separated tags
- `isActive` (boolean, optional): Active status (default: true)
- `order` (number, optional): Display order (default: 0)
- `uploadedBy` (string, optional): Uploader name
- `width` (number, optional): Image width
- `height` (number, optional): Image height

**Response:** Created photo object

#### PUT `/api/gallery-photos/:id`
Update an existing gallery photo.

**Content-Type:** `multipart/form-data`

**Form Data:** Same as POST (all fields optional except image)

**Response:** Updated photo object

#### DELETE `/api/gallery-photos/:id`
Delete a gallery photo.

**Response:**
```json
{
  "message": "Gallery photo deleted successfully"
}
```

#### PATCH `/api/gallery-photos/:id/toggle-status`
Toggle the active status of a gallery photo.

**Response:** Updated photo object with toggled status

---

## 2. Video Uploads API

### Base URL: `/api/video-uploads`

#### GET `/api/video-uploads`
Get all video uploads with pagination and filtering.

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `category` (string, optional): Filter by category
- `isPublic` (boolean, optional): Filter by public status
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response:**
```json
{
  "videos": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "duration": 120,
      "fileSize": 12345678,
      "format": "video/mp4",
      "resolution": "1920x1080",
      "category": "string",
      "tags": ["string"],
      "isActive": true,
      "order": 0,
      "uploadedBy": "string",
      "views": 0,
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

#### GET `/api/video-uploads/:id`
Get a single video upload by ID (increments view count).

**Response:** Video object (same structure as above)

#### POST `/api/video-uploads`
Create a new video upload.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `video` (file, optional): Video file (MP4, AVI, MOV, WMV, FLV, WebM, max 500MB)
- `title` (string, optional): Video title
- `description` (string, optional): Video description
- `thumbnailUrl` (string, optional): Thumbnail URL
- `duration` (number, optional): Video duration in seconds
- `format` (string, optional): Video format
- `resolution` (string, optional): Video resolution
- `category` (string, optional): Video category
- `tags` (string, optional): Comma-separated tags
- `isActive` (boolean, optional): Active status (default: true)
- `order` (number, optional): Display order (default: 0)
- `uploadedBy` (string, optional): Uploader name
- `isPublic` (boolean, optional): Public status (default: true)

**Response:** Created video object

#### PUT `/api/video-uploads/:id`
Update an existing video upload.

**Content-Type:** `multipart/form-data`

**Form Data:** Same as POST (all fields optional except video)

**Response:** Updated video object

#### DELETE `/api/video-uploads/:id`
Delete a video upload.

**Response:**
```json
{
  "message": "Video upload deleted successfully"
}
```

#### PATCH `/api/video-uploads/:id/toggle-status`
Toggle the active status of a video upload.

**Response:** Updated video object with toggled status

#### PATCH `/api/video-uploads/:id/toggle-public`
Toggle the public status of a video upload.

**Response:** Updated video object with toggled public status

---

## 3. Happy Clients API

### Base URL: `/api/happy-clients`

#### GET `/api/happy-clients`
Get all happy clients with pagination and filtering.

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `category` (string, optional): Filter by category
- `featured` (boolean, optional): Filter by featured status
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response:**
```json
{
  "clients": [
    {
      "_id": "string",
             "name": "string",
       "company": "string",
       "position": "string",
       "photoUrl": "string",
       "postRedirect": "string",
       "rating": 5,
      "website": "string",
      "email": "string",
      "phone": "string",
      "category": "string",
      "tags": ["string"],
      "isActive": true,
      "order": 0,
      "featured": false,
      "socialLinks": {
        "linkedin": "string",
        "twitter": "string",
        "facebook": "string"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

#### GET `/api/happy-clients/:id`
Get a single happy client by ID.

**Response:** Client object (same structure as above)

#### POST `/api/happy-clients`
Create a new happy client.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photo` (file, optional): Client photo (JPEG, PNG, GIF, WebP, max 5MB)
- `name` (string, optional): Client name
- `company` (string, optional): Company name
- `position` (string, optional): Job position
- `postRedirect` (string, optional): Post redirect URL
- `rating` (number, optional): Rating (1-5)
- `website` (string, optional): Website URL
- `email` (string, optional): Email address
- `phone` (string, optional): Phone number
- `category` (string, optional): Client category
- `tags` (string, optional): Comma-separated tags
- `isActive` (boolean, optional): Active status (default: true)
- `order` (number, optional): Display order (default: 0)
- `featured` (boolean, optional): Featured status (default: false)
- `linkedin` (string, optional): LinkedIn URL
- `twitter` (string, optional): Twitter URL
- `facebook` (string, optional): Facebook URL

**Response:** Created client object

#### PUT `/api/happy-clients/:id`
Update an existing happy client.

**Content-Type:** `multipart/form-data`

**Form Data:** Same as POST (all fields optional except photo)

**Response:** Updated client object

#### DELETE `/api/happy-clients/:id`
Delete a happy client.

**Response:**
```json
{
  "message": "Happy client deleted successfully"
}
```

#### PATCH `/api/happy-clients/:id/toggle-status`
Toggle the active status of a happy client.

**Response:** Updated client object with toggled status

#### PATCH `/api/happy-clients/:id/toggle-featured`
Toggle the featured status of a happy client.

**Response:** Updated client object with toggled featured status

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "File upload error",
  "error": "File too large"
}
```

### 404 Not Found
```json
{
  "message": "Gallery photo not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

---

## File Upload Limits

- **Gallery Photos**: 10MB max, formats: JPEG, PNG, GIF, WebP
- **Video Uploads**: 500MB max, formats: MP4, AVI, MOV, WMV, FLV, WebM
- **Happy Client Photos**: 5MB max, formats: JPEG, PNG, GIF, WebP

---

## Usage Examples

### Upload a Gallery Photo
```bash
curl -X POST https://api.risingspaces.in/api/gallery-photos \
  -F "image=@photo.jpg" \
  -F "title=Beautiful Sunset" \
  -F "description=A stunning sunset view" \
  -F "category=nature" \
  -F "tags=sunset,nature,beautiful" \
  -F "isActive=true"
```

### Create a Video Upload
```bash
curl -X POST https://api.risingspaces.in/api/video-uploads \
  -F "video=@presentation.mp4" \
  -F "title=Product Demo" \
  -F "description=Product demonstration video" \
  -F "category=marketing" \
  -F "isActive=true" \
  -F "isPublic=true"
```

### Add a Happy Client
```bash
curl -X POST https://api.risingspaces.in/api/happy-clients \
  -F "photo=@client.jpg" \
  -F "name=John Doe" \
  -F "company=Tech Corp" \
  -F "position=CEO" \
  -F "postRedirect=https://example.com/redirect" \
  -F "rating=5" \
  -F "isActive=true" \
  -F "featured=true"
```

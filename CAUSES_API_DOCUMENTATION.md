# Causes System API Documentation

The causes system allows organizations to create and manage causes (campaigns/programs) with associated lectures, documents, and enrollments.

## Overview

### New Models Added:
- **Cause**: Main cause entity with visibility, verification requirements
- **CauseEnrollment**: User enrollment in causes with verification workflow
- **CauseLecture**: Lectures specific to causes (live/recorded/hybrid)
- **LectureDocument**: Documents attached to cause lectures
- **CauseLectureEnrollment**: User enrollment in cause lectures with progress tracking

### Key Features:
- **Privacy Control**: Public/Private causes
- **Enrollment Management**: Optional enrollment keys and verification
- **Lecture Types**: Live streaming, recorded content, hybrid lectures
- **Document Management**: PDF, presentations, videos, and other file types
- **Permission System**: Presidents and higher roles can edit causes
- **Progress Tracking**: Watch time and completion tracking

## API Endpoints

### Cause Management

#### Create Cause
```
POST /api/causes
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

**Request Body:**
```json
{
  "title": "Climate Action Initiative",
  "description": "Join us in fighting climate change through technology",
  "content": "This cause focuses on developing sustainable technology solutions...",
  "coverImage": "https://example.com/climate-action-cover.jpg",
  "visibility": "PUBLIC",
  "requiresVerification": false,
  "enrollmentKey": "climate-2024",
  "instituteOrganizationId": 1
}
```

#### Update Cause
```
PUT /api/causes/:id
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

#### Delete Cause
```
DELETE /api/causes/:id
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

#### Get Cause by ID
```
GET /api/causes/:id
Authorization: Bearer <token>
```

#### Get Causes by Organization
```
GET /api/causes/organization/:orgId?isGlobal=true|false
Authorization: Bearer <token>
```

### Cause Enrollment

#### Enroll in Cause
```
POST /api/causes/enroll
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "causeId": 1,
  "enrollmentKey": "climate-2024"
}
```

#### Verify Enrollment
```
POST /api/causes/verify-enrollment
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

**Request Body:**
```json
{
  "enrollmentId": 1,
  "approved": true,
  "reason": "Approved after reviewing application"
}
```

#### Get Cause Enrollments
```
GET /api/causes/:id/enrollments
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN, SECRETARY, MODERATOR
```

### Cause Lectures

#### Create Cause Lecture
```
POST /api/causes/lectures
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

**Request Body:**
```json
{
  "causeId": 1,
  "title": "Introduction to Sustainable Computing",
  "description": "Learn about green computing practices",
  "content": "In this lecture, we will explore...",
  "type": "LIVE",
  "status": "SCHEDULED",
  "liveStreamUrl": "https://example.com/live-stream",
  "scheduledAt": "2025-02-01T14:00:00Z",
  "recordingUrl": "https://example.com/recording.mp4",
  "recordingAvailableAfter": "2025-02-01T16:00:00Z",
  "visibility": "PRIVATE",
  "requiresEnrollment": true
}
```

#### Update Cause Lecture
```
PUT /api/causes/lectures/:id
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN
```

#### Get Cause Lectures
```
GET /api/causes/:id/lectures
Authorization: Bearer <token>
```

### Lecture Documents

#### Add Document to Lecture
```
POST /api/causes/lectures/documents
Authorization: Bearer <token>
Roles: PRESIDENT, VICE_PRESIDENT, ADMIN, SECRETARY, MODERATOR
```

**Request Body:**
```json
{
  "causeLectureId": 1,
  "title": "Sustainable Computing Guidelines",
  "description": "Comprehensive guide to sustainable computing practices",
  "documentUrl": "https://example.com/documents/guide.pdf",
  "documentType": "PDF",
  "fileSize": 2048000
}
```

### Public Endpoints (No Authentication)

#### Get Public Causes by Organization
```
GET /api/causes/public/organization/:orgId?isGlobal=true|false
```

#### Get Public Cause by ID
```
GET /api/causes/public/:id
```

## Data Types and Enums

### CauseVisibility
- `PUBLIC`: Visible to everyone
- `PRIVATE`: Only visible to enrolled members

### LectureType
- `LIVE`: Real-time streaming lecture
- `RECORDED`: Pre-recorded content
- `HYBRID`: Combination of live and recorded

### LectureStatus
- `SCHEDULED`: Upcoming lecture
- `LIVE`: Currently streaming
- `COMPLETED`: Finished lecture
- `CANCELLED`: Cancelled lecture

### DocumentType
- `PDF`, `DOC`, `DOCX`, `PPT`, `PPTX`
- `IMAGE`, `VIDEO`, `AUDIO`, `OTHER`

### VerificationStatus
- `PENDING`: Awaiting verification
- `APPROVED`: Verified and active
- `REJECTED`: Application denied

## Permission System

### Cause Management Permissions:
- **Create/Edit/Delete Causes**: PRESIDENT, VICE_PRESIDENT, ADMIN
- **View Enrollments**: PRESIDENT, VICE_PRESIDENT, ADMIN, SECRETARY, MODERATOR
- **Verify Enrollments**: PRESIDENT, VICE_PRESIDENT, ADMIN
- **Upload Documents**: PRESIDENT, VICE_PRESIDENT, ADMIN, SECRETARY, MODERATOR

### Access Control:
- Public causes: Visible to everyone
- Private causes: Only accessible to enrolled and verified members
- Lecture access: Based on cause enrollment and lecture requirements

## Example Workflows

### 1. Creating a Public Cause with Lectures

1. **Create Cause** (as President):
   ```json
   POST /api/causes
   {
     "title": "Open Source Initiative",
     "visibility": "PUBLIC",
     "requiresVerification": false,
     "instituteOrganizationId": 1
   }
   ```

2. **Add Lecture**:
   ```json
   POST /api/causes/lectures
   {
     "causeId": 1,
     "title": "Git Workshop",
     "type": "LIVE",
     "scheduledAt": "2025-02-15T14:00:00Z"
   }
   ```

3. **Upload Documents**:
   ```json
   POST /api/causes/lectures/documents
   {
     "causeLectureId": 1,
     "title": "Git Cheat Sheet",
     "documentUrl": "https://example.com/git-cheat-sheet.pdf",
     "documentType": "PDF"
   }
   ```

### 2. Private Cause with Verification

1. **Create Private Cause**:
   ```json
   POST /api/causes
   {
     "title": "Research Project Alpha",
     "visibility": "PRIVATE",
     "requiresVerification": true,
     "enrollmentKey": "research-alpha-2024"
   }
   ```

2. **User Enrollment**:
   ```json
   POST /api/causes/enroll
   {
     "causeId": 1,
     "enrollmentKey": "research-alpha-2024"
   }
   ```

3. **Verify Enrollment** (as President):
   ```json
   POST /api/causes/verify-enrollment
   {
     "enrollmentId": 1,
     "approved": true
   }
   ```

## Sample Data

The system includes sample data with:
- **Climate Action Initiative**: Public cause with recorded lecture
- **AI for Social Good**: Private cause requiring verification
- Sample lectures with documents and enrollments
- Progress tracking examples

## Integration Notes

- Cover images should be hosted externally (CDN recommended)
- Live stream URLs should integrate with your streaming platform
- Document URLs should point to your file storage system
- Recording URLs become available after `recordingAvailableAfter` time
- Watch time tracking for analytics and progress monitoring

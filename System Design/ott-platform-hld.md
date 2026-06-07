# OTT Platform Design Notes (Netflix / Prime / Hotstar)

## Video Upload → Transcoding → Playback Flow

---

# 1. Video Upload

## Raw Video Upload

Example:

```text
Avengers.mp4
Size = 50GB
```

Stored in:

```text
s3://videos-raw/video-123/original.mp4
```

### Why S3?

* Cheap storage
* Highly durable
* Scalable
* Can store TB/PB scale data

---

## PostgreSQL Metadata Entry

```sql
CREATE TABLE video_metadata (
    video_id UUID PRIMARY KEY,
    title TEXT,
    processing_status VARCHAR(50),
    manifest_url TEXT,
    duration INT,
    created_at TIMESTAMP
);
```

Initial Insert:

```sql
INSERT INTO video_metadata(
 video_id,
 title,
 processing_status
)
VALUES(
 'video-123',
 'Avengers',
 'PROCESSING'
);
```

---

# 2. Upload Completion Event

S3 Upload Finished

Event:

```text
ObjectCreated
```

Publish:

```json
{
  "event":"VIDEO_UPLOADED",
  "videoId":"video-123",
  "path":"videos-raw/video-123/original.mp4"
}
```

Flow:

```text
S3
 ↓
SQS/Kafka
 ↓
Transcoding Service
```

---

# 3. Transcoding Pipeline

## Input

```text
original.mp4
```

## FFmpeg Generates

```text
360p
480p
720p
1080p
4K
```

Example:

```text
video-123

 ├── 360p
 ├── 480p
 ├── 720p
 └── 1080p
```

---

## Important

Never store video files in PostgreSQL.

❌ Wrong

```sql
video_blob BYTEA
```

---

✅ Correct

Store in S3.

```text
s3://videos-processed/video-123/
```

---

# 4. HLS(HTTP Live Streaming) Packaging

Video converted into chunks.

Example:

```text
720p

segment1.ts
segment2.ts
segment3.ts
```

Stored:

```text
video-123/

 720p/
   segment1.ts
   segment2.ts
   playlist.m3u8
```

---

# Final S3 Structure

```text
video-123/

 master.m3u8

 360p/
   playlist.m3u8
   segment1.ts
   segment2.ts

 720p/
   playlist.m3u8
   segment1.ts
   segment2.ts

 1080p/
   playlist.m3u8
   segment1.ts
   segment2.ts
```

---

# What is master.m3u8 ?

Top-level HLS Manifest.

Contains all available resolutions.

Example:

```text
#EXTM3U

1080p/playlist.m3u8

720p/playlist.m3u8

360p/playlist.m3u8
```

Visual:

```text
master.m3u8

      |
      +----> 360p playlist
      |
      +----> 720p playlist
      |
      +----> 1080p playlist
```

Generated automatically by:

```text
FFmpeg
AWS MediaConvert
```

---

# What is playlist.m3u8 ?

Resolution specific playlist.

Example:

```text
#EXTM3U

segment1.ts
segment2.ts
segment3.ts
```

Tells player:

```text
Play segment1
Then segment2
Then segment3
```

---

# What are .ts Files?

Actual video chunks.

Example:

```text
segment1.ts
segment2.ts
segment3.ts
```

Typically:

```text
10 seconds each
```

---

# 5. PostgreSQL After Processing

Update:

```sql
UPDATE video_metadata
SET
 processing_status='READY',
 manifest_url='s3://videos-processed/video-123/master.m3u8'
WHERE video_id='video-123';
```

---

Optional Table

```sql
CREATE TABLE video_resolutions (
 id BIGSERIAL,
 video_id UUID,
 resolution VARCHAR(20),
 bitrate INT,
 playlist_url TEXT
);
```

Example:

```text
video-123
360p
1000000

video-123
720p
5000000

video-123
1080p
8000000
```

---

# Why Store Only Manifest URL?

Because:

```text
master.m3u8
```

already knows:

```text
all resolutions
all playlists
all chunks
```

No need to store every segment in DB.

---

# 6. Playback Flow

User Clicks:

```text
Play
```

API:

```http
GET /videos/video-123/play
```

Query:

```sql
SELECT manifest_url
FROM video_metadata
WHERE video_id='video-123';
```

Response:

```json
{
  "manifestUrl":
  "https://cdn.netflix.com/video-123/master.m3u8"
}
```

---

# CDN Flow

```text
User
 |
CDN
 |
master.m3u8
 |
playlist.m3u8
 |
segment.ts
```

---

# Adaptive Streaming

## Problem

Internet changes frequently.

Example:

```text
10 Mbps
 ↓
2 Mbps
```

Without adaptive streaming:

```text
Buffering
Buffering
Buffering
```

---

## Solution

Player switches quality automatically.

```text
1080p
 ↓
720p
 ↓
480p
```

No buffering.

---

# How Does Player Decide?

Checks:

```text
Current bandwidth
Segment download time
Buffer size
```

Example:

```text
Bandwidth > 8 Mbps
→ 1080p

5-8 Mbps
→ 720p

2-5 Mbps
→ 480p

<2 Mbps
→ 360p
```

---

# Keyframes

Video contains:

```text
I Frame
P Frame
B Frame
```

---

## I Frame

Complete image.

```text
Can start playback independently.
```

---

## P/B Frame

Depends on previous frames.

---

# Why Keyframes Matter?

Switching quality must happen only at keyframes.

Example:

```text
1080p Segment42
 ↓
720p Segment43
```

If segment43 doesn't start with keyframe:

```text
Artifacts
Video corruption
Black screen
```

Possible.

---

# Keyframe Alignment

During transcoding:

```text
0 sec
10 sec
20 sec
30 sec
```

All chunk boundaries start with I-frame.

---

# Adaptive Streaming Visual

```text
master.m3u8

      |
      +--> 1080p playlist
      |
      +--> 720p playlist
      |
      +--> 480p playlist
```

Current Speed:

```text
12 Mbps
```

Choose:

```text
1080p
```

Speed drops:

```text
3 Mbps
```

Switch:

```text
720p
```

Without stopping playback.

---

# Event Flow

```text
Upload Service
      ↓
S3 Raw
      ↓
VIDEO_UPLOADED
      ↓
SQS/Kafka
      ↓
Transcoding Service
      ↓
FFmpeg
      ↓
HLS Packaging
      ↓
S3 Processed
      ↓
Update PostgreSQL
      ↓
VIDEO_READY
      ↓
CDN
      ↓
Player
```

---

# Interview Gold Answer

PostgreSQL stores:

```text
Metadata
Manifest URL
Status
Duration
Title
Description
```

S3 stores:

```text
Original Video
Processed Video
Chunks
Playlists
Manifests
```

CDN serves:

```text
master.m3u8
playlist.m3u8
segment.ts
```

Adaptive Streaming:

```text
Player dynamically changes quality
based on network speed and buffer health
without interrupting playback.
```

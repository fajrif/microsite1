This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Next.js avoid dynamic data cached

to avoid dynamic data cached, add this to the top of the page:

```js
```
export const dynamic = 'force-dynamic'
```
```


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Panel Setup Guide

## Quick Start

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Configure `.env`:**
   - **Supabase Connection Strings:**
     - `DATABASE_URL`: Transaction pooler connection (port 6543)
     - `DIRECT_DATABASE_URL`: Direct connection for migrations (port 5432)
     - Get both from your Supabase project settings → Database → Connection string
   - Generate and add `NEXTAUTH_SECRET`: `openssl rand -base64 32`

3. **Setup database:**
   ```bash
   # Generate Prisma client (Prisma 7)
   npx prisma generate
   
   # Run migrations (creates tables)
   npx prisma migrate dev --name init
   
   # Seed initial data
   npx prisma db seed
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Login:**
   - Navigate to `http://localhost:3000/admin`
   - Email: `admin@spotify-adv.com`
   - Password: `Secret1234!`

## Alibaba Cloud OSS Setup

### 1. Create OSS Bucket

1. Go to **Alibaba Cloud Console > Object Storage Service**
2. Click **Create Bucket**
   - Bucket name: e.g. `your-app-media`
   - Region: same as your ECS (e.g. `oss-ap-southeast-5` for Jakarta)
   - Storage Class: **Standard**
   - ACL: **Public Read**
3. Note the endpoint: `your-app-media.oss-ap-southeast-5.aliyuncs.com`

### 2. Create Access Keys

1. Go to **RAM Console > Users** (or use existing RAM user)
2. Create an AccessKey pair (save the ID and Secret)
3. Grant the user `AliyunOSSFullAccess` policy

### 3. (Optional) Enable CDN

1. Go to **Alibaba Cloud CDN > Domain Names > Add Domain**
2. Set your domain: e.g. `cdn.yourdomain.com`
3. Origin: select **OSS Domain** → pick your bucket
4. Enable HTTPS (upload SSL cert or use free cert)
5. Cache rules: set long TTL for `*.mp4`, `*.mp3`, `*.wav`, `*.webm`, `*.png`, `*.jpg`
6. Add CNAME record in your DNS pointing `cdn.yourdomain.com` to the CDN CNAME

### 4. Set Environment Variables

Add to your `.env` on the server:

```env
OSS_REGION=oss-ap-southeast-5
OSS_ACCESS_KEY_ID=your-key-id
OSS_ACCESS_KEY_SECRET=your-key-secret
OSS_BUCKET=your-app-media
OSS_CDN_DOMAIN=https://cdn.yourdomain.com  # optional, omit to use direct OSS URL
```

Without these variables, uploads fall back to `public/uploads/` (local filesystem).

### 5. NGINX Configuration for Large Uploads

Since showcases include audio/video files that can be hundreds of MB, update your NGINX config:

```nginx
server {
    client_max_body_size 1G;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_connect_timeout 300s;
        proxy_send_timeout    300s;
        proxy_read_timeout    300s;

        proxy_buffering off;
        proxy_request_buffering off;

        # ... your existing proxy_set_header directives
    }
}
```

Then reload: `sudo nginx -t && sudo systemctl reload nginx`

### 6. Re-upload Existing Media via OSS CLI

For existing showcases that have audio/video stored locally on the ECS disk, you can bulk-upload them to OSS using the `ossutil` CLI and then update the database.

#### Install ossutil

```bash
# Download (Linux x64)
curl -o ossutil https://gosspublic.alicdn.com/ossutil/2.0.3/ossutil-2.0.3-linux-amd64.zip
unzip ossutil-2.0.3-linux-amd64.zip
sudo mv ossutil /usr/local/bin/
ossutil version
```

#### Configure credentials

```bash
ossutil config \
  --access-key-id YOUR_ACCESS_KEY_ID \
  --access-key-secret YOUR_ACCESS_KEY_SECRET \
  --region oss-ap-southeast-5
```

#### Upload files to OSS

```bash
# Upload all local audio/video/image files to the OSS bucket
ossutil cp -r ./public/uploads/ oss://your-app-media/uploads/ --include "*.wav" --include "*.mp3" --include "*.mp4" --include "*.webm" --include "*.png" --include "*.jpg" --include "*.jpeg" --include "*.webp"
```

#### Update database records

After uploading to OSS, update the `samples` table to point to the new OSS/CDN URLs.
Replace `https://cdn.yourdomain.com` with your actual OSS endpoint or CDN domain.

```sql
-- Update audio URLs (local path → OSS/CDN URL)
UPDATE samples
SET audio = REPLACE(audio, '/uploads/', 'https://cdn.yourdomain.com/uploads/')
WHERE audio LIKE '/uploads/%';

-- Update video URLs (local path → OSS/CDN URL)
UPDATE samples
SET video_link = REPLACE(video_link, '/uploads/', 'https://cdn.yourdomain.com/uploads/')
WHERE video_link LIKE '/uploads/%';

-- Update image URLs (local path → OSS/CDN URL)
UPDATE samples
SET image = REPLACE(image, '/uploads/', 'https://cdn.yourdomain.com/uploads/')
WHERE image LIKE '/uploads/%';

-- Also update classification images if needed
UPDATE classifications
SET image = REPLACE(image, '/uploads/', 'https://cdn.yourdomain.com/uploads/')
WHERE image LIKE '/uploads/%';
```

You can run these queries via `psql`, Supabase SQL Editor, or Prisma Studio.

#### Verify

After updating, open a showcase in the admin panel and confirm media loads from the new OSS/CDN URLs. Once verified, you can remove the old local files from `public/uploads/`.

## Next Steps

- Change the default admin password
- Create categories for your articles
- Start publishing blog content
- Configure Alibaba Cloud OSS for production file storage

/**
 * Storage abstraction layer.
 * Uses Alibaba OSS when STORAGE_PROVIDER=oss, otherwise falls back to
 * Vercel Blob (staging) or local filesystem (development).
 */

export async function uploadFile(file: File, filename: string): Promise<string> {
  if (process.env.STORAGE_PROVIDER === 'oss') {
    const OSS = (await import('ali-oss')).default
    const client = new OSS({
      region: process.env.OSS_REGION!,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
      bucket: process.env.OSS_BUCKET!,
    })
    const objectKey = `uploads/${Date.now()}-${filename}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await client.put(objectKey, buffer, {
      headers: { 'Content-Type': file.type },
    })
    return result.url as string
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    })
    return blob.url
  }

  // Local development fallback
  const fs = await import('fs/promises')
  const path = await import('path')
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const localName = `${Date.now()}-${filename}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, localName), buffer)
  return `/uploads/${localName}`
}

export async function deleteFile(url: string): Promise<void> {
  if (process.env.STORAGE_PROVIDER === 'oss') {
    if (!url.includes('aliyuncs.com')) return
    const OSS = (await import('ali-oss')).default
    const client = new OSS({
      region: process.env.OSS_REGION!,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
      bucket: process.env.OSS_BUCKET!,
    })
    const urlObj = new URL(url)
    const objectKey = urlObj.pathname.replace(/^\//, '')
    await client.delete(objectKey)
    return
  }

  if (url.includes('blob.vercel-storage.com')) {
    const { del } = await import('@vercel/blob')
    await del(url)
  }
}

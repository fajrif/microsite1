/**
 * Storage layer — Vercel Blob in production, local filesystem in development.
 */

import path from 'path'
import fs from 'fs/promises'

export async function uploadFile(file: File, filename?: string): Promise<string> {
  const name = filename ?? file.name
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const blob = await put(name, file, { access: 'public', addRandomSuffix: true })
    return blob.url
  }
  // Local fallback (dev only)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const localName = `${Date.now()}-${name}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, localName), buffer)
  return `/uploads/${localName}`
}

export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url) return
  if (url.includes('blob.vercel-storage.com')) {
    const { del } = await import('@vercel/blob')
    try { await del(url) } catch { /* ignore */ }
  } else if (url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', url)
    try { await fs.unlink(filePath) } catch { /* ignore */ }
  }
}

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import convertHeic from 'heic-convert'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const HEIC_TYPES = new Set(['image/heic', 'image/heif'])

export class InvalidFileError extends Error {}

function isHeic(file: File): boolean {
  if (HEIC_TYPES.has(file.type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.heic') || name.endsWith('.heif')
}

export async function uploadToR2(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new InvalidFileError('Fichier trop volumineux (10 Mo max)')
  }

  let mimeType = file.type
  let bytes = Buffer.from(await file.arrayBuffer())

  // Les navigateurs n'affichent pas nativement les photos HEIC (format par
  // défaut des iPhone) : on les convertit en JPEG avant stockage.
  if (isHeic(file)) {
    bytes = Buffer.from(await convertHeic({ buffer: bytes, format: 'JPEG', quality: 0.9 }))
    mimeType = 'image/jpeg'
  }

  if (!(mimeType in ALLOWED_MIME_TYPES)) {
    throw new InvalidFileError('Type de fichier non autorisé')
  }

  const ext = ALLOWED_MIME_TYPES[mimeType]
  const key = `${randomUUID()}.${ext}`

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: bytes,
    ContentType: mimeType,
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function uploadBufferToR2(buffer: Buffer, opts: { key: string; contentType: string }): Promise<string> {
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: opts.key,
    Body: buffer,
    ContentType: opts.contentType,
  }))

  return `${process.env.R2_PUBLIC_URL}/${opts.key}`
}

export async function deleteFromR2(url: string): Promise<void> {
  const base = process.env.R2_PUBLIC_URL!
  if (!url.startsWith(base)) return
  const key = url.slice(base.length + 1)
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }))
}

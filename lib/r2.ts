import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

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

export class InvalidFileError extends Error {}

export async function uploadToR2(file: File): Promise<string> {
  if (!(file.type in ALLOWED_MIME_TYPES)) {
    throw new InvalidFileError('Type de fichier non autorisé')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new InvalidFileError('Fichier trop volumineux (10 Mo max)')
  }

  const ext = ALLOWED_MIME_TYPES[file.type]
  const key = `${randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: Buffer.from(bytes),
    ContentType: file.type,
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}`
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

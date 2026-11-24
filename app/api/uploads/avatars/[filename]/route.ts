import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError, ValidationError, NotFoundError } from '@/lib/domain/errors'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const SECURE_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars')
const LEGACY_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    await requireAuth()

    const { filename } = await params

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new ValidationError('Nome de arquivo inválido')
    }

    let filePath = join(SECURE_UPLOAD_DIR, filename)
    
    if (!existsSync(filePath)) {
      filePath = join(LEGACY_UPLOAD_DIR, filename)
      
      if (!existsSync(filePath)) {
        throw new NotFoundError('Arquivo', filename)
      }
    }

    const fileBuffer = await readFile(filePath)

    const extension = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    }
    const contentType = mimeTypes[extension || ''] || 'application/octet-stream'

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    return handleDomainError(error)
  }
}

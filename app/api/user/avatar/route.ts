import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

const SECURE_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars')

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      throw new ValidationError('Nenhum arquivo enviado')
    }

    if (!file.type.startsWith('image/')) {
      throw new ValidationError('Apenas imagens são permitidas')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('Arquivo muito grande. Máximo 5MB')
    }

    if (!existsSync(SECURE_UPLOAD_DIR)) {
      await mkdir(SECURE_UPLOAD_DIR, { recursive: true })
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const uniqueName = `${crypto.randomUUID()}.${fileExtension}`
    const filePath = join(SECURE_UPLOAD_DIR, uniqueName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const avatarUrl = `/api/uploads/avatars/${uniqueName}`

    return success({ avatarUrl })
  } catch (error) {
    return handleDomainError(error)
  }
}

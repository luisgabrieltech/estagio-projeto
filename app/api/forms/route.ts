import { NextRequest } from 'next/server'
import { success, created } from '@/lib/api/server-helpers'
import { requireActiveUser, requireAdmin } from '@/lib/api/auth'
import { handleDomainError, NotFoundError } from '@/lib/domain/errors'
import { FormService } from '@/lib/domain/form'
import { prismaFormRepository } from '@/lib/infrastructure'
import { canAccessEvaluation } from '@/lib/domain/form/form-audience'
import type { QuestionType, Category, FormStatus, ExternalStatus } from '@prisma/client'

const formService = new FormService(prismaFormRepository)

interface ConditionalInput {
  dependsOn: string
  operator: 'AND' | 'OR'
  conditions: Array<{
    type: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than'
    value: string
  }>
}

interface QuestionInput {
  id?: string
  customId?: string | null
  text: string
  type: string
  required: boolean
  options?: string[]
  rows?: string[]
  columns?: string[]
  conditional?: ConditionalInput | null
}

interface FormInput {
  id?: string
  title: string
  description: string
  category: string
  status?: string
  deadline?: string
  estimatedTime?: string | null
  generatesCertificate?: boolean
  certificateHours?: string | null
  questions?: QuestionInput[]
}

interface PatchInput {
  id: string
  visibleToRoles?: string[]
  status?: string
}

function convertQuestionType(type: string): QuestionType {
  const typeMap: Record<string, QuestionType> = {
    'multiple_choice': 'MULTIPLE_CHOICE',
    'checkbox': 'CHECKBOX',
    'text': 'TEXT',
    'scale': 'SCALE',
    'grid': 'GRID',
    'dropdown': 'DROPDOWN',
    'section': 'SECTION'
  }
  return typeMap[type] || (type.toUpperCase() as QuestionType)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const user = await requireActiveUser()

    if (id) {
      const form = await formService.getFormById(id)
      if (!canAccessEvaluation(user, form)) {
        throw new NotFoundError('Formulário', id)
      }

      return success(form)
    }

    const { data: forms } = await formService.getForms({ page: 1, pageSize: 100 })
    return success(forms.filter(form => canAccessEvaluation(user, form)))
  } catch (error) {
    return handleDomainError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const data = await request.json()

    if (data.id) {
      return await updateForm(data)
    } else {
      return await createForm(data, session.user.id)
    }
  } catch (error) {
    return handleDomainError(error)
  }
}

async function createForm(data: FormInput, userId: string) {
  const form = await formService.createForm({
    title: data.title,
    description: data.description,
    category: data.category as Category,
    createdById: userId,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    estimatedTime: data.estimatedTime,
    generatesCertificate: data.generatesCertificate || false,
    certificateHours: data.certificateHours,
    visibleToRoles: [],
    visibleToUserIds: [],
    questions: data.questions?.map((q: QuestionInput, idx: number) => ({
      customId: q.customId,
      text: q.text,
      type: convertQuestionType(q.type),
      required: q.required,
      options: q.options || [],
      rows: q.rows || [],
      columns: q.columns || [],
      order: idx,
      conditional: q.conditional,
    })) || [],
  })

  return created(form)
}

async function updateForm(data: FormInput) {
  const form = await formService.updateForm(data.id!, {
    title: data.title,
    description: data.description,
    category: data.category as Category,
    status: data.status as FormStatus,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    estimatedTime: data.estimatedTime,
    generatesCertificate: data.generatesCertificate || false,
    certificateHours: data.certificateHours,
    questions: data.questions?.map((q: QuestionInput, idx: number) => ({
      id: q.id,
      customId: q.customId,
      text: q.text,
      type: convertQuestionType(q.type),
      required: q.required,
      options: q.options || [],
      rows: q.rows || [],
      columns: q.columns || [],
      order: idx,
      conditional: q.conditional,
    })),
  })

  return success(form)
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const data = await request.json()

    if (!data.id) {
      throw new NotFoundError('Formulário')
    }

    const updateData = buildUpdateData(action, data)
    const form = await formService.updateForm(data.id, updateData)

    return success(form)
  } catch (error) {
    return handleDomainError(error)
  }
}

function buildUpdateData(action: string | null, data: PatchInput) {
  if (action === 'visibility') {
    return {
      visibleToRoles: data.visibleToRoles || [],
      ...(data.status && { externalStatus: data.status as ExternalStatus }),
    }
  }
  
  if (action === 'external-status') {
    return { externalStatus: data.status as ExternalStatus }
  }
  
  return { status: data.status as FormStatus }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const { id } = await request.json()

    if (!id) {
      throw new NotFoundError('Formulário')
    }

    await formService.deleteForm(id, session.user.id)

    return success({ message: 'Formulário excluído' })
  } catch (error) {
    return handleDomainError(error)
  }
}

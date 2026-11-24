import type { Form, FormWithStats } from '@/types/entities/form'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { IFormRepository, FormEntity } from './form.repository'
import {
  createFormSchema,
  updateFormSchema,
  formFiltersSchema,
  type CreateFormDTO,
  type UpdateFormDTO,
  type FormFiltersDTO,
} from './form.schema'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  formatZodErrors,
} from '@/lib/domain/errors'

export class FormService {
  constructor(private readonly formRepository: IFormRepository) {}

  async createForm(data: CreateFormDTO): Promise<FormEntity> {
    const parseResult = createFormSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de formulário inválidos', details)
    }
    const validated = parseResult.data

    if (validated.generatesCertificate && !validated.certificateHours) {
      throw new ValidationError(
        'Carga horária do certificado é obrigatória quando o formulário gera certificado',
        { certificateHours: ['Carga horária é obrigatória'] }
      )
    }

    return this.formRepository.create({
      title: validated.title,
      description: validated.description,
      category: validated.category,
      createdById: validated.createdById,
      deadline: validated.deadline,
      estimatedTime: validated.estimatedTime,
      generatesCertificate: validated.generatesCertificate,
      certificateHours: validated.certificateHours,
      visibleToRoles: validated.visibleToRoles,
      visibleToUserIds: validated.visibleToUserIds,
      questions: validated.questions,
    })
  }

  async updateForm(
    id: string,
    data: UpdateFormDTO,
    userId?: string
  ): Promise<FormEntity> {
    const parseResult = updateFormSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de atualização inválidos', details)
    }
    const validated = parseResult.data

    const existingForm = await this.formRepository.findWithQuestionResponses(id)
    if (!existingForm) {
      throw new NotFoundError('Formulário', id)
    }

    if (userId && existingForm.createdById !== userId) {
      throw new ForbiddenError('Você não tem permissão para editar este formulário')
    }

    if (
      validated.generatesCertificate === true &&
      !validated.certificateHours &&
      !existingForm.certificateHours
    ) {
      throw new ValidationError(
        'Carga horária do certificado é obrigatória quando o formulário gera certificado',
        { certificateHours: ['Carga horária é obrigatória'] }
      )
    }

    if (validated.questions) {
      const questionsWithResponses = existingForm.questions.filter(
        (q) => q._count && q._count.responses > 0
      )

      for (const existingQuestion of questionsWithResponses) {
        const updatedQuestion = validated.questions.find(
          (q) => q.id === existingQuestion.id
        )

        if (!updatedQuestion) {
          throw new ConflictError(
            `Não é possível remover a questão "${existingQuestion.text}" pois ela possui respostas`
          )
        }

        if (
          updatedQuestion.type !== undefined &&
          updatedQuestion.type !== existingQuestion.type
        ) {
          throw new ConflictError(
            `Não é possível alterar o tipo da questão "${existingQuestion.text}" pois ela possui respostas`
          )
        }

        if (
          updatedQuestion.options !== undefined &&
          JSON.stringify(updatedQuestion.options) !==
            JSON.stringify(existingQuestion.options)
        ) {
          throw new ConflictError(
            `Não é possível alterar as opções da questão "${existingQuestion.text}" pois ela possui respostas`
          )
        }
      }
    }

    if (validated.questions) {
      return this.formRepository.updateWithQuestions(id, validated)
    }

    const updatedForm = await this.formRepository.update(id, validated)
    const formWithQuestions = await this.formRepository.findById(id)
    return formWithQuestions!
  }

  async deleteForm(id: string, userId?: string): Promise<void> {
    const existingForm = await this.formRepository.findById(id)
    if (!existingForm) {
      throw new NotFoundError('Formulário', id)
    }

    if (userId && existingForm.createdById !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir este formulário')
    }

    const hasResponses = await this.formRepository.hasResponses(id)
    if (hasResponses) {
      throw new ConflictError(
        'Não é possível excluir o formulário pois ele possui respostas'
      )
    }

    await this.formRepository.delete(id)
  }

  async getFormById(id: string): Promise<FormEntity> {
    const form = await this.formRepository.findById(id)
    if (!form) {
      throw new NotFoundError('Formulário', id)
    }
    return form
  }

  async getForms(filters: FormFiltersDTO): Promise<PaginatedResponse<Form>> {
    const parseResult = formFiltersSchema.safeParse(filters)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Filtros inválidos', details)
    }
    const validated = parseResult.data

    return this.formRepository.findMany(validated)
  }

  async getFormsByStatus(status: Form['status']): Promise<Form[]> {
    return this.formRepository.findByStatus(status)
  }

  async getFormsByExternalStatus(externalStatus: Form['externalStatus']): Promise<Form[]> {
    return this.formRepository.findByExternalStatus(externalStatus)
  }

  async getFormsWithStats(): Promise<FormWithStats[]> {
    return this.formRepository.findAllWithStats()
  }
}

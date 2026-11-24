import { getVisibleQuestionIds, hasQuestionAnswer } from '@/lib/domain/form/question-visibility'
import type { ResponseWithDetails } from '@/types/entities/response'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { IResponseRepository, ResponseEntity } from './response.repository'
import type { IFormRepository } from '@/lib/domain/form/form.repository'
import { canAccessEvaluation, type EvaluationUser } from '@/lib/domain/form/form-audience'
import {
  createResponsesSchema,
  responseFiltersSchema,
  type ResponseFiltersDTO,
} from './response.schema'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  formatZodErrors,
} from '@/lib/domain/errors'

/**
 * Response domain service
 * Contains business logic for response operations
 */
export class ResponseService {
  constructor(
    private readonly responseRepository: IResponseRepository,
    private readonly formRepository: IFormRepository
  ) {}

  /**
   * Save responses for a form
   * - Validates input data
   * - Checks if form exists and is available
   * - Checks if user has already responded
   * - Validates required questions are answered
   *
   * @param user - Current account submitting responses
   * @param data - Responses data
   * @returns Created responses
   * @throws ValidationError if data is invalid
   * @throws NotFoundError if form doesn't exist
   * @throws ForbiddenError if form is not available
   * @throws ConflictError if user has already responded
   */
  async saveResponses(
    user: EvaluationUser,
    data: unknown
  ): Promise<ResponseEntity[]> {
    // Validate input data
    const parseResult = createResponsesSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de resposta inválidos', details)
    }
    const validated = parseResult.data

    // Get form ID from first response (all responses should be for the same form)
    const formId = validated.responses[0].formId

    // Validate all responses are for the same form
    const differentFormResponses = validated.responses.filter(
      (r) => r.formId !== formId
    )
    if (differentFormResponses.length > 0) {
      throw new ValidationError(
        'Todas as respostas devem ser do mesmo formulário',
        { formId: ['IDs de formulário inconsistentes'] }
      )
    }

    // Check if form exists
    const form = await this.formRepository.findById(formId)
    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    if (!canAccessEvaluation(user, form)) {
      throw new ForbiddenError('Você não pode responder a esta avaliação')
    }

    // Check if form is available for responses
    if (form.externalStatus !== 'AVAILABLE') {
      throw new ForbiddenError('Este formulário não está disponível para respostas')
    }

    // Check if user has already responded to this form
    const hasResponded = await this.responseRepository.hasUserRespondedToForm(
      user.id,
      formId
    )
    if (hasResponded) {
      throw new ConflictError('Você já respondeu esta avaliação')
    }

    const questionsById = new Map(form.questions.map(question => [question.id, question]))
    const values = new Map<string, string>()
    for (const response of validated.responses) {
      const question = questionsById.get(response.questionId)
      if (!question || question.type === 'SECTION') {
        throw new ValidationError('Questões inválidas encontradas', {
          questions: ['Informe apenas perguntas deste formulário'],
        })
      }
      if (values.has(response.questionId)) {
        throw new ValidationError('Envie apenas uma resposta por pergunta')
      }
      values.set(response.questionId, response.value)
    }

    const visibleIds = getVisibleQuestionIds(form.questions, Object.fromEntries(values))
    const missingRequired = form.questions.filter(question =>
      question.type !== 'SECTION' && question.required && visibleIds.has(question.id)
      && !hasQuestionAnswer(question, values.get(question.id))
    )

    if (missingRequired.length > 0) {
      throw new ValidationError('Responda todas as perguntas obrigatórias', {
        questions: missingRequired.map(question => `Questão "${question.text}" é obrigatória`),
      })
    }

    const answeredVisibleIds = new Set(form.questions
      .filter(question => visibleIds.has(question.id) && hasQuestionAnswer(question, values.get(question.id)))
      .map(question => question.id))

    const responsesToSave = validated.responses
      .filter(response => answeredVisibleIds.has(response.questionId))
      .map(response => ({ ...response, userId: user.id }))

    if (responsesToSave.length === 0) {
      throw new ValidationError('Envie pelo menos uma resposta visível')
    }

    return this.responseRepository.saveMany(responsesToSave)
  }

  /**
   * Get responses by user
   *
   * @param userId - User ID
   * @returns List of responses
   */
  async getResponsesByUser(userId: string): Promise<ResponseEntity[]> {
    return this.responseRepository.findByUser(userId)
  }

  /**
   * Get responses by form
   *
   * @param formId - Form ID
   * @returns List of responses
   */
  async getResponsesByForm(formId: string): Promise<ResponseEntity[]> {
    // Check if form exists
    const form = await this.formRepository.findById(formId)
    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    return this.responseRepository.findByForm(formId)
  }

  /**
   * Get responses by user and form
   *
   * @param userId - User ID
   * @param formId - Form ID
   * @returns List of responses
   */
  async getResponsesByUserAndForm(
    userId: string,
    formId: string
  ): Promise<ResponseEntity[]> {
    return this.responseRepository.findByUserAndForm(userId, formId)
  }

  /**
   * Get paginated responses with details
   *
   * @param filters - Filter and pagination options
   * @returns Paginated list of responses with details
   * @throws ValidationError if filters are invalid
   */
  async getResponsesWithDetails(
    filters: ResponseFiltersDTO
  ): Promise<PaginatedResponse<ResponseWithDetails>> {
    // Validate filters
    const parseResult = responseFiltersSchema.safeParse(filters)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Filtros inválidos', details)
    }
    const validated = parseResult.data

    return this.responseRepository.findManyWithDetails(validated)
  }

  /**
   * Check if user has responded to a form
   *
   * @param userId - User ID
   * @param formId - Form ID
   * @returns True if user has responded
   */
  async hasUserRespondedToForm(
    userId: string,
    formId: string
  ): Promise<boolean> {
    return this.responseRepository.hasUserRespondedToForm(userId, formId)
  }

  /**
   * Get form IDs that a user has responded to
   *
   * @param userId - User ID
   * @returns Array of form IDs
   */
  async getRespondedFormIds(userId: string): Promise<string[]> {
    return this.responseRepository.getRespondedFormIds(userId)
  }

  /**
   * Count unique users who responded to a form
   *
   * @param formId - Form ID
   * @returns Number of unique users
   */
  async countUniqueUsersByForm(formId: string): Promise<number> {
    return this.responseRepository.countUniqueUsersByForm(formId)
  }
}

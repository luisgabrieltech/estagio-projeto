/**
 * Response Factory
 * 
 * Factory functions for creating test response data
 * 
 * @module __tests__/utils/factories/response.factory
 * Requirements: 3.3
 */
import type { 
  Response, 
  ResponseWithDetails, 
  DetailedResponse,
  QuestionStats,
  FormMetrics 
} from '@/types/entities/response'

let responseIdCounter = 0

/**
 * Creates a test response with default values
 * 
 * @param overrides - Partial response data to override defaults
 * @returns Complete Response object
 */
export function createResponse(overrides: Partial<Response> = {}): Response {
  responseIdCounter++
  const now = new Date()
  
  return {
    id: `response-${responseIdCounter}`,
    userId: 'user-1',
    formId: 'form-1',
    questionId: 'question-1',
    value: `Test response value ${responseIdCounter}`,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Creates multiple test responses
 * 
 * @param count - Number of responses to create
 * @param overrides - Partial response data to apply to all responses
 * @returns Array of Response objects
 */
export function createResponses(count: number, overrides: Partial<Response> = {}): Response[] {
  return Array.from({ length: count }, () => createResponse(overrides))
}

/**
 * Creates a response with full details
 * 
 * @param overrides - Partial data to override defaults
 * @returns ResponseWithDetails object
 */
export function createResponseWithDetails(
  overrides: Partial<ResponseWithDetails> = {}
): ResponseWithDetails {
  responseIdCounter++
  const now = new Date()
  
  return {
    id: `response-${responseIdCounter}`,
    value: `Test response value ${responseIdCounter}`,
    createdAt: now,
    updatedAt: now,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'user@test.com',
      functionalRoles: ['DOCENTE'],
    },
    form: {
      id: 'form-1',
      title: 'Test Form',
      category: 'DOCENTES',
    },
    question: {
      id: 'question-1',
      text: 'Test Question',
      type: 'TEXT',
      required: false,
    },
    ...overrides,
  }
}

/**
 * Creates a detailed response (full submission)
 * 
 * @param overrides - Partial data to override defaults
 * @returns DetailedResponse object
 */
export function createDetailedResponse(
  overrides: Partial<DetailedResponse> = {}
): DetailedResponse {
  responseIdCounter++
  const now = new Date()
  
  return {
    id: `submission-${responseIdCounter}`,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'user@test.com',
      role: 'USER',
    },
    form: {
      id: 'form-1',
      title: 'Test Form',
    },
    responses: [
      {
        questionId: 'question-1',
        questionText: 'Test Question 1',
        questionType: 'TEXT',
        value: 'Test answer',
        answeredAt: now,
      },
    ],
    submittedAt: now,
    timeSpent: 300,
    isComplete: true,
    ...overrides,
  }
}

/**
 * Creates question statistics
 * 
 * @param overrides - Partial data to override defaults
 * @returns QuestionStats object
 */
export function createQuestionStats(overrides: Partial<QuestionStats> = {}): QuestionStats {
  return {
    questionId: 'question-1',
    questionText: 'Test Question',
    questionType: 'MULTIPLE_CHOICE',
    isRequired: false,
    totalResponses: 100,
    skipRate: 5,
    optionStats: [
      { option: 'Option A', count: 40, percentage: 40 },
      { option: 'Option B', count: 35, percentage: 35 },
      { option: 'Option C', count: 25, percentage: 25 },
    ],
    ...overrides,
  }
}

/**
 * Creates form metrics
 * 
 * @param overrides - Partial data to override defaults
 * @returns FormMetrics object
 */
export function createFormMetrics(overrides: Partial<FormMetrics> = {}): FormMetrics {
  return {
    overview: {
      totalResponses: 500,
      totalUsers: 450,
      responseRate: 75.5,
      averageTime: 12.5,
      completionRate: 92.0,
      avgResponsesPerDay: 15.2,
    },
    demographics: {
      byCampus: [
        { campus: 'Campus A', count: 200, percentage: 40 },
        { campus: 'Campus B', count: 150, percentage: 30 },
        { campus: 'Campus C', count: 150, percentage: 30 },
      ],
      byCourse: [
        { course: 'Course 1', count: 250, percentage: 50 },
        { course: 'Course 2', count: 250, percentage: 50 },
      ],
      byRole: [
        { role: 'DOCENTE', count: 300, percentage: 60 },
        { role: 'DISCENTE', count: 200, percentage: 40 },
      ],
      byPeriod: [
        { period: '2024-Q1', count: 125 },
        { period: '2024-Q2', count: 125 },
        { period: '2024-Q3', count: 125 },
        { period: '2024-Q4', count: 125 },
      ],
    },
    timeline: [
      { date: '2024-01-01', responses: 10, cumulative: 10 },
      { date: '2024-01-02', responses: 15, cumulative: 25 },
      { date: '2024-01-03', responses: 20, cumulative: 45 },
    ],
    ...overrides,
  }
}

/**
 * Resets the response ID counter
 * Useful for test isolation
 */
export function resetResponseFactory(): void {
  responseIdCounter = 0
}

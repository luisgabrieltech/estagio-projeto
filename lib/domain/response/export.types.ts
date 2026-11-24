import type { QuestionType } from '@prisma/client'

export type ExportFormat = 'csv' | 'excel'

export interface ExportOptions {
  format: ExportFormat
  includeMetrics: boolean
  includePersonalData: boolean
}

export interface ExportFilters {
  campusFilter: string[]
  courseFilter: string[]
  roleFilter: string[]
  dateFromFilter: string | null
  dateToFilter: string | null
  questionIds: string[]
}

export interface ExportUserData {
  id: string
  name: string
  email: string
  extraData: Record<string, unknown> | null
}

export interface ExportResponseData {
  id: string
  value: string
  userId: string
  createdAt: Date
  user: ExportUserData
}

export interface ExportQuestionData {
  id: string
  customId: string | null
  text: string
  type: QuestionType
  order: number
  options: string[]
  rows: string[]
  columns: string[]
  maxValue?: number
  responses: ExportResponseData[]
}

export interface ExportFormData {
  id: string
  title: string
  questions: ExportQuestionData[]
}

export interface FormattedUserResponse {
  userId: string
  userName: string
  userEmail: string
  responses: Record<string, {
    questionText: string
    questionType: QuestionType
    value: string
    formattedValue: string
  }>
}

export interface ExportResult {
  form: ExportFormData
  questions: ExportQuestionData[]
  data: FormattedUserResponse[]
}

import type { QuestionType } from '@prisma/client'

export interface UserExtraData {
  campus?: string
  course?: string
  functionalRole?: string
  functionalRoles?: string[]
  [key: string]: unknown
}

export interface AnalyticsFilters {
  campusFilter: string[]
  courseFilter: string[]
  roleFilter: string[]
  dateFromFilter: string | null
  dateToFilter: string | null
}

export interface AnalyticsUserData {
  id: string
  extraData: UserExtraData | null
  createdAt: Date
}

export interface AnalyticsResponseData {
  id: string
  userId: string
  createdAt: Date
  user: AnalyticsUserData
}

export interface QuestionResponseData {
  id: string
  value: string
  createdAt: Date
  userId: string
  user: AnalyticsUserData
}

export interface AnalyticsQuestionData {
  id: string
  text: string
  type: QuestionType
  required: boolean
  options: string[]
  rows: string[]
  columns: string[]
  order: number
  responses: QuestionResponseData[]
}

export interface FiltersFormData {
  id: string
  title: string
  responses: AnalyticsResponseData[]
}

export interface MetricsFormData {
  id: string
  title: string
  estimatedTime: string | null
  _count: { questions: number }
  responses: AnalyticsResponseData[]
}

export interface StatisticsFormData {
  id: string
  title: string
  questions: AnalyticsQuestionData[]
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface FilterOptions {
  campuses: FilterOption[]
  courses: FilterOption[]
  roles: FilterOption[]
  dateRange: {
    earliest: Date
    latest: Date
  }
}

export interface Demographics {
  byCampus: Array<{ campus: string; count: number; percentage: number }>
  byCourse: Array<{ course: string; count: number; percentage: number }>
  byRole: Array<{ role: string; count: number; percentage: number }>
  byPeriod: Array<{ period: string; count: number }>
}

export interface TimelineEntry {
  date: string
  responses: number
  cumulative: number
}

export interface FormMetrics {
  overview: {
    totalResponses: number
    totalUsers: number
    responseRate: number
    averageTime: number
    completionRate: number
    avgResponsesPerDay: number
  }
  demographics: Demographics
  timeline: TimelineEntry[]
}

export interface OptionStat {
  option: string
  count: number
  percentage: number
}

export interface TextAnalysis {
  averageLength: number
  totalWords: number
  uniqueWords: number
  wordCloud: Array<{ word: string; frequency: number; weight: number }>
  commonPhrases: string[]
}

export interface ScaleStats {
  average: number
  median: number
  mode: number
  standardDeviation: number
  distribution: Array<{ value: number; count: number; percentage: number }>
}

export interface GridRowStat {
  rowLabel: string
  responses: Array<{ column: string; count: number; percentage: number }>
}

export interface GridStats {
  rowStats: GridRowStat[]
  columnTotals: Array<{ column: string; total: number; percentage: number }>
}

export interface QuestionStats {
  questionId: string
  questionText: string
  questionType: QuestionType
  isRequired: boolean
  totalResponses: number
  skipRate: number
  optionStats?: OptionStat[]
  textAnalysis?: TextAnalysis
  scaleStats?: ScaleStats
  gridStats?: GridStats
}

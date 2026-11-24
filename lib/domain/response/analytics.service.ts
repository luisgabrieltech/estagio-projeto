import { decodeCheckboxValues } from '@/lib/domain/form/checkbox-values'
import type {
  AnalyticsFilters,
  AnalyticsResponseData,
  AnalyticsQuestionData,
  QuestionResponseData,
  UserExtraData,
  FiltersFormData,
  MetricsFormData,
  FilterOptions,
  FormMetrics,
  QuestionStats,
  Demographics,
  TimelineEntry,
} from './analytics.types'

export class ResponseAnalyticsService {
  private getUserExtraData(extraData: unknown): UserExtraData {
    if (!extraData || typeof extraData !== 'object') {
      return {}
    }
    return extraData as UserExtraData
  }

  private getCampus(extraData: unknown): string {
    const data = this.getUserExtraData(extraData)
    return data.campus || 'Não informado'
  }

  private getCourse(extraData: unknown): string {
    const data = this.getUserExtraData(extraData)
    return data.course || 'Não informado'
  }

  private getRole(extraData: unknown): string {
    const data = this.getUserExtraData(extraData)
    return data.functionalRole || 'Não informado'
  }

  filterResponses<T extends { user: { extraData: unknown }; createdAt: Date }>(
    responses: T[],
    filters: AnalyticsFilters
  ): T[] {
    const { campusFilter, courseFilter, roleFilter, dateFromFilter, dateToFilter } = filters

    return responses.filter(response => {
      if (campusFilter.length > 0 || courseFilter.length > 0 || roleFilter.length > 0) {
        const campus = this.getCampus(response.user.extraData)
        const course = this.getCourse(response.user.extraData)
        const role = this.getRole(response.user.extraData)

        const campusMatch = campusFilter.length === 0 || campusFilter.includes(campus)
        const courseMatch = courseFilter.length === 0 || courseFilter.includes(course)
        const roleMatch = roleFilter.length === 0 || roleFilter.includes(role)

        if (!campusMatch || !courseMatch || !roleMatch) return false
      }

      if (dateFromFilter || dateToFilter) {
        const responseDate = new Date(response.createdAt)

        if (dateFromFilter && responseDate < new Date(dateFromFilter)) return false
        if (dateToFilter && responseDate > new Date(dateToFilter)) return false
      }

      return true
    })
  }

  calculateFilterOptions(form: FiltersFormData): FilterOptions {
    const campusSet = new Set<string>()
    const courseSet = new Set<string>()
    const roleSet = new Set<string>()
    const dates: Date[] = []

    const campusCounts = new Map<string, number>()
    const courseCounts = new Map<string, number>()
    const roleCounts = new Map<string, number>()

    form.responses.forEach(response => {
      const campus = this.getCampus(response.user.extraData)
      const course = this.getCourse(response.user.extraData)
      const role = this.getRole(response.user.extraData)

      campusSet.add(campus)
      courseSet.add(course)
      roleSet.add(role)
      dates.push(new Date(response.createdAt))

      campusCounts.set(campus, (campusCounts.get(campus) || 0) + 1)
      courseCounts.set(course, (courseCounts.get(course) || 0) + 1)
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1)
    })

    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())

    return {
      campuses: Array.from(campusSet)
        .map(campus => ({
          value: campus,
          label: campus,
          count: campusCounts.get(campus) || 0,
        }))
        .sort((a, b) => b.count - a.count),

      courses: Array.from(courseSet)
        .map(course => ({
          value: course,
          label: course,
          count: courseCounts.get(course) || 0,
        }))
        .sort((a, b) => b.count - a.count),

      roles: Array.from(roleSet)
        .map(role => ({
          value: role,
          label: role,
          count: roleCounts.get(role) || 0,
        }))
        .sort((a, b) => b.count - a.count),

      dateRange: {
        earliest: sortedDates[0] || new Date(),
        latest: sortedDates[sortedDates.length - 1] || new Date(),
      },
    }
  }

  calculateMetrics(
    form: MetricsFormData,
    filteredResponses: AnalyticsResponseData[],
    totalActiveUsers: number
  ): FormMetrics {
    const uniqueRespondents = new Set(filteredResponses.map(r => r.userId))
    const totalResponses = uniqueRespondents.size

    const responseRate = totalActiveUsers > 0
      ? (totalResponses / totalActiveUsers) * 100
      : 0

    const averageTime = form.estimatedTime ? parseInt(form.estimatedTime) : 0
    const completionRate = totalResponses > 0 ? 100 : 0

    const firstResponse = filteredResponses.length > 0
      ? filteredResponses.reduce((earliest, current) =>
          new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest
        ).createdAt
      : new Date()

    const daysSinceFirst = Math.max(
      1,
      Math.ceil((Date.now() - new Date(firstResponse).getTime()) / (1000 * 60 * 60 * 24))
    )

    const avgResponsesPerDay = totalResponses / daysSinceFirst

    const demographics = this.calculateDemographics(filteredResponses, totalResponses)
    const timeline = this.calculateTimeline(filteredResponses)

    return {
      overview: {
        totalResponses,
        totalUsers: totalActiveUsers,
        responseRate,
        averageTime,
        completionRate,
        avgResponsesPerDay,
      },
      demographics,
      timeline,
    }
  }

  private calculateDemographics(
    responses: AnalyticsResponseData[],
    totalResponses: number
  ): Demographics {
    const campusMap = new Map<string, number>()
    const courseMap = new Map<string, number>()
    const roleMap = new Map<string, number>()

    responses.forEach(response => {
      const campus = this.getCampus(response.user.extraData)
      const course = this.getCourse(response.user.extraData)
      const role = this.getRole(response.user.extraData)

      campusMap.set(campus, (campusMap.get(campus) || 0) + 1)
      courseMap.set(course, (courseMap.get(course) || 0) + 1)
      roleMap.set(role, (roleMap.get(role) || 0) + 1)
    })

    return {
      byCampus: Array.from(campusMap.entries()).map(([campus, count]) => ({
        campus,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      })),
      byCourse: Array.from(courseMap.entries()).map(([course, count]) => ({
        course,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      })),
      byRole: Array.from(roleMap.entries()).map(([role, count]) => ({
        role,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      })),
      byPeriod: [],
    }
  }

  private calculateTimeline(responses: AnalyticsResponseData[]): TimelineEntry[] {
    const timeline: TimelineEntry[] = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const responsesOnDate = responses.filter(
        r => r.createdAt.toISOString().split('T')[0] === dateStr
      ).length

      const cumulativeResponses = responses.filter(
        r => new Date(r.createdAt) <= date
      ).length

      timeline.push({
        date: dateStr,
        responses: responsesOnDate,
        cumulative: cumulativeResponses,
      })
    }

    return timeline
  }

  calculateQuestionStats(
    question: AnalyticsQuestionData,
    filteredResponses: QuestionResponseData[],
    totalUniqueRespondents: number
  ): QuestionStats {
    const totalResponses = filteredResponses.length

    const skipRate = totalUniqueRespondents > 0
      ? ((totalUniqueRespondents - totalResponses) / totalUniqueRespondents) * 100
      : 0

    const baseStats: QuestionStats = {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      isRequired: question.required,
      totalResponses,
      skipRate,
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'CHECKBOX':
      case 'DROPDOWN':
        baseStats.optionStats = this.calculateOptionStats(
          question,
          filteredResponses,
          totalResponses
        )
        break

      case 'TEXT':
        baseStats.textAnalysis = this.calculateTextAnalysis(filteredResponses)
        break

      case 'SCALE':
        baseStats.scaleStats = this.calculateScaleStats(filteredResponses)
        break

      case 'GRID':
        baseStats.gridStats = this.calculateGridStats(question, filteredResponses)
        break
    }

    return baseStats
  }

  private calculateOptionStats(
    question: AnalyticsQuestionData,
    responses: QuestionResponseData[],
    totalResponses: number
  ) {
    const optionCounts = new Map<string, number>()

    responses.forEach(response => {
      const values = question.type === 'CHECKBOX'
        ? decodeCheckboxValues(response.value, question.options)
        : [response.value]

      values.forEach(value => {
        const optionText = !isNaN(Number(value)) && question.options[Number(value)]
          ? question.options[Number(value)]
          : value

        optionCounts.set(optionText, (optionCounts.get(optionText) || 0) + 1)
      })
    })

    return Array.from(optionCounts.entries()).map(([option, count]) => ({
      option,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
    }))
  }

  private calculateTextAnalysis(responses: QuestionResponseData[]) {
    const textResponses = responses.map(r => r.value)
    const allText = textResponses.join(' ')
    const words = allText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)

    const wordCounts = new Map<string, number>()
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })

    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    const maxFrequency = sortedWords.length > 0 ? Math.max(...sortedWords.map(w => w[1])) : 1

    return {
      averageLength: textResponses.length > 0
        ? textResponses.reduce((sum, text) => sum + text.length, 0) / textResponses.length
        : 0,
      totalWords: words.length,
      uniqueWords: wordCounts.size,
      wordCloud: sortedWords.map(([word, frequency]) => ({
        word,
        frequency,
        weight: frequency / maxFrequency,
      })),
      commonPhrases: [],
    }
  }

  private calculateScaleStats(responses: QuestionResponseData[]) {
    const scaleValues = responses
      .map(r => parseFloat(r.value))
      .filter(v => !isNaN(v))

    if (scaleValues.length === 0) {
      return undefined
    }

    const sorted = [...scaleValues].sort((a, b) => a - b)
    const sum = scaleValues.reduce((a, b) => a + b, 0)
    const average = sum / scaleValues.length
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    const valueCounts = new Map<number, number>()
    scaleValues.forEach(value => {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1)
    })

    const mode = Array.from(valueCounts.entries())
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0]

    const variance = scaleValues.reduce(
      (sum, value) => sum + Math.pow(value - average, 2),
      0
    ) / scaleValues.length
    const standardDeviation = Math.sqrt(variance)

    const distribution = Array.from(valueCounts.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / scaleValues.length) * 100,
      }))
      .sort((a, b) => a.value - b.value)

    return {
      average,
      median,
      mode,
      standardDeviation,
      distribution,
    }
  }

  private calculateGridStats(
    question: AnalyticsQuestionData,
    responses: QuestionResponseData[]
  ) {
    if (!question.rows || !question.columns) {
      return { rowStats: [], columnTotals: [] }
    }

    const gridResponses = new Map<string, Map<string, number>>()
    const columnTotals = new Map<string, number>()

    question.rows.forEach(row => {
      gridResponses.set(row, new Map())
      question.columns.forEach(col => {
        gridResponses.get(row)?.set(col, 0)
      })
    })

    question.columns.forEach(col => {
      columnTotals.set(col, 0)
    })

    responses.forEach(response => {
      try {
        const gridData = JSON.parse(response.value) as Record<string, string>
        Object.entries(gridData).forEach(([rowIndex, colValue]) => {
          const rowLabel = question.rows[parseInt(rowIndex)]
          if (rowLabel && typeof colValue === 'string') {
            const colIndex = colValue.split('-')[1]
            if (colIndex && question.columns[parseInt(colIndex)]) {
              const colLabel = question.columns[parseInt(colIndex)]
              const currentCount = gridResponses.get(rowLabel)?.get(colLabel) || 0
              gridResponses.get(rowLabel)?.set(colLabel, currentCount + 1)
              columnTotals.set(colLabel, (columnTotals.get(colLabel) || 0) + 1)
            }
          }
        })
      } catch {
        // Invalid grid response
      }
    })

    const rowStats = Array.from(gridResponses.entries()).map(([rowLabel, colCounts]) => {
      const totalRowResponses = Array.from(colCounts.values()).reduce((sum, count) => sum + count, 0)
      return {
        rowLabel,
        responses: Array.from(colCounts.entries()).map(([column, count]) => ({
          column,
          count,
          percentage: totalRowResponses > 0 ? (count / totalRowResponses) * 100 : 0,
        })),
      }
    })

    const totalGridResponses = Array.from(columnTotals.values()).reduce((sum, count) => sum + count, 0)
    const columnTotalStats = Array.from(columnTotals.entries()).map(([column, total]) => ({
      column,
      total,
      percentage: totalGridResponses > 0 ? (total / totalGridResponses) * 100 : 0,
    }))

    return {
      rowStats,
      columnTotals: columnTotalStats,
    }
  }
}

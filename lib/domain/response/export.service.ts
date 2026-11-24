import { decodeCheckboxValues } from '@/lib/domain/form/checkbox-values'
import type {
  ExportFormData,
  ExportQuestionData,
  ExportFilters,
  ExportResponseData,
  FormattedUserResponse,
  ExportResult,
} from './export.types'

export class ExportService {
  processExportData(
    form: ExportFormData,
    filters: ExportFilters
  ): ExportResult {
    const filteredQuestions = this.applyFilters(form.questions, filters)
    const finalQuestions = this.filterSectionsWithResponses(filteredQuestions)
    const exportData = this.buildUserResponsesMap(finalQuestions)

    return {
      form,
      questions: finalQuestions,
      data: exportData,
    }
  }

  private applyFilters(
    questions: ExportQuestionData[],
    filters: ExportFilters
  ): ExportQuestionData[] {
    const { campusFilter, courseFilter, roleFilter, dateFromFilter, dateToFilter } = filters

    return questions.map(question => ({
      ...question,
      responses: question.responses.filter(response => {
        if (campusFilter.length > 0 || courseFilter.length > 0 || roleFilter.length > 0) {
          const extraData = response.user.extraData as Record<string, unknown> | null

          const campus = (extraData?.campus as string) || 'Não informado'
          const course = (extraData?.course as string) || 'Não informado'
          const role = (extraData?.functionalRole as string) || 'Não informado'

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
      }),
    }))
  }

  private filterSectionsWithResponses(
    questions: ExportQuestionData[]
  ): ExportQuestionData[] {
    const sectionsWithResponses = new Set<string>()

    const sectionQuestions = questions.filter(q => q.type === 'SECTION')

    sectionQuestions.forEach(section => {
      const sectionIndex = questions.findIndex(q => q.id === section.id)

      const questionsAfterSection = questions.slice(sectionIndex + 1)
      const nextSectionIndex = questionsAfterSection.findIndex(q => q.type === 'SECTION')
      const questionsInSection = nextSectionIndex === -1
        ? questionsAfterSection
        : questionsAfterSection.slice(0, nextSectionIndex)

      const hasResponses = questionsInSection.some(
        question => question.type !== 'SECTION' && question.responses.length > 0
      )

      if (hasResponses) {
        sectionsWithResponses.add(section.id)
      }
    })

    return questions.filter(question => {
      if (question.type === 'SECTION') {
        return sectionsWithResponses.has(question.id)
      }

      const questionIndex = questions.findIndex(q => q.id === question.id)

      let sectionId: string | null = null
      for (let i = questionIndex - 1; i >= 0; i--) {
        if (questions[i].type === 'SECTION') {
          sectionId = questions[i].id
          break
        }
      }

      if (!sectionId) {
        return true
      }

      return sectionsWithResponses.has(sectionId)
    })
  }

  private buildUserResponsesMap(
    questions: ExportQuestionData[]
  ): FormattedUserResponse[] {
    const userResponsesMap = new Map<string, FormattedUserResponse>()

    const allUsers = new Set<string>()
    questions.forEach(question => {
      question.responses.forEach(response => {
        allUsers.add(response.userId)
      })
    })

    allUsers.forEach(userId => {
      let userResponse: ExportResponseData | null = null
      for (const question of questions) {
        userResponse = question.responses.find(r => r.userId === userId) || null
        if (userResponse) break
      }

      if (userResponse) {
        userResponsesMap.set(userId, {
          userId: userId,
          userName: userResponse.user.name,
          userEmail: userResponse.user.email,
          responses: {},
        })
      }
    })

    questions.forEach(question => {
      question.responses.forEach(response => {
        const userResponse = userResponsesMap.get(response.userId)
        if (userResponse) {
          const formattedValue = this.formatResponseValue(question, response.value)
          userResponse.responses[question.id] = {
            questionText: question.text || question.customId || `Questão ${question.order}`,
            questionType: question.type,
            value: response.value,
            formattedValue: formattedValue,
          }
        }
      })
    })

    return Array.from(userResponsesMap.values())
  }

  formatResponseValue(question: ExportQuestionData, value: string): string {
    if (!value || value === 'null' || value === 'undefined') {
      return 'Não respondido'
    }

    try {
      switch (question.type) {
        case 'MULTIPLE_CHOICE':
        case 'DROPDOWN':
          return this.formatChoiceValue(question, value)

        case 'CHECKBOX':
          return this.formatCheckboxValue(question, value)

        case 'GRID':
          return this.formatGridValue(question, value)

        case 'SCALE':
          return this.formatScaleValue(question, value)

        case 'TEXT':
        default:
          if (value === 'NaN' || value === 'null' || value === 'undefined') {
            return 'Não respondido'
          }
          return value
      }
    } catch {
      return 'Não respondido'
    }
  }

  private formatChoiceValue(question: ExportQuestionData, value: string): string {
    const optionIndex = parseInt(value)

    if (!isNaN(optionIndex) && question.options && question.options[optionIndex]) {
      return question.options[optionIndex]
    }

    if (question.options && question.options.includes(value)) {
      return value
    }

    return value
  }

  private formatCheckboxValue(question: ExportQuestionData, value: string): string {
    if (!value || value === 'NaN' || value === '') return 'Não respondido'

    const values = decodeCheckboxValues(value, question.options)
    const results: string[] = []

    values.forEach(val => {
      const index = parseInt(val)
      if (!isNaN(index) && question.options && question.options[index]) {
        results.push(question.options[index])
      } else if (question.options && question.options.includes(val)) {
        results.push(val)
      } else {
        results.push(val)
      }
    })

    return results.length > 0 ? results.join('; ') : 'Não respondido'
  }

  private formatGridValue(question: ExportQuestionData, value: string): string {
    if (!value || value === 'NaN' || value === '{}') return 'Não respondido'

    try {
      const gridData = JSON.parse(value) as Record<string, string>
      const formattedGrid: string[] = []

      Object.entries(gridData).forEach(([rowIndex, colValue]) => {
        const rowIndexNum = parseInt(rowIndex)
        if (isNaN(rowIndexNum)) return

        const rowLabel = question.rows?.[rowIndexNum] ?? `Linha ${rowIndex}`
        const colIndex = typeof colValue === 'string' ? colValue.split('-')[1] : String(colValue)
        const colIndexNum = parseInt(colIndex)

        if (!isNaN(colIndexNum)) {
          const colLabel = question.columns?.[colIndexNum] ?? `Coluna ${colIndex}`
          formattedGrid.push(`${rowLabel}: ${colLabel}`)
        }
      })

      return formattedGrid.length > 0 ? formattedGrid.join('; ') : 'Não respondido'
    } catch {
      return 'Não respondido'
    }
  }

  private formatScaleValue(question: ExportQuestionData, value: string): string {
    const scaleValue = parseInt(value)
    if (isNaN(scaleValue)) return 'Não respondido'
    return `${scaleValue} (de 1 a ${question.maxValue || 5})`
  }

  generateCSV(
    form: ExportFormData,
    questions: ExportQuestionData[],
    exportData: FormattedUserResponse[],
    includeMetrics: boolean,
    includePersonalData: boolean
  ): { content: string; fileName: string } {
    const headers = this.buildHeaders(questions, includeMetrics, includePersonalData)
    const csvRows = [headers.join(',')]

    exportData.forEach(userResponse => {
      const row = this.buildDataRow(userResponse, questions, includeMetrics, includePersonalData, 'csv')
      csvRows.push(row.join(','))
    })

    const content = csvRows.join('\n')
    const fileName = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_respostas_${new Date().toISOString().split('T')[0]}.csv`

    return { content, fileName }
  }

  generateExcel(
    form: ExportFormData,
    questions: ExportQuestionData[],
    exportData: FormattedUserResponse[],
    includeMetrics: boolean,
    includePersonalData: boolean
  ): { content: string; fileName: string } {
    const headers = this.buildHeaders(questions, includeMetrics, includePersonalData)
    const tsvRows = [headers.join('\t')]

    exportData.forEach(userResponse => {
      const row = this.buildDataRow(userResponse, questions, includeMetrics, includePersonalData, 'tsv')
      tsvRows.push(row.join('\t'))
    })

    const content = tsvRows.join('\n')
    const fileName = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_respostas_${new Date().toISOString().split('T')[0]}.tsv`

    return { content, fileName }
  }

  private buildHeaders(
    questions: ExportQuestionData[],
    includeMetrics: boolean,
    includePersonalData: boolean
  ): string[] {
    const headers = ['ID do Usuário']

    if (includePersonalData) {
      headers.push('Nome', 'Email')
    }

    questions.forEach(question => {
      const questionHeader = question.customId || question.text || `Questão ${question.order}`
      headers.push(questionHeader)
      if (includeMetrics && ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(question.type)) {
        headers.push(`${questionHeader} (Valor Bruto)`)
      }
    })

    return headers
  }

  private buildDataRow(
    userResponse: FormattedUserResponse,
    questions: ExportQuestionData[],
    includeMetrics: boolean,
    includePersonalData: boolean,
    format: 'csv' | 'tsv'
  ): string[] {
    const row = [userResponse.userId]

    if (includePersonalData) {
      if (format === 'csv') {
        row.push(`"${userResponse.userName}"`, userResponse.userEmail)
      } else {
        row.push(userResponse.userName, userResponse.userEmail)
      }
    }

    questions.forEach(question => {
      const response = userResponse.responses[question.id]
      if (response) {
        const formattedValue = response.formattedValue || 'Não respondido'
        if (format === 'csv') {
          row.push(`"${formattedValue.replace(/"/g, '""')}"`)
        } else {
          row.push(formattedValue)
        }
        if (includeMetrics && ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(question.type)) {
          const rawValue = response.value || ''
          if (format === 'csv') {
            row.push(`"${rawValue}"`)
          } else {
            row.push(rawValue)
          }
        }
      } else {
        if (format === 'csv') {
          row.push('"Não respondido"')
        } else {
          row.push('Não respondido')
        }
        if (includeMetrics && ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(question.type)) {
          if (format === 'csv') {
            row.push('""')
          } else {
            row.push('')
          }
        }
      }
    })

    return row
  }
}

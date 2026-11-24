/**
 * Form Metrics API Route
 * 
 * Returns metrics and analytics for form responses.
 */

import { NextResponse } from 'next/server'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { handleDomainError, NotFoundError } from '@/lib/domain/errors'
import { prisma } from '@/lib/services/prisma'
import { FormMetrics } from '@/types/entities/response'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await requireAdminOrCSA()
    
    const { formId } = await params
    const { searchParams } = new URL(req.url)
    
    // Extract filters from query string
    const campusFilter = searchParams.get('campus')?.split(',').filter(Boolean) || []
    const courseFilter = searchParams.get('course')?.split(',').filter(Boolean) || []
    const roleFilter = searchParams.get('role')?.split(',').filter(Boolean) || []
    const dateFromFilter = searchParams.get('dateFrom')
    const dateToFilter = searchParams.get('dateTo')

    // Verificar se o formulário existe (select otimizado)
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        estimatedTime: true,
        _count: {
          select: {
            questions: true
          }
        },
        responses: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                extraData: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    // Aplicar filtros nas respostas
    let filteredResponses = form.responses

    // Filtrar por campus, curso e role
    if (campusFilter.length > 0 || courseFilter.length > 0 || roleFilter.length > 0) {
      filteredResponses = filteredResponses.filter(response => {
        const extraData = response.user.extraData as any
        
        const campus = extraData?.campus || 'Não informado'
        const course = extraData?.course || 'Não informado'
        const role = extraData?.functionalRole || 'Não informado'
        
        const campusMatch = campusFilter.length === 0 || campusFilter.includes(campus)
        const courseMatch = courseFilter.length === 0 || courseFilter.includes(course)
        const roleMatch = roleFilter.length === 0 || roleFilter.includes(role)
        
        return campusMatch && courseMatch && roleMatch
      })
    }

    // Filtrar por data
    if (dateFromFilter || dateToFilter) {
      filteredResponses = filteredResponses.filter(response => {
        const responseDate = new Date(response.createdAt)
        
        if (dateFromFilter && responseDate < new Date(dateFromFilter)) return false
        if (dateToFilter && responseDate > new Date(dateToFilter)) return false
        
        return true
      })
    }

    // Calcular métricas básicas com dados filtrados
    const uniqueRespondents = new Set(filteredResponses.map(r => r.userId))
    const totalResponses = uniqueRespondents.size
    const totalQuestions = form._count.questions

    // Calcular taxa de resposta (baseada em usuários ativos)
    const totalActiveUsers = await prisma.user.count({
      where: { active: true }
    })

    const responseRate = totalActiveUsers > 0 
      ? (totalResponses / totalActiveUsers) * 100 
      : 0

    // Calcular tempo médio (estimativa baseada no tempo estimado do formulário)
    const averageTime = form.estimatedTime ? parseInt(form.estimatedTime) : 0

    // Taxa de conclusão (assumindo que ter resposta = conclusão por enquanto)
    const completionRate = totalResponses > 0 ? 100 : 0

    // Respostas por dia (média)
    const firstResponse = filteredResponses.length > 0
      ? filteredResponses.reduce((earliest, current) => 
          new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest
        ).createdAt
      : new Date()

    const daysSinceFirst = Math.max(1, 
      Math.ceil((Date.now() - new Date(firstResponse).getTime()) / (1000 * 60 * 60 * 24))
    )
    
    const avgResponsesPerDay = totalResponses / daysSinceFirst

    // Análise demográfica básica (baseada em extraData dos usuários)
    const demographics = {
      byCampus: [] as Array<{ campus: string; count: number; percentage: number }>,
      byCourse: [] as Array<{ course: string; count: number; percentage: number }>,
      byRole: [] as Array<{ role: string; count: number; percentage: number }>,
      byPeriod: [] as Array<{ period: string; count: number }>
    }

    // Agrupar por campus, curso e role
    const campusMap = new Map<string, number>()
    const courseMap = new Map<string, number>()
    const roleMap = new Map<string, number>()

    filteredResponses.forEach(response => {
      const extraData = response.user.extraData as any
      
      // Campus
      const campus = extraData?.campus || 'Não informado'
      campusMap.set(campus, (campusMap.get(campus) || 0) + 1)
      
      // Curso  
      const course = extraData?.course || 'Não informado'
      courseMap.set(course, (courseMap.get(course) || 0) + 1)
      
      // Role
      const role = extraData?.functionalRole || 'Não informado'
      roleMap.set(role, (roleMap.get(role) || 0) + 1)
    })

    // Converter para arrays com percentuais
    demographics.byCampus = Array.from(campusMap.entries()).map(([campus, count]) => ({
      campus,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
    }))

    demographics.byCourse = Array.from(courseMap.entries()).map(([course, count]) => ({
      course,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
    }))

    demographics.byRole = Array.from(roleMap.entries()).map(([role, count]) => ({
      role,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
    }))

    // Timeline básica (últimos 30 dias)
    const timeline = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const responsesOnDate = filteredResponses.filter(r => 
        r.createdAt.toISOString().split('T')[0] === dateStr
      ).length

      const cumulativeResponses = filteredResponses.filter(r => 
        new Date(r.createdAt) <= date
      ).length

      timeline.push({
        date: dateStr,
        responses: responsesOnDate,
        cumulative: cumulativeResponses
      })
    }

    const metrics: FormMetrics = {
      overview: {
        totalResponses,
        totalUsers: totalActiveUsers,
        responseRate,
        averageTime,
        completionRate,
        avgResponsesPerDay
      },
      demographics,
      timeline
    }

    return NextResponse.json({ data: metrics })
  } catch (error) {
    return handleDomainError(error)
  }
}

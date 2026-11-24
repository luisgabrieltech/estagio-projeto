import { describe, expect, it } from 'vitest'
import { canAccessEvaluation } from '@/lib/domain/form/form-audience'
import { formKeys } from '@/lib/query/keys'

const user = { id: 'member', role: 'USER', active: true, functionalRoles: ['DOCENTE'] }
const restricted = { visibleToRoles: ['DOCENTE'], visibleToUserIds: [] }

describe('público da avaliação', () => {
  it('reconhece o segmento da coluna de cadastro', () => {
    expect(canAccessEvaluation(user, restricted)).toBe(true)
  })

  it('respeita seleção legada explícita, inclusive quando vazia', () => {
    expect(canAccessEvaluation({ ...user, extraData: { functionalRoles: [] } }, restricted)).toBe(false)
    expect(canAccessEvaluation({ ...user, functionalRoles: [], extraData: { functionalRoles: ['DOCENTE'] } }, restricted)).toBe(true)
  })

  it('respeita o público selecionado por conta', () => {
    const form = { visibleToRoles: [], visibleToUserIds: ['member'] }
    expect(canAccessEvaluation(user, form)).toBe(true)
    expect(canAccessEvaluation({ ...user, id: 'other' }, form)).toBe(false)
  })

  it('mantém o acesso administrativo para contas ativas', () => {
    const form = { visibleToRoles: ['EGRESSO'], visibleToUserIds: [] }
    expect(canAccessEvaluation({ ...user, role: 'ADMIN' }, form)).toBe(true)
    expect(canAccessEvaluation({ ...user, role: 'ADMIN', active: false }, form)).toBe(false)
  })

  it('separa o cache de formulários por conta', () => {
    expect(formKeys.public('member')).not.toEqual(formKeys.public('other'))
    expect(formKeys.public('member').slice(0, -1)).toEqual(formKeys.public())
  })
})

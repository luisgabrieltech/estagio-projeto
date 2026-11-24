import { describe, expect, it } from 'vitest'
import { ExportService } from '@/lib/domain/response/export.service'
import { decodeCheckboxValues } from '@/lib/domain/form/checkbox-values'
import { getVisibleQuestionIds, hasQuestionAnswer } from '@/lib/domain/form/question-visibility'

function conditional(id: string, dependsOn: string, value: string) {
  return {
    id,
    type: 'TEXT',
    conditional: { dependsOn, operator: 'AND', conditions: [{ type: 'equals', value }] },
  }
}

describe('visibilidade das perguntas', () => {
  it('não usa uma resposta antiga de uma dependência oculta', () => {
    const questions = [
      { id: 'first', type: 'TEXT' },
      conditional('second', 'first', 'Sim'),
      conditional('third', 'second', 'Sim'),
    ]
    expect([...getVisibleQuestionIds(questions, { first: 'Não', second: 'Sim' })]).toEqual(['first'])
  })

  it('oculta dependências cíclicas', () => {
    const questions = [conditional('a', 'b', 'Sim'), conditional('b', 'a', 'Sim')]
    expect(getVisibleQuestionIds(questions, { a: 'Sim', b: 'Sim' }).size).toBe(0)
  })

  it('preserva a seleção de opções com vírgula em respostas novas', () => {
    const selected = ['Recife, PE', 'Remoto']
    const questions = [
      { id: 'first', type: 'CHECKBOX', options: selected },
      conditional('second', 'first', 'Recife, PE'),
    ]
    const value = JSON.stringify(selected)
    expect(decodeCheckboxValues(value, selected)).toEqual(selected)
    expect(getVisibleQuestionIds(questions, { first: value }).has('second')).toBe(true)
    expect(getVisibleQuestionIds(questions, { first: selected }).has('second')).toBe(true)
    expect(hasQuestionAnswer(questions[0], '[]')).toBe(false)
  })

  it('lê as seleções armazenadas no formato legado', () => {
    expect(decodeCheckboxValues('0, 2')).toEqual(['0', '2'])
    expect(decodeCheckboxValues('Recife, PE', ['Recife, PE'])).toEqual(['Recife, PE'])
  })

  it('exporta valores novos e legados como rótulos legíveis', () => {
    const exporter = new ExportService()
    const question = {
      id: 'selection', customId: null, text: 'Local', type: 'CHECKBOX' as const,
      order: 0, options: ['Recife, PE', 'Remoto'], rows: [], columns: [], responses: [],
    }
    expect(exporter.formatResponseValue(question, '0, 1')).toBe('Recife, PE; Remoto')
    expect(exporter.formatResponseValue(question, '["Recife, PE","Remoto"]')).toBe('Recife, PE; Remoto')
  })
})

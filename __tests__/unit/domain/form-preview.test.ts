import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PreviewTab } from '@/components/forms/FormBuilder/PreviewTab'
import { createQuestion } from '@/__tests__/utils/factories/form.factory'

afterEach(cleanup)

it('simula dependências encadeadas na prévia do editor', () => {
  const questions = [
    createQuestion('form', {
      id: 'first', customId: 'initial-choice', type: 'MULTIPLE_CHOICE',
      text: 'Participou?', options: ['Sim', 'Não'],
    }),
    createQuestion('form', {
      id: 'second', type: 'MULTIPLE_CHOICE', text: 'Foi presencial?',
      options: ['Presencial', 'Remoto'],
      conditional: {
        dependsOn: 'initial-choice', operator: 'AND', conditions: [{ type: 'equals', value: 'Sim' }],
      },
    }),
    createQuestion('form', {
      id: 'third', text: 'Qual foi o local?',
      conditional: {
        dependsOn: 'second', operator: 'AND', conditions: [{ type: 'equals', value: 'Presencial' }],
      },
    }),
  ]

  render(createElement(PreviewTab, {
    formData: {
      title: 'Avaliação', description: '', category: '', status: 'DRAFT',
      deadline: null, estimatedTime: null, generatesCertificate: false,
      certificateHours: null, questions,
    },
  }))

  expect(screen.queryByText(/Foi presencial/)).toBeNull()
  fireEvent.click(screen.getByRole('radio', { name: 'Sim' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Presencial' }))
  expect(screen.queryByText(/Qual foi o local/)).not.toBeNull()
  fireEvent.click(screen.getByRole('radio', { name: 'Não' }))
  expect(screen.queryByText(/Foi presencial/)).toBeNull()
  expect(screen.queryByText(/Qual foi o local/)).toBeNull()
})

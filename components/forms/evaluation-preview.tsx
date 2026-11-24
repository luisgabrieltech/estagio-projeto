'use client'

import { useMemo, useState } from 'react'
import { QuestionCard } from '@/components/evaluations/EvaluationForm/QuestionCard'
import type { EvaluationQuestion, ResponseValue } from '@/hooks/evaluations/useEvaluationForm'
import { getVisibleQuestionIds } from '@/lib/domain/form/question-visibility'

export function EvaluationPreview({ questions }: { questions: readonly EvaluationQuestion[] }) {
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({})
  const visibleIds = useMemo(() => getVisibleQuestionIds(questions, responses), [questions, responses])
  let questionNumber = 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Teste as perguntas e suas condições. As respostas desta prévia são descartadas ao sair.
      </p>
      {questions.map(question => {
        if (question.type.toLowerCase() !== 'section') questionNumber += 1
        if (!visibleIds.has(question.id)) return null

        return (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={questionNumber}
            value={responses[question.id]}
            onChange={value => setResponses(previous => ({ ...previous, [question.id]: value }))}
          />
        )
      })}
    </div>
  )
}

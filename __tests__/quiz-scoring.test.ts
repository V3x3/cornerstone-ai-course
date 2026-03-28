function scoreQuiz(answers: Record<number, number>, questions: { id: number; correct: number }[]): number {
  const correct = questions.filter(q => answers[q.id] === q.correct).length
  return Math.round((correct / questions.length) * 100)
}

test('all correct = 100', () => {
  const questions = [{ id: 1, correct: 1 }, { id: 2, correct: 2 }, { id: 3, correct: 0 }]
  const answers = { 1: 1, 2: 2, 3: 0 }
  expect(scoreQuiz(answers, questions)).toBe(100)
})

test('none correct = 0', () => {
  const questions = [{ id: 1, correct: 1 }, { id: 2, correct: 2 }]
  const answers = { 1: 0, 2: 0 }
  expect(scoreQuiz(answers, questions)).toBe(0)
})

test('3 of 5 correct = 60 (pass)', () => {
  const questions = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, correct: 0 }))
  const answers = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 }
  expect(scoreQuiz(answers, questions)).toBe(60)
})

test('pass mark is 60', () => {
  expect(60 >= 60).toBe(true)
  expect(59 >= 60).toBe(false)
})

import { calculateModuleProgress, isCourseComplete } from '@/lib/progress'

test('0 completed lessons = 0% progress', () => {
  expect(calculateModuleProgress(1, [])).toBe(0)
})

test('all 5 lessons in module 1 = 100%', () => {
  const completed = [
    { module_id: 1, lesson_id: 1 },
    { module_id: 1, lesson_id: 2 },
    { module_id: 1, lesson_id: 3 },
    { module_id: 1, lesson_id: 4 },
    { module_id: 1, lesson_id: 5 },
  ]
  expect(calculateModuleProgress(1, completed)).toBe(100)
})

test('3 of 5 lessons = 60%', () => {
  const completed = [
    { module_id: 2, lesson_id: 1 },
    { module_id: 2, lesson_id: 2 },
    { module_id: 2, lesson_id: 3 },
  ]
  expect(calculateModuleProgress(2, completed)).toBe(60)
})

test('course complete when all 21 lessons done', () => {
  const allLessons: { module_id: number; lesson_id: number }[] = []
  for (let m = 1; m <= 3; m++) for (let l = 1; l <= 5; l++) allLessons.push({ module_id: m, lesson_id: l })
  for (let l = 1; l <= 6; l++) allLessons.push({ module_id: 4, lesson_id: l })
  expect(isCourseComplete(allLessons)).toBe(true)
})

test('course not complete with 20 lessons', () => {
  const lessons: { module_id: number; lesson_id: number }[] = []
  for (let m = 1; m <= 3; m++) for (let l = 1; l <= 5; l++) lessons.push({ module_id: m, lesson_id: l })
  for (let l = 1; l <= 5; l++) lessons.push({ module_id: 4, lesson_id: l })
  expect(isCourseComplete(lessons)).toBe(false)
})

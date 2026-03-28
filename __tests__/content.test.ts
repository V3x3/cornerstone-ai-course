import { MODULES, getLessonCount, getModule, getLesson } from '@/lib/content'

test('4 modules defined', () => {
  expect(MODULES).toHaveLength(4)
})

test('each module has id, title, description, accentColor', () => {
  MODULES.forEach(m => {
    expect(m.id).toBeDefined()
    expect(m.title).toBeDefined()
    expect(m.description).toBeDefined()
    expect(m.accentColor).toBeDefined()
  })
})

test('module 4 has 6 lessons, others have 5', () => {
  expect(getLessonCount(1)).toBe(5)
  expect(getLessonCount(2)).toBe(5)
  expect(getLessonCount(3)).toBe(5)
  expect(getLessonCount(4)).toBe(6)
})

test('getModule returns correct module', () => {
  expect(getModule(1)?.title).toBe('What AI Actually Is')
  expect(getModule(4)?.title).toContain('Hydra')
})

test('getLesson returns lesson metadata', () => {
  const lesson = getLesson(1, 1)
  expect(lesson?.title).toBeDefined()
  expect(lesson?.slug).toBeDefined()
})

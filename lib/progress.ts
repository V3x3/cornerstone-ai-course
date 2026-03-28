import { getLessonCount, TOTAL_LESSONS } from './content'

export interface ProgressRow {
  module_id: number
  lesson_id: number
}

export function calculateModuleProgress(moduleId: number, completed: ProgressRow[]): number {
  const total = getLessonCount(moduleId)
  if (total === 0) return 0
  const done = completed.filter(r => r.module_id === moduleId).length
  return Math.round((done / total) * 100)
}

export function isModuleComplete(moduleId: number, completed: ProgressRow[]): boolean {
  return calculateModuleProgress(moduleId, completed) === 100
}

export function isCourseComplete(completed: ProgressRow[]): boolean {
  return completed.length >= TOTAL_LESSONS
}

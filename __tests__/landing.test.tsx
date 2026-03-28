import { render, screen } from '@testing-library/react'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import ModuleCard from '@/components/landing/ModuleCard'
import { MODULES } from '@/lib/content'

test('Hero renders headline and CTA', () => {
  render(<Hero />)
  expect(screen.getByText(/Learn to think/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /enrol free/i })).toBeInTheDocument()
})

test('Stats renders 5 stat items', () => {
  render(<Stats />)
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
})

test('ModuleCard renders module title and lesson count', () => {
  render(<ModuleCard module={MODULES[0]} index={0} />)
  expect(screen.getByText('What AI Actually Is')).toBeInTheDocument()
  expect(screen.getByText(/5 lessons/i)).toBeInTheDocument()
})

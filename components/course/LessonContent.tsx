import { marked, type Tokens } from 'marked'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Strip raw HTML blocks from markdown output (defence in depth)
const renderer = new marked.Renderer()
renderer.html = (_token: Tokens.HTML) => ''

interface Props {
  moduleId: number
  lessonId: number
}

export default function LessonContent({ moduleId, lessonId }: Props) {
  const filePath = path.join(process.cwd(), 'content', `module-${moduleId}`, `${lessonId}.md`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)
  const html = marked(content, { renderer }) as string

  return (
    <article
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: '15px' }}
    />
  )
}

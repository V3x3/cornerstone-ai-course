export interface Lesson {
  id: number
  slug: string
  title: string
  isExercise?: boolean
}

export interface Module {
  id: number
  title: string
  description: string
  accentColor: string
  accentBg: string
  lessons: Lesson[]
}

export const MODULES: Module[] = [
  {
    id: 1,
    title: 'What AI Actually Is',
    description: 'Build a reliable mental model of how LLMs work — without equations.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'transformers-history', title: 'From rule-based systems to transformers: a 5-minute history' },
      { id: 2, slug: 'how-llms-work', title: 'How language models predict the next word — and why that\'s profound' },
      { id: 3, slug: 'hallucinations', title: 'Hallucinations, bias, and the limits you must know' },
      { id: 4, slug: 'narrow-vs-agi', title: 'Narrow AI vs AGI: separating reality from headlines' },
      { id: 5, slug: 'stress-test-exercise', title: 'Exercise: stress-test an AI and document where it breaks', isExercise: true },
    ],
  },
  {
    id: 2,
    title: 'AI Tools in Practice',
    description: 'Write prompts that work, choose the right tool, build a workflow that saves hours per week.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'prompt-engineering', title: 'Prompt engineering: zero-shot, few-shot, chain-of-thought' },
      { id: 2, slug: 'tool-comparison', title: 'Claude vs ChatGPT vs Gemini: when to use which' },
      { id: 3, slug: 'rewrite-exercise', title: 'Exercise: rewrite a real document in under 10 minutes', isExercise: true },
      { id: 4, slug: 'research-synthesis', title: 'AI for research, analysis, and synthesis' },
      { id: 5, slug: 'personal-workflow', title: 'Building a personal AI workflow you\'ll actually use' },
    ],
  },
  {
    id: 3,
    title: 'Building with AI — Agents, Claude & the Terminal',
    description: 'Cross the line from user to builder. No prior coding required.',
    accentColor: '#d97706',
    accentBg: '#fef3c7',
    lessons: [
      { id: 1, slug: 'what-is-an-agent', title: 'What is an AI agent? Loops, tools, memory, and autonomy explained' },
      { id: 2, slug: 'claude-terminal', title: 'Running Claude from the terminal: your first CLI session' },
      { id: 3, slug: 'mcp-plugins', title: 'Plugins & MCP servers: extending AI with real-world tools' },
      { id: 4, slug: 'tokens-explained', title: 'Tokens demystified: context windows, costs, and why they shape everything' },
      { id: 5, slug: 'build-agent-exercise', title: 'Exercise: build a simple agent that does something useful for your work', isExercise: true },
    ],
  },
  {
    id: 4,
    title: 'The Hydra Mindset — Critical Thinking, Game Theory & Antifragility',
    description: 'A strategic framework to thrive under AI disruption, not merely survive it.',
    accentColor: '#6366f1',
    accentBg: '#eef2ff',
    lessons: [
      { id: 1, slug: 'hydra-principle', title: 'The Hydra principle: why AI disruption rewards the antifragile' },
      { id: 2, slug: 'game-theory-basics', title: 'Game theory basics: Nash equilibria, arms races, and AI adoption' },
      { id: 3, slug: 'prisoners-dilemma', title: 'The prisoner\'s dilemma of automation — and how to escape it' },
      { id: 4, slug: 'second-order-thinking', title: 'Second-order thinking: what happens after everyone uses AI?' },
      { id: 5, slug: 'via-negativa', title: 'Via negativa: what to remove from your thinking to become clearer' },
      { id: 6, slug: 'antifragility-map', title: 'Final exercise: your Antifragility Map', isExercise: true },
    ],
  },
]

export function getModule(moduleId: number): Module | undefined {
  return MODULES.find(m => m.id === moduleId)
}

export function getLessonCount(moduleId: number): number {
  return getModule(moduleId)?.lessons.length ?? 0
}

export function getLesson(moduleId: number, lessonId: number): Lesson | undefined {
  return getModule(moduleId)?.lessons.find(l => l.id === lessonId)
}

export const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0) // 21

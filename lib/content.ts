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
    title: 'The Intelligence Layer',
    description: 'What AI actually is, through the lens of how humans think — without mysticism.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'how-llms-predict', title: 'How language models predict — and why it mirrors human heuristics' },
      { id: 2, slug: 'the-hallucination-problem', title: 'The hallucination problem — overconfidence, Dunning-Kruger, and why AI lies convincingly' },
      { id: 3, slug: 'thinking-partner-vs-search-engine', title: 'AI as a thinking partner vs. a search engine — a critical distinction' },
      { id: 4, slug: 'the-european-moment', title: 'The European moment — why geography, regulation, and culture change the AI equation' },
      { id: 5, slug: 'what-ai-cannot-do', title: 'What AI cannot do — and why that matters more than what it can' },
      { id: 6, slug: 'exercise-stress-test', title: 'Exercise: stress-test an AI on something you know deeply', isExercise: true },
    ],
  },
  {
    id: 2,
    title: "The Philosopher's Stone",
    description: 'Critical thinking, cognitive traps, and the mental models that separate good thinkers from great ones.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'confirmation-bias', title: 'Confirmation bias — how AI turns your blind spots into blind highways' },
      { id: 2, slug: 'availability-heuristic', title: 'The availability heuristic — why vivid beats accurate, and what to do about it' },
      { id: 3, slug: 'chestertons-fence', title: "Chesterton's Fence — never automate what you don't understand" },
      { id: 4, slug: 'first-principles', title: 'First principles thinking — Aristotle, Musk, and prompting that actually works' },
      { id: 5, slug: 'the-steel-man', title: 'The steel man — using AI to argue against yourself' },
      { id: 6, slug: 'exercise-steel-man', title: 'Exercise: use AI to challenge your strongest professional belief', isExercise: true },
    ],
  },
  {
    id: 3,
    title: 'The Game',
    description: 'Game theory and strategic thinking for the AI era — applied to professional life.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'prisoners-dilemma', title: "The Prisoner's Dilemma — why cooperation is the most underrated professional skill in the AI age" },
      { id: 2, slug: 'nash-equilibrium', title: 'Nash Equilibrium — when everyone optimises and nobody wins' },
      { id: 3, slug: 'signalling-theory', title: 'Signalling theory — what you communicate without saying anything (and what AI erases)' },
      { id: 4, slug: 'second-order-thinking', title: 'Second-order thinking — what happens after what happens after AI' },
      { id: 5, slug: 'the-meta-game', title: "The meta-game — how to identify which game you're actually playing" },
      { id: 6, slug: 'exercise-map-your-game', title: 'Exercise: map the professional game you are currently playing', isExercise: true },
    ],
  },
  {
    id: 4,
    title: 'The Hydra',
    description: 'Antifragility, optionality, and building a career that gains from disorder — in an age of AI disruption.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'antifragility', title: 'Antifragility — the difference between robust, resilient, and antifragile in the AI economy' },
      { id: 2, slug: 'the-hydra-principle', title: 'The Hydra principle — why some careers get stronger from disruption' },
      { id: 3, slug: 'optionality', title: 'Optionality — how to use AI to expand your option set, not narrow it' },
      { id: 4, slug: 'black-swans', title: 'Black Swans and positioning — why the biggest career opportunities will look like chaos first' },
      { id: 5, slug: 'barbell-strategy', title: 'The barbell strategy — Taleb applied to professional development in the AI age' },
      { id: 6, slug: 'exercise-antifragility-audit', title: 'Exercise: your personal antifragility audit', isExercise: true },
    ],
  },
  {
    id: 5,
    title: 'The Price of Delegation',
    description: 'What you lose when you outsource your thinking — and how to keep the gains without paying the cost.',
    accentColor: 'var(--g3)',
    accentBg: 'var(--bg2)',
    lessons: [
      { id: 1, slug: 'the-outsourcing-trap', title: 'The outsourcing trap — when delegation becomes dependency' },
      { id: 2, slug: 'the-centaur-model', title: 'The centaur model — knowing which decisions to keep' },
      { id: 3, slug: 'epistemic-humility', title: 'Epistemic humility in practice — the difference between understanding and having been summarised to' },
      { id: 4, slug: 'asymmetric-tools', title: 'Asymmetric tools — not all AI use is equal' },
      { id: 5, slug: 'the-long-game', title: 'The long game — no one can help you get to the island' },
      { id: 6, slug: 'exercise-dependency-audit', title: 'Exercise: your personal dependency audit', isExercise: true },
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

export const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0) // 30

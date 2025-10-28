import { readable, writable, type Writable } from 'svelte/store'

export type AppMode = 'idle' | 'editing' | 'parsing'

export interface MorphemeMeta {
  id: string
  text: string
  createdAt: string
  lastReviewedAt: string | null
  vocabCount: number
  grammarCount: number
  tags: string[]
}

export interface ParseSession {
  id: string
  sentence: string
  morphemes: MorphemeMeta[]
  nodes: any[]
  edges: any[]
  createdAt: string
  lastReviewedAt: string | null
  completed: boolean
  tags: string[]
}

export interface SessionState {
  mode: AppMode
  current: ParseSession | null
}

function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function tokenizeToMorphemes(sentence: string): MorphemeMeta[] {
  const now = new Date().toISOString()
  // Simple tokenization on whitespace; punctuation kept for MVP
  return sentence
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(text => ({
      id: generateId('m'),
      text,
      createdAt: now,
      lastReviewedAt: null,
      vocabCount: 0,
      grammarCount: 0,
      tags: [],
    }))
}

function morphemesToFlow(morphemes: MorphemeMeta[]) {
  const nodes = morphemes.map((m, index) => ({
    id: m.id,
    position: { x: index * 140, y: 0 },
    data: { label: m.text },
    // XYFlow Svelte accepts additional styling via classes if needed
  }))
  const edges = morphemes.slice(1).map((m, index) => ({
    id: `e-${morphemes[index].id}-${m.id}`,
    source: morphemes[index].id,
    target: m.id,
  }))
  return { nodes, edges }
}

function createSessionStore() {
  const { subscribe, update }: Writable<SessionState> = writable({
    mode: 'idle',
    current: null,
  })

  const startNew = () => {
    update(() => ({
      mode: 'editing',
      current: {
        id: generateId('s'),
        sentence: '',
        morphemes: [],
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        lastReviewedAt: null,
        completed: false,
        tags: [],
      },
    }))
  }

  const updateSentence = (sentence: string) => {
    update(state => {
      if (!state.current) return state
      return {
        ...state,
        current: { ...state.current, sentence },
      }
    })
  }

  const beginParse = () => {
    update(state => {
      if (!state.current) return state
      const morphemes = tokenizeToMorphemes(state.current.sentence)
      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        mode: 'parsing',
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const toggleEdit = () => {
    update(state => ({
      ...state,
      mode: state.mode === 'parsing' ? 'editing' : 'parsing',
    }))
  }

  const setCompleted = (completed: boolean) => {
    update(state => {
      if (!state.current) return state
      return {
        ...state,
        current: { ...state.current, completed },
      }
    })
  }

  const exportJSON = () => {
    let snapshot: SessionState | null = null
    const unsub = subscribe(s => (snapshot = s))
    unsub()
    const data = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lingua-session-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = async (file: File) => {
    const text = await file.text()
    const snapshot = JSON.parse(text) as SessionState
    update(() => snapshot)
  }

  return {
    subscribe,
    startNew,
    updateSentence,
    beginParse,
    toggleEdit,
    setCompleted,
    exportJSON,
    importJSON,
  }
}

export const sessionStore = createSessionStore()

export const modes = readable<AppMode[]>(['idle', 'editing', 'parsing'])

import { readable, writable, type Writable } from 'svelte/store'

export type AppMode = 'idle' | 'editing' | 'parsing'

export type Note =
  | { id: string; type: 'vocab'; target: string; native: string; createdAt: string }
  | { id: string; type: 'grammar'; text: string; createdAt: string }

export interface MorphemeMeta {
  id: string
  text: string
  createdAt: string
  lastReviewedAt: string | null
  vocabCount: number
  grammarCount: number
  tags: string[]
  notes: Note[]
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
      notes: [],
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
    id: `e-${morphemes[index]!.id}-${m.id}`,
    source: morphemes[index]!.id,
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

  const addNoteToMorpheme = (
    morphemeId: string,
    payload: { type: 'vocab'; target: string; native: string } | { type: 'grammar'; text: string }
  ) => {
    update(state => {
      if (!state.current) return state
      const morphemes = state.current.morphemes.map(m => {
        if (m.id === morphemeId) {
          const now = new Date().toISOString()
          const note: Note =
            payload.type === 'vocab'
              ? { id: generateId('n'), type: 'vocab', target: payload.target, native: payload.native, createdAt: now }
              : { id: generateId('n'), type: 'grammar', text: payload.text, createdAt: now }
          const vocabCount = note.type === 'vocab' ? m.vocabCount + 1 : m.vocabCount
          const grammarCount = note.type === 'grammar' ? m.grammarCount + 1 : m.grammarCount
          return {
            ...m,
            notes: [...m.notes, note],
            vocabCount,
            grammarCount,
          }
        }
        return m
      })
      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const breakMorpheme = (morphemeId: string, breakIndex: number) => {
    update(state => {
      if (!state.current) return state
      const morphemeIndex = state.current.morphemes.findIndex(m => m.id === morphemeId)
      if (morphemeIndex === -1) return state

      const morpheme = state.current.morphemes[morphemeIndex]!
      const beforeText = morpheme.text.substring(0, breakIndex).trim()
      const afterText = morpheme.text.substring(breakIndex).trim()

      if (!beforeText || !afterText) return state

      const now = new Date().toISOString()
      const newMorpheme: MorphemeMeta = {
        id: generateId('m'),
        text: afterText,
        createdAt: now,
        lastReviewedAt: null,
        vocabCount: 0,
        grammarCount: 0,
        tags: [],
        notes: [],
      }

      const updatedMorpheme: MorphemeMeta = {
        ...morpheme,
        text: beforeText,
      }

      const morphemes = [
        ...state.current.morphemes.slice(0, morphemeIndex),
        updatedMorpheme,
        newMorpheme,
        ...state.current.morphemes.slice(morphemeIndex + 1),
      ]

      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const combineMorphemes = (morphemeIds: string[]) => {
    update(state => {
      if (!state.current || morphemeIds.length < 2) return state

      const indices = morphemeIds
        .map(id => state.current!.morphemes.findIndex(m => m.id === id))
        .filter(idx => idx !== -1)
        .sort((a, b) => a - b)

      if (indices.length < 2) return state

      const idxFirst = indices[0]!
      const firstMorpheme = state.current.morphemes[idxFirst]!
      const combinedText = indices
        .map(idx => state.current!.morphemes[idx]!.text)
        .join(' ')
      
      const combinedNotes = indices.flatMap(idx => state.current!.morphemes[idx]!.notes)
      const combinedVocabCount = indices.reduce((sum, idx) => sum + state.current!.morphemes[idx]!.vocabCount, 0)
      const combinedGrammarCount = indices.reduce((sum, idx) => sum + state.current!.morphemes[idx]!.grammarCount, 0)

      const combinedMorpheme: MorphemeMeta = {
        ...firstMorpheme,
        text: combinedText,
        notes: combinedNotes,
        vocabCount: combinedVocabCount,
        grammarCount: combinedGrammarCount,
      }

      const idxLast = indices[indices.length - 1]!
      const morphemes = [
        ...state.current.morphemes.slice(0, indices[0]),
        combinedMorpheme,
        ...state.current.morphemes.slice(idxLast + 1),
      ]

      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const editMorphemeText = (morphemeId: string, newText: string) => {
    update(state => {
      if (!state.current) return state
      const morphemes = state.current.morphemes.map(m => {
        if (m.id === morphemeId) {
          return { ...m, text: newText }
        }
        return m
      })
      const sentence = morphemes.map(m => m.text).join(' ')
      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          sentence,
          morphemes,
          nodes,
          edges,
        },
      }
    })
  }

  const insertMorpheme = (position: 'left' | 'right', targetMorphemeId: string, newText: string) => {
    update(state => {
      if (!state.current) return state
      const targetIndex = state.current.morphemes.findIndex(m => m.id === targetMorphemeId)
      if (targetIndex === -1) return state

      const now = new Date().toISOString()
      const newMorpheme: MorphemeMeta = {
        id: generateId('m'),
        text: newText,
        createdAt: now,
        lastReviewedAt: null,
        vocabCount: 0,
        grammarCount: 0,
        tags: [],
        notes: [],
      }

      const insertIndex = position === 'left' ? targetIndex : targetIndex + 1
      const morphemes = [
        ...state.current.morphemes.slice(0, insertIndex),
        newMorpheme,
        ...state.current.morphemes.slice(insertIndex),
      ]

      const sentence = morphemes.map(m => m.text).join(' ')
      const { nodes, edges } = morphemesToFlow(morphemes)
      return {
        ...state,
        current: {
          ...state.current,
          sentence,
          morphemes,
          nodes,
          edges,
        },
      }
    })
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
    addNoteToMorpheme,
    breakMorpheme,
    combineMorphemes,
    editMorphemeText,
    insertMorpheme,
  }
}

export const sessionStore = createSessionStore()

export const modes = readable<AppMode[]>(['idle', 'editing', 'parsing'])

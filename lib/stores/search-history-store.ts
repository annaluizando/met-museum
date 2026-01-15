import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UI_CONFIG } from '@/lib/constants/config'

/**
 * Search history item
 */
export interface SearchHistoryItem {
  query: string
  timestamp: number
}

interface SearchHistoryState {
  history: SearchHistoryItem[]
  addToHistory: (query: string) => void
  removeFromHistory: (timestamp: number) => void
  clearHistory: () => void
  getHistory: () => SearchHistoryItem[]
}

/**
 * Stores recent searches for quick access
 */
export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      
      addToHistory: (query) => {
        const trimmedQuery = query.trim();
        
        if (!trimmedQuery) {
          return
        }
        
        set((state) => {
          // Remove duplicate queries (case-insensitive)
          const filteredHistory = state.history.filter(
            (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
          )
          
          // Add new query at the beginning
          const newHistory: SearchHistoryItem[] = [
            { query: trimmedQuery, timestamp: Date.now() },
            ...filteredHistory,
          ]
          
          // Limit history size
          const limitedHistory = newHistory.slice(0, UI_CONFIG.SEARCH_HISTORY_LIMIT)
          
          return { history: limitedHistory }
        })
      },
      
      removeFromHistory: (timestamp) =>
        set((state) => ({
          history: state.history.filter((item) => item.timestamp !== timestamp),
        })),
      
      clearHistory: () => set({ history: [] }),
      
      getHistory: () => get().history,
    }),
    {
      name: 'metmuseum-search-history-storage',
    }
  )
)

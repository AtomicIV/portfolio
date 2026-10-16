import { createContext, useContext } from 'react'
import { getContent } from '../content'

// The site is English-only; `lang` stays in context so `tr()` and the demos
// have one place to read it from.
const LangContext = createContext(null)

export const LangProvider = LangContext.Provider

export function useContent() {
  return useContext(LangContext).content
}

export function useLang() {
  return useContext(LangContext)
}

export { getContent }

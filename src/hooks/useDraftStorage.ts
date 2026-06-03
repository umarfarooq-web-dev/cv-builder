import { useCallback } from 'react'
import type { CvFormData } from '../validation/cvSchema'
import { mergeDraft } from '../utils/mergeDraft'

const STORAGE_KEY = 'cv-builder-draft'

export function loadDraft(): CvFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return mergeDraft(parsed)
  } catch {
    return null
  }
}

export function useDraftStorage() {
  const saveDraft = useCallback((data: CvFormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return { ok: true as const }
    } catch {
      return { ok: false as const, message: 'Could not save draft. Storage may be full or disabled.' }
    }
  }, [])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      return { ok: true as const }
    } catch {
      return { ok: false as const, message: 'Could not clear saved draft.' }
    }
  }, [])

  return { saveDraft, clearDraft }
}

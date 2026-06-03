import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { mapCvFormToDbRow } from '../utils/mapCvToDbRow'
import type { CvFormData } from '../validation/cvSchema'

export type SaveCvResult =
  | { ok: true; cvId: string }
  | { ok: false; message: string }

export function canSaveToSupabase(): boolean {
  return isSupabaseConfigured()
}

/**
 * Saves CV via one Supabase REST endpoint: POST to `cv_profiles` (table insert).
 * Full form JSON is stored in `payload`; scalar columns are denormalized for querying.
 */
export async function saveCvToSupabase(
  data: CvFormData,
  userId?: string | null,
): Promise<SaveCvResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase is not configured. Add your project URL and anon key to .env',
    }
  }

  try {
    const supabase = getSupabase()
    const row = mapCvFormToDbRow(data, userId)

    const { data: inserted, error } = await supabase
      .from('cv_profiles')
      .insert(row)
      .select('id')
      .single()

    if (error) {
      return {
        ok: false,
        message: error.message || 'Failed to save CV to database.',
      }
    }

    if (!inserted?.id) {
      return {
        ok: false,
        message: 'Save succeeded but no CV id was returned.',
      }
    }

    return { ok: true, cvId: inserted.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error while saving.'
    return { ok: false, message }
  }
}

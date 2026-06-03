import type { CvFormData } from '../validation/cvSchema'

/** Maps form JSON → `cv_profiles` row for a single Supabase REST insert */
export function mapCvFormToDbRow(data: CvFormData, userId?: string | null) {
  const { personal } = data
  return {
    user_id: userId ?? null,
    sections: data.sections,
    first_name: personal.firstName,
    last_name: personal.lastName,
    email: personal.email,
    phone: personal.phone || null,
    city: personal.city || null,
    country: personal.country || null,
    linked_in: personal.linkedIn || null,
    website: personal.website || null,
    summary: data.summary,
    skills: data.skills,
    interests: data.interests,
    payload: data,
  }
}

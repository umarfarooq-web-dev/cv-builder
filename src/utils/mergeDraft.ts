import { defaultCvValues } from '../constants/defaults'
import { DEFAULT_SECTION_VISIBILITY } from '../constants/sections'
import type { CvFormData } from '../validation/cvSchema'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Restores saved drafts from older versions by merging with current defaults */
export function mergeDraft(parsed: unknown): CvFormData {
  if (!isRecord(parsed)) return defaultCvValues

  return {
    ...defaultCvValues,
    ...parsed,
    sections: {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(isRecord(parsed.sections) ? parsed.sections : {}),
    },
    personal: {
      ...defaultCvValues.personal,
      ...(isRecord(parsed.personal) ? parsed.personal : {}),
    },
    summary: typeof parsed.summary === 'string' ? parsed.summary : defaultCvValues.summary,
    experiences: Array.isArray(parsed.experiences)
      ? (parsed.experiences as CvFormData['experiences'])
      : defaultCvValues.experiences,
    education: Array.isArray(parsed.education)
      ? (parsed.education as CvFormData['education'])
      : defaultCvValues.education,
    skills: Array.isArray(parsed.skills) ? (parsed.skills as string[]) : defaultCvValues.skills,
    projects: Array.isArray(parsed.projects)
      ? (parsed.projects as CvFormData['projects'])
      : defaultCvValues.projects,
    articles: Array.isArray(parsed.articles)
      ? (parsed.articles as CvFormData['articles'])
      : defaultCvValues.articles,
    blogs: Array.isArray(parsed.blogs) ? (parsed.blogs as CvFormData['blogs']) : defaultCvValues.blogs,
    certifications: Array.isArray(parsed.certifications)
      ? (parsed.certifications as CvFormData['certifications'])
      : defaultCvValues.certifications,
    languages: Array.isArray(parsed.languages)
      ? (parsed.languages as CvFormData['languages'])
      : defaultCvValues.languages,
    volunteer: Array.isArray(parsed.volunteer)
      ? (parsed.volunteer as CvFormData['volunteer'])
      : defaultCvValues.volunteer,
    awards: Array.isArray(parsed.awards)
      ? (parsed.awards as CvFormData['awards'])
      : defaultCvValues.awards,
    references: Array.isArray(parsed.references)
      ? (parsed.references as CvFormData['references'])
      : defaultCvValues.references,
    interests: Array.isArray(parsed.interests)
      ? (parsed.interests as string[])
      : defaultCvValues.interests,
  } as CvFormData
}

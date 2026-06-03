import { DEFAULT_SECTION_VISIBILITY } from './sections'
import type { CvFormData } from '../validation/cvSchema'

function newId(): string {
  return crypto.randomUUID()
}

export const defaultExperience = () => ({
  id: newId(),
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
})

export const defaultEducation = () => ({
  id: newId(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
})

export const defaultArticle = () => ({
  id: newId(),
  title: '',
  publication: '',
  publishedDate: '',
  url: '',
  description: '',
})

export const defaultBlog = () => ({
  id: newId(),
  title: '',
  platform: '',
  publishedDate: '',
  url: '',
  excerpt: '',
})

export const defaultProject = () => ({
  id: newId(),
  name: '',
  role: '',
  url: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  technologies: '',
})

export const defaultCertification = () => ({
  id: newId(),
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  url: '',
})

export const defaultLanguage = () => ({
  id: newId(),
  language: '',
  proficiency: 'Professional' as const,
})

export const defaultVolunteer = () => ({
  id: newId(),
  organization: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
})

export const defaultAward = () => ({
  id: newId(),
  title: '',
  issuer: '',
  date: '',
  description: '',
})

export const defaultReference = () => ({
  id: newId(),
  name: '',
  title: '',
  organization: '',
  email: '',
  phone: '',
})

export const defaultCvValues: CvFormData = {
  sections: { ...DEFAULT_SECTION_VISIBILITY },
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedIn: '',
    website: '',
  },
  summary: '',
  experiences: [defaultExperience()],
  education: [defaultEducation()],
  skills: [],
  projects: [defaultProject()],
  articles: [defaultArticle()],
  blogs: [defaultBlog()],
  certifications: [defaultCertification()],
  languages: [defaultLanguage()],
  volunteer: [defaultVolunteer()],
  awards: [defaultAward()],
  references: [defaultReference()],
  interests: [],
}

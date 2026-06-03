export const SECTION_IDS = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'articles',
  'blogs',
  'certifications',
  'languages',
  'volunteer',
  'awards',
  'references',
  'interests',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export type SectionVisibility = Record<SectionId, boolean>

export type SectionMeta = {
  id: SectionId
  label: string
  description: string
  defaultEnabled: boolean
}

export const SECTION_CATALOG: SectionMeta[] = [
  {
    id: 'summary',
    label: 'Professional summary',
    description: 'Short profile at the top of your CV',
    defaultEnabled: true,
  },
  {
    id: 'experience',
    label: 'Work experience',
    description: 'Employment history and achievements',
    defaultEnabled: true,
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Degrees, schools, and training',
    defaultEnabled: true,
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Technical and professional competencies',
    defaultEnabled: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Portfolio work, side projects, or client deliverables',
    defaultEnabled: false,
  },
  {
    id: 'articles',
    label: 'Articles',
    description: 'Published articles, papers, or editorial work',
    defaultEnabled: false,
  },
  {
    id: 'blogs',
    label: 'Blogs',
    description: 'Blog posts and personal writing',
    defaultEnabled: false,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    description: 'Licenses, credentials, and professional certificates',
    defaultEnabled: false,
  },
  {
    id: 'languages',
    label: 'Languages',
    description: 'Spoken languages and proficiency levels',
    defaultEnabled: false,
  },
  {
    id: 'volunteer',
    label: 'Volunteer work',
    description: 'Community service and unpaid roles',
    defaultEnabled: false,
  },
  {
    id: 'awards',
    label: 'Awards & honors',
    description: 'Recognition, prizes, and distinctions',
    defaultEnabled: false,
  },
  {
    id: 'references',
    label: 'References',
    description: 'Professional references (often “available on request”)',
    defaultEnabled: false,
  },
  {
    id: 'interests',
    label: 'Interests',
    description: 'Hobbies and personal interests (optional culture fit)',
    defaultEnabled: false,
  },
]

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = SECTION_CATALOG.reduce(
  (acc, section) => {
    acc[section.id] = section.defaultEnabled
    return acc
  },
  {} as SectionVisibility,
)

/** Form field roots cleared when a section is turned off */
export const SECTION_FORM_ROOTS: Record<SectionId, string> = {
    summary: 'summary',
    experience: 'experiences',
    education: 'education',
    skills: 'skills',
    projects: 'projects',
    articles: 'articles',
    blogs: 'blogs',
    certifications: 'certifications',
    languages: 'languages',
    volunteer: 'volunteer',
    awards: 'awards',
    references: 'references',
    interests: 'interests',
  }

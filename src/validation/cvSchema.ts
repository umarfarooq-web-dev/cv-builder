import { z } from 'zod'
import type { SectionId } from '../constants/sections'

export const monthYear = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM format (e.g. 2024-06)')

export const optionalMonthYear = z.union([
  z.literal(''),
  monthYear,
])

const optionalUrl = z.union([
  z.literal(''),
  z.string().url('Enter a valid URL (include https://)'),
])

const optionalPhone = z.union([
  z.literal(''),
  z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s().-]+$/, 'Phone may only contain digits and + ( ) . - spaces'),
])

const optionalEmail = z.union([
  z.literal(''),
  z.string().trim().email('Enter a valid email address'),
])

function parseMonthYear(value: string): Date {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function isEndOnOrAfterStart(start: string, end: string): boolean {
  return parseMonthYear(end) >= parseMonthYear(start)
}

function refineDateRange(
  data: { startDate: string; endDate?: string; current: boolean },
  ctx: z.RefinementCtx,
  endRequiredMessage: string,
) {
  if (data.current) return
  if (!data.endDate?.trim()) {
    ctx.addIssue({ code: 'custom', message: endRequiredMessage, path: ['endDate'] })
    return
  }
  if (!monthYear.safeParse(data.endDate).success) {
    ctx.addIssue({
      code: 'custom',
      message: 'Use YYYY-MM format (e.g. 2024-06)',
      path: ['endDate'],
    })
    return
  }
  if (!isEndOnOrAfterStart(data.startDate, data.endDate)) {
    ctx.addIssue({
      code: 'custom',
      message: 'End date must be on or after start date',
      path: ['endDate'],
    })
  }
}

export const experienceSchema = z
  .object({
    id: z.string(),
    company: z.string().trim().min(1, 'Company is required').max(120, 'Max 120 characters'),
    position: z.string().trim().min(1, 'Job title is required').max(120, 'Max 120 characters'),
    location: z.string().trim().max(80, 'Max 80 characters').optional(),
    startDate: monthYear,
    endDate: z.string().optional(),
    current: z.boolean(),
    description: z
      .string()
      .trim()
      .min(20, 'Add at least 20 characters describing your role')
      .max(2000, 'Max 2000 characters'),
  })
  .superRefine((data, ctx) => {
    refineDateRange(
      data,
      ctx,
      'End date is required unless this is your current role',
    )
  })

export const educationSchema = z
  .object({
    id: z.string(),
    institution: z
      .string()
      .trim()
      .min(1, 'Institution is required')
      .max(120, 'Max 120 characters'),
    degree: z.string().trim().min(1, 'Degree is required').max(120, 'Max 120 characters'),
    field: z.string().trim().max(120, 'Max 120 characters').optional(),
    startDate: monthYear,
    endDate: z.string().optional(),
    current: z.boolean(),
  })
  .superRefine((data, ctx) => {
    refineDateRange(data, ctx, 'End date is required unless you are still studying')
  })

export const articleSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  publication: z
    .string()
    .trim()
    .min(1, 'Publication or outlet is required')
    .max(120, 'Max 120 characters'),
  publishedDate: optionalMonthYear,
  url: optionalUrl,
  description: z.string().trim().max(1500, 'Max 1500 characters').optional(),
})

export const blogSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  platform: z
    .string()
    .trim()
    .min(1, 'Blog or platform name is required')
    .max(120, 'Max 120 characters'),
  publishedDate: optionalMonthYear,
  url: optionalUrl,
  excerpt: z
    .string()
    .trim()
    .max(800, 'Max 800 characters')
    .optional(),
})

export const projectSchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1, 'Project name is required').max(120, 'Max 120 characters'),
    role: z.string().trim().max(80, 'Max 80 characters').optional(),
    url: optionalUrl,
    startDate: optionalMonthYear,
    endDate: z.string().optional(),
    current: z.boolean(),
    description: z
      .string()
      .trim()
      .min(20, 'Add at least 20 characters describing the project')
      .max(1500, 'Max 1500 characters'),
    technologies: z.string().trim().max(200, 'Max 200 characters').optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate?.trim()) return
    if (data.current) return
    if (!data.endDate?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date is required unless the project is ongoing',
        path: ['endDate'],
      })
      return
    }
    if (!monthYear.safeParse(data.endDate).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Use YYYY-MM format (e.g. 2024-06)',
        path: ['endDate'],
      })
      return
    }
    if (!isEndOnOrAfterStart(data.startDate, data.endDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be on or after start date',
        path: ['endDate'],
      })
    }
  })

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Certification name is required').max(120, 'Max 120 characters'),
  issuer: z.string().trim().min(1, 'Issuer is required').max(120, 'Max 120 characters'),
  issueDate: optionalMonthYear,
  expiryDate: optionalMonthYear,
  credentialId: z.string().trim().max(80, 'Max 80 characters').optional(),
  url: optionalUrl,
})

export const languageSchema = z.object({
  id: z.string(),
  language: z.string().trim().min(1, 'Language is required').max(60, 'Max 60 characters'),
  proficiency: z.enum(
    ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'],
    { message: 'Select a proficiency level' },
  ),
})

export const volunteerSchema = z
  .object({
    id: z.string(),
    organization: z
      .string()
      .trim()
      .min(1, 'Organization is required')
      .max(120, 'Max 120 characters'),
    role: z.string().trim().min(1, 'Role is required').max(120, 'Max 120 characters'),
    startDate: monthYear,
    endDate: z.string().optional(),
    current: z.boolean(),
    description: z.string().trim().max(1500, 'Max 1500 characters').optional(),
  })
  .superRefine((data, ctx) => {
    refineDateRange(data, ctx, 'End date is required unless this is ongoing')
  })

export const awardSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, 'Award title is required').max(120, 'Max 120 characters'),
  issuer: z.string().trim().min(1, 'Issuer is required').max(120, 'Max 120 characters'),
  date: optionalMonthYear,
  description: z.string().trim().max(500, 'Max 500 characters').optional(),
})

export const referenceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Name is required').max(80, 'Max 80 characters'),
  title: z.string().trim().max(80, 'Max 80 characters').optional(),
  organization: z.string().trim().max(120, 'Max 120 characters').optional(),
  email: optionalEmail,
  phone: optionalPhone,
})

const sectionsSchema = z.object({
  summary: z.boolean(),
  experience: z.boolean(),
  education: z.boolean(),
  skills: z.boolean(),
  projects: z.boolean(),
  articles: z.boolean(),
  blogs: z.boolean(),
  certifications: z.boolean(),
  languages: z.boolean(),
  volunteer: z.boolean(),
  awards: z.boolean(),
  references: z.boolean(),
  interests: z.boolean(),
})

const personalSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(60, 'Max 60 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(60, 'Max 60 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: optionalPhone,
  city: z.string().trim().max(80, 'Max 80 characters').optional(),
  country: z.string().trim().max(80, 'Max 80 characters').optional(),
  linkedIn: optionalUrl,
  website: optionalUrl,
})

const skillItemSchema = z.string().trim().min(1, 'Skill cannot be empty').max(50, 'Max 50 characters per skill')
const interestItemSchema = z
  .string()
  .trim()
  .min(1, 'Interest cannot be empty')
  .max(50, 'Max 50 characters per interest')

function addZodIssues(
  ctx: z.RefinementCtx,
  issues: z.ZodIssue[],
  pathPrefix: (string | number)[],
) {
  for (const issue of issues) {
    ctx.addIssue({
      ...issue,
      path: [...pathPrefix, ...issue.path],
    })
  }
}

function validateItems<T>(
  schema: z.ZodType<T>,
  items: T[],
  pathPrefix: (string | number)[],
  ctx: z.RefinementCtx,
) {
  items.forEach((item, index) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      addZodIssues(ctx, result.error.issues, [...pathPrefix, index])
    }
  })
}

function requireMinItems(
  enabled: boolean,
  items: unknown[],
  path: (string | number)[],
  message: string,
  ctx: z.RefinementCtx,
) {
  if (enabled && items.length === 0) {
    ctx.addIssue({ code: 'custom', message, path })
  }
}

export const cvFormShapeSchema = z.object({
  sections: sectionsSchema,
  personal: personalSchema,
  summary: z.string(),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillItemSchema),
  projects: z.array(projectSchema),
  articles: z.array(articleSchema),
  blogs: z.array(blogSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
  volunteer: z.array(volunteerSchema),
  awards: z.array(awardSchema),
  references: z.array(referenceSchema),
  interests: z.array(interestItemSchema),
})

export const cvSchema = cvFormShapeSchema.superRefine((data, ctx) => {
  const enabled = data.sections

  const hasAnySection = (Object.keys(enabled) as SectionId[]).some((key) => enabled[key])
  if (!hasAnySection) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enable at least one CV section besides personal details',
      path: ['sections'],
    })
  }

  if (enabled.summary) {
    const summary = data.summary.trim()
    if (summary.length < 50) {
      ctx.addIssue({
        code: 'custom',
        message: 'Summary should be at least 50 characters',
        path: ['summary'],
      })
    } else if (summary.length > 600) {
      ctx.addIssue({
        code: 'custom',
        message: 'Summary must be 600 characters or fewer',
        path: ['summary'],
      })
    }
  }

  if (enabled.experience) {
    requireMinItems(
      true,
      data.experiences,
      ['experiences'],
      'Add at least one work experience',
      ctx,
    )
    validateItems(experienceSchema, data.experiences, ['experiences'], ctx)
  }

  if (enabled.education) {
    requireMinItems(true, data.education, ['education'], 'Add at least one education entry', ctx)
    validateItems(educationSchema, data.education, ['education'], ctx)
  }

  if (enabled.skills) {
    if (data.skills.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Add at least one skill',
        path: ['skills'],
      })
    } else if (data.skills.length > 30) {
      ctx.addIssue({
        code: 'custom',
        message: 'Maximum 30 skills',
        path: ['skills'],
      })
    } else {
      data.skills.forEach((skill, index) => {
        const result = skillItemSchema.safeParse(skill)
        if (!result.success) {
          addZodIssues(ctx, result.error.issues, ['skills', index])
        }
      })
    }
  }

  if (enabled.projects) {
    requireMinItems(true, data.projects, ['projects'], 'Add at least one project', ctx)
    validateItems(projectSchema, data.projects, ['projects'], ctx)
  }

  if (enabled.articles) {
    requireMinItems(true, data.articles, ['articles'], 'Add at least one article', ctx)
    validateItems(articleSchema, data.articles, ['articles'], ctx)
  }

  if (enabled.blogs) {
    requireMinItems(true, data.blogs, ['blogs'], 'Add at least one blog post', ctx)
    validateItems(blogSchema, data.blogs, ['blogs'], ctx)
  }

  if (enabled.certifications) {
    requireMinItems(
      true,
      data.certifications,
      ['certifications'],
      'Add at least one certification',
      ctx,
    )
    validateItems(certificationSchema, data.certifications, ['certifications'], ctx)
  }

  if (enabled.languages) {
    requireMinItems(true, data.languages, ['languages'], 'Add at least one language', ctx)
    validateItems(languageSchema, data.languages, ['languages'], ctx)
  }

  if (enabled.volunteer) {
    requireMinItems(
      true,
      data.volunteer,
      ['volunteer'],
      'Add at least one volunteer entry',
      ctx,
    )
    validateItems(volunteerSchema, data.volunteer, ['volunteer'], ctx)
  }

  if (enabled.awards) {
    requireMinItems(true, data.awards, ['awards'], 'Add at least one award', ctx)
    validateItems(awardSchema, data.awards, ['awards'], ctx)
  }

  if (enabled.references) {
    requireMinItems(true, data.references, ['references'], 'Add at least one reference', ctx)
    validateItems(referenceSchema, data.references, ['references'], ctx)
  }

  if (enabled.interests) {
    if (data.interests.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Add at least one interest',
        path: ['interests'],
      })
    } else if (data.interests.length > 15) {
      ctx.addIssue({
        code: 'custom',
        message: 'Maximum 15 interests',
        path: ['interests'],
      })
    } else {
      data.interests.forEach((interest, index) => {
        const result = interestItemSchema.safeParse(interest)
        if (!result.success) {
          addZodIssues(ctx, result.error.issues, ['interests', index])
        }
      })
    }
  }
})

export type CvFormData = z.infer<typeof cvFormShapeSchema>
export type ExperienceFormData = z.infer<typeof experienceSchema>
export type EducationFormData = z.infer<typeof educationSchema>
export type ArticleFormData = z.infer<typeof articleSchema>
export type BlogFormData = z.infer<typeof blogSchema>
export type ProjectFormData = z.infer<typeof projectSchema>

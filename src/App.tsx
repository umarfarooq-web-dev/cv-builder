import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CvBuilderLayout } from './components/layout/CvBuilderLayout'
import { ArticlesSection } from './components/form/ArticlesSection'
import { AwardsSection } from './components/form/AwardsSection'
import { BlogsSection } from './components/form/BlogsSection'
import { CertificationsSection } from './components/form/CertificationsSection'
import { EducationSection } from './components/form/EducationSection'
import { ExperienceSection } from './components/form/ExperienceSection'
import { LanguagesSection } from './components/form/LanguagesSection'
import { OptionalSection } from './components/form/OptionalSection'
import { PersonalInfoSection } from './components/form/PersonalInfoSection'
import { ProjectsSection } from './components/form/ProjectsSection'
import { ReferencesSection } from './components/form/ReferencesSection'
import { SectionPicker } from './components/form/SectionPicker'
import { SummarySection } from './components/form/SummarySection'
import { TagListSection } from './components/form/TagListSection'
import { VolunteerSection } from './components/form/VolunteerSection'
import { CvPreview } from './components/preview/CvPreview'
import { defaultCvValues } from './constants/defaults'
import { loadDraft, useDraftStorage } from './hooks/useDraftStorage'
import { exportCvPdf } from './utils/exportCvPdf'
import { cvSchema, type CvFormData } from './validation/cvSchema'

function scrollToFirstError() {
  const firstInvalid =
    document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
    document.querySelector<HTMLElement>('.section-error')
  firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  firstInvalid?.focus()
}

function App() {
  const saved = loadDraft()
  const { saveDraft, clearDraft } = useDraftStorage()
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const methods = useForm<CvFormData>({
    resolver: zodResolver(cvSchema),
    defaultValues: saved ?? defaultCvValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const watched = useWatch({ control: methods.control })
  const previewData = { ...defaultCvValues, ...watched } as CvFormData

  const onValid = () => {
    setStatusMessage({
      type: 'success',
      text: 'Your CV passed validation. Use Download PDF to export.',
    })
  }

  const onInvalid = () => {
    setStatusMessage({
      type: 'error',
      text: 'Please fix the highlighted fields in your enabled sections.',
    })
    scrollToFirstError()
  }

  const handleDownloadPdf = methods.handleSubmit(async (data) => {
    try {
      const ok = await exportCvPdf(
        '.cv-preview',
        data.personal.firstName,
        data.personal.lastName,
      )
      if (!ok) {
        setStatusMessage({
          type: 'error',
          text: 'Could not export PDF. Make sure the preview has loaded.',
        })
        return
      }
      setStatusMessage({
        type: 'success',
        text: 'PDF downloaded — no browser header or footer added.',
      })
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'PDF export failed. Please try again.',
      })
    }
  }, onInvalid)

  const handleSaveDraft = () => {
    const data = methods.getValues()
    const result = saveDraft(data)
    if (result.ok) {
      setStatusMessage({ type: 'info', text: 'Draft saved to this browser.' })
    } else {
      setStatusMessage({ type: 'error', text: result.message })
    }
  }

  const handleClearDraft = () => {
    const result = clearDraft()
    if (!result.ok) {
      setStatusMessage({ type: 'error', text: result.message })
      return
    }
    methods.reset(defaultCvValues)
    setStatusMessage({ type: 'info', text: 'Draft cleared. Form reset.' })
  }

  return (
    <FormProvider {...methods}>
      <CvBuilderLayout
        preview={<CvPreview data={previewData} />}
        form={
          <form
            className="cv-form"
            onSubmit={methods.handleSubmit(onValid, onInvalid)}
            noValidate
          >
            {saved ? (
              <p className="banner banner--info" role="status">
                Restored your last saved draft from this browser.
              </p>
            ) : null}
            {statusMessage ? (
              <p
                className={`banner banner--${statusMessage.type}`}
                role={statusMessage.type === 'error' ? 'alert' : 'status'}
              >
                {statusMessage.text}
              </p>
            ) : null}

            <PersonalInfoSection />
            <SectionPicker />

            <OptionalSection sectionId="summary">
              <SummarySection />
            </OptionalSection>
            <OptionalSection sectionId="experience">
              <ExperienceSection />
            </OptionalSection>
            <OptionalSection sectionId="education">
              <EducationSection />
            </OptionalSection>
            <OptionalSection sectionId="skills">
              <TagListSection
                fieldName="skills"
                title="Skills"
                description="Add technical and professional skills. Press Enter or click Add."
                itemLabel="skill"
                placeholder="e.g. React, Project management"
                maxItems={30}
              />
            </OptionalSection>
            <OptionalSection sectionId="projects">
              <ProjectsSection />
            </OptionalSection>
            <OptionalSection sectionId="articles">
              <ArticlesSection />
            </OptionalSection>
            <OptionalSection sectionId="blogs">
              <BlogsSection />
            </OptionalSection>
            <OptionalSection sectionId="certifications">
              <CertificationsSection />
            </OptionalSection>
            <OptionalSection sectionId="languages">
              <LanguagesSection />
            </OptionalSection>
            <OptionalSection sectionId="volunteer">
              <VolunteerSection />
            </OptionalSection>
            <OptionalSection sectionId="awards">
              <AwardsSection />
            </OptionalSection>
            <OptionalSection sectionId="references">
              <ReferencesSection />
            </OptionalSection>
            <OptionalSection sectionId="interests">
              <TagListSection
                fieldName="interests"
                title="Interests"
                description="Hobbies and personal interests that reflect your personality."
                itemLabel="interest"
                placeholder="e.g. Photography, Chess"
                maxItems={15}
              />
            </OptionalSection>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                Validate CV
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleDownloadPdf}>
                Download PDF
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleSaveDraft}>
                Save draft
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleClearDraft}>
                Clear draft
              </button>
            </div>
          </form>
        }
      />
    </FormProvider>
  )
}

export default App

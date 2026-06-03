import type { ReactNode } from 'react'
import type { CvFormData } from '../../validation/cvSchema'
import { formatDateRange, formatMonthYear } from '../../utils/formatDate'

type CvPreviewProps = {
  data: CvFormData
}

function PreviewBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="cv-preview__section">
      <h2 className="cv-preview__section-title">{title}</h2>
      {children}
    </section>
  )
}

export function CvPreview({ data }: CvPreviewProps) {
  const {
    sections,
    personal,
    summary,
    experiences,
    education,
    skills,
    projects,
    articles,
    blogs,
    certifications,
    languages,
    volunteer,
    awards,
    references,
    interests,
  } = data

  const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ')
  const location = [personal.city, personal.country].filter(Boolean).join(', ')
  const contact = [personal.email, personal.phone].filter(Boolean)

  return (
    <article className="cv-preview" aria-label="CV preview">
      <header className="cv-preview__header">
        <h1 className="cv-preview__name">{fullName || 'Your Name'}</h1>
        {contact.length > 0 || location ? (
          <p className="cv-preview__contact">
            {[...contact, location].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {(personal.linkedIn || personal.website) && (
          <p className="cv-preview__links">
            {personal.linkedIn ? (
              <a href={personal.linkedIn} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            ) : null}
            {personal.linkedIn && personal.website ? ' · ' : null}
            {personal.website ? (
              <a href={personal.website} target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
          </p>
        )}
      </header>

      {sections.summary && summary ? (
        <PreviewBlock title="Summary">
          <p className="cv-preview__text">{summary}</p>
        </PreviewBlock>
      ) : null}

      {sections.experience && experiences.some((e) => e.company || e.position) ? (
        <PreviewBlock title="Experience">
          <ul className="cv-preview__list">
            {experiences.map((exp) => (
              <li key={exp.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {exp.position || 'Job title'}
                    {exp.company ? ` · ${exp.company}` : ''}
                  </strong>
                  <span className="cv-preview__dates">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                {exp.location ? <p className="cv-preview__meta">{exp.location}</p> : null}
                {exp.description ? <p className="cv-preview__text">{exp.description}</p> : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.education && education.some((e) => e.institution || e.degree) ? (
        <PreviewBlock title="Education">
          <ul className="cv-preview__list">
            {education.map((edu) => (
              <li key={edu.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {edu.degree || 'Degree'}
                    {edu.field ? ` in ${edu.field}` : ''}
                    {edu.institution ? ` · ${edu.institution}` : ''}
                  </strong>
                  <span className="cv-preview__dates">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.projects && projects.some((p) => p.name) ? (
        <PreviewBlock title="Projects">
          <ul className="cv-preview__list">
            {projects.map((project) => (
              <li key={project.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {project.name}
                    {project.role ? ` · ${project.role}` : ''}
                  </strong>
                  <span className="cv-preview__dates">
                    {project.startDate
                      ? formatDateRange(project.startDate, project.endDate, project.current)
                      : null}
                  </span>
                </div>
                {project.url ? (
                  <p className="cv-preview__meta">
                    <a href={project.url} target="_blank" rel="noreferrer">
                      View project
                    </a>
                  </p>
                ) : null}
                {project.technologies ? (
                  <p className="cv-preview__meta">{project.technologies}</p>
                ) : null}
                {project.description ? (
                  <p className="cv-preview__text">{project.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.skills && skills.length > 0 ? (
        <PreviewBlock title="Skills">
          <p className="cv-preview__skills">{skills.join(' · ')}</p>
        </PreviewBlock>
      ) : null}

      {sections.articles && articles.some((a) => a.title) ? (
        <PreviewBlock title="Articles">
          <ul className="cv-preview__list">
            {articles.map((article) => (
              <li key={article.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>{article.title}</strong>
                  {article.publishedDate ? (
                    <span className="cv-preview__dates">
                      {formatMonthYear(article.publishedDate)}
                    </span>
                  ) : null}
                </div>
                {article.publication ? (
                  <p className="cv-preview__meta">{article.publication}</p>
                ) : null}
                {article.url ? (
                  <p className="cv-preview__meta">
                    <a href={article.url} target="_blank" rel="noreferrer">
                      Read article
                    </a>
                  </p>
                ) : null}
                {article.description ? (
                  <p className="cv-preview__text">{article.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.blogs && blogs.some((b) => b.title) ? (
        <PreviewBlock title="Blogs">
          <ul className="cv-preview__list">
            {blogs.map((blog) => (
              <li key={blog.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>{blog.title}</strong>
                  {blog.publishedDate ? (
                    <span className="cv-preview__dates">{formatMonthYear(blog.publishedDate)}</span>
                  ) : null}
                </div>
                {blog.platform ? <p className="cv-preview__meta">{blog.platform}</p> : null}
                {blog.url ? (
                  <p className="cv-preview__meta">
                    <a href={blog.url} target="_blank" rel="noreferrer">
                      Read post
                    </a>
                  </p>
                ) : null}
                {blog.excerpt ? <p className="cv-preview__text">{blog.excerpt}</p> : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.certifications && certifications.some((c) => c.name) ? (
        <PreviewBlock title="Certifications">
          <ul className="cv-preview__list">
            {certifications.map((cert) => (
              <li key={cert.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {cert.name}
                    {cert.issuer ? ` · ${cert.issuer}` : ''}
                  </strong>
                  {cert.issueDate ? (
                    <span className="cv-preview__dates">{formatMonthYear(cert.issueDate)}</span>
                  ) : null}
                </div>
                {cert.credentialId ? (
                  <p className="cv-preview__meta">ID: {cert.credentialId}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.languages && languages.some((l) => l.language) ? (
        <PreviewBlock title="Languages">
          <p className="cv-preview__skills">
            {languages
              .filter((l) => l.language)
              .map((l) => `${l.language} (${l.proficiency})`)
              .join(' · ')}
          </p>
        </PreviewBlock>
      ) : null}

      {sections.volunteer && volunteer.some((v) => v.organization) ? (
        <PreviewBlock title="Volunteer work">
          <ul className="cv-preview__list">
            {volunteer.map((entry) => (
              <li key={entry.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {entry.role}
                    {entry.organization ? ` · ${entry.organization}` : ''}
                  </strong>
                  <span className="cv-preview__dates">
                    {formatDateRange(entry.startDate, entry.endDate, entry.current)}
                  </span>
                </div>
                {entry.description ? <p className="cv-preview__text">{entry.description}</p> : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.awards && awards.some((a) => a.title) ? (
        <PreviewBlock title="Awards & honors">
          <ul className="cv-preview__list">
            {awards.map((award) => (
              <li key={award.id} className="cv-preview__item">
                <div className="cv-preview__item-head">
                  <strong>
                    {award.title}
                    {award.issuer ? ` · ${award.issuer}` : ''}
                  </strong>
                  {award.date ? (
                    <span className="cv-preview__dates">{formatMonthYear(award.date)}</span>
                  ) : null}
                </div>
                {award.description ? <p className="cv-preview__text">{award.description}</p> : null}
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.references && references.some((r) => r.name) ? (
        <PreviewBlock title="References">
          <ul className="cv-preview__list">
            {references.map((ref) => (
              <li key={ref.id} className="cv-preview__item">
                <strong>{ref.name}</strong>
                <p className="cv-preview__meta">
                  {[ref.title, ref.organization].filter(Boolean).join(' · ')}
                </p>
                <p className="cv-preview__meta">
                  {[ref.email, ref.phone].filter(Boolean).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </PreviewBlock>
      ) : null}

      {sections.interests && interests.length > 0 ? (
        <PreviewBlock title="Interests">
          <p className="cv-preview__skills">{interests.join(' · ')}</p>
        </PreviewBlock>
      ) : null}
    </article>
  )
}

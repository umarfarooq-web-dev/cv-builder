import type { ReactNode } from 'react'

type CvBuilderLayoutProps = {
  form: ReactNode
  preview: ReactNode
}

export function CvBuilderLayout({ form, preview }: CvBuilderLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <p className="app-eyebrow">Professional CV Builder</p>
            <h1 className="app-title">Craft your résumé</h1>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="builder-grid">
          <div className="builder-form">{form}</div>
          <aside className="builder-preview" aria-label="Live preview panel">
            <div className="preview-sticky">
              <p className="preview-label">Live preview</p>
              {preview}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

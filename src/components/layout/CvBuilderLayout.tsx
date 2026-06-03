import type { ReactNode } from 'react'
import { AuthPanel } from '../auth/AuthPanel'

type CvBuilderLayoutProps = {
  form: ReactNode
  preview: ReactNode
  onAuthMessage?: (text: string, type: 'success' | 'error' | 'info') => void
}

export function CvBuilderLayout({ form, preview, onAuthMessage }: CvBuilderLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-title">Craft your résumé</h1>
          <AuthPanel onMessage={onAuthMessage} />
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

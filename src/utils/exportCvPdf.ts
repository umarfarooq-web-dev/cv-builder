import html2pdf from 'html2pdf.js'

function cvFilename(firstName?: string, lastName?: string): string {
  const name = [firstName, lastName].filter(Boolean).join('-').toLowerCase()
  return name ? `${name}-cv.pdf` : 'cv.pdf'
}

/**
 * Exports the CV preview as a PDF file without browser print headers/footers
 * (date, URL, page title) that appear when using window.print().
 */
export async function exportCvPdf(
  selector = '.cv-preview',
  firstName?: string,
  lastName?: string,
): Promise<boolean> {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) return false

  await html2pdf()
    .set({
      margin: [14, 14, 14, 14],
      filename: cvFilename(firstName, lastName),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save()

  return true
}

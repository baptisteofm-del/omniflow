import jsPDF from 'jspdf'

export interface InvoiceData {
  invoiceNumber: string      // ex: INV-2026-0042
  date: string               // ex: 22 mai 2026
  agencyName: string
  agencyEmail: string
  planName: string           // ex: Pro
  interval: 'monthly' | 'yearly'
  amount: number             // ex: 99
  nextRenewal: string        // ex: 22 juin 2026
}

export function generateInvoicePdf(data: InvoiceData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297

  // Fond blanc
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // Header band violet
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, W, 35, 'F')

  // Logo text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('OmniFlow', 20, 22)

  // "FACTURE" title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 180, 255)
  doc.text('FACTURE', W - 20, 22, { align: 'right' })

  // Invoice number
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${data.invoiceNumber}`, 20, 52)
  doc.setTextColor(140, 140, 140)
  doc.setFontSize(9)
  doc.text(`Émise le ${data.date}`, 20, 59)

  // Separator line
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.5)
  doc.line(20, 68, W - 20, 68)

  // "Facturé à" block
  doc.setTextColor(140, 140, 140)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURÉ À', 20, 80)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(11)
  doc.text(data.agencyName, 20, 88)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(data.agencyEmail, 20, 94)

  // OmniFlow info (right side)
  doc.setTextColor(140, 140, 140)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DE', W - 70, 80)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(11)
  doc.text('OmniFlow', W - 70, 88)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('hello@omniflowapp.ai', W - 70, 94)
  doc.text('omniflowapp.ai', W - 70, 100)

  // Items table header
  doc.setFillColor(249, 249, 251)
  doc.rect(20, 115, W - 40, 10, 'F')
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DESCRIPTION', 25, 121.5)
  doc.text('MONTANT', W - 25, 121.5, { align: 'right' })

  // Item row
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  const intervalLabel = data.interval === 'monthly' ? 'Mensuel' : 'Annuel'
  doc.text(`OmniFlow ${data.planName} — ${intervalLabel}`, 25, 136)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.text(`Période : ${data.date} → ${data.nextRenewal}`, 25, 143)
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.text(`${data.amount.toFixed(2)} €`, W - 25, 136, { align: 'right' })

  // Separator
  doc.setDrawColor(230, 230, 230)
  doc.line(20, 152, W - 20, 152)

  // TVA
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.text('TVA (0%)', 25, 162)
  doc.text('0,00 €', W - 25, 162, { align: 'right' })

  // Total
  doc.setFillColor(124, 58, 237)
  doc.rect(20, 170, W - 40, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL', 28, 179)
  doc.text(`${data.amount.toFixed(2)} €`, W - 28, 179, { align: 'right' })

  // Footer
  doc.setTextColor(170, 170, 170)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Merci pour votre confiance.', 20, H - 25)
  doc.text('OmniFlow · hello@omniflowapp.ai · omniflowapp.ai', 20, H - 19)

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

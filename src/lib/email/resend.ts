import { Resend } from 'resend'
import {
  welcomeTemplate,
  toolIntegrationTemplate,
  firstPostTemplate,
  trialEndingTemplate,
  paymentConfirmedTemplate,
  invoiceTemplate,
} from './templates'
import { generateInvoicePdf, InvoiceData } from './invoice-pdf'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

/**
 * Send welcome email (Day 0)
 */
export async function sendWelcomeEmail(email: string, agencyName: string): Promise<void> {
  try {
    const template = welcomeTemplate()
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: template.subject,
      html: template.html,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

/**
 * Send onboarding/drip emails based on day
 */
export async function sendOnboardingEmail(
  email: string,
  agencyName: string,
  day: number
): Promise<void> {
  let template

  switch (day) {
    case 1:
      template = toolIntegrationTemplate()
      break
    case 3:
      template = firstPostTemplate()
      break
    case 7:
      template = trialEndingTemplate()
      break
    default:
      console.warn(`No email template found for day ${day}`)
      return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: template.subject,
      html: template.html,
    })
  } catch (error) {
    console.error(`Error sending day ${day} email:`, error)
    throw error
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmedEmail(
  email: string,
  plan: string,
  renewalDate: string
): Promise<void> {
  try {
    const template = paymentConfirmedTemplate(plan, renewalDate)
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: template.subject,
      html: template.html,
    })
  } catch (error) {
    console.error('Error sending payment confirmed email:', error)
    throw error
  }
}

/**
 * Send monthly invoice email (legacy)
 */
export async function sendInvoiceEmail(
  email: string,
  month: string,
  amount: string,
  invoiceUrl: string
): Promise<void> {
  try {
    const template = invoiceTemplate(month, amount, invoiceUrl)
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: template.subject,
      html: template.html,
    })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    throw error
  }
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmailWithPdf(
  email: string,
  agencyName: string,
  invoiceData: InvoiceData
): Promise<void> {
  try {
    const pdfBuffer = generateInvoicePdf(invoiceData)
    
    // Use the clean invoice template from templates.ts
    const template = invoiceTemplate(
      invoiceData.date,
      invoiceData.amount.toFixed(2),
      ''
    )
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
      to: email,
      subject: `Votre facture OmniFlow — ${invoiceData.invoiceNumber}`,
      html: template.html,
      attachments: [
        {
          filename: `facture-omniflow-${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer,
        }
      ]
    })
  } catch (error) {
    console.error('Error sending invoice email with PDF:', error)
    throw error
  }
}

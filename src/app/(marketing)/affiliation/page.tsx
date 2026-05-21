import type { Metadata } from 'next'
import { AffiliationClient } from './AffiliationClient'

export const metadata: Metadata = {
  title: 'Programme Affiliation — Gagnez 10% à vie | OmniFlow',
  description: "Rejoignez le programme d'affiliation OmniFlow. 10% de commission récurrente à vie pour chaque agence référée.",
}

export default function AffiliationPage() {
  return <AffiliationClient />
}

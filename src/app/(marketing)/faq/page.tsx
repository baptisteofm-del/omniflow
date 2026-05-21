import type { Metadata } from 'next'
import { FaqClient } from './FaqClient'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | OmniFlow',
  description: 'Toutes les réponses sur OmniFlow : intégrations AdsPower/GeeLark, chatting IA, génération vidéo, tarifs, annulation.',
}

export default function FaqPage() {
  return <FaqClient />
}

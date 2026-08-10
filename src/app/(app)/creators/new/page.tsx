import { NewCreatorForm } from '@/components/app/creators/NewCreatorForm'

export default function NewCreatorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Nouvelle créatrice</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Configurez son identité, sa personnalité et ses règles commerciales.
      </p>
      <NewCreatorForm />
    </div>
  )
}

const STEPS = ['Comprend', 'Se souvient', 'Analyse', 'Décide', 'Vend', 'Négocie', 'Relance', 'Apprend']

function Strip() {
  return (
    <div className="flex shrink-0 items-center">
      {STEPS.map((step) => (
        <span key={step} className="flex items-center">
          <span className="gradient-text px-4 text-sm font-medium tracking-wide md:text-base">{step}</span>
          <span aria-hidden="true" className="text-[color:var(--border-strong)]">
            •
          </span>
        </span>
      ))}
    </div>
  )
}

export function AnimatedBanner() {
  return (
    <div className="glass overflow-hidden border-x-0 py-4">
      <div className="flex w-max animate-[marquee_22s_linear_infinite] motion-reduce:animate-none">
        <Strip />
        <Strip />
      </div>
    </div>
  )
}

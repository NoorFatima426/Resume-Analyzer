function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'
  const ringColor =
    score >= 80 ? 'stroke-emerald-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <svg className="-rotate-90 transform" width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          className={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-xs font-medium text-slate-500">out of 100</span>
      </div>
    </div>
  )
}

function TagList({ items, variant }) {
  const styles =
    variant === 'skills'
      ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'
      : 'bg-amber-50 text-amber-800 ring-amber-100'

  if (!items.length) {
    return <p className="text-sm text-slate-500">None identified.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${styles}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function AnalysisResults({ results }) {
  const { overallScore, skillsFound, missingKeywords, suggestions } = results

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">Overall Score</h2>
        <ScoreRing score={overallScore} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              ✓
            </span>
            Skills Found
          </h3>
          <TagList items={skillsFound} variant="skills" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              !
            </span>
            Missing Important Keywords
          </h3>
          <TagList items={missingKeywords} variant="missing" />
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-800">Suggestions to Improve</h3>
        <ol className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              {suggestion}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

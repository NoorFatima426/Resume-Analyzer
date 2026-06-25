export default function LoadingSpinner({ message = 'Analyzing your resume...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  )
}

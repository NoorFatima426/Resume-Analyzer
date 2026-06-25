import { useRef, useState } from 'react'
import AnalysisResults from './components/AnalysisResults'
import LoadingSpinner from './components/LoadingSpinner'
import { analyzeResume } from './utils/analyzeResume'
import { extractPdfText } from './utils/extractPdfText'

function App() {
  const fileInputRef = useRef(null)
  const [resumeText, setResumeText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your resume...')
  const [results, setResults] = useState(null)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }

    setError('')
    setIsExtracting(true)
    setUploadedFileName(file.name)

    try {
      const text = await extractPdfText(file)
      if (!text.trim()) {
        throw new Error('Could not extract text from this PDF. Try pasting the content manually.')
      }
      setResumeText(text)
    } catch (err) {
      setError(err.message || 'Failed to read PDF file.')
      setUploadedFileName('')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAnalyze = async () => {
    const trimmed = resumeText.trim()

    if (!trimmed) {
      setError('Please paste your resume text or upload a PDF first.')
      return
    }

    setError('')
    setIsLoading(true)
    setLoadingMessage('Analyzing your resume...')
    setResults(null)

    try {
      const analysis = await analyzeResume(trimmed, {
        onStatus: setLoadingMessage,
      })
      setResults(analysis)
    } catch (err) {
      setError(err.message || 'Something went wrong during analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setResumeText('')
    setUploadedFileName('')
    setResults(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Resume Analyzer
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              React frontend app — paste or upload your resume for AI feedback
            </p>
          </div>
          <div className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:block">
            Powered by OpenRouter
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Your Resume</h2>
              <p className="mt-1 text-sm text-slate-500">
                Paste your resume text or upload a PDF to get started.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload PDF
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>

          {uploadedFileName && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="truncate">{uploadedFileName}</span>
              {isExtracting && <span className="text-indigo-500">— extracting text...</span>}
            </div>
          )}

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            rows={14}
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading || isExtracting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </button>
            <p className="text-xs text-slate-500">
              Uses OpenRouter free models with automatic retry on rate limits
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        {results && !isLoading && (
          <div className="mt-8">
            <AnalysisResults results={results} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Resume Analyzer — React frontend with Vite & Tailwind CSS
      </footer>
    </div>
  )
}

export default App

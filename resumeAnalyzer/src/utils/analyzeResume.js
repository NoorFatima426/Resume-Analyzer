const FREE_MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-2-9b-it:free',
]

const MAX_RETRIES_PER_MODEL = 2

const SYSTEM_PROMPT = `You are an expert resume analyst and career coach. Analyze the provided resume text and respond ONLY with valid JSON (no markdown, no code fences) using this exact structure:
{
  "overallScore": <number 0-100>,
  "skillsFound": ["skill1", "skill2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Rules:
- overallScore reflects resume quality, clarity, impact, and ATS readiness
- skillsFound: technical and soft skills explicitly or implicitly present (5-15 items)
- missingKeywords: important industry keywords absent from the resume (5-10 items)
- suggestions: 3 to 5 specific, actionable improvements
- Return only the JSON object`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseAnalysisResponse(content) {
  const trimmed = content.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('AI response did not contain valid JSON.')
  }

  const parsed = JSON.parse(jsonMatch[0])

  return {
    overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 0)),
    skillsFound: Array.isArray(parsed.skillsFound) ? parsed.skillsFound : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
  }
}

function getRetryDelaySeconds(errorJson, attempt) {
  const retryAfter = errorJson?.error?.metadata?.retry_after_seconds
  if (retryAfter) return Math.ceil(retryAfter) + 1
  return Math.min(30, 5 * attempt)
}

async function requestAnalysis(baseUrl, apiKey, model, resumeText) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Resume Analyzer',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this resume:\n\n${resumeText.slice(0, 12000)}`,
        },
      ],
      temperature: 0.4,
    }),
  })

  if (response.ok) {
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No analysis returned from the AI model.')
    }

    return { ok: true, result: parseAnalysisResponse(content) }
  }

  const errorBody = await response.text()
  let errorJson = null

  try {
    errorJson = JSON.parse(errorBody)
  } catch {
    // keep errorJson null
  }

  return { ok: false, status: response.status, errorBody, errorJson }
}

export async function analyzeResume(resumeText, { onStatus } = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  const baseUrl = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('Please set your OpenRouter API key in the .env file.')
  }

  let lastRateLimitMessage = ''

  for (const model of FREE_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      onStatus?.(`Analyzing your resume${attempt > 1 ? ` (retry ${attempt})` : ''}...`)

      const response = await requestAnalysis(baseUrl, apiKey, model, resumeText)

      if (response.ok) {
        return response.result
      }

      if (response.status === 429) {
        const waitSeconds = getRetryDelaySeconds(response.errorJson, attempt)
        lastRateLimitMessage =
          response.errorJson?.error?.metadata?.raw ||
          'Free models are temporarily rate-limited.'

        if (attempt < MAX_RETRIES_PER_MODEL) {
          onStatus?.(`Rate limited. Retrying in ${waitSeconds}s...`)
          await sleep(waitSeconds * 1000)
          continue
        }

        break
      }

      throw new Error(`Analysis failed (${response.status}): ${response.errorBody}`)
    }
  }

  throw new Error(
    `${lastRateLimitMessage} Please wait about 30 seconds and try again.`,
  )
}

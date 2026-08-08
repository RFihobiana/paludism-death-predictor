import './Desease.css'
import React, { FormEvent, useCallback, useRef, useState } from 'react'

// ----- CLINICALLY CONSTANTS -----
const INITIAL_HEMOGLOBIN = 14.5 // g/dL, normal adult
const CRITICAL_HEMOGLOBIN = 5.0 // g/dL, life‑threatening anemia
const DAILY_PARASITE_GROWTH = 3.0 // realistic daily multiplier
const CRITICAL_PARASITE_DENSITY = 250_000 // ~5% parasitemia, severe malaria threshold
const DAYS_TO_CRITICAL = 7 // days for Hb to drop from 14.5 → 5.0
const SEVERITY_THRESHOLD = 8.5 // calibrated threshold
const MAX_SIMULATION_DAYS = 365

// ----- EXPOSED FUNCTIONS (used by the UI and tests) -----

/**
 * Models daily hemoglobin decline due to hemolysis.
 * Returns Hb in g/dL for a given day of infection.
 */
export function dieErythrocyte(day: number) {
  const progress = Math.max(0, day / DAYS_TO_CRITICAL)
  return Math.max(
    0,
    INITIAL_HEMOGLOBIN - progress * (INITIAL_HEMOGLOBIN - CRITICAL_HEMOGLOBIN),
  )
}

/**
 * Calculates a severity index from parasite density, current hemoglobin,
 * and days since onset. Higher values = worse prognosis.
 */
export function calculateSeverityIndex(
  parasiteDensity: number,
  hemoglobin: number,
  daysSinceOnset: number,
) {
  const parasiteTerm = Math.log10(parasiteDensity + 1) * 1.4
  const durationTerm = Math.log10(daysSinceOnset + 1) * 0.8
  // Anemia contribution: the lower the Hb, the higher the severity
  const anemiaTerm =
    Math.max(0, (INITIAL_HEMOGLOBIN - hemoglobin) / INITIAL_HEMOGLOBIN) * 3.0
  return parasiteTerm + durationTerm + anemiaTerm
}

/**
 * Predicts the exact day when the patient crosses a fatal threshold.
 * Returns a Date object representing that day, or null if no threshold is reached.
 */
export function findDeathDate(diseaseDate: Date): Date | null {
  const startDate = new Date(diseaseDate)
  let parasiteDensity = 10_000 // starting parasite density (parasites/µL)
  let daysSinceOnset = 0

  while (
    parasiteDensity < CRITICAL_PARASITE_DENSITY &&
    daysSinceOnset < MAX_SIMULATION_DAYS
  ) {
    parasiteDensity *= DAILY_PARASITE_GROWTH
    daysSinceOnset += 1

    const hemoglobin = dieErythrocyte(daysSinceOnset)
    const severity = calculateSeverityIndex(
      parasiteDensity,
      hemoglobin,
      daysSinceOnset,
    )

    // Critical condition: either severity crosses the threshold OR Hb drops below 5.0
    if (severity > SEVERITY_THRESHOLD || hemoglobin < CRITICAL_HEMOGLOBIN) {
      const deathDate = new Date(startDate)
      deathDate.setDate(deathDate.getDate() + daysSinceOnset)
      return deathDate
    }
  }

  // If parasite density becomes critical before other thresholds, return that day
  if (parasiteDensity >= CRITICAL_PARASITE_DENSITY) {
    const deathDate = new Date(startDate)
    deathDate.setDate(deathDate.getDate() + daysSinceOnset)
    return deathDate
  }

  // No threshold crossed within the simulation window
  return null
}

export default function Desease() {
  const [deathPrediction, setDeathPrediction] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const diseaseDateEl = useRef<HTMLInputElement>(null)

  const predictDeath = useCallback((ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (diseaseDateEl.current) {
      const diseaseDate = diseaseDateEl.current.valueAsDate
      if (!diseaseDate) {
        setErrorMessage('Please choose a start date to generate a prediction.')
        setDeathPrediction(null)
        return
      }
      setSelectedDate(diseaseDateEl.current.value)
      setErrorMessage('')
      setDeathPrediction(findDeathDate(diseaseDate))
    }
  }, [])

  const applySampleDate = useCallback((value: string) => {
    if (diseaseDateEl.current) {
      diseaseDateEl.current.value = value
      setSelectedDate(value)
      setErrorMessage('')
      setDeathPrediction(null) // clear previous prediction
    }
  }, [])

  const clearPrediction = useCallback(() => {
    if (diseaseDateEl.current) {
      diseaseDateEl.current.value = ''
    }
    setSelectedDate('')
    setErrorMessage('')
    setDeathPrediction(null)
  }, [])

  const selectedDateValue = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : null
  const daysUntilThreshold =
    deathPrediction && selectedDateValue
      ? Math.round(
          (deathPrediction.getTime() - selectedDateValue.getTime()) /
            86_400_000,
        )
      : null

  // Determine urgency level for visual feedback
  let urgencyLevel = 'low'
  let urgencyEmoji = '🟢'
  let urgencyLabel = 'Low risk'
  if (deathPrediction) {
    if (daysUntilThreshold !== null && daysUntilThreshold <= 14) {
      urgencyLevel = 'critical'
      urgencyEmoji = '🔴'
      urgencyLabel = 'Critical – immediate action required'
    } else if (daysUntilThreshold !== null && daysUntilThreshold <= 30) {
      urgencyLevel = 'moderate'
      urgencyEmoji = '🟡'
      urgencyLabel = 'Moderate – urgent monitoring needed'
    } else if (daysUntilThreshold !== null) {
      urgencyLevel = 'low'
      urgencyEmoji = '🟢'
      urgencyLabel = 'Elevated – clinical surveillance advised'
    }
  }

  return (
    <section className="prediction-card">
      <form className="prediction-form" method="GET" onSubmit={predictDeath}>
        <fieldset>
          <legend>Disease Timeline</legend>
          <p className="form-intro">
            Choose the day symptoms began and the model will estimate the point
            where the critical threshold is reached.
          </p>
          <label className="field">
            <span>Illness starting time</span>
            <input
              type="date"
              data-testid="desease-days"
              id="desease-days"
              ref={diseaseDateEl}
              onChange={() => {
                if (diseaseDateEl.current) {
                  setSelectedDate(diseaseDateEl.current.value)
                  setErrorMessage('')
                  setDeathPrediction(null) // clear old result when date changes
                }
              }}
            />
          </label>
          <div className="quick-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => applySampleDate('2024-01-15')}
            >
              📅 Try sample date
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={clearPrediction}
            >
              ✕ Clear
            </button>
          </div>
        </fieldset>
        <button
          type="submit"
          className="primary-button"
          disabled={!selectedDate}
        >
          Predict Critical Threshold
        </button>
      </form>

      <div className="insight-panel">
        <h2>How this estimate works</h2>
        <ul>
          <li>Simulates daily parasite growth and progressive anemia.</li>
          <li>
            Combines parasite density, haemoglobin level, and infection
            duration.
          </li>
          <li>
            Flags the date when the combined severity index exceeds a critical
            limit.
          </li>
        </ul>

        {errorMessage && (
          <p className="error-message" role="alert">
            ⚠️ {errorMessage}
          </p>
        )}

        <div className="result-area" aria-live="polite">
          {!deathPrediction && !errorMessage && (
            <div className="result-placeholder">
              <p>📋 Submit a date to see the projected critical threshold.</p>
            </div>
          )}

          {deathPrediction && (
            <div
              id="death-prediction"
              className={`result-card urgency-${urgencyLevel}`}
            >
              <div className="result-header">
                <span className="urgency-badge">
                  {urgencyEmoji} {urgencyLabel}
                </span>
                <span className="result-label">Projected critical date</span>
              </div>
              <h3>
                {deathPrediction.toLocaleDateString(navigator.language, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <p className="result-detail">
                <strong>{daysUntilThreshold}</strong> days from the selected
                start date.
              </p>
              <p className="result-footnote">
                This is the day the model predicts the combined severity index
                will cross the fatal threshold.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

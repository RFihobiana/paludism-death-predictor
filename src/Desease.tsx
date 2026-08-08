import React, { FormEvent, useCallback, useRef, useState } from 'react'
import './Desease.css'

/**
 * Calculates red blood cell (erythrocyte) destruction based on the
 * 48-hour schizogony cycle of Plasmodium falciparum (School Formula)
 *
 * @param day The current day of infection
 * @returns Number of erythrocytes destroyed during the cycle step
 */
export function dieErythrocyte(day: number): number {
  const hours = day * 24 // Convert days into total hours elapsed
  const x = hours / 48 // Determine how many 48-hour schizogony cycles have passed

  return 10 ** x
}

/**
 * Iterate through infection time using 2-day cycles
 * to simulate total red blood cell depletion until a critical threshold is met.
 *
 * @param deseaseDate The initial date when symptoms started
 * @returns A Date object representing the critical date
 */
export function findDeathDate(deseaseDate: Date): Date {
  const startDate = new Date(deseaseDate)

  // Initialize total adult human red blood cell count (Around 30 trillion cells)
  let erythrocyte = 30 * 10 ** 12
  let totalDays = 0

  // Loop through 2-day cycles
  // Stops if red blood cells drop bellow 50% (15 trillion) or safety limit of 365 days in hit
  for (let day = 2; erythrocyte > 15 * 10 ** 12 && totalDays < 365; day += 2) {
    const destroyed = dieErythrocyte(day)
    erythrocyte -= destroyed // Substract destroyed cell from the total pool
    totalDays = day // Keep track of total elapsed days
  }

  // Calculate final death date by adding total elapsed disease days to start date
  let deathDate = new Date(startDate)
  deathDate.setDate(deathDate.getDate() + totalDays)
  return deathDate
}

export default function Desease() {
  const [deathPrediction, setDeathPrediction] = useState<Date>()
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const deseaseDateEl = useRef<HTMLInputElement>(null)

  // Handle form submission to calculate and display the prediction date
  const predictDeath = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (deseaseDateEl.current) {
      const deseaseDate = deseaseDateEl.current.valueAsDate
      if (!deseaseDate) {
        setErrorMessage('Please Choose a start date to generate a prediction.')
        setDeathPrediction(undefined)
        return
      }

      setSelectedDate(deseaseDateEl.current.value)
      setErrorMessage('')
      setDeathPrediction(findDeathDate(deseaseDate))
    }
  }, [])

  // Helper to automatically apply a sample test date for quick evaluation
  const applySampleDate = useCallback((value: string) => {
    if (deseaseDateEl.current) {
      deseaseDateEl.current.value = value
    }
  }, [])

  // Clear all input and current predictions
  const clearPrediction = useCallback(() => {
    if (deseaseDateEl.current) {
      deseaseDateEl.current.value = ''
    }
    setSelectedDate('')
    setErrorMessage('')
    setDeathPrediction(undefined)
  }, [])

  // Calculates number of day between start date and predicted outcome
  const selectedDateValue = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : null
  const daysUntilDeath =
    deathPrediction && selectedDateValue
      ? Math.round(
          (deathPrediction.getTime() - selectedDateValue.getTime()) /
            86_400_000,
        )
      : null

  return (
    <section className="prediction-card">
      {/* Form section to capture illness start date */}
      <form className="prediction-form" method="GET" onSubmit={predictDeath}>
        <fieldset>
          <legend>Disease Timeline</legend>
          <p className="form-intro">
            Estimate outcomes based on the 48-hour erythrocytic schizogony
            cycle.
          </p>
          <label className="field">
            <span>Illness starting time</span>
            <input
              type="date"
              data-testid="desease-days"
              id="desease-days"
              ref={deseaseDateEl}
              onChange={() => {
                if (deseaseDateEl.current) {
                  setSelectedDate(deseaseDateEl.current.value)
                  setErrorMessage('')
                }
              }}
            />
          </label>

          <div className="quick-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                applySampleDate('2026-08-07')
              }}
            >
              Try sample date
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={() => clearPrediction()}
            >
              Clear
            </button>
          </div>
        </fieldset>

        <button type="submit" className="primary-button">
          Predict Death
        </button>
      </form>

      {/* Panel displaying model restrictions, limits, and final calculation outputs */}
      <div className="insight-panel">
        <h2>Model Restrictions & Limits</h2>
        <ul>
          <li>
            <strong>Purely Theorical:</strong> Assumes uniform cell destruction
            without accounting for immune defense, spleen filtration, or
            clinical treatments.
          </li>
          <li>
            <strong>Exponential Scale:</strong> Utilizes powers of ten (10
            <sup>x</sup>), meaning red blood cell destruction scales up
            aggrevesively over time.
          </li>
          <li>
            <strong>Simplified Threshold:</strong> Triggers critical failure
            once total RBC inventory drops by 50% as a generalized mathmatical
            benchmark.
          </li>
        </ul>
      </div>

      {/* Display validation error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Display final prediction card if it has been generated */}
      {deathPrediction && (
        <div
          id="death-prediction"
          className={`result-card urgency-${daysUntilDeath && daysUntilDeath < 28 ? 'critical' : 'moderate'}`}
        >
          <p className="result-label">Projected fatal date</p>
          <p className="result-summary">
            The patient will surely die at{' '}
            {deathPrediction.toLocaleDateString()}.
          </p>

          <h3>
            {Intl.DateTimeFormat('en-US', {
              month: 'long',
              weekday: 'long',
              year: 'numeric',
              day: '2-digit',
            }).format(deathPrediction)}
          </h3>
          <p>
            This estimate is about {daysUntilDeath} days from the selected start
            date
          </p>
        </div>
      )}
    </section>
  )
}

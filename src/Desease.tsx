import React, { useCallback, useRef } from 'react'
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
  const deseaseDateEl = useRef<HTMLInputElement>(null)

  // Helper to automatically apply a sample test date for quick evaluation
  const applySampleDate = useCallback((value: string) => {
    if (deseaseDateEl.current) {
      deseaseDateEl.current.value = value
    }
  }, [])

  return (
    <section className="prediction-card">
      {/* Form section to capture illness start date */}
      <form className="prediction-form" method="GET">
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
          </div>
        </fieldset>
      </form>
    </section>
  )
}

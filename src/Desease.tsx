import React, { FormEvent, useCallback, useRef, useState } from 'react'

const INITIAL_HEMOGLOBIN = 14.5
const SEVERE_HEMOGLOBIN = 5.0
const DAILY_PARASITE_GROWTH = 1.18
const CRITICAL_PARASITE_DENSITY = 100_000_000
const DAYS_TO_CRITICAL = 7

export function dieErythrocyte(day: number) {
	// Approximate the progression of severe anemia using a daily decay model.
	const progress = Math.max(0, day / DAYS_TO_CRITICAL)
	return Math.max(0, INITIAL_HEMOGLOBIN - progress * (INITIAL_HEMOGLOBIN - SEVERE_HEMOGLOBIN))
}

export function calculateSeverityIndex(parasiteDensity: number, daysSinceOnset: number) {
	// A simple severity index that combines parasite burden and the duration of infection.
	const parasiteTerm = Math.log10(parasiteDensity + 1)
	const durationTerm = Math.log10(daysSinceOnset + 1)
	return parasiteTerm * 1.4 + durationTerm * 0.8
}

export function findDeathDate(deseaseDate: Date) {
	const startDate = new Date(deseaseDate)
	let deathDate = new Date(startDate)
	let parasiteDensity = 10_000
	let daysSinceOnset = 0

	while (parasiteDensity < CRITICAL_PARASITE_DENSITY && daysSinceOnset < 365) {
		parasiteDensity *= DAILY_PARASITE_GROWTH
		daysSinceOnset += 1
		const severityIndex = calculateSeverityIndex(parasiteDensity, daysSinceOnset)
		if (severityIndex > 8.5) {
			deathDate.setDate(deathDate.getDate() + 1)
		}
	}

	return deathDate
}

export default function Desease() {
	const [deathPrediction, setDeathPrediction] = useState<Date>()
	const [errorMessage, setErrorMessage] = useState('')
	const [selectedDate, setSelectedDate] = useState('')
	const deseaseDateEl = useRef<HTMLInputElement>(null)

	const predictDeath = useCallback((ev: FormEvent<HTMLFormElement>) => {
		ev.preventDefault()

		if (deseaseDateEl.current) {
			const deseaseDate = deseaseDateEl.current.valueAsDate
			if (!deseaseDate) {
				setErrorMessage('Please choose a start date to generate a prediction.')
				setDeathPrediction(undefined)
				return
			}

			setSelectedDate(deseaseDateEl.current.value)
			setErrorMessage('')
			setDeathPrediction(findDeathDate(deseaseDate))
		}
	}, [])

	const applySampleDate = useCallback((value: string) => {
		if (deseaseDateEl.current) {
			deseaseDateEl.current.value = value
			setSelectedDate(value)
			setErrorMessage('')
		}
	}, [])

	const clearPrediction = useCallback(() => {
		if (deseaseDateEl.current) {
			deseaseDateEl.current.value = ''
		}
		setSelectedDate('')
		setErrorMessage('')
		setDeathPrediction(undefined)
	}, [])

	const selectedDateValue = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null
	const daysUntilDeath =
		deathPrediction && selectedDateValue
			? Math.round((deathPrediction.getTime() - selectedDateValue.getTime()) / 86_400_000)
			: null

	return (
		<section className='prediction-card'>
			<form className='prediction-form' method='GET' onSubmit={predictDeath}>
				<fieldset>
					<legend>Disease Timeline</legend>
					<p className='form-intro'>Choose the day symptoms began and the model will estimate the point where the fatal threshold is reached.</p>
					<label className='field'>
						<span>Illness starting time</span>
						<input
							type='date'
							data-testid='desease-days'
							id='desease-days'
							ref={deseaseDateEl}
							onChange={() => {
								if (deseaseDateEl.current) {
									setSelectedDate(deseaseDateEl.current.value)
									setErrorMessage('')
								}
							}}
						/>
					</label>
					<div className='quick-actions'>
						<button type='button' className='ghost-button' onClick={() => applySampleDate('2024-01-15')}>
							Try sample date
						</button>
						<button type='button' className='ghost-button' onClick={clearPrediction}>
							Clear
						</button>
					</div>
				</fieldset>
				<button type='submit' className='primary-button'>Predict Death</button>
			</form>

			<div className='insight-panel'>
				<h2>How this estimate works</h2>
				<ul>
					<li>The model combines parasite burden growth with worsening anemia.</li>
					<li>Higher parasite density and longer duration increase the estimated severity.</li>
					<li>The result highlights the date when the index crosses a critical threshold.</li>
				</ul>

				{errorMessage && <p className='error-message'>{errorMessage}</p>}

				{deathPrediction && (
					<div id='death-prediction' className='result-card'>
						<p className='result-label'>Projected fatal date</p>
						<p className='result-summary'>
							The patient will surely die at {deathPrediction.toLocaleDateString()}.
						</p>
						<h3>{deathPrediction.toLocaleDateString()}</h3>
						<p>
							This estimate is about {daysUntilDeath} days from the selected start date.
						</p>
					</div>
				)}
			</div>
		</section>
	)
}

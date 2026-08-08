import React, { FormEvent, useCallback, useRef, useState } from 'react'

export function dieErythrocyte(day: number) {
	// Convert the number of days into hours and then scale it to the model's 48-hour cycle.
	const hours = day * 24
	const x = hours / 48

	// Each step grows exponentially, so the loss increases quickly over time.
	return 10 ** x
}

export function findDeathDate(deseaseDate: Date) {
	// Start from a large erythrocyte count that represents the patient's initial healthy state.
	// The value is intentionally large so the loop can model gradual depletion over many days.
	let erythrocyte = 30 * 10 ** 12
	let deathDate = new Date(deseaseDate)

	// Advance the date in 2-day steps while erythrocyte levels remain above zero.
	for (
		let day = 2;
		erythrocyte > 0;
		erythrocyte -= dieErythrocyte(day), day += 2
	) {
		deathDate.setDate(deathDate.getDate() + day)
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
				// Guard against an empty input so the UI can show a helpful message.
				setErrorMessage('Please choose a start date to generate a prediction.')
				setDeathPrediction(undefined)
				return
			}

			// Store the entered date so the result panel can describe the interval clearly.
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
		// Reset the UI state so the form is ready for a new prediction.
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
					<li>The model follows erythrocyte depletion in 48-hour steps.</li>
					<li>Each step uses an exponential decay curve to estimate the lethal threshold.</li>
					<li>The result highlights the date when the body reaches that threshold.</li>
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

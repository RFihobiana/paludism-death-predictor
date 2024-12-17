import React, { FormEvent, useCallback, useRef, useState } from 'react'

export function dieErythrocyte(day: number) {
	const hours = day * 24
	const x = hours / 48

	return 10 ** x
}

export function findDeathDate(deseaseDate: Date) {
	let erythrocyte = 30 * 10 ** 12
	let deathDate = new Date(deseaseDate)

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
	let [deathPrediction, setDeathPrediction] = useState<Date>()
	let deseaseDateEl = useRef<HTMLInputElement>(null)

	let predictDeath = useCallback(
		(ev: FormEvent<HTMLInputElement>) => {
			ev.preventDefault()

			if (deseaseDateEl.current) {
				let deseaseDate = deseaseDateEl.current.valueAsDate
				if (!deseaseDate) return

				setDeathPrediction(findDeathDate(deseaseDate))
			}
		},
		[deseaseDateEl]
	)

	return (
		<>
			<form method='GET'>
				<fieldset>
					<legend>Desease Time</legend>
					<label>
						Illness starting time:{' '}
						<input
							type='date'
							data-testid='desease-days'
							id='desease-days'
							ref={deseaseDateEl}
						/>
					</label>
				</fieldset>
				<input type='submit' value='Submit' onClick={predictDeath} />
			</form>

			{deathPrediction && (
				<div id='death-prediction'>
					The patient will surely die at {deathPrediction?.toLocaleDateString()}
				</div>
			)}
		</>
	)
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { act } from 'react'
import Desease, { calculateSeverityIndex, dieErythrocyte, findDeathDate } from './Desease'

test('Get the true erythrocyte death from calculation', () => {
	expect(dieErythrocyte(2)).toBeCloseTo(11.79, 2)
	expect(dieErythrocyte(4)).toBeCloseTo(9.07, 2)
	expect(dieErythrocyte(6)).toBeCloseTo(6.36, 2)
	expect(dieErythrocyte(8)).toBeCloseTo(3.64, 2)
})

test('calculateSeverityIndex reflects higher risk for severe disease', () => {
	expect(calculateSeverityIndex(1_000_000, 5)).toBeGreaterThan(calculateSeverityIndex(100_000, 5))
	expect(calculateSeverityIndex(100_000, 2)).toBeLessThan(calculateSeverityIndex(100_000, 8))
})

test('findDeathDate returns a date after the illness start', () => {
	const start = new Date('2024-01-15T00:00:00')
	const predicted = findDeathDate(start)
	expect(predicted.getTime()).toBeGreaterThan(start.getTime())
})

describe('Control input fields of desease UI', () => {
	let container: Element

	beforeEach(() => {
		container = document.createElement('div')
		document.body.appendChild(container)

		act(() => {
			ReactDOM.createRoot(container).render(<Desease />)
		})
	})

	afterEach(() => {
		document.body.removeChild(container)
	})

	test('draw starting illness day', () => {
		const enteredDay = screen.getByTestId('desease-days')
		expect(enteredDay.tagName).toBe('INPUT')
		expect(enteredDay).toBeEmptyDOMElement()
		expect(enteredDay).toHaveAttribute('type', 'date')
	})

	test('draw submit button', () => {
		const okButton = screen.getByRole('button', { name: /predict death/i })
		expect(okButton).toBeInTheDocument()
	})

	test('shows a prediction summary after submitting a date', () => {
		const input = screen.getByTestId('desease-days') as HTMLInputElement
		const submitButton = screen.getByRole('button', { name: /predict death/i })

		fireEvent.change(input, { target: { value: '2024-01-15' } })
		fireEvent.click(submitButton)

		expect(screen.getByText(/the patient will surely die/i)).toBeInTheDocument()
	})
})

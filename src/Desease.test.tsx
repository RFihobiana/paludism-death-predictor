import React from 'react'
import ReactDOM from 'react-dom/client'
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { act } from 'react'
import Desease, { dieErythrocyte } from './Desease'

test('Get the true erythrocyte death from calculation', () => {
	expect(dieErythrocyte(2)).toBe(10)
	expect(dieErythrocyte(4)).toBe(100)
	expect(dieErythrocyte(6)).toBe(1_000)
	expect(dieErythrocyte(8)).toBe(1_0000)
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
		const okButton = screen.getByText(/submit/iu)
		expect(okButton).toBeInTheDocument()
	})
})

import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import React from 'react'
import Desease, { dieErythrocyte, findDeathDate } from './Desease'
import { act } from 'react'
import ReactDOM from 'react-dom/client'

test('Get the true erythrocyte death from calculation', () => {
  expect(dieErythrocyte(2)).toBe(10) // One cycle for 48 hours
  expect(dieErythrocyte(4)).toBe(100)
})

test('findDeathDate returns a date after the illness start date', () => {
  const startDate = new Date()
  const predicted = findDeathDate(startDate)
  expect(predicted.getTime()).toBeGreaterThan(startDate.getTime())
})

describe('Control input fields of desease UI', () => {
  let container: Element

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      ReactDOM.createRoot(container).render(<Desease/>)
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
    const okButton = screen.getByRole('button', { name: /predict death/i})
    expect(okButton).toBeInTheDocument()
  })
})

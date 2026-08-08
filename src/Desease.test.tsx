import React from 'react'
import ReactDOM from 'react-dom/client'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { act } from 'react'
import Desease, {
  calculateSeverityIndex,
  dieErythrocyte,
  findDeathDate,
} from './Desease'

test('dieErythrocyte follows the expected decay curve', () => {
  expect(dieErythrocyte(2)).toBeCloseTo(11.79, 2)
  expect(dieErythrocyte(4)).toBeCloseTo(9.07, 2)
  expect(dieErythrocyte(6)).toBeCloseTo(6.36, 2)
  expect(dieErythrocyte(8)).toBeCloseTo(3.64, 2)
})

test('calculateSeverityIndex increases with lower hemoglobin', () => {
  // Higher severity when hemoglobin drops from 14.5 to 7.0
  const highHb = calculateSeverityIndex(100_000, 14.5, 5)
  const lowHb = calculateSeverityIndex(100_000, 7.0, 5)
  expect(lowHb).toBeGreaterThan(highHb)
})

test('calculateSeverityIndex increases with higher parasite density', () => {
  const lowDensity = calculateSeverityIndex(100_000, 14.5, 5)
  const highDensity = calculateSeverityIndex(1_000_000, 14.5, 5)
  expect(highDensity).toBeGreaterThan(lowDensity)
})

test('calculateSeverityIndex increases with longer duration', () => {
  const shortDuration = calculateSeverityIndex(100_000, 14.5, 2)
  const longDuration = calculateSeverityIndex(100_000, 14.5, 8)
  expect(longDuration).toBeGreaterThan(shortDuration)
})

test('findDeathDate returns a date after the illness start, or null', () => {
  const start = new Date('2024-01-15T00:00:00')
  const predicted = findDeathDate(start)
  // If not null, it must be after the start date
  if (predicted) {
    expect(predicted.getTime()).toBeGreaterThan(start.getTime())
  } else {
    // It's acceptable to return null if no threshold is crossed
    expect(predicted).toBeNull()
  }
})

describe('Control input fields of disease UI', () => {
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

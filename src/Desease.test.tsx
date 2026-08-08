import '@testing-library/jest-dom'
import { dieErythrocyte, findDeathDate } from './Desease'

test('Get the true erythrocyte death from calculation', () => {
  expect(dieErythrocyte(2)).toBe(10) // One cycle for 48 hours
  expect(dieErythrocyte(4)).toBe(100)
})

test('findDeathDate returns a date after the illness start date', () => {
  const startDate = new Date()
  const predicted = findDeathDate(startDate)
  expect(predicted.getTime()).toBeGreaterThan(startDate.getTime())
})


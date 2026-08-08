import '@testing-library/jest-dom'
import { dieErythrocyte } from './Desease'

test('Get the true erythrocyte death from calculation', () => {
  expect(dieErythrocyte(2)).toBe(10) // One cycle for 48 hours
  expect(dieErythrocyte(4)).toBe(100)
})




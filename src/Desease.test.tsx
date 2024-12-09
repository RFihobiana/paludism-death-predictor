import Desease, { dieErythrocyte } from './Desease'

test('Get the true erythrocyte death from calculation', () => {
	expect(dieErythrocyte(2)).toBe(10)
	expect(dieErythrocyte(4)).toBe(100)
	expect(dieErythrocyte(6)).toBe(1_000)
	expect(dieErythrocyte(8)).toBe(1_0000)
})

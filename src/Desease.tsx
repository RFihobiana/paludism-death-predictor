import React from 'react'

export function dieErythrocyte(day: number) {
	const hours = day * 24
	const x = hours / 48

	return 10**x
}

export default function Desease() {
	return <input type="text" />
}

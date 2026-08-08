import React from 'react'
import './App.css'
import Desease from './Desease'

function App() {
	return (
		<div className='App'>
			<main className='app-shell'>
				<header className='hero-card'>
					<p className='eyebrow'>Medical forecasting</p>
					<h1>Paludism Disease Predictor</h1>
					<p className='hero-copy'>Explore a simple clinical estimate based on erythrocyte decline and the projected fatal threshold.</p>
				</header>
				<Desease />
			</main>
		</div>
	)
}

export default App;

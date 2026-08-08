import './Desease.css'


/**
 * Calculates red blood cell (erythrocyte) destruction based on the
 * 48-hour schizogony cycle of Plasmodium falciparum (School Formula)
 * 
 * @param day The current day of infection
 * @returns Number of erythrocytes destroyed during the cycle step
 */
export function dieErythrocyte(day: number): number {
  const hours = day * 24  // Convert days into total hours elapsed
  const x = hours / 48    // Determine how many 48-hour schizogony cycles have passed

  return 10 ** x
}


const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatFechaEspanol(fechaISO: string): string {
  if (!fechaISO) return '';
  const [year, month, day] = fechaISO.split('-').map(Number);
  return `${day} de ${MESES[month - 1]} de ${year}`;
}

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

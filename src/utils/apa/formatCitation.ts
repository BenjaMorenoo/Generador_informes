import { Referencia } from '../../types';

function formatAuthors(autores: string[]): string {
  if (!autores || autores.length === 0) return '';
  if (autores.length === 1) return `${autores[0]}.`;
  if (autores.length <= 7) {
    const allButLast = autores.slice(0, -1).join(', ');
    return `${allButLast} y ${autores[autores.length - 1]}.`;
  }
  const first6 = autores.slice(0, 6).join(', ');
  return `${first6}, ... ${autores[autores.length - 1]}.`;
}

export function formatAPA7(ref: Referencia): string {
  const autores = formatAuthors(ref.autores);
  const anio = ref.anio ? `(${ref.anio}).` : '(s.f.).';
  const titulo = ref.titulo || '';

  switch (ref.tipo) {
    case 'libro': {
      const editorial = ref.editorial ? `${ref.editorial}.` : ref.fuente ? `${ref.fuente}.` : '';
      const ciudad = ref.ciudad ? `${ref.ciudad}: ` : '';
      return `${autores} ${anio} <em>${titulo}</em>. ${ciudad}${editorial}`.trim();
    }
    case 'articulo': {
      const fuente = ref.fuente ? `<em>${ref.fuente}</em>` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : ref.url ? ` ${ref.url}` : '';
      return `${autores} ${anio} ${titulo}. ${fuente}.${doi}`.trim();
    }
    case 'web': {
      const fuente = ref.fuente ? `${ref.fuente}.` : '';
      const url = ref.url ? ` ${ref.url}` : '';
      return `${autores} ${anio} <em>${titulo}</em>. ${fuente}${url}`.trim();
    }
    case 'norma': {
      const fuente = ref.fuente ? `${ref.fuente}.` : '';
      return `${titulo}. ${anio} ${fuente}`.trim();
    }
    default: {
      const fuente = ref.fuente ? `${ref.fuente}.` : '';
      const url = ref.url ? ` ${ref.url}` : '';
      return `${autores} ${anio} ${titulo}. ${fuente}${url}`.trim();
    }
  }
}

export function sortReferences(refs: Referencia[]): Referencia[] {
  return [...refs].sort((a, b) => {
    const keyA = (a.autores?.[0] || a.titulo || '').toLowerCase();
    const keyB = (b.autores?.[0] || b.titulo || '').toLowerCase();
    return keyA.localeCompare(keyB, 'es');
  });
}

export function formatAPA7Plain(ref: Referencia): string {
  return formatAPA7(ref).replace(/<\/?em>/g, '');
}

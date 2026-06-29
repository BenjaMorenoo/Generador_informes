import { DocumentoAcademico, Seccion, NivelSeccion, PRESETS_TABLA } from '../types';

// Generador de ids estables para la plantilla
let uid = 0;
const nid = (p: string) => `ev-${p}-${++uid}`;

let orden = 0;
function seccion(titulo: string, nivel: NivelSeccion): Seccion {
  return {
    id: nid('s'),
    titulo,
    nivel,
    contenido: '',
    orden: orden++,
    imagenes: [],
    tablas: [],
  };
}

// Estructura (esqueleto) de un informe de evaluación de proyectos de software.
// Las secciones vienen vacías para que el usuario complete el contenido.
const secciones: Seccion[] = [
  seccion('Resumen Ejecutivo', 1),
  seccion('Introducción y Objetivo del Informe', 1),
  seccion('Presentación de los Proyectos Evaluados', 1),
  seccion('Opciones de Desarrollo: Implicancias, Proyecciones y Expectativas', 1),
  seccion('Técnicas de Análisis y Justificación de la Alternativa', 1),
  seccion('Comparación Financiera y Selección del Proyecto', 1),
  seccion('Justificación de Viabilidad y Rentabilidad del Proyecto Seleccionado', 1),
  seccion('Hallazgos y Observaciones sobre la Documentación', 1),
  seccion('Conclusiones y Recomendaciones', 1),
  seccion('Referencias y Fuentes', 1),
];

const ahora = new Date().toISOString().split('T')[0];

export const documentoEvaluacion: DocumentoAcademico = {
  metadata: {
    proyecto: '',
    entrega: 'ENTREGA 1',
    asignatura: 'Evaluación de Proyectos de Software',
    seccion: '',
    profesor: '',
    fecha: ahora,
    integrantes: [],
    institucion: 'Institución',
    logoUrl: '',
    ciudad: 'Santiago',
    version: '1.0',
    mantenidoPor: '',
    fechaUltimaRevision: ahora,
    fechaProximaRevision: '',
    aprobadoPor: '',
    fechaUltimaAprobacion: '',
    historialRevisiones: [],
    estiloHistorial: { ...PRESETS_TABLA.azul },
  },
  config: {
    fuente: 'Times New Roman',
    tamano: 12,
    interlineado: 1.5,
    margenes: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 },
  },
  secciones,
  referencias: [],
  mostrarIdentificacion: false,
};

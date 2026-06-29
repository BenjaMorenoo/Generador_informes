import { DocumentoAcademico, PRESETS_TABLA } from '../types';
import { documentoEvaluacion } from './evaluacionProyectos';

export interface Plantilla {
  id: string;
  nombre: string;
  nombreCompleto: string;
  descripcion: string;
  categoria: string;
  disponible: boolean;
  color: string;        // hex accent color for card
  colorClaro: string;   // light bg for badge
  colorTexto: string;   // text color for badge
  documento: DocumentoAcademico;
}

const ahora = new Date().toISOString().split('T')[0];

const documentoBase = (): DocumentoAcademico => ({
  metadata: {
    proyecto: '',
    entrega: 'ENTREGA 1',
    asignatura: '',
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
    estiloHistorial: PRESETS_TABLA.azul,
  },
  config: {
    fuente: 'Times New Roman',
    tamano: 12,
    interlineado: 1.5,
    margenes: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 },
  },
  secciones: [],
  referencias: [],
});

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'das',
    nombre: 'DAS',
    nombreCompleto: 'Documento de Arquitectura de Software',
    descripcion:
      'Formato estándar para documentar la arquitectura de un sistema de software. Incluye portada, identificación del documento, historial de revisiones, índices automáticos y referencias APA 7.',
    categoria: 'Ingeniería de Software',
    disponible: true,
    color: '#1d4ed8',
    colorClaro: '#eff6ff',
    colorTexto: '#1e40af',
    documento: documentoBase(),
  },
  {
    id: 'evaluacion-proyectos',
    nombre: 'Evaluación de Proyectos',
    nombreCompleto: 'Informe de Evaluación de Proyectos de Software',
    descripcion:
      'Informe técnico de decisión de inversión para comparar y seleccionar proyectos de software. Trae la estructura de secciones lista (resumen ejecutivo, opciones de desarrollo, técnicas de análisis, comparación financiera VAN/TIR/PRI, conclusiones y referencias) para que completes el contenido.',
    categoria: 'Evaluación de Proyectos',
    disponible: true,
    color: '#0f766e',
    colorClaro: '#f0fdfa',
    colorTexto: '#115e59',
    documento: documentoEvaluacion,
  },
  {
    id: 'informe-tecnico',
    nombre: 'Informe Técnico',
    nombreCompleto: 'Informe Técnico',
    descripcion:
      'Estructura formal para reportes técnicos con abstract, introducción, desarrollo, resultados y conclusiones según norma IEEE.',
    categoria: 'Ingeniería',
    disponible: false,
    color: '#7c3aed',
    colorClaro: '#f5f3ff',
    colorTexto: '#6d28d9',
    documento: documentoBase(),
  },
  {
    id: 'laboratorio',
    nombre: 'Laboratorio',
    nombreCompleto: 'Informe de Laboratorio',
    descripcion:
      'Plantilla para informes de laboratorio con objetivo, hipótesis, materiales, procedimiento y análisis de resultados.',
    categoria: 'Ciencias',
    disponible: false,
    color: '#059669',
    colorClaro: '#f0fdf4',
    colorTexto: '#065f46',
    documento: documentoBase(),
  },
  {
    id: 'memoria',
    nombre: 'Memoria de Título',
    nombreCompleto: 'Memoria / Tesis de Título',
    descripcion:
      'Documento académico formal para proyecto de título con resumen ejecutivo, estado del arte, metodología y resultados.',
    categoria: 'Académico',
    disponible: false,
    color: '#d97706',
    colorClaro: '#fffbeb',
    colorTexto: '#92400e',
    documento: documentoBase(),
  },
  {
    id: 'en-blanco',
    nombre: 'En Blanco',
    nombreCompleto: 'Documento en Blanco',
    descripcion:
      'Estructura completamente libre. Solo portada y secciones vacías para cualquier tipo de informe personalizado.',
    categoria: 'General',
    disponible: false,
    color: '#64748b',
    colorClaro: '#f8fafc',
    colorTexto: '#475569',
    documento: documentoBase(),
  },
];

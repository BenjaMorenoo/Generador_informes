export interface Integrante {
  id: string;
  nombre: string;
  rol?: string;
}

export interface Margen {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Config {
  fuente: string;
  tamano: number;
  interlineado: number;
  margenes: Margen;
}

export interface Imagen {
  id: string;
  url: string;
  figuraNumero: number;
  descripcion: string;
}

// ── Tablas ──────────────────────────────────────────────

export interface EstiloTabla {
  colorEncabezado: string;
  colorTextoEncabezado: string;
  colorFilaImpar: string;
  colorFilaPar: string;
  colorBorde: string;
  tiposBorde: 'todos' | 'horizontales' | 'exterior' | 'ninguno';
}

export const PRESETS_TABLA: Record<string, EstiloTabla> = {
  azul: {
    colorEncabezado: '#1e40af',
    colorTextoEncabezado: '#ffffff',
    colorFilaImpar: '#eff6ff',
    colorFilaPar: '#ffffff',
    colorBorde: '#93c5fd',
    tiposBorde: 'todos',
  },
  gris: {
    colorEncabezado: '#374151',
    colorTextoEncabezado: '#ffffff',
    colorFilaImpar: '#f9fafb',
    colorFilaPar: '#ffffff',
    colorBorde: '#d1d5db',
    tiposBorde: 'todos',
  },
  verde: {
    colorEncabezado: '#065f46',
    colorTextoEncabezado: '#ffffff',
    colorFilaImpar: '#f0fdf4',
    colorFilaPar: '#ffffff',
    colorBorde: '#6ee7b7',
    tiposBorde: 'todos',
  },
  naranja: {
    colorEncabezado: '#c2410c',
    colorTextoEncabezado: '#ffffff',
    colorFilaImpar: '#fff7ed',
    colorFilaPar: '#ffffff',
    colorBorde: '#fdba74',
    tiposBorde: 'todos',
  },
  minimalista: {
    colorEncabezado: '#ffffff',
    colorTextoEncabezado: '#111827',
    colorFilaImpar: '#f9fafb',
    colorFilaPar: '#ffffff',
    colorBorde: '#e5e7eb',
    tiposBorde: 'horizontales',
  },
};

export interface CeldaTabla {
  id: string;
  valor: string;
}

export interface FilaTabla {
  id: string;
  celdas: CeldaTabla[];
}

export interface Tabla {
  id: string;
  descripcion: string;
  columnas: string[];
  filas: FilaTabla[];
  estilo: EstiloTabla;
}

// ── Sección ──────────────────────────────────────────────

export type NivelSeccion = 1 | 2 | 3;

export interface Seccion {
  id: string;
  titulo: string;
  nivel: NivelSeccion;
  contenido: string;
  orden: number;
  imagenes: Imagen[];
  tablas: Tabla[];
}

// ── Referencias ───────────────────────────────────────────

export type TipoReferencia = 'libro' | 'articulo' | 'web' | 'norma' | 'otro';

export interface Referencia {
  id: string;
  tipo: TipoReferencia;
  autores: string[];
  anio: string;
  titulo: string;
  fuente: string;
  url?: string;
  editorial?: string;
  doi?: string;
  ciudad?: string;
}

// ── Metadata ─────────────────────────────────────────────

export interface FilaHistorial {
  id: string;
  fecha: string;
  revision: string;
  autor: string;
  modificacion: string;
}

export interface Metadata {
  proyecto: string;
  entrega: string;
  asignatura: string;
  seccion: string;
  profesor: string;
  fecha: string;
  integrantes: Integrante[];
  institucion: string;
  logoUrl: string;
  ciudad: string;
  version: string;
  mantenidoPor: string;
  fechaUltimaRevision: string;
  fechaProximaRevision: string;
  aprobadoPor: string;
  fechaUltimaAprobacion: string;
  historialRevisiones: FilaHistorial[];
  estiloHistorial: EstiloTabla;
}

export interface DocumentoAcademico {
  metadata: Metadata;
  config: Config;
  secciones: Seccion[];
  referencias: Referencia[];
  // Página preliminar de "Identificación del Documento" (propia del DAS).
  // undefined o true = se muestra; false = se oculta.
  mostrarIdentificacion?: boolean;
}

export type ActivePanel = 'metadata' | 'secciones' | 'referencias' | 'config';

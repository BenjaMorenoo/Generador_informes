import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DocumentoAcademico,
  Seccion,
  Referencia,
  Integrante,
  FilaHistorial,
  Imagen,
  Tabla,
  ActivePanel,
  EstiloTabla,
  PRESETS_TABLA,
} from '../types';
import { generarId } from '../utils/date';

const defaultDocumento: DocumentoAcademico = {
  metadata: {
    proyecto: '',
    entrega: 'ENTREGA 1',
    asignatura: '',
    seccion: '',
    profesor: '',
    fecha: new Date().toISOString().split('T')[0],
    integrantes: [],
    institucion: 'Duoc UC',
    logoUrl: '',
    ciudad: 'Santiago',
    version: '1.0',
    mantenidoPor: '',
    fechaUltimaRevision: new Date().toISOString().split('T')[0],
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
};

// Helper: aplica fn a la tabla dentro de una sección
function mapTabla(
  secciones: Seccion[],
  seccionId: string,
  tablaId: string,
  fn: (t: Tabla) => Tabla
): Seccion[] {
  return secciones.map((sec) =>
    sec.id !== seccionId
      ? sec
      : {
          ...sec,
          tablas: sec.tablas.map((t) => (t.id !== tablaId ? t : fn(t))),
        }
  );
}

interface DocumentStore {
  documento: DocumentoAcademico;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  updateMetadata: (fields: Partial<DocumentoAcademico['metadata']>) => void;
  updateConfig: (fields: Partial<DocumentoAcademico['config']>) => void;
  addIntegrante: (i: Integrante) => void;
  updateIntegrante: (id: string, fields: Partial<Integrante>) => void;
  removeIntegrante: (id: string) => void;
  reorderIntegrantes: (ids: string[]) => void;
  addSeccion: (s: Seccion) => void;
  updateSeccion: (id: string, fields: Partial<Seccion>) => void;
  removeSeccion: (id: string) => void;
  reorderSecciones: (ids: string[]) => void;
  addImagen: (seccionId: string, img: Imagen) => void;
  updateImagen: (seccionId: string, imagenId: string, fields: Partial<Imagen>) => void;
  removeImagen: (seccionId: string, imagenId: string) => void;
  // Tablas
  addTabla: (seccionId: string, tabla: Tabla) => void;
  updateTabla: (seccionId: string, tablaId: string, fields: Partial<Tabla>) => void;
  removeTabla: (seccionId: string, tablaId: string) => void;
  addColumna: (seccionId: string, tablaId: string) => void;
  removeColumna: (seccionId: string, tablaId: string, colIdx: number) => void;
  updateColumna: (seccionId: string, tablaId: string, colIdx: number, nombre: string) => void;
  addFila: (seccionId: string, tablaId: string) => void;
  removeFila: (seccionId: string, tablaId: string, filaId: string) => void;
  updateCelda: (seccionId: string, tablaId: string, filaId: string, celdaId: string, valor: string) => void;
  // Referencias
  addReferencia: (r: Referencia) => void;
  updateReferencia: (id: string, fields: Partial<Referencia>) => void;
  removeReferencia: (id: string) => void;
  // Historial
  addHistorial: (f: FilaHistorial) => void;
  updateHistorial: (id: string, fields: Partial<FilaHistorial>) => void;
  removeHistorial: (id: string) => void;
  resetDocumento: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documento: defaultDocumento,
      activePanel: 'metadata',

      setActivePanel: (panel) => set({ activePanel: panel }),

      updateMetadata: (fields) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, ...fields } } })),

      updateConfig: (fields) =>
        set((s) => ({ documento: { ...s.documento, config: { ...s.documento.config, ...fields } } })),

      addIntegrante: (i) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, integrantes: [...s.documento.metadata.integrantes, i] } } })),

      updateIntegrante: (id, fields) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, integrantes: s.documento.metadata.integrantes.map((i) => i.id === id ? { ...i, ...fields } : i) } } })),

      removeIntegrante: (id) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, integrantes: s.documento.metadata.integrantes.filter((i) => i.id !== id) } } })),

      reorderIntegrantes: (ids) =>
        set((s) => {
          const map = new Map(s.documento.metadata.integrantes.map((i) => [i.id, i]));
          return { documento: { ...s.documento, metadata: { ...s.documento.metadata, integrantes: ids.map((id) => map.get(id)!).filter(Boolean) } } };
        }),

      addSeccion: (sec) =>
        set((s) => ({ documento: { ...s.documento, secciones: [...s.documento.secciones, sec] } })),

      updateSeccion: (id, fields) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === id ? { ...sec, ...fields } : sec) } })),

      removeSeccion: (id) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.filter((sec) => sec.id !== id) } })),

      reorderSecciones: (ids) =>
        set((s) => {
          const map = new Map(s.documento.secciones.map((sec) => [sec.id, sec]));
          return { documento: { ...s.documento, secciones: ids.map((id, idx) => ({ ...map.get(id)!, orden: idx })).filter(Boolean) } };
        }),

      addImagen: (seccionId, img) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === seccionId ? { ...sec, imagenes: [...sec.imagenes, img] } : sec) } })),

      updateImagen: (seccionId, imagenId, fields) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === seccionId ? { ...sec, imagenes: sec.imagenes.map((img) => img.id === imagenId ? { ...img, ...fields } : img) } : sec) } })),

      removeImagen: (seccionId, imagenId) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === seccionId ? { ...sec, imagenes: sec.imagenes.filter((img) => img.id !== imagenId) } : sec) } })),

      // ── TABLAS ──────────────────────────────────────────────

      addTabla: (seccionId, tabla) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === seccionId ? { ...sec, tablas: [...sec.tablas, tabla] } : sec) } })),

      updateTabla: (seccionId, tablaId, fields) =>
        set((s) => ({ documento: { ...s.documento, secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({ ...t, ...fields })) } })),

      removeTabla: (seccionId, tablaId) =>
        set((s) => ({ documento: { ...s.documento, secciones: s.documento.secciones.map((sec) => sec.id === seccionId ? { ...sec, tablas: sec.tablas.filter((t) => t.id !== tablaId) } : sec) } })),

      addColumna: (seccionId, tablaId) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              columnas: [...t.columnas, `Columna ${t.columnas.length + 1}`],
              filas: t.filas.map((fila) => ({
                ...fila,
                celdas: [...fila.celdas, { id: generarId(), valor: '' }],
              })),
            })),
          },
        })),

      removeColumna: (seccionId, tablaId, colIdx) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              columnas: t.columnas.filter((_, i) => i !== colIdx),
              filas: t.filas.map((fila) => ({
                ...fila,
                celdas: fila.celdas.filter((_, i) => i !== colIdx),
              })),
            })),
          },
        })),

      updateColumna: (seccionId, tablaId, colIdx, nombre) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              columnas: t.columnas.map((c, i) => (i === colIdx ? nombre : c)),
            })),
          },
        })),

      addFila: (seccionId, tablaId) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              filas: [
                ...t.filas,
                {
                  id: generarId(),
                  celdas: t.columnas.map(() => ({ id: generarId(), valor: '' })),
                },
              ],
            })),
          },
        })),

      removeFila: (seccionId, tablaId, filaId) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              filas: t.filas.filter((f) => f.id !== filaId),
            })),
          },
        })),

      updateCelda: (seccionId, tablaId, filaId, celdaId, valor) =>
        set((s) => ({
          documento: {
            ...s.documento,
            secciones: mapTabla(s.documento.secciones, seccionId, tablaId, (t) => ({
              ...t,
              filas: t.filas.map((f) =>
                f.id !== filaId
                  ? f
                  : { ...f, celdas: f.celdas.map((c) => (c.id !== celdaId ? c : { ...c, valor })) }
              ),
            })),
          },
        })),

      // ── REFERENCIAS ─────────────────────────────────────────

      addReferencia: (ref) =>
        set((s) => ({ documento: { ...s.documento, referencias: [...s.documento.referencias, ref] } })),

      updateReferencia: (id, fields) =>
        set((s) => ({ documento: { ...s.documento, referencias: s.documento.referencias.map((r) => r.id === id ? { ...r, ...fields } : r) } })),

      removeReferencia: (id) =>
        set((s) => ({ documento: { ...s.documento, referencias: s.documento.referencias.filter((r) => r.id !== id) } })),

      // ── HISTORIAL ───────────────────────────────────────────

      addHistorial: (fila) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, historialRevisiones: [...s.documento.metadata.historialRevisiones, fila] } } })),

      updateHistorial: (id, fields) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, historialRevisiones: s.documento.metadata.historialRevisiones.map((h) => h.id === id ? { ...h, ...fields } : h) } } })),

      removeHistorial: (id) =>
        set((s) => ({ documento: { ...s.documento, metadata: { ...s.documento.metadata, historialRevisiones: s.documento.metadata.historialRevisiones.filter((h) => h.id !== id) } } })),

      resetDocumento: () => set({ documento: defaultDocumento }),
    }),
    {
      name: 'das-documento',
      // Migración: secciones guardadas antes de la feature de tablas no tienen el campo
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.documento.secciones = state.documento.secciones.map((sec) => ({
          ...sec,
          tablas: sec.tablas ?? [],
        }));
        const meta = state.documento.metadata as unknown as { estiloHistorial?: EstiloTabla };
        if (!meta.estiloHistorial) {
          state.documento.metadata.estiloHistorial = PRESETS_TABLA.azul;
        }
      },
    }
  )
);

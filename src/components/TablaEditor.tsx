import { useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { Tabla, EstiloTabla, PRESETS_TABLA } from '../types';
import { Trash2, Plus, ChevronDown, ChevronRight, Columns, AlignLeft } from 'lucide-react';

interface Props {
  tabla: Tabla;
  seccionId: string;
  tablaNum: number;
}

const BORDER_OPTIONS: { value: EstiloTabla['tiposBorde']; label: string }[] = [
  { value: 'todos', label: 'Todos los bordes' },
  { value: 'horizontales', label: 'Solo horizontales' },
  { value: 'exterior', label: 'Solo exterior' },
  { value: 'ninguno', label: 'Sin bordes' },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600 w-40 flex-shrink-0">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 border border-gray-300 rounded px-1.5 py-0.5 text-xs font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export function TablaEditor({ tabla, seccionId, tablaNum }: Props) {
  const { updateTabla, removeTabla, addColumna, removeColumna, updateColumna, addFila, removeFila, updateCelda } =
    useDocumentStore();
  const [tab, setTab] = useState<'datos' | 'estilo'>('datos');
  const [expanded, setExpanded] = useState(true);

  const updateEstilo = (fields: Partial<EstiloTabla>) =>
    updateTabla(seccionId, tabla.id, { estilo: { ...tabla.estilo, ...fields } });

  const applyPreset = (preset: keyof typeof PRESETS_TABLA) =>
    updateTabla(seccionId, tabla.id, { estilo: PRESETS_TABLA[preset] });

  const { estilo } = tabla;
  const colCount = tabla.columnas.length;

  // Mini-preview de la tabla con el estilo actual
  const MiniPreview = () => (
    <div className="mt-3 rounded overflow-hidden border" style={{ borderColor: estilo.colorBorde }}>
      <div className="flex">
        {['Encabezado', 'Columna 2'].map((c, i) => (
          <div
            key={i}
            className="flex-1 text-xs font-bold px-2 py-1"
            style={{ background: estilo.colorEncabezado, color: estilo.colorTextoEncabezado, borderRight: i === 0 ? `1px solid ${estilo.colorBorde}` : undefined }}
          >
            {c}
          </div>
        ))}
      </div>
      {[0, 1].map((row) => (
        <div
          key={row}
          className="flex"
          style={{ background: row % 2 === 0 ? estilo.colorFilaImpar : estilo.colorFilaPar, borderTop: `1px solid ${estilo.colorBorde}` }}
        >
          {['Dato A', 'Dato B'].map((c, i) => (
            <div
              key={i}
              className="flex-1 text-xs px-2 py-1"
              style={{ borderRight: i === 0 ? `1px solid ${estilo.colorBorde}` : undefined }}
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div
          className="w-3 h-3 rounded-sm border border-gray-300"
          style={{ background: estilo.colorEncabezado }}
        />
        <span className="text-xs font-semibold text-gray-600">Tabla {tablaNum}.</span>
        <input
          className="flex-1 text-xs border border-gray-300 rounded px-2 py-0.5 bg-white"
          placeholder="Descripción de la tabla"
          value={tabla.descripcion}
          onChange={(e) => updateTabla(seccionId, tabla.id, { descripcion: e.target.value })}
        />
        <span className="text-xs text-gray-400">{colCount}×{tabla.filas.length}</span>
        <button onClick={() => removeTabla(seccionId, tabla.id)} className="text-red-400 hover:text-red-600">
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div className="p-3">
          {/* Sub-tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTab('datos')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                tab === 'datos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <AlignLeft size={11} /> Datos
            </button>
            <button
              onClick={() => setTab('estilo')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                tab === 'estilo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Columns size={11} /> Diseño
            </button>
          </div>

          {tab === 'datos' && (
            <div>
              {/* Grid editor */}
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full text-xs border-collapse">
                  {/* Column headers */}
                  <thead>
                    <tr>
                      {tabla.columnas.map((col, ci) => (
                        <th
                          key={ci}
                          className="border border-gray-200 p-0"
                          style={{ minWidth: '80px' }}
                        >
                          <div className="flex items-center" style={{ background: estilo.colorEncabezado }}>
                            <input
                              className="flex-1 px-2 py-1.5 text-xs font-bold bg-transparent outline-none min-w-0"
                              style={{ color: estilo.colorTextoEncabezado }}
                              value={col}
                              onChange={(e) => updateColumna(seccionId, tabla.id, ci, e.target.value)}
                              placeholder={`Col ${ci + 1}`}
                            />
                            {colCount > 1 && (
                              <button
                                onClick={() => removeColumna(seccionId, tabla.id, ci)}
                                className="px-1 opacity-60 hover:opacity-100 flex-shrink-0"
                                style={{ color: estilo.colorTextoEncabezado }}
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      {/* Add column button */}
                      <th className="border border-gray-200 p-1 bg-gray-50">
                        <button
                          onClick={() => addColumna(seccionId, tabla.id)}
                          className="text-gray-400 hover:text-blue-600 w-full flex justify-center"
                          title="Agregar columna"
                        >
                          <Plus size={12} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.filas.map((fila, fi) => (
                      <tr key={fila.id} style={{ background: fi % 2 === 0 ? estilo.colorFilaImpar : estilo.colorFilaPar }}>
                        {fila.celdas.map((celda, ci) => (
                          <td key={celda.id} className="border border-gray-200 p-0">
                            <input
                              className="w-full px-2 py-1.5 text-xs bg-transparent outline-none"
                              value={celda.valor}
                              onChange={(e) => updateCelda(seccionId, tabla.id, fila.id, celda.id, e.target.value)}
                              placeholder={`(${fi + 1},${ci + 1})`}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 p-1 bg-gray-50">
                          <button
                            onClick={() => removeFila(seccionId, tabla.id, fila.id)}
                            className="text-gray-300 hover:text-red-500 flex justify-center w-full"
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Add row */}
                    <tr className="bg-gray-50">
                      <td colSpan={colCount + 1} className="border border-gray-200">
                        <button
                          onClick={() => addFila(seccionId, tabla.id)}
                          className="w-full text-xs text-gray-400 hover:text-blue-600 py-1 flex items-center justify-center gap-1"
                        >
                          <Plus size={11} /> Agregar fila
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'estilo' && (
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Estilos predefinidos</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(PRESETS_TABLA) as [keyof typeof PRESETS_TABLA, EstiloTabla][]).map(
                    ([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => applyPreset(key)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <span
                          className="w-3 h-3 rounded-sm inline-block border border-gray-300"
                          style={{ background: preset.colorEncabezado }}
                        />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Color pickers */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Colores</p>
                <div className="space-y-2">
                  <ColorField
                    label="Fondo encabezado"
                    value={estilo.colorEncabezado}
                    onChange={(v) => updateEstilo({ colorEncabezado: v })}
                  />
                  <ColorField
                    label="Texto encabezado"
                    value={estilo.colorTextoEncabezado}
                    onChange={(v) => updateEstilo({ colorTextoEncabezado: v })}
                  />
                  <ColorField
                    label="Fila impar"
                    value={estilo.colorFilaImpar}
                    onChange={(v) => updateEstilo({ colorFilaImpar: v })}
                  />
                  <ColorField
                    label="Fila par"
                    value={estilo.colorFilaPar}
                    onChange={(v) => updateEstilo({ colorFilaPar: v })}
                  />
                  <ColorField
                    label="Bordes"
                    value={estilo.colorBorde}
                    onChange={(v) => updateEstilo({ colorBorde: v })}
                  />
                </div>
              </div>

              {/* Border type */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Tipo de borde</p>
                <div className="flex flex-wrap gap-1">
                  {BORDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateEstilo({ tiposBorde: opt.value })}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        estilo.tiposBorde === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini preview */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Vista previa</p>
                <MiniPreview />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

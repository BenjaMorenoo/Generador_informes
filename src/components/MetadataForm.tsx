import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDocumentStore } from '../store/documentStore';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Trash2, Plus, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { generarId } from '../utils/date';
import { Integrante, FilaHistorial, EstiloTabla, PRESETS_TABLA } from '../types';

const BORDER_OPTIONS: { value: EstiloTabla['tiposBorde']; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'horizontales', label: 'Horizontales' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'ninguno', label: 'Sin bordes' },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600 w-36 flex-shrink-0">{label}</label>
      <div className="flex items-center gap-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0.5 bg-white" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-20 border border-gray-300 rounded px-1.5 py-0.5 text-xs font-mono" maxLength={7} />
      </div>
    </div>
  );
}

export function MetadataForm() {
  const { documento, updateMetadata, addIntegrante, updateIntegrante, removeIntegrante,
    addHistorial, updateHistorial, removeHistorial } = useDocumentStore();
  const { metadata } = documento;
  const [showDesign, setShowDesign] = useState(false);

  const estilo = metadata.estiloHistorial ?? PRESETS_TABLA.azul;
  const updateEstilo = (fields: Partial<EstiloTabla>) =>
    updateMetadata({ estiloHistorial: { ...estilo, ...fields } });
  const applyPreset = (key: keyof typeof PRESETS_TABLA) =>
    updateMetadata({ estiloHistorial: PRESETS_TABLA[key] });

  const { register, watch, setValue } = useForm({ defaultValues: metadata });

  useEffect(() => {
    const sub = watch((values) => {
      updateMetadata(values as typeof metadata);
    });
    return () => sub.unsubscribe();
  }, [watch, updateMetadata]);

  useEffect(() => {
    Object.keys(metadata).forEach((key) => {
      setValue(key as keyof typeof metadata, (metadata as unknown as Record<string, unknown>)[key] as string);
    });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateMetadata({ logoUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const addNewIntegrante = () => {
    const nuevo: Integrante = { id: generarId(), nombre: '', rol: '' };
    addIntegrante(nuevo);
  };

  const addNewHistorial = () => {
    const nueva: FilaHistorial = {
      id: generarId(),
      fecha: new Date().toISOString().split('T')[0],
      revision: '1.0',
      autor: '',
      modificacion: 'Versión inicial',
    };
    addHistorial(nueva);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Portada */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">Portada</h3>
        <div className="space-y-3">
          <Input label="Institución" {...register('institucion')} />
          <Input label="Nombre del Proyecto" {...register('proyecto')} />
          <Input label="Entrega" placeholder="ENTREGA 1" {...register('entrega')} />
          <Input label="Asignatura" {...register('asignatura')} />
          <Input label="Sección" {...register('seccion')} />
          <Input label="Profesor" {...register('profesor')} />
          <Input label="Ciudad" {...register('ciudad')} />
          <Input label="Fecha" type="date" {...register('fecha')} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Logo Institucional
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {metadata.logoUrl && (
              <img src={metadata.logoUrl} alt="Logo" className="h-12 object-contain mt-1" />
            )}
          </div>
        </div>
      </section>

      {/* Integrantes */}
      <section>
        <div className="flex items-center justify-between mb-3 border-b pb-1">
          <h3 className="font-semibold text-gray-800">Integrantes</h3>
          <Button size="sm" onClick={addNewIntegrante} variant="secondary">
            <Plus size={12} /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {metadata.integrantes.map((integrante) => (
            <div key={integrante.id} className="flex gap-2 items-start bg-gray-50 rounded-md p-2">
              <GripVertical size={14} className="text-gray-400 mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <input
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Nombre completo"
                  value={integrante.nombre}
                  onChange={(e) => updateIntegrante(integrante.id, { nombre: e.target.value })}
                />
                <input
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"
                  placeholder="Rol (opcional)"
                  value={integrante.rol || ''}
                  onChange={(e) => updateIntegrante(integrante.id, { rol: e.target.value })}
                />
              </div>
              <button
                onClick={() => removeIntegrante(integrante.id)}
                className="text-red-400 hover:text-red-600 mt-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {metadata.integrantes.length === 0 && (
            <p className="text-xs text-gray-400 italic">Sin integrantes. Haz clic en "Agregar".</p>
          )}
        </div>
      </section>

      {/* Identificación del documento */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">Identificación del Documento</h3>
        <div className="space-y-3">
          <Input label="Versión" {...register('version')} />
          <Input label="Mantenido por" {...register('mantenidoPor')} />
          <Input label="Fecha última revisión" type="date" {...register('fechaUltimaRevision')} />
          <Input label="Fecha próxima revisión" type="date" {...register('fechaProximaRevision')} />
          <Input label="Aprobado por" {...register('aprobadoPor')} />
          <Input label="Fecha última aprobación" type="date" {...register('fechaUltimaAprobacion')} />
        </div>
      </section>

      {/* Historial de revisiones */}
      <section>
        <div className="flex items-center justify-between mb-3 border-b pb-1">
          <h3 className="font-semibold text-gray-800">Historial de Revisiones</h3>
          <Button size="sm" onClick={addNewHistorial} variant="secondary">
            <Plus size={12} /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {metadata.historialRevisiones.map((fila) => (
            <div key={fila.id} className="bg-gray-50 rounded-md p-2 space-y-1">
              <div className="flex gap-1">
                <input
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                  type="date"
                  value={fila.fecha}
                  onChange={(e) => updateHistorial(fila.id, { fecha: e.target.value })}
                />
                <input
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Rev."
                  value={fila.revision}
                  onChange={(e) => updateHistorial(fila.id, { revision: e.target.value })}
                />
                <button onClick={() => removeHistorial(fila.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="Autor"
                value={fila.autor}
                onChange={(e) => updateHistorial(fila.id, { autor: e.target.value })}
              />
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                placeholder="Descripción del cambio"
                value={fila.modificacion}
                onChange={(e) => updateHistorial(fila.id, { modificacion: e.target.value })}
              />
            </div>
          ))}
          {metadata.historialRevisiones.length === 0 && (
            <p className="text-xs text-gray-400 italic">Sin historial. Haz clic en "Agregar".</p>
          )}
        </div>

        {/* Panel de diseño de la tabla */}
        <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDesign(!showDesign)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-gray-300 inline-block" style={{ background: estilo.colorEncabezado }} />
              Diseño de la tabla
            </span>
            {showDesign ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          {showDesign && (
            <div className="p-3 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Estilos predefinidos</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(PRESETS_TABLA) as [keyof typeof PRESETS_TABLA, EstiloTabla][]).map(([key, preset]) => (
                    <button key={key} type="button" onClick={() => applyPreset(key)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <span className="w-3 h-3 rounded-sm inline-block border border-gray-300" style={{ background: preset.colorEncabezado }} />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Colores</p>
                <div className="space-y-2">
                  <ColorField label="Fondo encabezado" value={estilo.colorEncabezado} onChange={(v) => updateEstilo({ colorEncabezado: v })} />
                  <ColorField label="Texto encabezado" value={estilo.colorTextoEncabezado} onChange={(v) => updateEstilo({ colorTextoEncabezado: v })} />
                  <ColorField label="Fila impar" value={estilo.colorFilaImpar} onChange={(v) => updateEstilo({ colorFilaImpar: v })} />
                  <ColorField label="Fila par" value={estilo.colorFilaPar} onChange={(v) => updateEstilo({ colorFilaPar: v })} />
                  <ColorField label="Bordes" value={estilo.colorBorde} onChange={(v) => updateEstilo({ colorBorde: v })} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Tipo de borde</p>
                <div className="flex flex-wrap gap-1">
                  {BORDER_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => updateEstilo({ tiposBorde: opt.value })}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        estilo.tiposBorde === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Vista previa</p>
                <div className="rounded overflow-hidden border" style={{ borderColor: estilo.colorBorde }}>
                  <div className="flex">
                    {['Fecha', 'Autor'].map((c, i) => (
                      <div key={i} className="flex-1 text-xs font-bold px-2 py-1"
                        style={{ background: estilo.colorEncabezado, color: estilo.colorTextoEncabezado, borderRight: i === 0 ? `1px solid ${estilo.colorBorde}` : undefined }}>
                        {c}
                      </div>
                    ))}
                  </div>
                  {[0, 1].map((row) => (
                    <div key={row} className="flex"
                      style={{ background: row % 2 === 0 ? estilo.colorFilaImpar : estilo.colorFilaPar, borderTop: `1px solid ${estilo.colorBorde}` }}>
                      {['2024-01-15', 'Equipo'].map((c, i) => (
                        <div key={i} className="flex-1 text-xs px-2 py-1"
                          style={{ borderRight: i === 0 ? `1px solid ${estilo.colorBorde}` : undefined }}>
                          {c}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

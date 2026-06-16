import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDocumentStore } from '../store/documentStore';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { generarId } from '../utils/date';
import { Integrante, FilaHistorial } from '../types';

export function MetadataForm() {
  const { documento, updateMetadata, addIntegrante, updateIntegrante, removeIntegrante,
    addHistorial, updateHistorial, removeHistorial } = useDocumentStore();
  const { metadata } = documento;

  const { register, watch, setValue } = useForm({ defaultValues: metadata });

  useEffect(() => {
    const sub = watch((values) => {
      updateMetadata(values as typeof metadata);
    });
    return () => sub.unsubscribe();
  }, [watch, updateMetadata]);

  useEffect(() => {
    Object.keys(metadata).forEach((key) => {
      setValue(key as keyof typeof metadata, (metadata as Record<string, unknown>)[key] as string);
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
      </section>
    </div>
  );
}

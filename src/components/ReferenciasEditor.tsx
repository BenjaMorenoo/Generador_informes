import { useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { Referencia, TipoReferencia } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { generarId } from '../utils/date';
import { formatAPA7, sortReferences } from '../utils/apa/formatCitation';

const tipoOptions: { value: TipoReferencia; label: string }[] = [
  { value: 'libro', label: 'Libro' },
  { value: 'articulo', label: 'Artículo' },
  { value: 'web', label: 'Sitio web' },
  { value: 'norma', label: 'Norma técnica' },
  { value: 'otro', label: 'Otro' },
];

function ReferenciaItem({ ref }: { ref: Referencia }) {
  const { updateReferencia, removeReferencia } = useDocumentStore();
  const [expanded, setExpanded] = useState(false);

  const updateAutores = (idx: number, val: string) => {
    const next = [...ref.autores];
    next[idx] = val;
    updateReferencia(ref.id, { autores: next });
  };

  const addAutor = () => updateReferencia(ref.id, { autores: [...ref.autores, ''] });
  const removeAutor = (idx: number) => {
    const next = ref.autores.filter((_, i) => i !== idx);
    updateReferencia(ref.id, { autores: next });
  };

  const preview = formatAPA7(ref);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-lg">
        <button onClick={() => setExpanded(!expanded)} className="text-gray-600">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium uppercase">
          {ref.tipo}
        </span>
        <span className="flex-1 text-sm text-gray-700 truncate">
          {ref.titulo || <span className="text-gray-400 italic">Sin título</span>}
        </span>
        <button onClick={() => removeReferencia(ref.id)} className="text-red-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          <Select
            label="Tipo"
            value={ref.tipo}
            options={tipoOptions}
            onChange={(e) => updateReferencia(ref.id, { tipo: e.target.value as TipoReferencia })}
          />
          <Input
            label="Título"
            value={ref.titulo}
            onChange={(e) => updateReferencia(ref.id, { titulo: e.target.value })}
          />
          <Input
            label="Año"
            value={ref.anio}
            placeholder="2023"
            onChange={(e) => updateReferencia(ref.id, { anio: e.target.value })}
          />

          {/* Autores */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Autores</label>
              <button onClick={addAutor} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={10} /> Autor
              </button>
            </div>
            {ref.autores.map((autor, idx) => (
              <div key={idx} className="flex gap-1 mb-1">
                <input
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Apellido, N."
                  value={autor}
                  onChange={(e) => updateAutores(idx, e.target.value)}
                />
                <button onClick={() => removeAutor(idx)} className="text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <Input
            label="Fuente / Revista / Editorial"
            value={ref.fuente}
            onChange={(e) => updateReferencia(ref.id, { fuente: e.target.value })}
          />
          {ref.tipo === 'libro' && (
            <>
              <Input
                label="Editorial"
                value={ref.editorial || ''}
                onChange={(e) => updateReferencia(ref.id, { editorial: e.target.value })}
              />
              <Input
                label="Ciudad"
                value={ref.ciudad || ''}
                onChange={(e) => updateReferencia(ref.id, { ciudad: e.target.value })}
              />
            </>
          )}
          {(ref.tipo === 'articulo') && (
            <Input
              label="DOI"
              value={ref.doi || ''}
              placeholder="10.xxxx/xxxxx"
              onChange={(e) => updateReferencia(ref.id, { doi: e.target.value })}
            />
          )}
          <Input
            label="URL"
            value={ref.url || ''}
            onChange={(e) => updateReferencia(ref.id, { url: e.target.value })}
          />

          <div className="bg-amber-50 border border-amber-200 rounded p-2">
            <p className="text-xs text-amber-700 font-medium mb-1">Vista previa APA 7:</p>
            <p
              className="text-xs text-gray-700"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ReferenciasEditor() {
  const { documento, addReferencia } = useDocumentStore();
  const sorted = sortReferences(documento.referencias);

  const addNuevaReferencia = () => {
    const nueva: Referencia = {
      id: generarId(),
      tipo: 'libro',
      autores: [''],
      anio: String(new Date().getFullYear()),
      titulo: '',
      fuente: '',
    };
    addReferencia(nueva);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">{documento.referencias.length} referencia(s) • Ordenadas A–Z</p>
        <Button size="sm" onClick={addNuevaReferencia} variant="primary">
          <Plus size={12} /> Nueva referencia
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Sin referencias. Haz clic en "Nueva referencia".</p>
        </div>
      )}

      {sorted.map((ref) => (
        <ReferenciaItem key={ref.id} ref={ref} />
      ))}
    </div>
  );
}

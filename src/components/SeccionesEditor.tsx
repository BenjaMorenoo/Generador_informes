import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDocumentStore } from '../store/documentStore';
import { Seccion, NivelSeccion, Imagen, Tabla, PRESETS_TABLA } from '../types';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TablaEditor } from './TablaEditor';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Image, Table2 } from 'lucide-react';
import { generarId } from '../utils/date';

const nivelOptions = [
  { value: '1', label: 'Nivel 1 – Capítulo (H1)' },
  { value: '2', label: 'Nivel 2 – Sección (H2)' },
  { value: '3', label: 'Nivel 3 – Subsección (H3)' },
];

function SortableSeccion({
  seccion,
  figuraOffset,
  tablaOffset,
  tablaNumGlobal,
}: {
  seccion: Seccion;
  figuraOffset: number;
  tablaOffset: number;
  tablaNumGlobal: (seccionId: string, tablaId: string) => number;
}) {
  const { updateSeccion, removeSeccion, addImagen, updateImagen, removeImagen, addTabla } =
    useDocumentStore();
  const [expanded, setExpanded] = useState(true);
  const [showImageForm, setShowImageForm] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: seccion.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddTabla = () => {
    const nueva: Tabla = {
      id: generarId(),
      descripcion: '',
      columnas: ['Columna 1', 'Columna 2', 'Columna 3'],
      filas: [
        { id: generarId(), celdas: [{ id: generarId(), valor: '' }, { id: generarId(), valor: '' }, { id: generarId(), valor: '' }] },
        { id: generarId(), celdas: [{ id: generarId(), valor: '' }, { id: generarId(), valor: '' }, { id: generarId(), valor: '' }] },
      ],
      estilo: PRESETS_TABLA.azul,
    };
    addTabla(seccion.id, nueva);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const nueva: Imagen = {
        id: generarId(),
        url: ev.target?.result as string,
        figuraNumero: figuraOffset + seccion.imagenes.length + 1,
        descripcion: '',
      };
      addImagen(seccion.id, nueva);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const nivelStyle = {
    1: 'border-l-4 border-blue-500',
    2: 'border-l-4 border-blue-300 ml-3',
    3: 'border-l-4 border-blue-200 ml-6',
  }[seccion.nivel];

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-lg shadow-sm ${nivelStyle} mb-2`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-lg">
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab">
          <GripVertical size={16} />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-600">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="text-xs font-bold text-blue-600 uppercase w-6">H{seccion.nivel}</span>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {seccion.titulo || <span className="text-gray-400 italic">Sin título</span>}
        </span>
        <button onClick={() => removeSeccion(seccion.id)} className="text-red-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input
                label="Título"
                value={seccion.titulo}
                onChange={(e) => updateSeccion(seccion.id, { titulo: e.target.value })}
              />
            </div>
            <Select
              label="Nivel"
              value={String(seccion.nivel)}
              options={nivelOptions}
              onChange={(e) =>
                updateSeccion(seccion.id, { nivel: Number(e.target.value) as NivelSeccion })
              }
            />
          </div>
          <Textarea
            label="Contenido"
            rows={6}
            value={seccion.contenido}
            placeholder="Escribe el contenido de esta sección. Usa listas con - para viñetas."
            onChange={(e) => updateSeccion(seccion.id, { contenido: e.target.value })}
          />

          {/* Imágenes */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Figuras ({seccion.imagenes.length})
              </span>
              <button
                onClick={() => setShowImageForm(!showImageForm)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Image size={12} /> Agregar figura
              </button>
            </div>
            {showImageForm && (
              <div className="bg-blue-50 rounded p-2 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-100 file:text-blue-700"
                />
              </div>
            )}
            {seccion.imagenes.map((img, idx) => (
              <div key={img.id} className="flex gap-2 items-start bg-gray-50 rounded p-2 mb-1">
                <img src={img.url} alt={img.descripcion} className="w-16 h-12 object-cover rounded" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-gray-500">Figura {figuraOffset + idx + 1}</p>
                  <input
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="Descripción de la figura"
                    value={img.descripcion}
                    onChange={(e) => updateImagen(seccion.id, img.id, { descripcion: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => removeImagen(seccion.id, img.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Tablas */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Tablas ({seccion.tablas.length})
              </span>
              <button
                onClick={handleAddTabla}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Table2 size={12} /> Agregar tabla
              </button>
            </div>
            {seccion.tablas.map((tabla) => (
              <TablaEditor
                key={tabla.id}
                tabla={tabla}
                seccionId={seccion.id}
                tablaNum={tablaNumGlobal(seccion.id, tabla.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SeccionesEditor() {
  const { documento, addSeccion, reorderSecciones } = useDocumentStore();
  const { secciones } = documento;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = secciones.map((s) => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const newIds = [...ids];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, String(active.id));
    reorderSecciones(newIds);
  };

  const addNuevaSeccion = (nivel: NivelSeccion) => {
    const nueva: Seccion = {
      id: generarId(),
      titulo: '',
      nivel,
      contenido: '',
      orden: secciones.length,
      imagenes: [],
      tablas: [],
    };
    addSeccion(nueva);
  };

  // Numeración global de figuras y tablas
  let figuraCounter = 0;
  let tablaCounter = 0;
  const figuraOffsets: Record<string, number> = {};
  const tablaOffsets: Record<string, number> = {};
  // mapa tablaId -> número global
  const tablaNumMap: Record<string, number> = {};

  for (const sec of secciones) {
    figuraOffsets[sec.id] = figuraCounter;
    figuraCounter += sec.imagenes.length;
    tablaOffsets[sec.id] = tablaCounter;
    for (const tabla of sec.tablas) {
      tablaCounter++;
      tablaNumMap[tabla.id] = tablaCounter;
    }
  }

  const tablaNumGlobal = (_seccionId: string, tablaId: string) => tablaNumMap[tablaId] ?? 0;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" onClick={() => addNuevaSeccion(1)} variant="primary">
          <Plus size={12} /> H1 Capítulo
        </Button>
        <Button size="sm" onClick={() => addNuevaSeccion(2)} variant="secondary">
          <Plus size={12} /> H2 Sección
        </Button>
        <Button size="sm" onClick={() => addNuevaSeccion(3)} variant="ghost">
          <Plus size={12} /> H3 Sub
        </Button>
      </div>

      {secciones.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Sin secciones. Agrega un capítulo para comenzar.</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={secciones.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {secciones.map((sec) => (
            <SortableSeccion
              key={sec.id}
              seccion={sec}
              figuraOffset={figuraOffsets[sec.id]}
              tablaOffset={tablaOffsets[sec.id]}
              tablaNumGlobal={tablaNumGlobal}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

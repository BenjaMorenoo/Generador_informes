import { useDocumentStore } from './store/documentStore';
import { MetadataForm } from './components/MetadataForm';
import { SeccionesEditor } from './components/SeccionesEditor';
import { ReferenciasEditor } from './components/ReferenciasEditor';
import { ConfigForm } from './components/ConfigForm';
import { VistaPrevia } from './components/VistaPrevia';
import { ExportButtons } from './components/ExportButtons';
import { ActivePanel } from './types';
import { FileText, Layout, BookOpen, Settings, Eye } from 'lucide-react';

const paneles: { id: ActivePanel; label: string; icon: React.ReactNode }[] = [
  { id: 'metadata', label: 'Portada', icon: <FileText size={15} /> },
  { id: 'secciones', label: 'Secciones', icon: <Layout size={15} /> },
  { id: 'referencias', label: 'Referencias', icon: <BookOpen size={15} /> },
  { id: 'config', label: 'Configuración', icon: <Settings size={15} /> },
];

export default function App() {
  const { activePanel, setActivePanel } = useDocumentStore();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── PANEL IZQUIERDO ── */}
      <div className="flex flex-col w-[420px] min-w-[340px] max-w-[480px] bg-white shadow-lg z-10">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-700 text-white flex-shrink-0">
          <FileText size={18} />
          <div>
            <h1 className="text-sm font-bold leading-tight">Generador DAS</h1>
            <p className="text-xs text-blue-200">Documento de Arquitectura de Software</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex border-b border-gray-200 flex-shrink-0">
          {paneles.map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                activePanel === panel.id
                  ? 'border-b-2 border-blue-600 text-blue-700 font-semibold bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {panel.icon}
              <span>{panel.label}</span>
            </button>
          ))}
        </nav>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {activePanel === 'metadata' && <MetadataForm />}
          {activePanel === 'secciones' && <SeccionesEditor />}
          {activePanel === 'referencias' && <ReferenciasEditor />}
          {activePanel === 'config' && <ConfigForm />}
        </div>

        {/* Export */}
        <ExportButtons />
      </div>

      {/* ── PANEL DERECHO: VISTA PREVIA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-xs flex-shrink-0">
          <Eye size={13} />
          <span className="font-medium">Vista previa en vivo</span>
          <span className="text-gray-400 ml-2">— se actualiza en tiempo real</span>
        </div>
        <div className="flex-1 overflow-auto">
          <VistaPrevia />
        </div>
      </div>
    </div>
  );
}

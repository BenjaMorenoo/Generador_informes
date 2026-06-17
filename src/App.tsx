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
          <div className="flex-1">
            <h1 className="text-sm font-bold leading-tight">Generador DAS</h1>
            <p className="text-xs text-blue-200">Documento de Arquitectura de Software</p>
          </div>
          <a
            href="https://github.com/BenjaMorenoo/Generador_informes"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en GitHub"
            className="text-blue-200 hover:text-white transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
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

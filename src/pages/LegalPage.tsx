import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

interface Props {
  titulo: string;
  ultimaActualizacion: string;
  children: React.ReactNode;
}

export default function LegalPage({ titulo, ultimaActualizacion, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            Volver
          </button>
          <div className="flex items-center gap-2 ml-2">
            <FileText size={16} className="text-blue-700" />
            <span className="text-sm font-semibold text-gray-800">{titulo}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{titulo}</h1>
        <p className="text-xs text-gray-400 mb-8">Última actualización: {ultimaActualizacion}</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-12 py-6 text-center">
        <p className="text-xs text-gray-400">
          Generador de Informes — Beta V0.1 ·{' '}
          <a href="https://github.com/BenjaMorenoo/Generador_informes" target="_blank" rel="noopener noreferrer"
            className="hover:text-gray-600 underline underline-offset-2">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── Primitivas de tipografía para el contenido legal ── */
export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 mb-2">{titulo}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function Parrafo({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{children}</p>;
}

export function Lista({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-600">{item}</li>
      ))}
    </ul>
  );
}

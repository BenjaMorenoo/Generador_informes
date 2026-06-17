import { useNavigate, Link } from 'react-router-dom';
import { FileText, Layers, Cpu, FlaskConical, GraduationCap, Clock } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { PLANTILLAS, Plantilla } from '../templates';

const ICONOS: Record<string, React.ReactNode> = {
  das:             <Layers size={28} />,
  'informe-tecnico': <Cpu size={28} />,
  laboratorio:     <FlaskConical size={28} />,
  memoria:         <GraduationCap size={28} />,
  'en-blanco':     <FileText size={28} />,
};

function PlantillaCard({ plantilla }: { plantilla: Plantilla }) {
  const { iniciarDocumento } = useDocumentStore();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!plantilla.disponible) return;
    iniciarDocumento(plantilla.id, plantilla.documento);
    navigate('/editor');
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col rounded-xl border bg-white overflow-hidden transition-all duration-200 ${
        plantilla.disponible
          ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 border-gray-200 hover:border-opacity-0'
          : 'cursor-not-allowed opacity-60 border-gray-200'
      }`}
      style={plantilla.disponible ? { boxShadow: `0 0 0 0px ${plantilla.color}` } : undefined}
      onMouseEnter={(e) => {
        if (plantilla.disponible)
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px -4px ${plantilla.color}40, 0 0 0 2px ${plantilla.color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {/* Barra de color superior */}
      <div className="h-1.5 w-full" style={{ background: plantilla.color }} />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Icono + nombre corto */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: plantilla.colorClaro, color: plantilla.color }}>
              {ICONOS[plantilla.id]}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">{plantilla.nombre}</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">{plantilla.nombreCompleto}</p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{plantilla.descripcion}</p>

        {/* Footer: categoría + badge */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span className="text-xs text-gray-400">{plantilla.categoria}</span>
          {plantilla.disponible ? (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: plantilla.colorClaro, color: plantilla.colorTexto }}
            >
              Disponible
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              <Clock size={10} /> Próximamente
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo y título */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center mb-4 shadow-lg">
          <FileText size={28} color="white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generador de Informes</h1>
        <p className="text-gray-500 mt-2 text-base max-w-md">
          Crea documentos académicos con formato profesional. Elige una plantilla para comenzar.
        </p>
      </div>

      {/* Grid de plantillas */}
      <div className="w-full max-w-4xl">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">
          Selecciona una plantilla
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANTILLAS.map((p) => (
            <PlantillaCard key={p.id} plantilla={p} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-400">Beta V0.1 · Más plantillas disponibles próximamente</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link to="/terminos" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            Términos y Condiciones
          </Link>
          <span>·</span>
          <Link to="/privacidad" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            Política de Privacidad
          </Link>
          <span>·</span>
          <a href="https://github.com/BenjaMorenoo/Generador_informes" target="_blank"
            rel="noopener noreferrer" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

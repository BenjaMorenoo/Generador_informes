import { useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { Button } from './ui/Button';
import { FileDown, FileText, RotateCcw, AlertCircle } from 'lucide-react';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons() {
  const { documento, resetDocumento } = useDocumentStore();
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = documento.metadata.proyecto
    ? documento.metadata.proyecto.replace(/\s+/g, '_')
    : 'informe';

  const handleDocx = async () => {
    setLoadingDocx(true);
    setError(null);
    try {
      const { generateDocx } = await import('../export/docx/generateDocx');
      const blob = await generateDocx(documento);
      downloadBlob(blob, `${filename}.docx`);
    } catch (e) {
      console.error(e);
      setError('Error al generar DOCX. Verifica la consola.');
    } finally {
      setLoadingDocx(false);
    }
  };

  const handlePdf = async () => {
    setLoadingPdf(true);
    setError(null);
    try {
      const { generatePdf } = await import('../export/pdf/generatePdf');
      const blob = await generatePdf(documento);
      downloadBlob(blob, `${filename}.pdf`);
    } catch (e) {
      console.error(e);
      setError('Error al generar PDF. Verifica la consola.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleReset = () => {
    if (confirm('¿Borrar todo el documento? Esta acción no se puede deshacer.')) {
      resetDocumento();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t border-gray-200 bg-white">
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded p-2">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={handleDocx}
          disabled={loadingDocx}
          className="flex-1 justify-center"
          variant="primary"
        >
          <FileDown size={14} />
          {loadingDocx ? 'Generando...' : 'Exportar DOCX'}
        </Button>
        <Button
          onClick={handlePdf}
          disabled={loadingPdf}
          className="flex-1 justify-center"
          variant="secondary"
        >
          <FileText size={14} />
          {loadingPdf ? 'Generando...' : 'Exportar PDF'}
        </Button>
      </div>
      <button
        onClick={handleReset}
        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 justify-center"
      >
        <RotateCcw size={10} /> Reiniciar documento
      </button>
    </div>
  );
}

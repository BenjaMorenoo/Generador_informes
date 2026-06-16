import { useDocumentStore } from '../store/documentStore';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const fuenteOptions = [
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Georgia', label: 'Georgia' },
];

const interlineadoOptions = [
  { value: '1', label: 'Simple (1.0)' },
  { value: '1.5', label: '1.5 líneas' },
  { value: '2', label: 'Doble (2.0)' },
];

export function ConfigForm() {
  const { documento, updateConfig } = useDocumentStore();
  const { config } = documento;

  return (
    <div className="p-4 space-y-5">
      <section>
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">Tipografía</h3>
        <div className="space-y-3">
          <Select
            label="Fuente"
            value={config.fuente}
            options={fuenteOptions}
            onChange={(e) => updateConfig({ fuente: e.target.value })}
          />
          <Input
            label="Tamaño (pt)"
            type="number"
            min={8}
            max={18}
            value={config.tamano}
            onChange={(e) => updateConfig({ tamano: Number(e.target.value) })}
          />
          <Select
            label="Interlineado"
            value={String(config.interlineado)}
            options={interlineadoOptions}
            onChange={(e) => updateConfig({ interlineado: Number(e.target.value) })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">Márgenes (cm)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Superior"
            type="number"
            step={0.1}
            value={config.margenes.top}
            onChange={(e) => updateConfig({ margenes: { ...config.margenes, top: Number(e.target.value) } })}
          />
          <Input
            label="Inferior"
            type="number"
            step={0.1}
            value={config.margenes.bottom}
            onChange={(e) => updateConfig({ margenes: { ...config.margenes, bottom: Number(e.target.value) } })}
          />
          <Input
            label="Izquierdo"
            type="number"
            step={0.1}
            value={config.margenes.left}
            onChange={(e) => updateConfig({ margenes: { ...config.margenes, left: Number(e.target.value) } })}
          />
          <Input
            label="Derecho"
            type="number"
            step={0.1}
            value={config.margenes.right}
            onChange={(e) => updateConfig({ margenes: { ...config.margenes, right: Number(e.target.value) } })}
          />
        </div>
      </section>
    </div>
  );
}

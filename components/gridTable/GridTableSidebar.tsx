import { FIELD_TYPE_OPTIONS } from "@/components/gridTable/gridTable.config";
import type { FieldType } from "@/components/gridTable/gridTable.types";

type GridTableSidebarProps = {
  canAdd: boolean;
  labelText: string;
  typeText: FieldType;
  onLabelTextChange: (value: string) => void;
  onTypeTextChange: (value: FieldType) => void;
  onAddField: () => void;
  onAddLabel: () => void;
  onAddRow: () => void;
  onGenerateJson: () => void;
};

export function GridTableSidebar({
  canAdd,
  labelText,
  typeText,
  onLabelTextChange,
  onTypeTextChange,
  onAddField,
  onAddLabel,
  onAddRow,
  onGenerateJson,
}: GridTableSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Configuracion del bloque</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Usa el mismo texto base para crear un campo, un label visual o una fila compuesta.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="field-label" className="mb-2 block text-sm font-medium text-slate-700">
            Texto del bloque
          </label>
          <input
            id="field-label"
            value={labelText}
            onChange={(event) => onLabelTextChange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-cyan-700"
            placeholder="Ej: Mano de obra directa"
          />
        </div>

        <div>
          <label htmlFor="field-input" className="mb-2 block text-sm font-medium text-slate-700">
            Tipo de dato
          </label>
          <select
            id="field-input"
            value={typeText}
            onChange={(event) => onTypeTextChange(event.target.value as FieldType)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-cyan-700"
          >
            {FIELD_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tipos de bloques disponibles</p>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={onAddField}
              disabled={!canAdd}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Agregar campo individual
            </button>

            <button
              type="button"
              onClick={onAddLabel}
              disabled={!canAdd}
              className="rounded-xl bg-cyan-700 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Agregar label
            </button>

            <button
              type="button"
              onClick={onAddRow}
              disabled={!canAdd}
              className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Agregar fila compuesta
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Exportacion</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            El JSON respeta el orden visual del grid: primero arriba hacia abajo y luego de
            izquierda a derecha.
          </p>
          <button
            type="button"
            onClick={onGenerateJson}
            className="mt-4 w-full rounded-xl bg-cyan-700 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-800"
          >
            Generar JSON
          </button>
        </div>
      </div>
    </aside>
  );
}

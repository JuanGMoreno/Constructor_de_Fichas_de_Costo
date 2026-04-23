import {
  CALCULATION_OPERATION_OPTIONS,
  FIELD_TYPE_OPTIONS,
} from "@/components/gridTable/gridTable.config";
import type {
  CalculationConfig,
  CalculationOperation,
  FieldReferenceOption,
  FieldType,
} from "@/components/gridTable/gridTable.types";

type SelectedCalculationTarget = {
  id: string;
  label: string;
  contextLabel: string;
  calculation?: CalculationConfig;
};

type GridTableSidebarProps = {
  canAdd: boolean;
  labelText: string;
  typeText: FieldType;
  importJsonText: string;
  importError: string | null;
  selectedCalculationTarget: SelectedCalculationTarget | null;
  fieldReferenceOptions: FieldReferenceOption[];
  onLabelTextChange: (value: string) => void;
  onTypeTextChange: (value: FieldType) => void;
  onImportJsonTextChange: (value: string) => void;
  onAddField: () => void;
  onAddLabel: () => void;
  onAddRow: () => void;
  onGenerateJson: () => void;
  onLoadJson: () => void;
  onUpdateCalculationOperation: (fieldId: string, operation: CalculationOperation) => void;
  onToggleCalculationSource: (fieldId: string, sourceFieldId: string) => void;
  onClearCalculation: (fieldId: string) => void;
};

export function GridTableSidebar({
  canAdd,
  labelText,
  typeText,
  importJsonText,
  importError,
  selectedCalculationTarget,
  fieldReferenceOptions,
  onLabelTextChange,
  onTypeTextChange,
  onImportJsonTextChange,
  onAddField,
  onAddLabel,
  onAddRow,
  onGenerateJson,
  onLoadJson,
  onUpdateCalculationOperation,
  onToggleCalculationSource,
  onClearCalculation,
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

        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Campos calculados</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Selecciona un campo desde el boton <span className="font-semibold">fx</span> en la
            tablilla para configurar su formula aqui.
          </p>

          {selectedCalculationTarget ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
                  Campo objetivo
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedCalculationTarget.label}
                </p>
                <p className="text-xs text-slate-600">{selectedCalculationTarget.contextLabel}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Operacion</label>
                <select
                  value={selectedCalculationTarget.calculation?.operation ?? "sum"}
                  onChange={(event) =>
                    onUpdateCalculationOperation(
                      selectedCalculationTarget.id,
                      event.target.value as CalculationOperation,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-cyan-700"
                >
                  {CALCULATION_OPERATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Campos que participan</p>
                <div className="max-h-56 space-y-2 overflow-auto rounded-xl border border-slate-300 bg-slate-50 p-3">
                  {fieldReferenceOptions
                    .filter((option) => option.id !== selectedCalculationTarget.id)
                    .map((option) => {
                      const isSelected =
                        selectedCalculationTarget.calculation?.sourceFieldIds.includes(option.id) ??
                        false;

                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-start gap-2 rounded-lg bg-white px-3 py-2 hover:bg-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              onToggleCalculationSource(selectedCalculationTarget.id, option.id)
                            }
                            className="mt-0.5"
                          />
                          <span className="min-w-0 text-xs text-slate-700">
                            <span className="block font-medium">{option.label}</span>
                            <span className="block text-slate-500">{option.sourceLabel}</span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onClearCalculation(selectedCalculationTarget.id)}
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Limpiar configuracion de calculo
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Ningun campo seleccionado. Pulsa <span className="font-semibold">fx</span> en un
              campo o subcampo para configurar su comportamiento calculado.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Importacion</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pega un JSON valido del constructor para reconstruir la tablilla.
          </p>
          <textarea
            value={importJsonText}
            onChange={(event) => onImportJsonTextChange(event.target.value)}
            className="mt-4 min-h-52 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700 outline-none focus:border-cyan-700"
            placeholder='{"grid":{"cols":12,"rows":12},"items":[]}'
          />
          {importError && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {importError}
            </p>
          )}
          <button
            type="button"
            onClick={onLoadJson}
            className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-900"
          >
            Cargar JSON en la tablilla
          </button>
        </div>
      </div>
    </aside>
  );
}

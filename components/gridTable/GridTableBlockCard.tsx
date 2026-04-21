import { memo } from "react";

import { FIELD_TYPE_OPTIONS } from "@/components/gridTable/gridTable.config";
import type {
  FieldItem,
  FieldType,
  RowFieldDraft,
} from "@/components/gridTable/gridTable.types";

type GridTableBlockCardProps = {
  item: FieldItem;
  rowDraft?: RowFieldDraft;
  isRowEditorOpen: boolean;
  onRemoveField: (id: string) => void;
  onToggleRowEditor: (id: string) => void;
  onUpdateRowDraft: (rowId: string, patch: Partial<RowFieldDraft>) => void;
  onAddFieldToRow: (rowId: string) => void;
  onRemoveRowChild: (rowId: string, childId: string) => void;
};

export const GridTableBlockCard = memo(function GridTableBlockCard({
  item,
  rowDraft,
  isRowEditorOpen,
  onRemoveField,
  onToggleRowEditor,
  onUpdateRowDraft,
  onAddFieldToRow,
  onRemoveRowChild,
}: GridTableBlockCardProps) {
  // El constructor solo muestra una vista previa visual del campo final.
  // `list` necesita un `select`, mientras que el resto puede representarse como inputs.
  const renderFieldPreview = (type: FieldType, compact = false) => {
    const sharedClassName = compact
      ? "no-drag w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600"
      : "no-drag w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600";

    if (type === "list") {
      return (
        <select
          disabled
          defaultValue=""
          className={
            compact
              ? "no-drag w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-500"
              : "no-drag w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-500"
          }
        >
          <option value="">Lista de seleccion</option>
        </select>
      );
    }

    return (
      <input
        readOnly
        type={type}
        placeholder={`Tipo: ${type}`}
        className={sharedClassName}
      />
    );
  };

  if (item.kind === "label") {
    return (
      <div className="box-border h-full overflow-hidden rounded-xl border border-cyan-300 bg-cyan-50 shadow-sm">
        <div className="flex h-full items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
              Label
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-900">{item.label}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemoveField(item.id)}
            className="no-drag inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
            aria-label={`Eliminar bloque ${item.label}`}
            title="Eliminar bloque"
          >
            x
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="box-border h-full rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        {item.kind === "single" ? (
          <label className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-slate-700">
            {item.label}
          </label>
        ) : (
          <p className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-cyan-800">
            Fila compuesta: {item.label}
          </p>
        )}

        <div className="no-drag flex shrink-0 items-center gap-1">
          {item.kind === "row" && (
            <button
              type="button"
              onClick={() => onToggleRowEditor(item.id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-cyan-300 bg-cyan-50 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
              aria-label={`Alternar editor de fila ${item.label}`}
              title="Agregar subcampo"
            >
              +
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemoveField(item.id)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            aria-label={`Eliminar bloque ${item.label}`}
            title="Eliminar bloque"
          >
            x
          </button>
        </div>
      </div>

      {item.kind === "single" ? (
        renderFieldPreview(item.type)
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          {/* Las filas tienen un editor inline porque sus subcampos forman parte del mismo bloque. */}
          {isRowEditorOpen && (
            <div className="no-drag mb-3 rounded-md border border-cyan-200 bg-cyan-50 p-2">
              <p className="mb-2 text-[11px] font-semibold text-cyan-900">
                Agregar campo a la fila
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_160px_auto]">
                <input
                  value={rowDraft?.label ?? ""}
                  onChange={(event) =>
                    onUpdateRowDraft(item.id, { label: event.target.value })
                  }
                  placeholder="Nombre del campo"
                  className="no-drag w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-cyan-700"
                />
                <select
                  value={rowDraft?.type ?? "text"}
                  onChange={(event) =>
                    onUpdateRowDraft(item.id, {
                      type: event.target.value as FieldType,
                    })
                  }
                  className="no-drag w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-cyan-700"
                >
                  {FIELD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onAddFieldToRow(item.id)}
                  className="no-drag rounded-md bg-cyan-700 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-800"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          <div className="flex min-h-0 flex-1 items-start gap-2 overflow-x-auto overflow-y-auto pb-1">
            {item.fields.map((field) => (
              <div
                key={field.id}
                className="relative h-auto w-52 min-w-52 flex-none rounded-md border border-slate-200 bg-slate-50 p-2"
              >
                <button
                  type="button"
                  onClick={() => onRemoveRowChild(item.id, field.id)}
                  className="no-drag absolute right-1 top-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
                  aria-label={`Eliminar subcampo ${field.label}`}
                >
                  x
                </button>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                  {field.label}
                </label>
                {renderFieldPreview(field.type, true)}
              </div>
            ))}
            {item.fields.length === 0 && (
              <p className="text-xs text-slate-500">
                Esta fila aun no tiene campos. Agrega el primero.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

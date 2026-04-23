import ReactGridLayout, { type Layout } from "react-grid-layout";

import {
  GRID_COLUMNS,
  GRID_ROW_HEIGHT,
  GRID_ROWS,
} from "@/components/gridTable/gridTable.config";
import { GridTableBlockCard } from "@/components/gridTable/GridTableBlockCard";
import { GridTableJsonPreview } from "@/components/gridTable/GridTableJsonPreview";
import type {
  FieldItem,
  RowFieldDraft,
} from "@/components/gridTable/gridTable.types";

type GridTableCanvasProps = {
  width: number;
  mounted: boolean;
  layout: Layout;
  items: Record<string, FieldItem>;
  rowDrafts: Record<string, RowFieldDraft>;
  openRowEditorId: string | null;
  openCalculationTargetId: string | null;
  jsonPreview: string;
  exportCount: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLayoutChange: (nextLayout: Layout) => void;
  onRemoveField: (id: string) => void;
  onToggleRowEditor: (id: string) => void;
  onToggleCalculationEditor: (targetId: string) => void;
  onUpdateRowDraft: (rowId: string, patch: Partial<RowFieldDraft>) => void;
  onAddFieldToRow: (rowId: string) => void;
  onRemoveRowChild: (rowId: string, childId: string) => void;
};

export function GridTableCanvas({
  width,
  mounted,
  layout,
  items,
  rowDrafts,
  openRowEditorId,
  openCalculationTargetId,
  jsonPreview,
  exportCount,
  containerRef,
  onLayoutChange,
  onRemoveField,
  onToggleRowEditor,
  onToggleCalculationEditor,
  onUpdateRowDraft,
  onAddFieldToRow,
  onRemoveRowChild,
}: GridTableCanvasProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-slate-50 p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Lienzo de estructura</h3>
          <p className="mt-1 text-sm text-slate-600">
            Arrastra y redimensiona los bloques para ordenar la ficha.
          </p>
        </div>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Grid {GRID_COLUMNS}x{GRID_ROWS}
        </span>
      </div>

      <div ref={containerRef}>
        {mounted && (
          <ReactGridLayout
            width={width}
            layout={layout}
            onLayoutChange={onLayoutChange}
            dragConfig={{
              cancel: ".no-drag",
            }}
            gridConfig={{
              cols: GRID_COLUMNS,
              rowHeight: GRID_ROW_HEIGHT,
              maxRows: GRID_ROWS,
              margin: [8, 8],
              containerPadding: [8, 8],
            }}
            className="min-h-[680px] overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white"
          >
            {layout.map((slot) => {
              // `layout` guarda la geometria del bloque, mientras `items` guarda su contenido.
              // Ambos se relacionan mediante el id del bloque (`slot.i`).
              const item = items[slot.i];
              if (!item) return null;

              return (
                <div key={slot.i} className={item.kind === "label" ? "z-10" : undefined}>
                  <GridTableBlockCard
                    item={item}
                    rowDraft={rowDrafts[item.id]}
                    isRowEditorOpen={openRowEditorId === item.id}
                    openCalculationTargetId={openCalculationTargetId}
                    onRemoveField={onRemoveField}
                    onToggleRowEditor={onToggleRowEditor}
                    onToggleCalculationEditor={onToggleCalculationEditor}
                    onUpdateRowDraft={onUpdateRowDraft}
                    onAddFieldToRow={onAddFieldToRow}
                    onRemoveRowChild={onRemoveRowChild}
                  />
                </div>
              );
            })}
          </ReactGridLayout>
        )}
      </div>

      <GridTableJsonPreview count={exportCount} jsonPreview={jsonPreview} />
    </section>
  );
}

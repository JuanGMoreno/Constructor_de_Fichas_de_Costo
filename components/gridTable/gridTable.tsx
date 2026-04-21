"use client";

import { useMemo, useState } from "react";
import { type Layout, useContainerWidth } from "react-grid-layout";

import {
  buildLabelLayout,
  buildRowLayout,
  buildSingleFieldLayout,
  getOrderedLayout,
  GRID_COLUMNS,
  GRID_ROWS,
} from "@/components/gridTable/gridTable.config";
import { GridTableCanvas } from "@/components/gridTable/GridTableCanvas";
import { GridTableSidebar } from "@/components/gridTable/GridTableSidebar";
import type {
  FieldItem,
  FieldType,
  RowChildField,
  RowFieldDraft,
  SavedStructure,
} from "@/components/gridTable/gridTable.types";

export default function GridTableBuilder() {
  const [labelText, setLabelText] = useState("");
  const [typeText, setTypeText] = useState<FieldType>("text");
  const [layout, setLayout] = useState<Layout>([]);
  const [items, setItems] = useState<Record<string, FieldItem>>({});
  const [rowDrafts, setRowDrafts] = useState<Record<string, RowFieldDraft>>({});
  const [jsonPreview, setJsonPreview] = useState("");
  const [openRowEditorId, setOpenRowEditorId] = useState<string | null>(null);
  const { width, mounted, containerRef } = useContainerWidth({
    initialWidth: 980,
  });

  const canAdd = labelText.trim().length > 0;
  const orderedLayout = useMemo(() => getOrderedLayout(layout), [layout]);

  const structure = useMemo<SavedStructure>(() => {
    return {
      grid: {
        cols: GRID_COLUMNS,
        rows: GRID_ROWS,
      },
      // The exported JSON mirrors the visual order of the grid.
      items: orderedLayout
        .map((slot) => {
          const source = items[slot.i];
          if (!source) return null;

          return {
            id: source.id,
            label: source.label,
            kind: source.kind,
            type: source.kind === "single" ? source.type : undefined,
            fields: source.kind === "row" ? source.fields : undefined,
            x: slot.x,
            y: slot.y,
            w: slot.w,
            h: slot.h,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    };
  }, [items, orderedLayout]);

  const resetDraft = () => {
    setLabelText("");
    setTypeText("text");
  };

  const addField = () => {
    if (!canAdd) return;

    const id = `field_${Date.now()}`;
    setItems((prev) => ({
      ...prev,
      [id]: {
        id,
        kind: "single",
        label: labelText.trim(),
        type: typeText,
      },
    }));
    setLayout((prev) => [...prev, buildSingleFieldLayout(id)]);
    resetDraft();
  };

  const addCompositeRow = () => {
    if (!canAdd) return;

    const id = `row_${Date.now()}`;
    setItems((prev) => ({
      ...prev,
      [id]: {
        id,
        kind: "row",
        label: labelText.trim(),
        fields: [],
      },
    }));
    setRowDrafts((prev) => ({
      ...prev,
      [id]: {
        label: "",
        type: typeText,
      },
    }));
    setLayout((prev) => [...prev, buildRowLayout(id)]);
    resetDraft();
  };

  const addLabelBlock = () => {
    if (!canAdd) return;

    const id = `label_${Date.now()}`;
    setItems((prev) => ({
      ...prev,
      [id]: {
        id,
        kind: "label",
        label: labelText.trim(),
      },
    }));
    setLayout((prev) => [...prev, buildLabelLayout(id)]);
    resetDraft();
  };

  const removeField = (id: string) => {
    setLayout((prev) => prev.filter((slot) => slot.i !== id));
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRowDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOpenRowEditorId((prev) => (prev === id ? null : prev));
  };

  const toggleRowEditor = (id: string) => {
    setOpenRowEditorId((prev) => (prev === id ? null : id));
  };

  const updateRowDraft = (rowId: string, patch: Partial<RowFieldDraft>) => {
    setRowDrafts((prev) => ({
      ...prev,
      [rowId]: {
        label: patch.label ?? prev[rowId]?.label ?? "",
        type: patch.type ?? prev[rowId]?.type ?? "text",
      },
    }));
  };

  const addFieldToRow = (rowId: string) => {
    const draft = rowDrafts[rowId];
    if (!draft?.label.trim()) return;

    setItems((prev) => {
      const row = prev[rowId];
      if (!row || row.kind !== "row") return prev;

      const child: RowChildField = {
        id: `${rowId}_child_${Date.now()}`,
        label: draft.label.trim(),
        type: draft.type,
      };

      return {
        ...prev,
        [rowId]: {
          ...row,
          fields: [...row.fields, child],
        },
      };
    });

    setRowDrafts((prev) => ({
      ...prev,
      [rowId]: {
        label: "",
        type: prev[rowId]?.type ?? "text",
      },
    }));
  };

  const removeRowChild = (rowId: string, childId: string) => {
    setItems((prev) => {
      const row = prev[rowId];
      if (!row || row.kind !== "row") return prev;

      return {
        ...prev,
        [rowId]: {
          ...row,
          fields: row.fields.filter((field) => field.id !== childId),
        },
      };
    });
  };

  const saveJson = () => {
    setJsonPreview(JSON.stringify(structure, null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <GridTableSidebar
            canAdd={canAdd}
            labelText={labelText}
            typeText={typeText}
            onLabelTextChange={setLabelText}
            onTypeTextChange={setTypeText}
            onAddField={addField}
            onAddLabel={addLabelBlock}
            onAddRow={addCompositeRow}
            onGenerateJson={saveJson}
          />

          <GridTableCanvas
            width={width}
            mounted={mounted}
            layout={layout}
            items={items}
            rowDrafts={rowDrafts}
            openRowEditorId={openRowEditorId}
            jsonPreview={jsonPreview}
            exportCount={structure.items.length}
            containerRef={containerRef}
            onLayoutChange={setLayout}
            onRemoveField={removeField}
            onToggleRowEditor={toggleRowEditor}
            onUpdateRowDraft={updateRowDraft}
            onAddFieldToRow={addFieldToRow}
            onRemoveRowChild={removeRowChild}
          />
        </div>
      </div>
    </div>
  );
}

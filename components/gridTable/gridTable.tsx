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
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
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
      // El JSON exportado respeta el orden visual del grid.
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
    const payload = JSON.stringify(structure, null, 2);
    setJsonPreview(payload);
    // Se copia el JSON exportado en el area de importacion para poder editarlo y recargarlo rapido.
    setImportJsonText(payload);
    setImportError(null);
  };

  const loadStructure = (nextStructure: SavedStructure) => {
    // La libreria del grid necesita un arreglo `layout`.
    // Aqui se reconstruye a partir del JSON importado sin perder las restricciones base de cada bloque.
    const nextLayout: Layout = nextStructure.items.map((item) => {
      if (item.kind === "row") {
        const base = buildRowLayout(item.id);
        return { ...base, x: item.x, y: item.y, w: item.w, h: item.h };
      }

      if (item.kind === "label") {
        const base = buildLabelLayout(item.id);
        return { ...base, x: item.x, y: item.y, w: item.w, h: item.h };
      }

      const base = buildSingleFieldLayout(item.id);
      return { ...base, x: item.x, y: item.y, w: item.w, h: item.h };
    });

    // `items` guarda el contenido semantico de los bloques.
    // `rowDrafts` es un estado auxiliar usado solo por el editor inline de filas.
    const nextItems: Record<string, FieldItem> = {};
    const nextRowDrafts: Record<string, RowFieldDraft> = {};

    nextStructure.items.forEach((item) => {
      if (item.kind === "label") {
        nextItems[item.id] = {
          id: item.id,
          kind: "label",
          label: item.label,
        };
        return;
      }

      if (item.kind === "single") {
        nextItems[item.id] = {
          id: item.id,
          kind: "single",
          label: item.label,
          type: item.type ?? "text",
        };
        return;
      }

      nextItems[item.id] = {
        id: item.id,
        kind: "row",
        label: item.label,
        fields: item.fields ?? [],
      };
      nextRowDrafts[item.id] = {
        label: "",
        type: "text",
      };
    });

    setLayout(nextLayout);
    setItems(nextItems);
    setRowDrafts(nextRowDrafts);
    setOpenRowEditorId(null);
    setJsonPreview(JSON.stringify(nextStructure, null, 2));
  };

  // La validacion de importacion es simple a proposito:
  // solo lo necesario para rechazar JSON mal formados antes de renderizar.
  const isValidFieldType = (value: unknown): value is FieldType => {
    return ["text", "number", "date", "email", "tel", "list"].includes(String(value));
  };

  const loadJson = () => {
    try {
      const parsed = JSON.parse(importJsonText) as SavedStructure;

      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
        throw new Error("El JSON no tiene la estructura esperada.");
      }

      parsed.items.forEach((item, index) => {
        if (!item?.id || !item?.kind || typeof item.label !== "string") {
          throw new Error(`El elemento ${index + 1} no tiene un formato valido.`);
        }

        if (!["single", "row", "label"].includes(item.kind)) {
          throw new Error(`El tipo de bloque del elemento ${index + 1} no es valido.`);
        }

        if (
          typeof item.x !== "number" ||
          typeof item.y !== "number" ||
          typeof item.w !== "number" ||
          typeof item.h !== "number"
        ) {
          throw new Error(`El elemento ${index + 1} no tiene coordenadas validas.`);
        }

        if (item.kind === "single" && !isValidFieldType(item.type)) {
          throw new Error(`El campo simple ${item.label} no tiene un tipo de dato valido.`);
        }

        if (item.kind === "row" && item.fields) {
          item.fields.forEach((field, fieldIndex) => {
            if (!field.id || typeof field.label !== "string" || !isValidFieldType(field.type)) {
              throw new Error(
                `El subcampo ${fieldIndex + 1} de la fila ${item.label} no tiene un formato valido.`,
              );
            }
          });
        }
      });

      // Una vez validado el JSON, se traduce al estado interno que usa la interfaz.
      loadStructure(parsed);
      setImportError(null);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "No se pudo interpretar el JSON indicado.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <GridTableSidebar
            canAdd={canAdd}
            labelText={labelText}
            typeText={typeText}
            importJsonText={importJsonText}
            importError={importError}
            onLabelTextChange={setLabelText}
            onTypeTextChange={setTypeText}
            onImportJsonTextChange={setImportJsonText}
            onAddField={addField}
            onAddLabel={addLabelBlock}
            onAddRow={addCompositeRow}
            onGenerateJson={saveJson}
            onLoadJson={loadJson}
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

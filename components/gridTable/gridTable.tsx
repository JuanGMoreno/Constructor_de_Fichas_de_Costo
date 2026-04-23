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
  CalculationConfig,
  CalculationOperation,
  FieldItem,
  FieldReferenceOption,
  FieldType,
  RowChildField,
  RowFieldDraft,
  SavedStructure,
} from "@/components/gridTable/gridTable.types";

function removeSourceReference(
  items: Record<string, FieldItem>,
  removedId: string,
): Record<string, FieldItem> {
  const nextItems: Record<string, FieldItem> = {};

  Object.values(items).forEach((item) => {
    if (item.kind === "label") {
      nextItems[item.id] = item;
      return;
    }

    if (item.kind === "single") {
      nextItems[item.id] = {
        ...item,
        calculation: item.calculation
          ? {
              ...item.calculation,
              sourceFieldIds: item.calculation.sourceFieldIds.filter(
                (sourceId) => sourceId !== removedId,
              ),
            }
          : undefined,
      };
      return;
    }

    nextItems[item.id] = {
      ...item,
      fields: item.fields.map((field) => ({
        ...field,
        calculation: field.calculation
          ? {
              ...field.calculation,
              sourceFieldIds: field.calculation.sourceFieldIds.filter(
                (sourceId) => sourceId !== removedId,
              ),
            }
          : undefined,
      })),
    };
  });

  return nextItems;
}

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
  const [openCalculationTargetId, setOpenCalculationTargetId] = useState<string | null>(null);
  const { width, mounted, containerRef } = useContainerWidth({
    initialWidth: 980,
  });

  const canAdd = labelText.trim().length > 0;
  const orderedLayout = useMemo(() => getOrderedLayout(layout), [layout]);

  const fieldReferenceOptions = useMemo<FieldReferenceOption[]>(() => {
    return orderedLayout.flatMap((slot) => {
      const item = items[slot.i];
      if (!item || item.kind === "label") return [];

      if (item.kind === "single") {
        return [
          {
            id: item.id,
            label: item.label,
            sourceLabel: "Campo general",
          },
        ];
      }

      return item.fields.map((field) => ({
        id: field.id,
        label: field.label,
        sourceLabel: item.label,
      }));
    });
  }, [items, orderedLayout]);

  const selectedCalculationTarget = useMemo(() => {
    if (!openCalculationTargetId) return null;

    for (const slot of orderedLayout) {
      const item = items[slot.i];
      if (!item || item.kind === "label") continue;

      if (item.kind === "single" && item.id === openCalculationTargetId) {
        return {
          id: item.id,
          label: item.label,
          contextLabel: "Campo general",
          calculation: item.calculation,
        };
      }

      if (item.kind === "row") {
        const child = item.fields.find((field) => field.id === openCalculationTargetId);
        if (child) {
          return {
            id: child.id,
            label: child.label,
            contextLabel: `Subcampo de ${item.label}`,
            calculation: child.calculation,
          };
        }
      }
    }

    return null;
  }, [items, openCalculationTargetId, orderedLayout]);

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
            calculation: source.kind === "single" ? source.calculation : undefined,
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
      return removeSourceReference(next, id);
    });
    setRowDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOpenRowEditorId((prev) => (prev === id ? null : prev));
    setOpenCalculationTargetId((prev) => (prev === id ? null : prev));
  };

  const toggleRowEditor = (id: string) => {
    setOpenRowEditorId((prev) => (prev === id ? null : id));
  };

  const toggleCalculationEditor = (targetId: string) => {
    setOpenCalculationTargetId((prev) => (prev === targetId ? null : targetId));
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

      const nextItems = {
        ...prev,
        [rowId]: {
          ...row,
          fields: row.fields.filter((field) => field.id !== childId),
        },
      };

      return removeSourceReference(nextItems, childId);
    });
    setOpenCalculationTargetId((prev) => (prev === childId ? null : prev));
  };

  const updateFieldCalculation = (fieldId: string, calculation?: CalculationConfig) => {
    setItems((prev) => {
      const nextItems: Record<string, FieldItem> = {};

      Object.values(prev).forEach((item) => {
        if (item.kind === "label") {
          nextItems[item.id] = item;
          return;
        }

        if (item.kind === "single") {
          nextItems[item.id] =
            item.id === fieldId
              ? {
                  ...item,
                  calculation,
                }
              : item;
          return;
        }

        nextItems[item.id] = {
          ...item,
          fields: item.fields.map((field) =>
            field.id === fieldId
              ? {
                  ...field,
                  calculation,
                }
              : field,
          ),
        };
      });

      return nextItems;
    });
  };

  const updateCalculationOperation = (fieldId: string, operation: CalculationOperation) => {
    const current = fieldReferenceOptions.find((field) => field.id === fieldId);
    if (!current) return;

    setItems((prev) => {
      const nextItems: Record<string, FieldItem> = {};

      Object.values(prev).forEach((item) => {
        if (item.kind === "label") {
          nextItems[item.id] = item;
          return;
        }

        if (item.kind === "single") {
          nextItems[item.id] =
            item.id === fieldId
              ? {
                  ...item,
                  calculation: {
                    operation,
                    sourceFieldIds: item.calculation?.sourceFieldIds ?? [],
                  },
                }
              : item;
          return;
        }

        nextItems[item.id] = {
          ...item,
          fields: item.fields.map((field) =>
            field.id === fieldId
              ? {
                  ...field,
                  calculation: {
                    operation,
                    sourceFieldIds: field.calculation?.sourceFieldIds ?? [],
                  },
                }
              : field,
          ),
        };
      });

      return nextItems;
    });
  };

  const toggleCalculationSource = (fieldId: string, sourceFieldId: string) => {
    if (fieldId === sourceFieldId) return;

    setItems((prev) => {
      const nextItems: Record<string, FieldItem> = {};

      Object.values(prev).forEach((item) => {
        if (item.kind === "label") {
          nextItems[item.id] = item;
          return;
        }

        if (item.kind === "single") {
          if (item.id !== fieldId) {
            nextItems[item.id] = item;
            return;
          }

          const currentSourceIds = item.calculation?.sourceFieldIds ?? [];
          const nextSourceIds = currentSourceIds.includes(sourceFieldId)
            ? currentSourceIds.filter((id) => id !== sourceFieldId)
            : [...currentSourceIds, sourceFieldId];

          nextItems[item.id] = {
            ...item,
            calculation: {
              operation: item.calculation?.operation ?? "sum",
              sourceFieldIds: nextSourceIds,
            },
          };
          return;
        }

        nextItems[item.id] = {
          ...item,
          fields: item.fields.map((field) => {
            if (field.id !== fieldId) return field;

            const currentSourceIds = field.calculation?.sourceFieldIds ?? [];
            const nextSourceIds = currentSourceIds.includes(sourceFieldId)
              ? currentSourceIds.filter((id) => id !== sourceFieldId)
              : [...currentSourceIds, sourceFieldId];

            return {
              ...field,
              calculation: {
                operation: field.calculation?.operation ?? "sum",
                sourceFieldIds: nextSourceIds,
              },
            };
          }),
        };
      });

      return nextItems;
    });
  };

  const clearCalculation = (fieldId: string) => {
    updateFieldCalculation(fieldId, undefined);
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
          calculation: item.calculation,
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
    setOpenCalculationTargetId(null);
    setJsonPreview(JSON.stringify(nextStructure, null, 2));
  };

  // La validacion de importacion es simple a proposito:
  // solo lo necesario para rechazar JSON mal formados antes de renderizar.
  const isValidFieldType = (value: unknown): value is FieldType => {
    return ["text", "number", "date", "email", "tel", "list"].includes(String(value));
  };

  const isValidCalculationOperation = (value: unknown): value is CalculationOperation => {
    return ["sum", "subtract", "multiply", "divide", "average", "percent"].includes(
      String(value),
    );
  };

  const isValidCalculationConfig = (value: unknown): value is CalculationConfig => {
    if (!value || typeof value !== "object") return false;

    const candidate = value as CalculationConfig;
    return (
      isValidCalculationOperation(candidate.operation) &&
      Array.isArray(candidate.sourceFieldIds) &&
      candidate.sourceFieldIds.every((entry) => typeof entry === "string")
    );
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

        if (item.kind === "single") {
          if (!isValidFieldType(item.type)) {
            throw new Error(`El campo simple ${item.label} no tiene un tipo de dato valido.`);
          }

          if (item.calculation && !isValidCalculationConfig(item.calculation)) {
            throw new Error(`El campo simple ${item.label} tiene una configuracion de calculo invalida.`);
          }
        }

        if (item.kind === "row" && item.fields) {
          item.fields.forEach((field, fieldIndex) => {
            if (!field.id || typeof field.label !== "string" || !isValidFieldType(field.type)) {
              throw new Error(
                `El subcampo ${fieldIndex + 1} de la fila ${item.label} no tiene un formato valido.`,
              );
            }

            if (field.calculation && !isValidCalculationConfig(field.calculation)) {
              throw new Error(
                `El subcampo ${field.label} de la fila ${item.label} tiene un calculo invalido.`,
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
            selectedCalculationTarget={selectedCalculationTarget}
            fieldReferenceOptions={fieldReferenceOptions}
            onLabelTextChange={setLabelText}
            onTypeTextChange={setTypeText}
            onImportJsonTextChange={setImportJsonText}
            onAddField={addField}
            onAddLabel={addLabelBlock}
            onAddRow={addCompositeRow}
            onGenerateJson={saveJson}
            onLoadJson={loadJson}
            onUpdateCalculationOperation={updateCalculationOperation}
            onToggleCalculationSource={toggleCalculationSource}
            onClearCalculation={clearCalculation}
          />

          <GridTableCanvas
            width={width}
            mounted={mounted}
            layout={layout}
            items={items}
            rowDrafts={rowDrafts}
            openRowEditorId={openRowEditorId}
            openCalculationTargetId={openCalculationTargetId}
            jsonPreview={jsonPreview}
            exportCount={structure.items.length}
            containerRef={containerRef}
            onLayoutChange={setLayout}
            onRemoveField={removeField}
            onToggleRowEditor={toggleRowEditor}
            onToggleCalculationEditor={toggleCalculationEditor}
            onUpdateRowDraft={updateRowDraft}
            onAddFieldToRow={addFieldToRow}
            onRemoveRowChild={removeRowChild}
          />
        </div>
      </div>
    </div>
  );
}

import type { Layout, LayoutItem } from "react-grid-layout";

import type {
  CalculationOperation,
  FieldType,
} from "@/components/gridTable/gridTable.types";

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 12;
export const GRID_ROW_HEIGHT = 42;

export const FIELD_TYPE_OPTIONS: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Numero" },
  { value: "date", label: "Fecha" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Telefono" },
  { value: "list", label: "Lista" },
];

export const CALCULATION_OPERATION_OPTIONS: Array<{
  value: CalculationOperation;
  label: string;
}> = [
  { value: "sum", label: "Suma" },
  { value: "subtract", label: "Resta" },
  { value: "multiply", label: "Multiplicacion" },
  { value: "divide", label: "Division" },
  { value: "average", label: "Promedio" },
  { value: "percent", label: "Porcentaje" },
];

// Estos helpers definen el comportamiento base de cada tipo de bloque al crearse.
// Cuando se importa un JSON, se reutilizan estos valores y solo se reemplazan posicion y tamano.
export function buildSingleFieldLayout(id: string): LayoutItem {
  return {
    i: id,
    x: 0,
    y: Infinity,
    w: 3,
    h: 2,
    minW: 2,
    minH: 2,
    maxW: GRID_COLUMNS,
  };
}

export function buildRowLayout(id: string): LayoutItem {
  return {
    i: id,
    x: 0,
    y: Infinity,
    w: GRID_COLUMNS,
    h: 5,
    minW: GRID_COLUMNS,
    minH: 6,
    maxW: GRID_COLUMNS,
  };
}

export function buildLabelLayout(id: string): LayoutItem {
  return {
    i: id,
    x: 0,
    y: Infinity,
    w: 4,
    h: 2,
    minW: 3,
    minH: 2,
    maxW: GRID_COLUMNS,
    isResizable: true,
  };
}

// El JSON exportado debe ser estable y legible, por eso se ordena por posicion visual
// y no por el orden en que fueron creados los bloques.
export function getOrderedLayout(layout: Layout) {
  return [...layout].sort((left, right) => {
    if (left.y !== right.y) return left.y - right.y;
    if (left.x !== right.x) return left.x - right.x;
    return left.i.localeCompare(right.i);
  });
}

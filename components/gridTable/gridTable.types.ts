export type FieldType = "text" | "number" | "date" | "email" | "tel" | "list";
export type BlockKind = "single" | "row" | "label";

export type SingleFieldItem = {
  id: string;
  kind: "single";
  label: string;
  type: FieldType;
};

export type LabelFieldItem = {
  id: string;
  kind: "label";
  label: string;
};

export type RowChildField = {
  id: string;
  label: string;
  type: FieldType;
};

export type RowCompositeItem = {
  id: string;
  kind: "row";
  label: string;
  fields: RowChildField[];
};

export type FieldItem = SingleFieldItem | RowCompositeItem | LabelFieldItem;

export type RowFieldDraft = {
  label: string;
  type: FieldType;
};

export type SavedStructure = {
  grid: {
    cols: number;
    rows: number;
  };
  items: Array<{
    id: string;
    kind: BlockKind;
    label: string;
    type?: FieldType;
    fields?: RowChildField[];
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
};

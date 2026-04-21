type GridTableJsonPreviewProps = {
  count: number;
  jsonPreview: string;
};

export function GridTableJsonPreview({
  count,
  jsonPreview,
}: GridTableJsonPreviewProps) {
  if (!jsonPreview) return null;

  return (
    <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-100">JSON generado</p>
        <span className="text-xs text-slate-400">{count} elementos exportados</span>
      </div>
      <pre className="max-h-72 overflow-auto text-xs leading-6 text-slate-100">{jsonPreview}</pre>
    </div>
  );
}

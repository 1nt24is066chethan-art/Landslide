/**
 * Temporary placeholder shown on pages whose real content arrives in a later
 * build phase. Each page removes its own placeholder when it gets built out —
 * this component itself will eventually be deleted once every page is real.
 */
export default function PhasePlaceholder({ title, description, phase }) {
  return (
    <div className="panel p-8 md:p-10 flex flex-col items-center text-center gap-2 min-h-[50vh] justify-center">
      <span className="badge-medium inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium mb-2">
        {phase}
      </span>
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <p className="text-sm text-slate-400 max-w-md">{description}</p>
    </div>
  )
}

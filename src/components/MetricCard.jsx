export default function MetricCard({ icon, label, value, unit, badge, children, className = '' }) {
  return (
    <div className={`rounded-3xl bg-white p-6 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate">
          {icon} {label}
        </div>
        {badge}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-serif text-[42px] leading-none text-navy-deep">{value}</span>
        {unit && <span className="text-[15px] text-slate">{unit}</span>}
      </div>

      {children}
    </div>
  )
}

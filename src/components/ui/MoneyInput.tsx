import { cn } from '@/utils/cn';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
}

export function MoneyInput({ label, prefix = 'R$', className, ...props }: Props) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
          {prefix}
        </span>
        <input
          {...props}
          type="number"
          step="0.01"
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800",
            props.disabled && "bg-slate-100 cursor-not-allowed opacity-60",
            className
          )}
        />
      </div>
    </div>
  );
}

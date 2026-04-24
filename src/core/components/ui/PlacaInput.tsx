import { cn } from '@/core/utils/formatters';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PlacaInput({ label, className, onChange, value, ...props }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (onChange) {
      e.target.value = val;
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>}
      <input
        {...props}
        type="text"
        maxLength={7}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest placeholder:tracking-normal",
          className
        )}
        placeholder="ABC1D23"
      />
    </div>
  );
}

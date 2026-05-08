import { cn } from '@/core/utils/formatters';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, className, hover = true, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-slate-100 rounded-xl p-4 transition-all duration-300",
        hover && "hover:shadow-md hover:shadow-slate-200/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {Icon && (
        <div className="p-1 bg-blue-50 rounded">
          <Icon className="w-3 h-3 text-brand-primary" />
        </div>
      )}
      <div>
        <h3 className="text-xs font-bold text-slate-800 leading-none">
          {title}
        </h3>
        {subtitle && <p className="text-[8px] text-slate-400 font-medium uppercase tracking-wider leading-none mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

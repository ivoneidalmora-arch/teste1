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
    <div className="flex items-center gap-2 mb-4">
      {Icon && (
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-brand-primary" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-slate-800">
          {title}
        </h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
      </div>
    </div>
  );
}

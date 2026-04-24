import { cn } from '@/core/utils/formatters';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, className, hover = true, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300",
        hover && "hover:shadow-lg hover:shadow-slate-200/50",
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
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-brand-primary" />
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
          {title}
        </h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
      </div>
    </div>
  );
}

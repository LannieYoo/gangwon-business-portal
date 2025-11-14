/**
 * Table Component
 */

import { cn } from '@shared/utils/helpers';

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('table', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }) {
  return <tr className={className} {...props}>{children}</tr>;
}

export function TableHeader({ children, className, ...props }) {
  return <th className={cn('table th', className)} {...props}>{children}</th>;
}

export function TableCell({ children, className, ...props }) {
  return <td className={cn('table td', className)} {...props}>{children}</td>;
}


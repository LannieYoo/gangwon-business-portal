/**
 * Card Component
 */

import { cn } from '@shared/utils/helpers';
import './Card.css';

export function Card({ children, hover = false, className, ...props }) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('card-header', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('card-body', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('card-footer', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;


import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/**
 * Card — generic surface card component.
 *
 * Usage:
 *   <Card title="My Card">
 *     <p>Content goes here</p>
 *   </Card>
 */
export default function Card({ title, children, className = "", footer }: CardProps) {
  return (
    <div className={`bg-white border border-border rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-muted border-t border-border">{footer}</div>
      )}
    </div>
  );
}

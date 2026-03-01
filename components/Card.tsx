import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass" | "bordered";
  hoverEffect?: boolean;
  gradient?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

interface CardBadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
}

export function Card({
  children,
  className = "",
  variant = "default",
  hoverEffect = true,
  gradient = false,
}: CardProps) {
  const baseClasses =
    "rounded-xl border transition-all duration-300 overflow-hidden";

  const variantClasses = {
    default: "bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg",
    elevated:
      "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-xl",
    glass: "bg-white/10 backdrop-blur-xl border-white/20 shadow-lg",
    bordered:
      "bg-white border-2 border-gradient-to-r from-blue-500 to-purple-500 shadow-xl",
  };

  const hoverClasses = hoverEffect
    ? "hover:shadow-xl hover:-translate-y-1 hover:border-gray-300/50"
    : "";

  const gradientClasses = gradient
    ? "bg-gradient-to-br from-gradient-start via-gradient-middle to-gradient-end"
    : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${gradientClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`flex flex-col space-y-3 p-6 border-b border-gray-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", icon }: CardTitleProps) {
  return (
    <h3
      className={`text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3 ${className}`}
    >
      {icon && <span className="text-blue-500">{icon}</span>}
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`flex items-center justify-between p-6 border-t border-gray-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBadge({
  children,
  variant = "primary",
  className = "",
}: CardBadgeProps) {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-purple-100 text-purple-800 border border-purple-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    error: "bg-red-100 text-red-800 border border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

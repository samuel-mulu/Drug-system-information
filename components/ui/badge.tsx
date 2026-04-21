import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variantStyles = {
    success: { backgroundColor: '#dcfce7', color: '#166534' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    danger: { backgroundColor: '#fee2e2', color: '#dc2626' },
    info: { backgroundColor: '#dbeafe', color: '#1e40af' },
  };

  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 'bold',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}

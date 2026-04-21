import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead style={{ borderBottom: '2px solid #e2e8f0' }}>{children}</thead>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
      {children}
    </tr>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <th
      style={{
        padding: '12px',
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#64748b',
      }}
    >
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: ReactNode }) {
  return (
    <td style={{ padding: '12px', color: '#1e293b' }}>
      {children}
    </td>
  );
}

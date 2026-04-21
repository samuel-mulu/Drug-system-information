'use client';

import { ReactNode } from 'react';
import LoadingState from './loading-state';
import EmptyState from './empty-state';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No data found',
  emptyDescription,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 border-b border-slate-200 ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
            {actions && <th className="px-6 py-3 border-b border-slate-200 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-slate-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column, index) => (
                <td key={index} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : (item[column.accessor] as ReactNode)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div onClick={(e) => e.stopPropagation()}>{actions(item)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

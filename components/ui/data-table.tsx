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
    <div className="overflow-x-auto rounded-xl border border-[#dbe6f0] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#f2f7fb] text-slate-600 uppercase text-xs font-semibold tracking-[0.08em]">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-3 py-3 border-b border-[#dbe6f0] sm:px-6 ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
            {actions && <th className="px-3 py-3 border-b border-[#dbe6f0] text-right sm:px-6">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6edf5]">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-[#f8fbfe] transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column, index) => (
                <td key={index} className={`px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4 ${column.className || ''}`}>
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : (item[column.accessor] as ReactNode)}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-3 whitespace-nowrap text-right sm:px-6 sm:py-4">
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

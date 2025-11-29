/**
 * Table Component
 */

import { cn } from '@shared/utils/helpers';
import './Table.css';

export function Table({ 
  children, 
  className, 
  columns, 
  data, 
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  ...props 
}) {
  // If columns and data are provided, render the table automatically
  if (columns && data) {
    const allSelected = data.length > 0 && selectedRows.length === data.length;
    const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

    // Get primary column for mobile card title (first column or column with key 'name' or 'title')
    const primaryColumn = columns.find(col => ['name', 'title', 'companyName', 'id'].includes(col.key)) || columns[0];

    return (
      <div className="table-wrapper">
        {/* Desktop Table View */}
        <table className={cn('table', className)} {...props}>
          <thead>
            <tr>
              {selectable && (
                <th className="table-checkbox-header">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => {
                      if (onSelectAll) {
                        onSelectAll(e.target.checked ? data.map(row => row.id) : []);
                      }
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="table-header"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={cn(
                  'table-row',
                  onRowClick && 'table-row-clickable'
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td className="table-checkbox-cell">
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (onSelectRow) {
                          if (e.target.checked) {
                            onSelectRow([...selectedRows, row.id]);
                          } else {
                            onSelectRow(selectedRows.filter(id => id !== row.id));
                          }
                        }
                      }}
                    />
                  </td>
                )}
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'table-cell',
                        column.className
                      )}
                    >
                      {column.render ? column.render(value, row, rowIndex) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="table-mobile-card">
          {data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className={cn(
                'table-mobile-card-item',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick && onRowClick(row)}
            >
              <div className="table-mobile-card-header">
                <div className="table-mobile-card-title">
                  {primaryColumn.render 
                    ? primaryColumn.render(row[primaryColumn.key], row, rowIndex)
                    : row[primaryColumn.key]}
                </div>
                {selectable && (
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onSelectRow) {
                        if (e.target.checked) {
                          onSelectRow([...selectedRows, row.id]);
                        } else {
                          onSelectRow(selectedRows.filter(id => id !== row.id));
                        }
                      }
                    }}
                  />
                )}
              </div>
              <div className="table-mobile-card-body">
                {columns
                  .filter(column => column.key !== primaryColumn.key)
                  .map((column) => {
                    const value = row[column.key];
                    return (
                      <div key={column.key} className="table-mobile-card-row">
                        <div className="table-mobile-card-label">{column.label}</div>
                        <div className="table-mobile-card-value">
                          {column.render ? column.render(value, row, rowIndex) : value}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render as before (manual table structure)
  return (
    <div className="table-wrapper">
      <table className={cn('table', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }) {
  return <thead className={cn('table-thead', className)}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={cn('table-tbody', className)}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }) {
  return <tr className={cn('table-row', className)} {...props}>{children}</tr>;
}

export function TableHeader({ children, className, ...props }) {
  return (
    <th
      className={cn('table-header', className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('table-cell', className)} {...props}>
      {children}
    </td>
  );
}


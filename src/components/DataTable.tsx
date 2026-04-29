import React from 'react';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div style={containerStyle}>
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={thStyle}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={emptyStyle}>
                  No hay datos disponibles.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} style={trStyle}>
                  {columns.map((col) => (
                    <td key={`${row.id || rowIndex}-${col.key}`} style={tdStyle}>
                      {col.render 
                        ? col.render(row[col.key], row) 
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={paginationStyle}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={getButtonStyle(currentPage <= 1)}
        >
          Anterior
        </button>
        <span style={pageInfoStyle}>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={getButtonStyle(currentPage >= totalPages)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: '#f8fafc',
  color: '#475569',
  fontWeight: '600',
  fontSize: '0.875rem',
  borderBottom: '1px solid #e2e8f0',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid #f1f5f9',
  transition: 'background-color 0.15s'
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  color: '#334155',
  fontSize: '0.875rem'
};

const emptyStyle: React.CSSProperties = {
  padding: '2rem',
  textAlign: 'center',
  color: '#64748b'
};

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc'
};

const getButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  backgroundColor: disabled ? '#e2e8f0' : '#2563eb',
  color: disabled ? '#94a3b8' : 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'background-color 0.2s'
});

const pageInfoStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#475569',
  fontWeight: '500'
};

export default DataTable;

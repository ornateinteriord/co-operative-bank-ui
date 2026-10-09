import DataTable from 'react-data-table-component';
import { Box } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';

interface DashboardTableProps {
  data: any;
  columns: any;
  sx?: any;
  customStyles?: any;
}

const DashboardTable = ({ data, columns, sx = {}, customStyles }: DashboardTableProps) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        customStyles={customStyles || DASHBOARD_CUTSOM_STYLE}
        pointerOnHover
        noDataComponent={<Box sx={{ p: 3, textAlign: 'center', color: '#64748b' }}>No data available</Box>}
      />
    </Box>
  );
};

export default DashboardTable;

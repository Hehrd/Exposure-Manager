// src/pages/TablePage.tsx
import EditableTable from '../components/EditableTable';
import AppWrapper from '../components/Wrapper';

const TablePage = () => {
  return (
    <AppWrapper>
      <div style={{ height: '100%' }}>
        <EditableTable />
      </div>
    </AppWrapper>
  );
};

export default TablePage;

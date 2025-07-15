// src/pages/TablePage.tsx
import EditableTable from '../components/EditableTable';
import AppWrapper from '../components/AppWrapper';

const TablePage = () => {
  return (
    <AppWrapper>
      <div style={{ height: 'fit-content'}}>
        <EditableTable />
      </div>
    </AppWrapper>
  );
};

export default TablePage;

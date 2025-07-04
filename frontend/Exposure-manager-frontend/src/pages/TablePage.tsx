// src/pages/TablePage.tsx
import EditableTable from '../components/EditableTable';
import AppWrapper from '../components/Wrapper';

const TablePage = () => {
  return (
    <AppWrapper>
      <div className="min-h-screen bg-background text-foreground px-6 py-12">
        <EditableTable />
      </div>
    </AppWrapper>
  );
};

export default TablePage;

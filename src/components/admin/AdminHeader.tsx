
import CSVExport from './CSVExport';

interface AdminHeaderProps {
  users: any[];
}

const AdminHeader = ({ users }: AdminHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management of ISPB website and registered users</p>
        </div>
        <CSVExport users={users} />
      </div>
    </div>
  );
};

export default AdminHeader;

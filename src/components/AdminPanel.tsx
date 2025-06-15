
import AdminAccessControl from './admin/AdminAccessControl';
import AdminDashboard from './admin/AdminDashboard';
import { useAdminData } from '@/hooks/useAdminData';

const AdminPanel = () => {
  const {
    stats,
    users,
    userRoles,
    conferences,
    messages,
    publications,
    mandates,
    activities,
    refreshData
  } = useAdminData();

  return (
    <AdminAccessControl>
      <AdminDashboard
        stats={stats}
        users={users}
        userRoles={userRoles}
        conferences={conferences}
        messages={messages}
        publications={publications}
        mandates={mandates}
        activities={activities}
        refreshData={refreshData}
      />
    </AdminAccessControl>
  );
};

export default AdminPanel;

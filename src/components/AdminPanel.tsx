
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
    mandates,
    activities,
    payments,
    membershipPlans,
    refreshData,
    updateUserRole,
    addMembership,
    updateMembership,
    deleteMembership
  } = useAdminData();

  return (
    <AdminAccessControl>
      <AdminDashboard
        stats={stats}
        users={users}
        userRoles={userRoles}
        conferences={conferences}
        messages={messages}
        mandates={mandates}
        activities={activities}
        payments={payments}
        membershipPlans={membershipPlans}
        refreshData={refreshData}
        updateUserRole={updateUserRole}
        addMembership={addMembership}
        updateMembership={updateMembership}
        deleteMembership={deleteMembership}
      />
    </AdminAccessControl>
  );
};

export default AdminPanel;

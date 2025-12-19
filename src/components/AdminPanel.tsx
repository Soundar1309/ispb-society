import { useState } from 'react';
import AdminAccessControl from './admin/AdminAccessControl';
import AdminDashboard from './admin/AdminDashboard';
import { useAdminData } from '@/hooks/useAdminData';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    lifeMembers,
    orders,
    publications,
    galleryItems,
    officeBearers,
    applications,
    refreshData,
    updateUserRole,
    addMembership,
    updateMembership,
    deleteMembership
  } = useAdminData(activeTab);

  return (
    <AdminAccessControl>
      <AdminDashboard
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        users={users}
        userRoles={userRoles}
        conferences={conferences}
        messages={messages}
        mandates={mandates}
        activities={activities}
        payments={payments}
        membershipPlans={membershipPlans}
        lifeMembers={lifeMembers}
        orders={orders}
        publications={publications}
        galleryItems={galleryItems}
        officeBearers={officeBearers}
        applications={applications}
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

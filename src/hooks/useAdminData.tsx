import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  membershipEnrolled: number;
  unreadMessages: number;
}

interface UserRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  institution: string | null;
  designation: string | null;
  specialization: string | null;
  phone: string | null;
  created_at: string;
}

interface Membership {
  id: string;
  user_id: string;
  membership_type: string;
  status: string;
  payment_status: string;
  amount: number;
  valid_from: string;
  valid_until: string;
  created_at: string;
  is_manual?: boolean;
  member_code?: string;
}

interface MemberWithUserData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  institution?: string;
  designation?: string;
  specialization?: string;
  phone?: string;
  membership_type: string;
  membership_status: string;
  payment_status: string;
  valid_from: string;
  valid_until: string;
  is_manual?: boolean;
  membership_id?: string;
  amount?: number;
  member_code?: string;
}

export const useAdminData = (activeTab: string = 'dashboard') => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    membershipEnrolled: 0,
    unreadMessages: 0
  });

  const [users, setUsers] = useState<MemberWithUserData[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [applications, setApplications] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [lifeMembers, setLifeMembers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [publications, setPublications] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [officeBearers, setOfficeBearers] = useState([]);

  // Track what has been fetched to avoid redundant calls or to cache if desired
  const [fetchedTabs, setFetchedTabs] = useState<Set<string>>(new Set());

  const fetchStats = async () => {
    try {
      // Parallelize these count queries
      const [usersRes, membershipRes, messagesRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'active').in('payment_status', ['paid', 'manual']),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'unread')
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        membershipEnrolled: membershipRes.count || 0,
        unreadMessages: messagesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading statistics');
    }
  };

  const fetchTabSpecificData = async () => {
    try {
      // Don't fetch if not needed or already fetching?
      // For now, simple switch case.

      // Common data needed for multiple tabs - memoize or fetch only once if possible
      // But for simplicity/speed now, we just fetch what is needed for the ACTIVE tab.

      if (activeTab === 'users' || activeTab === 'members') {
        // Users and Members need user_roles and memberships
        const [userRolesRes, membershipsRes] = await Promise.all([
          supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
          supabase.from('memberships').select('*').eq('status', 'active').order('created_at', { ascending: false })
        ]);

        if (userRolesRes.data) setUserRoles(userRolesRes.data as UserRole[]);
        if (membershipsRes.data) setMemberships(membershipsRes.data as Membership[]);

        // Process combined data
        const membersWithUserData: MemberWithUserData[] = [];
        if (membershipsRes.data && userRolesRes.data) {
          for (const membership of membershipsRes.data as Membership[]) {
            const userRole = (userRolesRes.data as UserRole[]).find(ur => ur.user_id === membership.user_id);
            if (userRole) {
              membersWithUserData.push({
                id: userRole.id,
                user_id: userRole.user_id,
                full_name: userRole.full_name || 'Unknown User',
                email: userRole.email || 'No email',
                role: userRole.role || 'member',
                institution: userRole.institution || undefined,
                designation: userRole.designation || undefined,
                specialization: userRole.specialization || undefined,
                phone: userRole.phone || undefined,
                membership_type: membership.membership_type,
                membership_status: membership.status,
                payment_status: membership.payment_status,
                valid_from: membership.valid_from || '',
                valid_until: membership.valid_until || '',
                is_manual: membership.is_manual || false,
                membership_id: membership.id,
                amount: membership.amount || 0,
                member_code: membership.member_code
              });
            }
          }
        }
        setUsers(membersWithUserData);
      }

      if (activeTab === 'applications') {
        const [applicationsRes, userRolesRes] = await Promise.all([
          supabase.from('memberships').select('*').in('application_status', ['submitted', 'approved', 'rejected']).order('created_at', { ascending: false }),
          supabase.from('user_roles').select('*') // Might need all users to map names
        ]);

        if (userRolesRes.data) setUserRoles(userRolesRes.data as UserRole[]);

        const applicationsWithUserData = [];
        if (applicationsRes.data && userRolesRes.data) {
          for (const app of applicationsRes.data) {
            const userRole = (userRolesRes.data as UserRole[]).find(ur => ur.user_id === app.user_id);
            applicationsWithUserData.push({
              ...app,
              user_roles: userRole ? {
                full_name: userRole.full_name,
                email: userRole.email,
                phone: userRole.phone,
                institution: userRole.institution,
                designation: userRole.designation
              } : null
            });
          }
        }
        setApplications(applicationsWithUserData);
      }

      if (activeTab === 'conferences') {
        const { data } = await supabase.from('conferences').select('*').order('created_at', { ascending: false });
        setConferences(data || []);
      }

      if (activeTab === 'messages') {
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        setMessages(data || []);
      }

      if (activeTab === 'content') {
        const [mandatesRes, activitiesRes] = await Promise.all([
          supabase.from('mandates').select('*').order('display_order', { ascending: true }),
          supabase.from('activities').select('*').order('display_order', { ascending: true })
        ]);
        setMandates(mandatesRes.data || []);
        setActivities(activitiesRes.data || []);
      }

      if (activeTab === 'payments') {
        // Payments typically need user info too
        const [paymentsRes, userRolesRes] = await Promise.all([
          supabase.from('orders').select(`
              *,
              memberships(membership_type, user_id)
            `).eq('status', 'paid').order('created_at', { ascending: false }),
          supabase.from('user_roles').select('*')
        ]);

        const formattedPayments = [];
        if (paymentsRes.data && userRolesRes.data) {
          for (const order of paymentsRes.data) {
            const userRole = order.memberships?.user_id
              ? (userRolesRes.data as UserRole[]).find(ur => ur.user_id === order.memberships.user_id)
              : (userRolesRes.data as UserRole[]).find(ur => ur.user_id === order.user_id);

            formattedPayments.push({
              id: order.id,
              membership_id: order.membership_id,
              user_id: order.user_id,
              amount: order.amount,
              currency: order.currency || 'INR',
              payment_method: order.payment_method || 'Razorpay',
              payment_status: order.status,
              razorpay_payment_id: order.razorpay_payment_id,
              razorpay_order_id: order.razorpay_order_id,
              created_at: order.created_at,
              user_name: userRole?.full_name || 'Unknown User',
              membership_type: order.memberships?.membership_type || 'N/A'
            });
          }
        }
        setPayments(formattedPayments);

        // Also fetch orders for the Orders tab if needed there? Or is it separate?
        // Orders tab seems to use 'orders' prop.
        // Let's assume 'payments' tab is for paid orders, separate might be needed for Order management.

        const { data: allOrders } = await supabase.from('orders').select(`
              *,
              memberships(membership_type, status)
            `).order('created_at', { ascending: false });

        const ordersWithProfiles = (allOrders || []).map((order: any) => {
          const userRole = (userRolesRes.data as UserRole[] | null)?.find((ur) => ur.user_id === order.user_id);
          return {
            ...order,
            profiles: userRole ? { full_name: userRole.full_name || 'Unknown User', email: userRole.email || '' } : undefined,
          };
        });
        setOrders(ordersWithProfiles);
      }

      if (activeTab === 'membership-plans') {
        const { data } = await supabase.from('membership_plans').select('*').order('price', { ascending: true });
        setMembershipPlans(data || []);
      }

      if (activeTab === 'life-members') {
        const { data } = await supabase.from('life_members').select('*').order('created_at', { ascending: false });
        setLifeMembers(data || []);
      }

      if (activeTab === 'publications') {
        const { data } = await supabase.from('publications').select('*').order('year', { ascending: false });
        setPublications(data || []);
      }

      if (activeTab === 'gallery') {
        const { data } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
        setGalleryItems(data || []);
      }

      if (activeTab === 'office-bearers') {
        const { data } = await supabase.from('office_bearers').select('*').order('display_order', { ascending: true });
        setOfficeBearers(data || []);
      }

    } catch (error) {
      console.error(`Error fetching data for tab ${activeTab}:`, error);
      toast.error('Error loading data');
    }
  };

  // Initial stats fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data when activeTab changes
  useEffect(() => {
    fetchTabSpecificData();
  }, [activeTab]);

  const refreshData = () => {
    fetchStats();
    fetchTabSpecificData();
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating user role:', { userId, newRole });

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      await fetchTabSpecificData();
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  };

  const addMembership = async (membershipData: any) => {
    try {
      console.log('Adding membership:', membershipData);

      const { data: existingMemberships, error: checkError } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', membershipData.user_id)
        .eq('status', 'active');

      if (checkError) {
        console.error('Error checking existing memberships:', checkError);
        throw checkError;
      }

      if (existingMemberships && existingMemberships.length > 0) {
        toast.error('User already has an active membership');
        return { success: false };
      }

      // Check if member code already exists
      if (membershipData.member_code) {
        const { data: existingCode, error: codeError } = await supabase
          .from('memberships')
          .select('id')
          .eq('member_code', membershipData.member_code)
          .single();

        if (codeError && codeError.code !== 'PGRST116') {
          console.error('Error checking member code:', codeError);
          throw codeError;
        }

        if (existingCode) {
          toast.error('Member code already exists. Please use a unique code.');
          return { success: false };
        }
      }

      const { error } = await supabase
        .from('memberships')
        .insert(membershipData);

      if (error) {
        console.error('Error adding membership:', error);
        throw error;
      }

      toast.success('Membership added successfully');
      await fetchTabSpecificData();
      await fetchStats();
      return { success: true };
    } catch (error) {
      console.error('Error in addMembership:', error);
      toast.error('Error adding membership');
      throw error;
    }
  };

  const updateMembership = async (membershipId: string, membershipData: any) => {
    try {
      console.log('Updating membership:', { membershipId, membershipData });

      // Check if member code already exists (excluding current membership)
      if (membershipData.member_code) {
        const { data: existingCode, error: codeError } = await supabase
          .from('memberships')
          .select('id')
          .eq('member_code', membershipData.member_code)
          .neq('id', membershipId)
          .single();

        if (codeError && codeError.code !== 'PGRST116') {
          console.error('Error checking member code:', codeError);
          throw codeError;
        }

        if (existingCode) {
          toast.error('Member code already exists. Please use a unique code.');
          return { success: false };
        }
      }

      const { error } = await supabase
        .from('memberships')
        .update(membershipData)
        .eq('id', membershipId);

      if (error) {
        console.error('Error updating membership:', error);
        throw error;
      }

      toast.success('Membership updated successfully');
      await fetchTabSpecificData();
      return { success: true };
    } catch (error) {
      console.error('Error in updateMembership:', error);
      toast.error('Error updating membership');
      throw error;
    }
  };

  const deleteMembership = async (membershipId: string) => {
    try {
      console.log('Deleting membership:', membershipId);

      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId);

      if (error) {
        console.error('Error deleting membership:', error);
        throw error;
      }

      toast.success('Membership deleted successfully');
      await fetchTabSpecificData();
      await fetchStats();
      return { success: true };
    } catch (error) {
      console.error('Error in deleteMembership:', error);
      toast.error('Error deleting membership');
      throw error;
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    stats,
    users,
    userRoles,
    memberships,
    applications,
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
    refreshData,
    updateUserRole,
    addMembership,
    updateMembership,
    deleteMembership
  };
};

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

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    membershipEnrolled: 0,
    unreadMessages: 0
  });

  const [users, setUsers] = useState<MemberWithUserData[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
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

  const fetchStats = async () => {
    try {
      const [usersRes, membershipRes, messagesRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('status', 'active').in('payment_status', ['paid', 'manual']),
        supabase.from('contact_messages').select('id', { count: 'exact' }).eq('status', 'unread')
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

  const fetchAllData = async () => {
    try {
      const [
        userRolesRes, 
        membershipsRes,
        conferencesRes, 
        messagesRes,
        mandatesRes,
        activitiesRes,
        paymentsRes,
        membershipPlansRes,
        lifeMembersRes,
        ordersRes,
        publicationsRes,
        galleryRes,
        officeBearersRes
      ] = await Promise.all([
        supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
        supabase.from('memberships').select('*').eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('conferences').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('mandates').select('*').order('display_order', { ascending: true }),
        supabase.from('activities').select('*').order('display_order', { ascending: true }),
        supabase.from('payment_tracking').select(`
          *,
          user_roles!payment_tracking_user_id_fkey(full_name),
          memberships(membership_type)
        `).order('created_at', { ascending: false }),
        supabase.from('membership_plans').select('*').order('price', { ascending: true }),
        supabase.from('life_members').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select(`
          *,
          user_roles!orders_user_id_fkey(full_name, email),
          memberships!orders_membership_id_fkey(membership_type, status)
        `).order('created_at', { ascending: false }),
        supabase.from('publications').select('*').order('year', { ascending: false }),
        supabase.from('gallery').select('*').order('display_order', { ascending: true }),
        supabase.from('office_bearers').select('*').order('display_order', { ascending: true })
      ]);

      console.log('Fetched user roles:', userRolesRes.data);
      console.log('Fetched memberships:', membershipsRes.data);

      // Set user roles for user management tab
      if (userRolesRes.data) {
        setUserRoles(userRolesRes.data as UserRole[]);
      }
      
      // Set memberships
      if (membershipsRes.data) {
        setMemberships(membershipsRes.data as Membership[]);
      }
      
      // Create members with user data for the members tab (all active memberships)
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
      setConferences(conferencesRes.data || []);
      setMessages(messagesRes.data || []);
      setMandates(mandatesRes.data || []);
      setActivities(activitiesRes.data || []);
      setPayments(paymentsRes.data || []);
      setMembershipPlans(membershipPlansRes.data || []);
      setLifeMembers(lifeMembersRes.data || []);
      setOrders(ordersRes.data || []);
      setPublications(publicationsRes.data || []);
      setGalleryItems(galleryRes.data || []);
      setOfficeBearers(officeBearersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading admin data');
    }
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

      await fetchAllData();
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
      await fetchAllData();
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
      await fetchAllData();
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
      await fetchAllData();
      await fetchStats();
      return { success: true };
    } catch (error) {
      console.error('Error in deleteMembership:', error);
      toast.error('Error deleting membership');
      throw error;
    }
  };

  const refreshData = () => {
    fetchStats();
    fetchAllData();
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    stats,
    users,
    userRoles,
    memberships,
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

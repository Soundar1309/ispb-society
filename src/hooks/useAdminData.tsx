
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  membershipEnrolled: number;
  unreadMessages: number;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    membershipEnrolled: 0,
    unreadMessages: 0
  });

  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchStats = async () => {
    try {
      const [usersRes, membershipRes, messagesRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('status', 'active').eq('payment_status', 'paid'),
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
        messagesRes
      ] = await Promise.all([
        supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
        supabase.from('memberships').select(`
          *,
          user_roles!inner(*)
        `).eq('status', 'active').eq('payment_status', 'paid').order('created_at', { ascending: false }),
        supabase.from('conferences').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      ]);

      // Set all users for user management
      setUserRoles(userRolesRes.data || []);
      
      // Set only users with active paid memberships for members tab
      const membersWithUserData = (membershipsRes.data || []).map(membership => {
        // Ensure user_roles exists and is a valid object with required properties
        const userRoles = membership.user_roles;
        if (!userRoles || typeof userRoles !== 'object' || Array.isArray(userRoles)) {
          console.warn('Invalid user_roles data for membership:', membership.id);
          return {
            id: membership.id,
            user_id: membership.user_id,
            full_name: 'Unknown User',
            email: 'No email',
            role: 'member',
            membership_type: membership.membership_type,
            membership_status: membership.status,
            payment_status: membership.payment_status,
            valid_from: membership.valid_from,
            valid_until: membership.valid_until
          };
        }
        
        return {
          id: userRoles.id,
          user_id: userRoles.user_id,
          full_name: userRoles.full_name || 'Unknown User',
          email: userRoles.email || 'No email',
          role: userRoles.role || 'member',
          institution: userRoles.institution,
          designation: userRoles.designation,
          specialization: userRoles.specialization,
          phone: userRoles.phone,
          membership_type: membership.membership_type,
          membership_status: membership.status,
          payment_status: membership.payment_status,
          valid_from: membership.valid_from,
          valid_until: membership.valid_until
        };
      });
      
      setUsers(membersWithUserData);
      setMemberships(membershipsRes.data || []);
      setConferences(conferencesRes.data || []);
      setMessages(messagesRes.data || []);
      
      // Mock data for mandates and activities since these tables don't exist yet
      setMandates([]);
      setActivities([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading admin data');
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
    refreshData
  };
};


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
        supabase.from('memberships').select('*').eq('status', 'active').eq('payment_status', 'paid').order('created_at', { ascending: false }),
        supabase.from('conferences').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      ]);

      // Set all users for user management
      setUserRoles(userRolesRes.data || []);
      setMemberships(membershipsRes.data || []);
      
      // Manually join memberships with user_roles data
      const membersWithUserData: MemberWithUserData[] = [];
      
      if (membershipsRes.data && userRolesRes.data) {
        for (const membership of membershipsRes.data) {
          const userRole = userRolesRes.data.find(ur => ur.user_id === membership.user_id);
          
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
              valid_until: membership.valid_until || ''
            });
          } else {
            // Handle case where user_role is not found
            membersWithUserData.push({
              id: membership.id,
              user_id: membership.user_id || '',
              full_name: 'Unknown User',
              email: 'No email',
              role: 'member',
              membership_type: membership.membership_type,
              membership_status: membership.status,
              payment_status: membership.payment_status,
              valid_from: membership.valid_from || '',
              valid_until: membership.valid_until || ''
            });
          }
        }
      }
      
      setUsers(membersWithUserData);
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

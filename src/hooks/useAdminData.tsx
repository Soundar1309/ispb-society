
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  membershipEnrolled: number;
  totalPublications: number;
  unreadMessages: number;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    membershipEnrolled: 0,
    totalPublications: 0,
    unreadMessages: 0
  });

  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [publications, setPublications] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchStats = async () => {
    try {
      const [usersRes, membershipRes, publicationsRes, messagesRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('publications').select('id', { count: 'exact' }),
        supabase.from('contact_messages').select('id', { count: 'exact' }).eq('status', 'unread')
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        membershipEnrolled: membershipRes.count || 0,
        totalPublications: publicationsRes.count || 0,
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
        conferencesRes, 
        messagesRes, 
        publicationsRes
      ] = await Promise.all([
        supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
        supabase.from('conferences').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('publications').select('*').order('created_at', { ascending: false })
      ]);

      // user_roles now contains all user data, so we use it for both users and userRoles
      setUsers(userRolesRes.data || []);
      setUserRoles(userRolesRes.data || []);
      setConferences(conferencesRes.data || []);
      setMessages(messagesRes.data || []);
      setPublications(publicationsRes.data || []);
      
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
    conferences,
    messages,
    publications,
    mandates,
    activities,
    refreshData
  };
};

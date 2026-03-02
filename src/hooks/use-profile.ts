import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAudioStore } from '@/lib/audio-store';
import { useAuth } from './use-auth';

export function useProfile() {
  const { user } = useAuth();
  const setAliencoins = useAudioStore((s) => s.setAliencoins);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('aliencoins')
          .eq('user_id', user.id)
          .single();
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        if (data) {
          setAliencoins(data.aliencoins);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user, setAliencoins]);
}

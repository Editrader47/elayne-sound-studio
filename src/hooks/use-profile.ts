import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAudioStore } from '@/lib/audio-store';
import { useAuth } from './use-auth';

export function useProfile() {
  const { user } = useAuth();
  const { setAliencoins } = useAudioStore();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('aliencoins')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setAliencoins(data.aliencoins);
      }
    };

    fetchProfile();
  }, [user, setAliencoins]);
}

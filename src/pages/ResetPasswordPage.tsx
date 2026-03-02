import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import elayneLogoImg from '@/assets/elayne-logo.png';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery session
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: '✅ Contraseña actualizada' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 w-full max-w-md text-center space-y-4">
          <img src={elayneLogoImg} alt="" className="w-16 h-16 object-contain mx-auto" />
          <p className="text-muted-foreground text-sm">Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.</p>
          <Button onClick={() => navigate('/auth')} variant="outline">Volver al inicio</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={elayneLogoImg} alt="" className="w-16 h-16 object-contain" />
          <h1 className="text-xl font-black tracking-wider neon-logo">NUEVA CONTRASEÑA</h1>
          <p className="text-xs text-muted-foreground">Ingresa tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nueva contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-secondary/50 border-border/40" />
          </div>
          <Button type="submit" disabled={loading} className="w-full glow-button h-11">
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

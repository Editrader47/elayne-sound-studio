import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import elayneLogoImg from '@/assets/elayne-logo.png';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: '✅ Sesión iniciada' });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: '✅ Cuenta creada', description: 'Revisa tu correo para confirmar.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <img src={elayneLogoImg} alt="" className="w-20 h-20 object-contain" />
          <h1 className="text-2xl font-black tracking-wider neon-logo">ELAYNE SOUND STUDIO</h1>
          <p className="text-xs text-muted-foreground">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre artístico"
                className="bg-secondary/50 border-border/40"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Correo electrónico</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="bg-secondary/50 border-border/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-secondary/50 border-border/40"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full glow-button h-11">
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

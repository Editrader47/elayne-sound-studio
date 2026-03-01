import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AudioPlayer } from '@/components/player/AudioPlayer';
import { AliencoinsWidget } from './AliencoinsWidget';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  useProfile();
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border/20 px-4 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-3">
              <AliencoinsWidget />
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 pb-36 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      <AudioPlayer />
    </SidebarProvider>
  );
}

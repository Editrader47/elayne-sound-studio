import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AudioPlayer } from '@/components/player/AudioPlayer';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/20 px-4 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
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

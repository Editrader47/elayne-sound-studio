import { Library, Sparkles, Mic, FlaskConical } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import elayneLogoImg from '@/assets/elayne-logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Estudio', url: '/', icon: Sparkles },
  { title: 'Biblioteca', url: '/library', icon: Library },
  { title: 'Mis Voces', url: '/voices', icon: Mic },
  { title: 'Lab de Voz', url: '/voice-lab', icon: FlaskConical },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarHeader className="p-4 pt-5">
        <div className="flex flex-col items-center gap-2">
          <img src={elayneLogoImg} alt="ELAYNE" className={collapsed ? "w-10 h-10 object-contain" : "w-28 h-28 object-contain"} />
          {!collapsed && (
            <div className="text-center">
              <h1 className="text-xl font-black tracking-wider neon-logo">ELAYNE</h1>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground/60">Latin Pro Creative Engine</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] tracking-widest uppercase">
            {!collapsed && 'Navegar'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/40 font-mono">v3.0 · ELAYNE</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

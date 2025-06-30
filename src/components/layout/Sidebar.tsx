
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, Users, 
  CreditCard, FileSpreadsheet, Landmark, Tag, FolderKanban, 
  FileText, Settings, LogOut, Building, BarChart
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

type SidebarProps = {
  role: UserRole;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

type NavItem = {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  roles: Array<UserRole>;
};

export function Sidebar({ role, collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);

  const navigationItems: NavItem[] = [
    { 
      titleKey: 'nav.dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.clients', 
      href: '/clients', 
      icon: Building,
      roles: ['accountant'] 
    },
    { 
      titleKey: 'nav.cashflow', 
      href: '/cashflow', 
      icon: BarChart,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.transactions', 
      href: '/transactions', 
      icon: FileSpreadsheet,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.accounts', 
      href: '/accounts', 
      icon: Landmark,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.categories', 
      href: '/categories', 
      icon: Tag,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.costCenters', 
      href: '/cost-centers', 
      icon: FolderKanban,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.partners', 
      href: '/partners', 
      icon: Users,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.invoices', 
      href: '/invoices', 
      icon: FileText,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
    { 
      titleKey: 'nav.settings', 
      href: '/settings', 
      icon: Settings,
      roles: ['accountant', 'client-admin', 'client-user'] 
    },
  ];
  
  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  // Helper function to check if user is a client
  const isClient = role === 'client-admin' || role === 'client-user';

  const handleLogout = () => {
    toast({
      title: t('toast.loggedOut'),
      description: t('toast.loggedOutDesc'),
    });

    // In a real app, this would handle authentication logout
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <aside 
      className={cn(
        "h-screen fixed top-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64",
        hovering && collapsed ? "w-64" : "",
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-center justify-between p-4 h-16">
        <div className={cn(
          "flex items-center gap-2 overflow-hidden transition-all",
          collapsed && !hovering ? "opacity-0 w-0" : "opacity-100"
        )}>
          <CreditCard className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-lg whitespace-nowrap">Finance Hub</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "rounded-full p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && !hovering ? "ml-auto" : ""
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent group",
                    isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium transition-all overflow-hidden whitespace-nowrap",
                    collapsed && !hovering ? "w-0 opacity-0" : "w-full opacity-100",
                  )}>
                    {t(item.titleKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-4 space-y-2">
        <LanguageToggle collapsed={collapsed && !hovering} />
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className={cn(
            "transition-all overflow-hidden",
            collapsed && !hovering ? "w-0 opacity-0" : "opacity-100"
          )}>
            {t('nav.logout')}
          </span>
        </Button>
      </div>
    </aside>
  );
}

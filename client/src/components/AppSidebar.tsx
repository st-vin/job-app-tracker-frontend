import type { ComponentType, SVGProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE } from "@/const";
import { AlarmClock, CalendarDays, LayoutDashboard, ListChecks, PlusCircle, Settings2, UserRound, BarChart3 } from "lucide-react";

type NavItem = {
  title: string;
  description: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  matchPrefix?: boolean;
};

const navSections: Array<{
  title: string;
  items: NavItem[];
}> = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        description: "KPIs, charts, reminders",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        description: "Deep insights and trends",
        path: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Applications",
    items: [
      {
        title: "All Applications",
        description: "Search, filter, or switch views",
        path: "/applications",
        icon: ListChecks,
        matchPrefix: true,
      },
    ],
  },
  {
    title: "Follow-ups",
    items: [
      {
        title: "Reminders",
        description: "Global view of upcoming follow-ups",
        path: "/reminders",
        icon: AlarmClock,
      },
          {
            title: "Calendar",
            description: "Month view of reminders & apps",
            path: "/calendar",
            icon: CalendarDays,
          },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        description: "Manage personal details",
        path: "/profile",
        icon: UserRound,
      },
      {
        title: "Settings",
        description: "Preferences, theme, danger zone",
        path: "/settings",
        icon: Settings2,
      },
    ],
  },
];

const getInitials = (title: string) =>
  title
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return location.pathname.startsWith(item.path);
    }
    return location.pathname === item.path;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <button
          type="button"
          className="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => navigate("/dashboard")}
        >
          {APP_LOGO ? (
            <img
              src={APP_LOGO}
              alt="App logo"
              className="h-9 w-9 rounded-md object-cover"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold">
              {getInitials(APP_TITLE)}
            </div>
          )}
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold leading-tight">{APP_TITLE}</p>
            <p className="text-xs text-muted-foreground">Navigate</p>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent>
        {navSections.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive(item)}
                        onClick={() => navigate(item.path)}
                        tooltip={item.description}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => navigate("/applications/new")}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Application</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


import {
    LayoutDashboard,
    Users,
    Crown,
    UserCheck,
    Calendar,
    BookOpen,
    Image,
    Award,
    MessageSquare,
    CreditCard,
    Settings,
    FileText,
    Cog,
    ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define the menu sections (moved from AdminDashboard to be shared/static or passed as props if dynamic)
// Since they rely on props like counts, we will likely accept the structure as props.

interface NavItem {
    id: string;
    label: string;
    icon: any;
    description?: string;
    count?: number;
    urgent?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface AdminSidebarNavProps {
    sections: NavSection[];
    activeTab: string;
    onSelectTab: (tabId: string) => void;
    className?: string;
}

export function AdminSidebarNav({
    sections,
    activeTab,
    onSelectTab,
    className
}: AdminSidebarNavProps) {
    return (
        <div className={cn("pb-12 h-full", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2 border-b mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ISPB Admin
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Management Portal</p>
                </div>

                <ScrollArea className="h-[calc(100vh-8rem)] px-2">
                    <div className="space-y-6 px-2">
                        {sections.map((section) => (
                            <div key={section.title}>
                                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const IconComponent = item.icon;
                                        const isActive = activeTab === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onSelectTab(item.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group text-sm font-medium",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                                                        : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconComponent
                                                        className={cn(
                                                            "h-4 w-4 shrink-0 transition-colors",
                                                            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                                        )}
                                                    />
                                                    <span>{item.label}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {item.count !== undefined && (
                                                        <Badge
                                                            variant={item.urgent ? "destructive" : "secondary"}
                                                            className={cn(
                                                                "h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center text-[10px]",
                                                                isActive ? "bg-blue-100 text-blue-700" : ""
                                                            )}
                                                        >
                                                            {item.count}
                                                        </Badge>
                                                    )}
                                                    {isActive && <ChevronRight className="h-3 w-3 text-blue-600" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

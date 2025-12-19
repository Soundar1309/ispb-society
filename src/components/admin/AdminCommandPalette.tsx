import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    FileText,
    Users,
    Crown,
    Image,
    BookOpen,
    Award,
    MessageSquare,
    Search
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

interface AdminCommandPaletteProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSelectTab: (tab: string) => void;
}

export function AdminCommandPalette({
    open: externalOpen,
    onOpenChange,
    onSelectTab
}: AdminCommandPaletteProps) {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const isOpen = externalOpen ?? open
    const setOp = onOpenChange ?? setOpen

    const handleSelect = (tabId: string) => {
        onSelectTab(tabId)
        setOp(false)
    }

    return (
        <>
            {/* Trigger Button (Visible on Desktop Header usually, or just Key listener) */}
            <button
                onClick={() => setOp(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 border rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                <Search className="w-4 h-4" />
                <span className="text-xs">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={isOpen} onOpenChange={setOp}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => handleSelect('dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('applications')}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Applications</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('members')}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Members</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('payments')}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Payments</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('messages')}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Messages</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Content">
                        <CommandItem onSelect={() => handleSelect('conferences')}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Conferences</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('publications')}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Publications</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('gallery')}>
                            <Image className="mr-2 h-4 w-4" />
                            <span>Gallery</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => handleSelect('payment-settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Payment Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

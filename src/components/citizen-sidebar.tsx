"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { ClipboardList, FilePenLine, LogIn, LogOut, Scale, Settings } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, SidebarHeader } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [{ label: "New chat", href: "#issue", icon: FilePenLine }, { label: "Grievances", href: "#recent-cases", icon: ClipboardList }, { label: "RTI applications", href: "#recent-cases", icon: FilePenLine }, { label: "Appeals", href: "#recent-cases", icon: Scale }]
type RecentCase = { id: string; issue: string; department: string | null; status: string }
type CitizenSidebarProps = { user?: { name: string; email: string } | null; cases?: RecentCase[] }

export default function CitizenSidebar({ user = null, cases = [] }: CitizenSidebarProps) {
  const [recentCases, setRecentCases] = useState<RecentCase[]>(cases)
  const [casesLoaded, setCasesLoaded] = useState(false)
  useEffect(() => {
    if (!user) { setRecentCases([]); setCasesLoaded(true); return }
    fetch("/api/cases", { credentials: "include" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (data && Array.isArray(data.cases)) setRecentCases(data.cases.slice(0, 4)) })
      .catch(() => undefined)
      .finally(() => setCasesLoaded(true))
  }, [user])
  const signOut = async () => { await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" }); window.location.assign("/") }
  return <TooltipProvider><SidebarProvider defaultOpen className="contents" style={{ "--sidebar-width": "20.625rem", "--sidebar-width-icon": "4rem" } as CSSProperties}><Sidebar collapsible="icon"><SidebarHeader className="border-b border-sidebar-border p-4"><div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center"><a href="/" className="text-3xl font-black tracking-[-0.08em] text-sidebar-foreground group-data-[collapsible=icon]:hidden">IGS</a><SidebarTrigger id="shadcnSidebarToggle" aria-label="Toggle sidebar" /></div></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupContent><SidebarMenu>{navigation.map(({ label, href, icon: Icon }, index) => <SidebarMenuItem key={label}><SidebarMenuButton render={<a href={href} />} isActive={index === 0} tooltip={label}><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup><SidebarGroup id="recent-cases" className="group-data-[collapsible=icon]:hidden"><SidebarGroupLabel>Active last 30 days</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{recentCases.map((item) => <SidebarMenuItem key={item.id}><SidebarMenuButton render={<a href={`/cases/${item.id}`} />} tooltip={item.issue}><ClipboardList /><span className="truncate">{item.department || item.issue}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>{casesLoaded && !recentCases.length ? <p className="px-2 text-sm text-sidebar-foreground/60">No active cases yet.</p> : null}</SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter>{user ? <SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-sidebar-accent" />}><Avatar className="size-8 shrink-0"><AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="grid min-w-0 group-data-[collapsible=icon]:hidden"><strong className="truncate font-semibold">{user.name}</strong><small className="truncate text-xs text-muted-foreground">{user.email}</small></span></DropdownMenuTrigger><DropdownMenuContent side="top" align="start" sideOffset={8} className="w-60"><DropdownMenuLabel className="flex items-center gap-2 py-2"><Avatar className="size-8"><AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="grid min-w-0"><strong className="truncate text-sm">{user.name}</strong><span className="truncate text-xs font-normal">{user.email}</span></span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem render={<a href="/settings" />}><Settings />Account</DropdownMenuItem><DropdownMenuItem render={<a href="/settings#notifications" />}><span aria-hidden="true">♧</span>Notifications</DropdownMenuItem><DropdownMenuItem render={<a href="/cases" />}><ClipboardList />My cases</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={signOut}><LogOut />Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu> : <SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<a href="/sign-in" />} tooltip="Sign in"><LogIn /><span>Sign in</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>}</SidebarFooter><SidebarRail /></Sidebar></SidebarProvider></TooltipProvider>
}

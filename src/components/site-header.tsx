import { Link, useRouter } from "@tanstack/react-router";
import { Heart, LayoutDashboard, LogOut, Menu, Search, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, signOut } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground font-bold">i4</span>
          <span className="text-lg font-bold tracking-tight text-navy">
            idilicar<span className="text-brand">4sales</span>
          </span>
        </Link>
        <nav className="ml-6 hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          <Link to="/search" className="hover:text-brand">Buy</Link>
          <Link to="/sell" className="hover:text-brand">Sell my car</Link>
          <Link to="/dealers" className="hover:text-brand">Dealers</Link>
          <Link to="/research" className="hover:text-brand">Research</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Favourites">
                <Link to="/dashboard/favorites"><Heart className="h-5 w-5" /></Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    <UserIcon className="mr-1.5 h-4 w-4" />
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/listings">My listings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/offers">Offers</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/messages">Messages</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/favorites">Saved cars</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/sales">Sales history</Link></DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin panel</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                <Link to="/auth" search={{ mode: "signup" }}><Search className="mr-1.5 h-4 w-4" />Get started</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold">idilicar<span className="text-brand">4sales</span></div>
          <p className="mt-3 text-sm text-white/70">The smarter way to buy and sell used cars in the UK.</p>
        </div>
        <FooterCol title="Buyers" items={[{ label: "Search cars", to: "/search" }, { label: "Saved cars", to: "/dashboard/favorites" }, { label: "Research", to: "/research" }]} />
        <FooterCol title="Sellers" items={[{ label: "Sell my car", to: "/sell" }, { label: "Dashboard", to: "/dashboard" }, { label: "Dealers", to: "/dealers" }]} />
        <FooterCol title="Account" items={[{ label: "Sign in", to: "/auth" }, { label: "Register", to: "/auth" }]} />
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} idilicar4sales. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {items.map((i) => (
          <li key={i.label}><Link to={i.to} className="hover:text-white">{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
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
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Saved">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">Sign in</Button>
          <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Search className="mr-1.5 h-4 w-4" /> Search
          </Button>
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
        <FooterCol title="Buyers" links={["Search cars", "Saved cars", "Car reviews", "Price trends"]} />
        <FooterCol title="Sellers" links={["Sell my car", "Instant valuation", "Dealer signup", "Pricing"]} />
        <FooterCol title="Company" links={["About", "Careers", "Press", "Contact"]} />
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} idilicar4sales. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {links.map((l) => <li key={l}><a className="hover:text-white" href="#">{l}</a></li>)}
      </ul>
    </div>
  );
}

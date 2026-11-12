import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Cuboid } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const navigationItems = [
  { to: '/apks', label: 'Minecraft APKs' },
  { to: '/pc', label: 'Minecraft for PC' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="mcedit-site min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand-mark" to="/" aria-label="MCEDIT home">
            <span className="brand-icon" aria-hidden="true"><Cuboid /></span>
            <span>MC<span className="brand-accent">EDIT</span></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="site-credit">Made by DPT</span>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <Link className="footer-brand" to="/">MCEDIT</Link>
        <span>Minecraft downloads made simple.</span>
        <span>Made by DPT</span>
      </footer>
    </div>
  );
}

export function InstructionsDialog({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="instructions-trigger">
          Instructions
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="instructions-dialog">
        <DialogHeader>
          <DialogTitle className="instructions-title">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="instructions-body">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
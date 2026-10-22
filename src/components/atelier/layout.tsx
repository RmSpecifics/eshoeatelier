import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Menu, X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2Z" stroke="currentColor" strokeWidth="1" /><path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth=".6" /></svg>;
}
export function AtelierLayout({ children, catalogue = false }: { children: ReactNode; catalogue?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [announcement, setAnnouncement] = useState(true);
  const [information, setInformation] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
  useEffect(() => setMenu(false), [pathname]);
  return <div className={`atelier-shell ${catalogue ? 'catalogue-shell' : ''} ${announcement ? '' : 'no-announcement'}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    {announcement && <div className="announcement"><span>Elegance in Every Step.</span><Button variant="ghost" size="icon" aria-label="Dismiss announcement" onClick={() => setAnnouncement(false)}><X size={12} /></Button></div>}
    <header className="site-header">
      <Link to="/" className="brand" aria-label="E'SHOE ATELIER home"><span>{'\n'}</span><span className="brand-atelier">{'\n'}</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation"><Link to="/collection" activeProps={{ className: 'nav-active' }}>Shoes</Link><Link to="/story" activeProps={{ className: 'nav-active' }}>Discover E'SHOE ATELIER</Link></nav>
      <div className="header-actions"><Button asChild variant="ghost" size="icon" aria-label="Search shoes"><Link to="/collection" hash="catalogue"><Search /></Link></Button><Button variant="ghost" size="icon" className="mobile-menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button></div>
    </header>
    {menu && <nav className="mobile-nav" aria-label="Mobile navigation"><Link to="/">Home</Link><Link to="/collection">The collection <ArrowUpRight /></Link><Link to="/story">Our story <ArrowUpRight /></Link></nav>}
    <main id="main" key={pathname} className="page-enter">{children}</main>
    <footer className="site-footer">
      <div className="footer-top"><div><BrandMark className="text-primary mb-6" /><Link to="/" className="footer-wordmark">E'SHOE ATELIER</Link><p>Elegance in Every Step.</p></div><div className="footer-links"><span className="eyebrow">THE ATELIER</span><Link to="/collection">The collection <ArrowUpRight size={14} /></Link><Link to="/story">Our story <ArrowUpRight size={14} /></Link><Button variant="link" onClick={() => setInformation(true)}>Reseller information <Plus size={14} /></Button></div><div className="footer-note"><span className="eyebrow">ROOTED IN SOUTH AFRICA</span><p>An independent eye.<br />A considered collection.<br />A love for the everyday extraordinary.</p></div></div>
      <div className="footer-bottom"><span>© 2026 E'SHOE ATELIER</span><span>Independent third-party footwear reseller.</span><span>ZAR · SOUTH AFRICA</span></div>
    </footer>
    <Dialog open={information} onOpenChange={setInformation}><DialogContent className="atelier-dialog"><DialogTitle className="font-editorial text-3xl">An independent atelier.</DialogTitle><DialogDescription className="leading-7">E'SHOE ATELIER is an independent third-party footwear reseller based in South Africa. We are not claiming an official partnership or affiliation with any manufacturer shown in the reference photographs.</DialogDescription><p className="text-sm text-muted-foreground leading-7">This collection is a photographic preview, not a live store. Product details, prices, availability, delivery terms and returns policies must be confirmed before orders open.</p></DialogContent></Dialog>
  </div>;
}

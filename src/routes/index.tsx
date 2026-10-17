import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUpRight, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AtelierLayout, BrandMark } from '@/components/atelier/layout';
import { CollectionGallery } from '@/components/atelier/collection-gallery';
import { pageHead } from '@/lib/collection';

export const Route = createFileRoute('/')({
  head: () => pageHead('Elegance in Every Step.', 'Discover E\'SHOE ATELIER, an independent South African footwear atelier. Considered silhouettes, a timeless perspective, and elegance in every step.', '/'),
  component: Index,
});
function Index() {
  return <AtelierLayout>
    <section className="atelier-hero" aria-labelledby="hero-title">
      <div className="hero-topline"><span className="eyebrow">ELEGANCE. COMFORT. CLASS.</span><span className="eyebrow">THE ATELIER / 2026</span></div>
      <div className="hero-stage"><h1 id="hero-title" className="hero-wordmark"><span>E'SHOE</span><span>ATELIER</span></h1><span className="hero-caption"><span className="caption-line" />A DIFFERENT KIND OF EVERYDAY.</span><span className="hero-coordinate">EST. 2026<br />SOUTH AFRICA</span></div>
      <div className="hero-bottom"><div><p className="hero-tagline">Elegance in Every Step.</p><p className="hero-support">Considered footwear. Unmistakably you.</p></div><Button asChild className="collection-cta"><Link to="/collection">Discover the collection <ArrowUpRight size={18} /></Link></Button></div>
      <a href="#selected" className="scroll-cue" aria-label="Scroll to selected silhouettes"><ArrowDown size={14} /><span>SCROLL TO DISCOVER</span></a>
    </section>
    <div className="values-strip"><span>ELEGANCE</span><BrandMark /><span>COMFORT</span><BrandMark /><span>CLASS</span><BrandMark /><span>INDEPENDENT BY NATURE</span></div>
    <section id="selected" className="section-wrap selected-section"><div className="section-heading"><div><span className="eyebrow text-primary">01 / THE COLLECTION</span><h2>Selected silhouettes.</h2></div><Link to="/collection" className="text-link">Explore all pieces <ArrowUpRight size={16} /></Link></div><CollectionGallery /><p className="preview-note">A first look at the collection. Reference photography; product details and availability to follow.</p></section>
    <section className="home-story section-wrap"><div className="story-years"><span>2011</span><span className="year-rule" /><span>2026</span><span className="eyebrow">AN IDEA. A JOURNEY. AN ATELIER.</span></div><div className="home-story-copy"><span className="eyebrow text-primary">02 / OUR STORY</span><h2>Some ideas<br />never leave you.</h2><p>First imagined in 2011. Brought to life in 2026. E'SHOE ATELIER began with a simple belief: elegance belongs in the everyday.</p><p>Today, that idea takes shape through an independent South African perspective on footwear — grounded in comfort, guided by integrity.</p><Link to="/story" className="text-link">Step into our story <MoveRight size={18} /></Link></div></section>
    <section className="closing-statement"><BrandMark className="text-primary" /><span className="eyebrow">THE E'SHOE ATELIER PERSPECTIVE</span><p>Not just what you wear.<br /><em>How you carry yourself.</em></p><Button asChild variant="outline"><Link to="/collection">Find your next step <ArrowUpRight /></Link></Button></section>
  </AtelierLayout>;
}

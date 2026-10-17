import { useState } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { collection, type CollectionPiece } from '@/lib/collection';

export function CollectionGallery({ filters = false }: { filters?: boolean }) {
  const [category, setCategory] = useState('All pieces');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CollectionPiece | null>(null);
  const [photo, setPhoto] = useState(0);
  const pieces = collection.filter(p => (category === 'All pieces' || p.category === category) && `${p.name} ${p.colour} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    {filters && <div className="collection-tools"><div className="filter-tabs" aria-label="Filter collection">{['All pieces', 'Sneakers', 'Slides'].map(c => <Button key={c} variant="ghost" className={category === c ? 'filter-active' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</Button>)}</div><div className="collection-search"><Search size={16} /><input aria-label="Search collection" placeholder="Find your silhouette" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button size="icon" variant="ghost" aria-label="Clear search" onClick={() => setQuery('')}><X /></Button>}</div></div>}
    <div className="product-grid">{pieces.map(piece => <article key={piece.id} className="product-piece"><Button variant="ghost" className="product-image-button" aria-label={`View ${piece.name}`} onClick={() => { setSelected(piece); setPhoto(0); }}><span className="piece-number">N° {piece.id}</span><img src={piece.images[0]} alt={`${piece.colour} ${piece.category.toLowerCase()} reference photograph`} loading="lazy" /><span className="piece-open"><ArrowUpRight size={20} /></span></Button><div className="piece-meta"><div><span className="eyebrow">{piece.category} / {piece.colour}</span><h3>{piece.name}</h3></div><span className="piece-status">Collection preview</span></div></article>)}</div>
    {pieces.length === 0 && <div className="empty-collection"><p>No pieces found.</p><Button variant="link" onClick={() => { setQuery(''); setCategory('All pieces'); }}>View all pieces <ArrowRight /></Button></div>}
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="gallery-dialog atelier-dialog">{selected && <><div className="gallery-photo"><img src={selected.images[photo]} alt={`${selected.name}, view ${photo + 1}`} /><div className="gallery-controls"><Button variant="outline" size="icon" aria-label="Previous photograph" onClick={() => setPhoto((photo - 1 + selected.images.length) % selected.images.length)}><ArrowLeft /></Button><span>{photo + 1} / {selected.images.length}</span><Button variant="outline" size="icon" aria-label="Next photograph" onClick={() => setPhoto((photo + 1) % selected.images.length)}><ArrowRight /></Button></div></div><span className="eyebrow text-primary">{selected.category} / {selected.colour}</span><DialogTitle className="font-editorial text-3xl">{selected.name}</DialogTitle><DialogDescription>Reference photography · Collection preview</DialogDescription><p className="text-sm text-muted-foreground leading-6">Product specifications, pricing, sizes and availability are not yet confirmed. This piece is not currently available to order.</p></>}</DialogContent></Dialog>
  </>;
}

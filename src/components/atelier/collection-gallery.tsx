import { useState } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight, Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { collection, formatPrice, type CollectionPiece } from '@/lib/collection';
import { useSuspenseQuery } from '@tanstack/react-query';
import { pricesQuery } from '../../lib/prices-query';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productForPiece, shopifyProductsQuery } from '../../lib/shopify';
import { useCartStore } from '../../stores/cart-store';

export function CollectionGallery({ filters = false }: { filters?: boolean }) {
  const { data: prices } = useSuspenseQuery(pricesQuery);
  const [category, setCategory] = useState('All pieces');
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [colour, setColour] = useState('All colours');
  const [sort, setSort] = useState('Featured');
  const [selected, setSelected] = useState<CollectionPiece | null>(null);
  const [photo, setPhoto] = useState(0);
  const [size, setSize] = useState('');
  const { data: shopProducts = [] } = useQuery(shopifyProductsQuery);
  const addItem = useCartStore(s => s.addItem);
  const adding = useCartStore(s => s.isLoading);
  const priceFor = (id: string) => { const v = productForPiece(shopProducts, id)?.variants[0]; return v ? formatPrice(parseFloat(v.price.amount)) : formatPrice(prices[id]); };
  const open = (piece: CollectionPiece) => { setSelected(piece); setPhoto(0); setSize(''); };
  const selectedProduct = selected ? productForPiece(shopProducts, selected.id) : undefined;
  const addToBag = async () => {
    const variant = selectedProduct?.variants.find(v => v.selectedOptions.some(o => o.value === size));
    const image = selected?.images[0];
    if (!selected || !variant || !image) return;
    const ok = await addItem({ variantId: variant.id, title: selected.name, size, image, price: variant.price, quantity: 1 });
    if (ok) { toast.success('Added to your bag', { description: `${selected.name} · ${size}`, position: 'top-center' }); setSelected(null); }
  };
  const pieces = collection.filter(p => (category === 'All pieces' || p.category === category) && (colour === 'All colours' || p.colour === colour) && `${p.name} ${p.colour} ${p.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'Name A–Z' ? a.name.localeCompare(b.name) : sort === 'Name Z–A' ? b.name.localeCompare(a.name) : a.id.localeCompare(b.id));
  return <>
    {filters && <div className="collection-tools"><div className="filter-tabs" aria-label="Filter collection">{['All pieces', 'Sneakers', 'Slides', 'Mules'].map(c => <Button key={c} variant="ghost" className={category === c ? 'filter-active' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c === 'All pieces' ? 'All Shoes' : c}</Button>)}</div><div className="catalogue-toolbar"><span aria-live="polite">{pieces.length} {pieces.length === 1 ? 'Item' : 'Items'}</span><div className="catalogue-toolbar-controls"><Button variant="ghost" aria-expanded={filterOpen} onClick={() => setFilterOpen(!filterOpen)}>Filter <SlidersHorizontal size={13} /></Button><span aria-hidden="true">|</span><select aria-label="Sort collection" value={sort} onChange={e => setSort(e.target.value)}><option value="Featured">Sort By</option><option>Name A–Z</option><option>Name Z–A</option></select></div></div>{filterOpen && <div className="filter-panel"><select aria-label="Filter by colour" value={colour} onChange={e => setColour(e.target.value)}><option>All colours</option><option>Black</option><option>Olive</option><option>Blue</option><option>Grey</option><option>Beige</option></select><div className="collection-search"><Search size={16} /><input aria-label="Search collection" placeholder="Search shoes" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button size="icon" variant="ghost" aria-label="Clear search" onClick={() => setQuery('')}><X /></Button>}</div><Button variant="link" onClick={() => { setQuery(''); setColour('All colours'); setCategory('All pieces'); }}>Reset</Button></div>}</div>}
    <div className="product-grid">{pieces.map(piece => <article key={piece.id} className="product-piece"><Button variant="ghost" className="product-image-button" aria-label={`View ${piece.name}`} onClick={() => open(piece)}><span className="piece-number">N° {piece.id}</span><img src={piece.images[0]} alt={`${piece.colour} ${piece.category.toLowerCase()} reference photograph`} loading="lazy" /><span className="piece-open"><ArrowUpRight size={20} /></span></Button><div className="piece-meta"><div><span className="eyebrow">{piece.category} / {piece.colour}</span><h3>{piece.name}</h3><p className="product-price">{priceFor(piece.id)}</p></div><Button className="piece-select" onClick={() => open(piece)}>Select</Button></div></article>)}</div>
    {pieces.length === 0 && <div className="empty-collection"><p>No pieces found.</p><Button variant="link" onClick={() => { setQuery(''); setColour('All colours'); setCategory('All pieces'); }}>View all pieces <ArrowRight /></Button></div>}
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="gallery-dialog atelier-dialog">{selected && <><div className="gallery-photo"><img src={selected.images[photo]} alt={`${selected.name}, view ${photo + 1}`} /><div className="gallery-controls"><Button variant="outline" size="icon" aria-label="Previous photograph" onClick={() => setPhoto((photo - 1 + selected.images.length) % selected.images.length)}><ArrowLeft /></Button><span>{photo + 1} / {selected.images.length}</span><Button variant="outline" size="icon" aria-label="Next photograph" onClick={() => setPhoto((photo + 1) % selected.images.length)}><ArrowRight /></Button></div></div><span className="eyebrow text-primary">{selected.category} / {selected.colour}</span><DialogTitle className="font-editorial text-3xl">{selected.name}</DialogTitle><DialogDescription>Reference photography · Collection preview</DialogDescription><p className="product-price">{priceFor(selected.id)}</p>{selectedProduct ? <><div className="size-picker" role="group" aria-label="Choose your size">{selectedProduct.variants.map(v => { const val = v.selectedOptions.find(o => o.name === 'Size')?.value ?? v.title; return <Button key={v.id} variant="outline" size="sm" disabled={!v.availableForSale} aria-pressed={size === val} className={size === val ? 'size-active' : ''} onClick={() => setSize(val)}>{val}</Button>; })}</div><Button className="piece-select" disabled={!size || adding} onClick={addToBag}>{adding ? 'Adding…' : size ? 'Add to Cart' : 'Choose a size'}</Button></> : <p className="text-sm text-muted-foreground">Loading sizes…</p>}</>}</DialogContent></Dialog>
  </>;
}

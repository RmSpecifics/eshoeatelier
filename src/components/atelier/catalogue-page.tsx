import cover from '../../assets/atelier-cinematic-cover.jpg';
import { ArrowDownRight } from 'lucide-react';
import { Button } from '../ui/button';
import { CollectionGallery } from '@/components/atelier/collection-gallery';

export function CataloguePage() {
  return <>
    <section className="catalogue-cover catalogue-cover--cinematic" aria-label="E'SHOE ATELIER">
      <img src={cover} alt="Grey Nike Dunk on a stone plinth in a softly lit atelier" fetchPriority="high" />
      <div className="cinematic-copy"><span className="cinematic-eyebrow">AN INDEPENDENT SOUTH AFRICAN ATELIER</span><h1 id="collection-title">E'SHOE<br /><em>ATELIER</em></h1><p>Elegance in Every Step.</p><Button asChild variant="outline" className="cover-enter"><a href="#catalogue">Enter the collection <ArrowDownRight size={18} /></a></Button></div>
      <div className="cinematic-caption"><span>THE ART OF THE EVERYDAY</span><span>01 — THE COLLECTION</span></div>
    </section>
    <section id="catalogue" aria-label="Footwear collection"><CollectionGallery filters /><p className="preview-note">Photographic collection preview. Sizes and availability are confirmed with your order request. No payment is taken online.</p></section>
  </>;
}
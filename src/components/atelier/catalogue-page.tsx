import cover from '@/assets/atelier-cover.png.asset.json';
import { CollectionGallery } from '@/components/atelier/collection-gallery';

export function CataloguePage() {
  return <>
    <section className="catalogue-cover" aria-labelledby="collection-title">
      <img src={cover.url} alt="E'SHOE ATELIER logo on ivory with soft leaf shadows" fetchPriority="high" />
      <div className="cover-copy"><h1 id="collection-title">All Shoes Collection</h1><p>Explore sneakers, slides and mules through an independent South African perspective. Considered silhouettes, everyday comfort and understated style.</p><p className="cover-tagline">Elegance in Every Step.</p></div>
    </section>
    <section id="catalogue" aria-label="Footwear collection"><CollectionGallery filters /><p className="preview-note">Photographic collection preview. Prices, sizes and availability are not yet confirmed. Orders are not yet open.</p></section>
  </>;
}
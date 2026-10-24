import cover from '@/assets/atelier-black-cover.png.asset.json';
import { CollectionGallery } from '@/components/atelier/collection-gallery';

export function CataloguePage() {
  return <>
    <section className="catalogue-cover catalogue-cover--brand" aria-label="E'SHOE ATELIER">
      <img src={cover.url} alt="ATELIER logo on black with the words More than shoes. A lifestyle." fetchPriority="high" />
      <div className="cover-copy"><h1 id="collection-title">{"\n"}</h1><p>{"\n"}</p><p className="cover-tagline">Elegance in Every Step.</p></div>
    </section>
    <section id="catalogue" aria-label="Footwear collection"><CollectionGallery filters /><p className="preview-note">Photographic collection preview. Prices, sizes and availability are not yet confirmed. Orders are not yet open.</p></section>
  </>;
}
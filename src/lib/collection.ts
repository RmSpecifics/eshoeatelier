import sneaker from '@/assets/sneaker.png.asset.json';
import sneakerFront from '@/assets/sneaker-front.png.asset.json';
import sneakerSide from '@/assets/sneaker-side.png.asset.json';
import olive from '@/assets/olive-slide.png.asset.json';
import oliveTop from '@/assets/olive-top.png.asset.json';
import slide from '@/assets/black-slide.png.asset.json';
import slidePair from '@/assets/black-pair.png.asset.json';
import vomeroPair from '@/assets/vomero-roam-pair.png.asset.json';
import vomeroTop from '@/assets/vomero-roam-top.png.asset.json';
import vomeroSide from '@/assets/vomero-roam-side.png.asset.json';
import dunkPair from '@/assets/dunk-grey-pair.png.asset.json';
import dunkTop from '@/assets/dunk-grey-top.png.asset.json';
import dunkSide from '@/assets/dunk-grey-side.png.asset.json';
import muleBlackPair from '@/assets/adidas-mule-black-pair.png.asset.json';
import muleBlackTop from '@/assets/adidas-mule-black-top.png.asset.json';
import muleBlackSide from '@/assets/adidas-mule-black-side.png.asset.json';
import muleBeigePair from '@/assets/adidas-mule-beige-pair.png.asset.json';

export type CollectionPiece = { id: string; name: string; price?: number; category: 'Sneakers' | 'Slides' | 'Mules'; colour: string; images: string[] };
export const collection: CollectionPiece[] = [
  { id: '01', name: 'Chritian Louboutin', price: 8000, category: 'Sneakers', colour: 'Black', images: [sneaker.url, sneakerFront.url, sneakerSide.url] },
  { id: '02', name: 'Mens Diesel Slides', price: 1560, category: 'Slides', colour: 'Olive', images: [olive.url, oliveTop.url] },
  { id: '03', name: 'Mens Diesel Slides', price: 1560, category: 'Slides', colour: 'Black', images: [slide.url, slidePair.url] },
  { id: '04', name: 'Nike Vomero Roam', price: 1750, category: 'Sneakers', colour: 'Blue', images: [vomeroPair.url, vomeroTop.url, vomeroSide.url] },
  { id: '05', name: 'Nike Dunk Low', price: 1500, category: 'Sneakers', colour: 'Grey', images: [dunkPair.url, dunkTop.url, dunkSide.url] },
  { id: '06', name: 'Adidas mule', price: 1450, category: 'Mules', colour: 'Black', images: [muleBlackPair.url, muleBlackTop.url, muleBlackSide.url] },
  { id: '07', name: 'Adidas mule', price: 1450, category: 'Mules', colour: 'Beige', images: [muleBeigePair.url] },
];
export function pageHead(title: string, description: string, path: string) {
  return { meta: [{ title: `${title} — E'SHOE ATELIER` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — E'SHOE ATELIER` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:url', content: path }, { name: 'twitter:card', content: 'summary_large_image' }], links: [{ rel: 'canonical', href: path }] };
}
// Prices in ZAR: leave undefined until the owner confirms them (shown as "Price on request").
export const SIZES = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
export const formatPrice = (p?: number) => (p === undefined ? 'Price on request' : `R${p.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

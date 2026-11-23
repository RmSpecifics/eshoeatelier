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
import nbSide from '@/assets/nb-1906r-side.jpeg.asset.json';
import nbTop from '@/assets/nb-1906r-top.jpeg.asset.json';
import nbPair from '@/assets/nb-1906r-pair.jpeg.asset.json';
import timberlandSide from '@/assets/timberland-boot-side.jpeg.asset.json';
import timberlandPair from '@/assets/timberland-boot-pair.jpeg.asset.json';
import timberlandTop from '@/assets/timberland-boot-top.jpeg.asset.json';
import asicsSide from '@/assets/asics-kayano-side.jpeg.asset.json';
import asicsPair from '@/assets/asics-kayano-pair.jpeg.asset.json';
import asicsSole from '@/assets/asics-kayano-sole.jpeg.asset.json';
import bapeSide from '@/assets/bape-crocs-side.jpeg.asset.json';
import bapePair from '@/assets/bape-crocs-pair.jpeg.asset.json';
import bapeHeel from '@/assets/bape-crocs-heel.jpeg.asset.json';
import bapePinkSide from '@/assets/bape-pink-crocs-side.jpeg.asset.json';
import bapePinkTop from '@/assets/bape-pink-crocs-top.jpeg.asset.json';
import bapePinkPair from '@/assets/bape-pink-crocs-pair.jpeg.asset.json';
import pumaFront from '@/assets/puma-speedcat-front.jpeg.asset.json';
import pumaSide from '@/assets/puma-speedcat-side.jpeg.asset.json';
import pumaTop from '@/assets/puma-speedcat-top.jpeg.asset.json';
import pumaRedSide from '@/assets/puma-speedcat-red-side.jpeg.asset.json';
import pumaRedFront from '@/assets/puma-speedcat-red-front.jpeg.asset.json';
import pumaRedPair from '@/assets/puma-speedcat-red-pair.jpeg.asset.json';
import nikeP6000Side from '@/assets/nike-p6000-side.jpeg.asset.json';
import nikeP6000Pair from '@/assets/nike-p6000-pair.jpeg.asset.json';
import nikeP6000Heel from '@/assets/nike-p6000-heel.jpeg.asset.json';
import nikeP6000BlackSide from '@/assets/nike-p6000-black-side.jpeg.asset.json';
import nikeP6000BlackPair from '@/assets/nike-p6000-black-pair.jpeg.asset.json';
import nikeP6000BlackHeel from '@/assets/nike-p6000-black-heel.jpeg.asset.json';
import nikeAm95Side from '@/assets/nike-am95-pink-side.jpeg.asset.json';
import nikeAm95Pair from '@/assets/nike-am95-pink-pair.jpeg.asset.json';
import nikeAm95Front from '@/assets/nike-am95-pink-front.jpeg.asset.json';

export type CollectionPiece = { id: string; name: string; price?: number; category: 'Sneakers' | 'Slides' | 'Mules' | 'Boots' | 'Clogs'; colour: string; images: string[] };
export const collection: CollectionPiece[] = [
  { id: '01', name: 'Christian Louboutin', price: 8000, category: 'Sneakers', colour: 'Black', images: [sneaker.url, sneakerFront.url, sneakerSide.url] },
  { id: '02', name: 'Mens Diesel Slides', price: 1360, category: 'Slides', colour: 'Olive', images: [olive.url, oliveTop.url] },
  { id: '03', name: 'Mens Diesel Slides', price: 1360, category: 'Slides', colour: 'Black', images: [slide.url, slidePair.url] },
  { id: '04', name: 'Nike Vomero Roam', price: 1750, category: 'Sneakers', colour: 'Blue', images: [vomeroPair.url, vomeroTop.url, vomeroSide.url] },
  { id: '05', name: 'Nike Dunk Low', price: 1500, category: 'Sneakers', colour: 'Grey', images: [dunkPair.url, dunkTop.url, dunkSide.url] },
  { id: '06', name: 'Adidas mule', price: 1450, category: 'Mules', colour: 'Black', images: [muleBlackPair.url, muleBlackTop.url, muleBlackSide.url] },
  { id: '07', name: 'Adidas mule', price: 1450, category: 'Mules', colour: 'Beige', images: [muleBeigePair.url] },
  { id: '08', name: "New Balance Men's 1906R", price: 1900, category: 'Sneakers', colour: 'White', images: [nbSide.url, nbTop.url, nbPair.url] },
  { id: '09', name: "Timberland 6 Inch Premium Waterproof Lace-Up Boots", price: 2600, category: 'Boots', colour: 'Black', images: [timberlandSide.url, timberlandPair.url, timberlandTop.url] },
  { id: '10', name: 'Asics Gel-Kayano', price: 1800, category: 'Sneakers', colour: 'Silver', images: [asicsSide.url, asicsPair.url, asicsSole.url] },
  { id: '11', name: 'APE x Crocs M9 A Bathing Ape ABC Camo Blue Classic Clogs', category: 'Clogs', colour: 'Blue', images: [bapeSide.url, bapePair.url, bapeHeel.url] },
  { id: '12', name: 'BAPE x Crocs M9 A Bathing Ape ABC Camo Pink Classic Clogs', category: 'Clogs', colour: 'Pink', images: [bapePinkSide.url, bapePinkTop.url, bapePinkPair.url] },
  { id: '13', name: 'Puma Speedcat OG Low-Top', price: 1600, category: 'Sneakers', colour: 'Pink', images: [pumaFront.url, pumaSide.url, pumaTop.url] },
  { id: '14', name: 'Puma Speedcat OG Low-Top', price: 1600, category: 'Sneakers', colour: 'Red', images: [pumaRedSide.url, pumaRedFront.url, pumaRedPair.url] },
  { id: '15', name: "Nike P-6000 Women's", price: 1400, category: 'Sneakers', colour: 'Silver', images: [nikeP6000Side.url, nikeP6000Pair.url, nikeP6000Heel.url] },
  { id: '16', name: 'Nike P-6000', price: 1700, category: 'Sneakers', colour: 'Black', images: [nikeP6000BlackSide.url, nikeP6000BlackPair.url, nikeP6000BlackHeel.url] },
  { id: '17', name: "Nike Air Max 95 'Pink Foam'", price: 1600, category: 'Sneakers', colour: 'Pink', images: [nikeAm95Side.url, nikeAm95Pair.url, nikeAm95Front.url] },
];
export function pageHead(title: string, description: string, path: string) {
  return { meta: [{ title: `${title} — E'SHOE ATELIER` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — E'SHOE ATELIER` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:url', content: path }, { name: 'twitter:card', content: 'summary_large_image' }], links: [{ rel: 'canonical', href: path }] };
}
// Prices in ZAR: leave undefined until the owner confirms them (shown as "Price on request").
export const SIZES = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];
export const formatPrice = (p?: number) => {
  if (p === undefined) return 'Price on request';
  const [whole = '0', cents = '00'] = p.toFixed(2).split('.');
  return `R${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${cents}`;
};

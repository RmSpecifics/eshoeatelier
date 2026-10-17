import sneaker from '@/assets/sneaker.png.asset.json';
import sneakerFront from '@/assets/sneaker-front.png.asset.json';
import sneakerSide from '@/assets/sneaker-side.png.asset.json';
import olive from '@/assets/olive-slide.png.asset.json';
import oliveTop from '@/assets/olive-top.png.asset.json';
import slide from '@/assets/black-slide.png.asset.json';
import slidePair from '@/assets/black-pair.png.asset.json';

export type CollectionPiece = { id: string; name: string; category: 'Sneakers' | 'Slides'; colour: string; images: string[] };
export const collection: CollectionPiece[] = [
  { id: '01', name: 'The black sneaker', category: 'Sneakers', colour: 'Black', images: [sneaker.url, sneakerFront.url, sneakerSide.url] },
  { id: '02', name: 'The olive slide', category: 'Slides', colour: 'Olive', images: [olive.url, oliveTop.url] },
  { id: '03', name: 'The black slide', category: 'Slides', colour: 'Black', images: [slide.url, slidePair.url] },
];
export function pageHead(title: string, description: string, path: string) {
  return { meta: [{ title: `${title} — E'SHOE ATELIER` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — E'SHOE ATELIER` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:url', content: path }, { name: 'twitter:card', content: 'summary_large_image' }], links: [{ rel: 'canonical', href: path }] };
}

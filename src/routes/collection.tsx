import { createFileRoute } from '@tanstack/react-router';
import { AtelierLayout } from '@/components/atelier/layout';
import { CataloguePage } from '../components/atelier/catalogue-page';
import { pageHead } from '@/lib/collection';
import { pricesQuery } from '../lib/prices-query';
export const Route = createFileRoute('/collection')({ loader: ({ context }) => context.queryClient.ensureQueryData(pricesQuery), head: () => pageHead('The Collection', "Explore the E'SHOE ATELIER photographic footwear collection: sneakers, understated slides and mules. Prices and availability to be confirmed.", '/collection'), component: Collection });
function Collection() { return <AtelierLayout catalogue><CataloguePage /></AtelierLayout>; }

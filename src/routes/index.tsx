import { createFileRoute } from '@tanstack/react-router';
import { AtelierLayout } from '@/components/atelier/layout';
import { CataloguePage } from '../components/atelier/catalogue-page';
import { pageHead } from '@/lib/collection';
import { pricesQuery } from '../lib/prices-query';
export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(pricesQuery),
  head: () => pageHead('Shoes Collection', "Explore E'SHOE ATELIER’s South African footwear collection. Elegance in Every Step. Sneakers, slides and mules in a photographic preview.", '/'),
  component: Index,
});
function Index() { return <AtelierLayout catalogue><CataloguePage /></AtelierLayout>; }

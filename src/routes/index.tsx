import { createFileRoute } from '@tanstack/react-router';
import { AtelierLayout } from '@/components/atelier/layout';
import { CataloguePage } from '../components/atelier/catalogue-page';
import { pageHead } from '@/lib/collection';
export const Route = createFileRoute('/')({
  head: () => pageHead('Shoes Collection', "Explore E'SHOE ATELIER’s South African footwear collection. Elegance in Every Step. Sneakers and slides in a photographic preview.", '/'),
  component: Index,
});
function Index() { return <AtelierLayout catalogue><CataloguePage /></AtelierLayout>; }

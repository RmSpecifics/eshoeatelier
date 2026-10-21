import { createFileRoute } from '@tanstack/react-router';
import { AtelierLayout } from '@/components/atelier/layout';
import { CataloguePage } from '../components/atelier/catalogue-page';
import { pageHead } from '@/lib/collection';
export const Route = createFileRoute('/collection')({ head: () => pageHead('The Collection', "Explore the E'SHOE ATELIER photographic footwear collection: black sneakers and understated slides. Prices and availability to be confirmed.", '/collection'), component: Collection });
function Collection() { return <AtelierLayout catalogue><CataloguePage /></AtelierLayout>; }

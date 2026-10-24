import { queryOptions } from '@tanstack/react-query';
import { getPrices } from './prices.functions';
export const pricesQuery = queryOptions({ queryKey: ['product-prices'], queryFn: () => getPrices(), staleTime: 0 });
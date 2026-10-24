// Shopify Storefront API (public storefront token — safe in browser code).
export const SHOPIFY_API_VERSION = '2026-10';
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'eshoeatelier-fckmi-s2kqwrkr.myshopify.com';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = 'ff62cea68ec551f6306963efdab282f0';

export type Money = { amount: string; currencyCode: string };
export type ShopifyVariant = { id: string; title: string; price: Money; availableForSale: boolean; selectedOptions: { name: string; value: string }[] };
export type ShopifyProduct = { id: string; title: string; handle: string; tags: string[]; image: string | null; variants: ShopifyVariant[] };

export class ShopifyPaymentRequired extends Error {}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) throw new ShopifyPaymentRequired('Shopify store needs an active plan');
  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors.map((e: { message: string }) => e.message).join(', '));
  return data;
}

const PRODUCTS_QUERY = `query GetProducts($first: Int!) { products(first: $first) { edges { node {
  id title handle tags images(first: 1) { edges { node { url } } }
  variants(first: 50) { edges { node { id title availableForSale price { amount currencyCode } selectedOptions { name value } } } }
} } } }`;

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
  return data.data.products.edges.map(({ node }: any) => ({
    id: node.id, title: node.title, handle: node.handle, tags: node.tags,
    image: node.images.edges[0]?.node.url ?? null,
    variants: node.variants.edges.map((e: any) => e.node),
  }));
}

/** Each Shopify product is tagged `piece-XX` to link it to a collection piece. */
export const productForPiece = (products: ShopifyProduct[], pieceId: string) => products.find(p => p.tags.includes(`piece-${pieceId}`));

export const shopifyProductsQuery = { queryKey: ['shopify-products'], queryFn: fetchShopifyProducts, staleTime: 60_000 };

const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;
const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };
const notFound = (errs: UserError[]) => errs.some(e => /cart not found|does not exist/i.test(e.message));

export function formatCheckoutUrl(checkoutUrl: string) {
  try { const url = new URL(checkoutUrl); url.searchParams.set('channel', 'online_store'); return url.toString(); } catch { return checkoutUrl; }
}

export async function createShopifyCart(variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_CREATE, { input: { lines: [{ quantity, merchandiseId: variantId }] } });
  const res = data.data.cartCreate;
  if (res.userErrors.length) return null;
  const lineId = res.cart?.lines.edges[0]?.node.id;
  if (!res.cart?.checkoutUrl || !lineId) return null;
  return { cartId: res.cart.id as string, checkoutUrl: formatCheckoutUrl(res.cart.checkoutUrl), lineId: lineId as string };
}
export async function addLineToShopifyCart(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_ADD, { cartId, lines: [{ quantity, merchandiseId: variantId }] });
  const errs = data.data.cartLinesAdd.userErrors;
  if (notFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  const line = data.data.cartLinesAdd.cart.lines.edges.find((l: any) => l.node.merchandise.id === variantId);
  return { success: true, lineId: line?.node.id as string | undefined };
}
export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });
  const errs = data.data.cartLinesUpdate.userErrors;
  return notFound(errs) ? { success: false, cartNotFound: true } : { success: errs.length === 0 };
}
export async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_REMOVE, { cartId, lineIds: [lineId] });
  const errs = data.data.cartLinesRemove.userErrors;
  return notFound(errs) ? { success: false, cartNotFound: true } : { success: errs.length === 0 };
}
export async function fetchCartQuantity(cartId: string) {
  const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
  return (data.data.cart?.totalQuantity as number | undefined) ?? 0;
}

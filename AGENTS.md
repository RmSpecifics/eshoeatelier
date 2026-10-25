<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application structure
- Store owner-entered ZAR prices in product_prices with public read and admin-role-only writes; use one shared price query across catalogue, pricing and checkout so totals stay consistent.
- Keep shared atelier navigation and footer in a reusable layout and each content section in its own TanStack route, so navigation remains explicit and page metadata stays independent.
- Keep reference footwear data in a browser-safe module and mark it as preview-only until confirmed product records exist; never infer prices, brands, stock or checkout availability from photographs.
- Store owner-uploaded photographs as Lovable Assets pointers and keep presentation motion in semantic-token CSS with reduced-motion fallbacks.

- Reuse the catalogue presentation on the home and collection routes, keeping product filtering and photo dialogs shared to prevent divergent catalogue behavior.
- Submit checkout requests through a validated server function and send a fixed owner notification via the managed email helper; only show success after an accepted send, and derive idempotency from the submission ID to avoid duplicate notifications.
- Keep email templates in the scaffolded registry and delivery managed by Lovable without email tables or queues; checkout remains an unpaid order request until a payment service is connected.
- Take online payment through the connected Shopify store: each collection piece links to a Shopify product tagged piece-XX, the bag syncs a Storefront API cart, and checkout opens Shopify's hosted checkout in a new tab; Shopify product prices are what customers are charged.
- Access the linked Microsoft Excel account only through server-side connector gateway calls; keep its connection credentials out of browser code.

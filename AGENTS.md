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
- Keep shared atelier navigation and footer in a reusable layout and each content section in its own TanStack route, so navigation remains explicit and page metadata stays independent.
- Keep reference footwear data in a browser-safe module and mark it as preview-only until confirmed product records exist; never infer prices, brands, stock or checkout availability from photographs.
- Store owner-uploaded photographs as Lovable Assets pointers and keep presentation motion in semantic-token CSS with reduced-motion fallbacks.

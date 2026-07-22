# Pickup & Go

Read this file first. It's written for a fresh Claude Code session with zero
prior context on this repo — it should be enough to start making correct
changes immediately, without re-deriving the architecture from scratch.

## What this is

`hpcresources-pearc26` is a static resource directory for the **ACM PEARC26
Student Program**, built by HackHPC. It's a GitHub Pages site: push to
`main`, GitHub builds and deploys it automatically, no CI config needed.

There is exactly **one page**. Until 2026-07-22 it was one giant `index.html`
file; it's now assembled from `index.html` (a thin shell) plus Jekyll
`_includes/*.html` partials, `assets/js/*.js`, and `assets/css/main.css` —
see "File map" and "How the page is assembled" below for exactly how that
split works. Conceptually it's still four client-side tabs, toggled with no
page reload or URL change:

- **Resource Directory** (`#tab-directory`) — searchable/filterable
  directory of HPC communities, funding, training, conferences, and career
  resources.
- **Connected Mentors** (`#tab-mentors`) — mentor roster + signup form.
- **Groundwork for Greatness** (`#tab-speakers`) — speaker bios for the
  morning speaker series.
- **FAQ** (`#tab-faq`) — static `<details>/<summary>` accordion explaining
  how to use every feature on the page (search, filters, sort, badges,
  single/multi-resource sharing, suggesting a resource, mentors, speakers).
  No JS needed for the accordion itself — `<details>` is a native HTML
  element. It embeds four screenshots (see `assets/screenshots/` below).
  This is documentation *for site visitors*, not for future Claude
  sessions — don't confuse it with this file. It also ends with a "Still
  Need Help?" support-question form (`#support-form`) that follows the
  exact same GitHub-Issue-on-submit pattern as "Suggest a Resource" — see
  the bullet on that pattern further down.

There used to be a second standalone page, `speakers.html`, for the speaker
bios — it was merged into `index.html` as a third tab (to match how
Connected Mentors already worked) and deleted. If you find a stray reference
to `speakers.html` anywhere (a link, a doc, an old bookmark), it's stale —
point it at `index.html` and let the tab button handle it.

There is no separate frontend build step, no npm, no bundler beyond Ruby's
Bundler for Jekyll itself. Tailwind is loaded from a CDN (`cdn.tailwindcss.com`)
and configured in `assets/js/tailwind-config.js`, a plain static JS file
(no Liquid in it — see below).

## How the page is assembled

1. Front matter `layout: null` on `index.html` — Jekyll processes Liquid in
   the file but doesn't wrap it in a theme layout.
2. `index.html` itself is now just a **thin shell**: the `<head>`, `<body>`
   open tag (with one important data attribute, see below), and a sequence
   of `{% include ... %}` tags pulling in `_includes/head.html`,
   `_includes/site-header.html`, one `_includes/tab-*.html` per tab,
   `_includes/site-footer.html`, and the two modal partials
   (`_includes/suggest-modal.html`, `_includes/share-multiple-modal.html`).
   Jekyll inlines each include's content at build time — the built
   `_site/index.html` is one normal complete HTML file, same as before the
   split; only the *source* is now spread across files.
3. **Why `_includes` and not separate pages**: these are partials, not
   routable pages — `{% include %}` just splices HTML text in at build
   time, there's no client-side routing, no separate URL per tab. This is
   different from the earlier `speakers.html` situation (a real second
   page that got merged into a tab) — `_includes/tab-speakers.html` is not
   a page, it's a chunk of `index.html`'s markup that lives in its own file
   purely for editability.
4. **`assets/js/app.js`** is the single vanilla-JS IIFE with essentially
   all client-side behavior — state, rendering, filtering, sharing, forms,
   tabs. It's a **plain static file with zero Liquid in it**, loaded via
   `<script src="{{ site.baseurl }}/assets/js/app.js">` near the end of
   `<body>`, in the same position the inline `<script>` used to occupy —
   execution order/timing is unchanged. Because it can't use `{{ site.baseurl
   }}` directly (Jekyll doesn't process Liquid in `.js` files without front
   matter, and this one intentionally has none, to keep it a boring static
   asset), `index.html`'s `<body>` tag carries
   `data-baseurl="{{ site.baseurl }}"`, and `app.js` reads it once at the
   top: `const SITE_BASEURL = document.body.dataset.baseurl || '';`. If you
   ever need another Jekyll variable inside `app.js`, extend that one data
   attribute rather than adding Liquid front matter to the JS file — keeping
   `app.js` build-tool-free is deliberate.
5. **`assets/js/tailwind-config.js`** is similarly static and Liquid-free —
   it only sets `tailwind.config = {...}` (fonts, the `pearc` color
   palette), which doesn't need any site data. It's loaded via
   `<script src>` immediately after the Tailwind CDN `<script src>` tag in
   `_includes/head.html` — order matters here (the CDN script must run
   first to create the global `tailwind` object), and both are plain
   blocking `<script src>` tags (no `defer`/`async`), so document order is
   sufficient to guarantee it.
6. **`assets/css/main.css`** holds the handful of custom rules Tailwind's
   utility classes can't express (the `brand-bar` gradient, the
   `clamp-desc` line-clamp, the pulse/glow keyframe animations, etc.) —
   also static, loaded via a plain `<link rel="stylesheet">`.
7. Data lives in `_data/*.csv` or `_data/*.yml`. Jekyll parses these at
   **build time** and exposes them as `site.data.<filename-without-extension>`.
8. Each dataset is embedded as JSON in its own
   `<script type="application/json">` tag via
   `{{ site.data.whatever | jsonify | replace: "</", "<\/" }}` — the
   `replace` guards against a literal `</script>` inside a description
   breaking out of the tag. There are three: `#resource-data`,
   `#mentor-data`, `#speaker-data`. These three tags **stayed inline in
   `index.html`** rather than moving into an include or `app.js` — they're
   Jekyll-templated output, not reusable markup or static logic, so neither
   move made sense; they're the one place left where `index.html` still
   contains real page-specific content instead of pure assembly.
9. `app.js` reads each JSON blob with
   `JSON.parse(document.getElementById('...').textContent)` and renders it
   client-side into that tab's markup (card grid, mentor grid, or speaker
   list). No runtime fetch, no CSV/YAML parsing in the browser — Jekyll
   already did that at build time. All three tabs' data loads eagerly on
   `DOMContentLoaded` regardless of which tab is visible — switching tabs
   only toggles a `hidden` class, it doesn't lazy-load anything.

This means: **to change what data appears, edit the file in `_data/`, not
the HTML.** The HTML/JS only needs to change if you're changing *how*
something renders, adding a new data file, or changing page
structure/behavior.

## File map

```
_config.yml                                  Jekyll site config (title, description, exclude list)
Gemfile / Gemfile.lock                       Ruby deps (Gemfile.lock is gitignored — see "Local dev" below)
_data/
  PEARC26-HPCResourceList-FullList.csv       Resource directory data → "Resource Directory" tab
  mentors.csv                                Connected Mentors roster → "Connected Mentors" tab
  speakers.yml                               Groundwork for Greatness speaker bios → "Groundwork for Greatness" tab
_includes/
  head.html                                  <head> contents: meta/OG/Twitter tags, fonts, Tailwind CDN + config, main.css link
  site-header.html                           Brand stripe, top banner, header, and the 4-tab nav
  tab-directory.html                         "Resource Directory" tab panel markup
  tab-mentors.html                           "Connected Mentors" tab panel markup
  tab-speakers.html                          "Groundwork for Greatness" tab panel markup
  tab-faq.html                               "FAQ" tab panel markup (accordion + support form)
  site-footer.html                           <footer> markup
  suggest-modal.html                         "Suggest a Resource" modal markup
  share-multiple-modal.html                  "Share Multiple Resources" modal markup
assets/
  css/main.css                               Custom CSS Tailwind utilities can't express (static, no Liquid)
  js/app.js                                  All client-side JS — state, rendering, filtering, sharing, forms, tabs (static, no Liquid)
  js/tailwind-config.js                      tailwind.config = {...} (static, no Liquid, loaded right after the CDN script)
  favicons/                                  SVG-wrapped org favicons for speaker affiliations (see below)
  favicons/resources/                        SVG-wrapped favicons for resource cards, one per resource (see below)
  speakers/                                  Speaker headshot photos, referenced by speakers.yml `photo`
  screenshots/                               PNG screenshots embedded in the FAQ tab (see below)
  og-image.png                               Social share preview image (see "SEO / social sharing" below)
index.html                                   Thin shell: front matter + <head>/<body> wrapper + {% include %} calls + the 3 embedded-JSON <script> tags + the app.js <script src>
README.md                                    Human-facing project README (may lag behind this file — check both)
```

## SEO / social sharing

`_includes/head.html` has canonical/Open Graph/Twitter Card meta tags
(added 2026-07-22, moved into this include on 2026-07-22) built from
`site.title` / `site.description` /
`site.url` / `site.baseurl` in `_config.yml` — **to change the title or
description that appears in search results or link previews, edit
`_config.yml`, not the meta tags themselves.** The tags are just templated
off those two values plus a hardcoded `assets/og-image.png` reference; there's
nothing tab-specific or per-resource here, it's one static preview for the
whole site.

- **`assets/og-image.png`** (1200×630, the standard OG/Twitter "large image"
  size) is what renders when the site's link is shared on Slack, iMessage,
  X, LinkedIn, Discord, etc. It's a **static PNG, not generated at build
  time** — it was authored as a one-off standalone HTML file (brand-color
  gradient background, the site's actual header copy, a large low-opacity
  🖥️ emoji as a background graphic) and captured with headless Chrome at
  exactly `--window-size=1200,630` / `deviceScaleFactor: 1` so the output
  PNG is pixel-exact, not scaled. The source HTML template wasn't kept in
  the repo (it's throwaway, like the FAQ screenshot captures) — if the
  branding, title, or tagline changes enough to need a new image, rebuild a
  similar standalone HTML page matching the current header/colors rather
  than editing the PNG directly, then recapture and overwrite
  `assets/og-image.png` in place (same filename, so the meta tags don't
  need touching).
- **`og:image`/`twitter:image` use absolute URLs** (`{{ site.url }}{{
  site.baseurl }}/assets/og-image.png`) — relative paths don't reliably work
  for these tags across platforms, unlike the favicon/screenshot `<img>`
  tags elsewhere on the page which do use `{{ site.baseurl }}`-relative
  paths.
- There's no automated way to verify how a link preview actually renders on
  a given platform (Slack/X/LinkedIn/etc. each cache and crop differently)
  short of actually posting the link somewhere or using that platform's own
  debugger tool — what was verified here is that the tags render with
  correct, absolute, resolved values after `jekyll build`, that the image
  file lands in `_site/assets/` at the expected path, and that it's exactly
  1200×630. That's the limit of what's checkable without external services.

## Data file schemas

**`_data/PEARC26-HPCResourceList-FullList.csv`** — columns: `Name` (required),
`URL` (optional, `https://` auto-prepended by the JS if missing — but prefer
writing full URLs with scheme in the CSV directly), `Contact Person`
(optional — presence triggers the "Mentorship Available" badge on the card;
free text, may include an email which gets auto-linked), `Category`
(optional — **can hold multiple values as a comma-separated list**, e.g.
`"PEARC EXHIBITOR, Communities & Mentorship"`; the JS splits on `,` and
trims each piece into a `categories` array, so a resource can render more
than one badge and match more than one filter checkbox — use an existing
category value unless a new one is genuinely warranted), `Description`
(optional, clamped to 4 lines until hover/focus).

  - The category `PEARC EXHIBITOR` is special-cased in `assets/js/app.js`
    (`EXHIBITOR_CATEGORY` constant): it renders with a violet/fuchsia
    gradient badge + 🎪 icon and a violet left-border accent on the card,
    instead of the default blue badge. If you rename or retire this
    category, update that constant too.
  - When adding an exhibitor/resource that's *already* in the CSV under a
    different name/category, prefer appending to its existing `Category`
    field (comma-separated) or its `Description` rather than creating a
    duplicate row — this has been the convention for PEARC exhibitors that
    overlap with existing resources (e.g. ACCESS Cyberinfrastructure, US-RSE).
  - **The category taxonomy has been deliberately consolidated more than
    once** — several near-duplicate categories were merged away entirely:
    `Academic Fellowship` → `Fellowships`, `Academic Training` →
    `Training Programs`, `Academic Career Prep` → `Jobs & Careers`,
    `Governmental Internships` → `Scholarships & Internships`, and later
    `Diversity & Inclusion` + `Professional Organizations` → `Communities &
    Mentorship`. If a category looks like it overlaps with another, that's
    not an oversight to "fix" unprompted — check whether a merge was
    already considered and rejected, or ask before merging again (this
    project's convention is to confirm scope before any taxonomy-wide
    change, since it reshapes the filter UI for everyone).
  - **Multi-category tagging follows a "primary function, not passing
    mention" rule**, confirmed explicitly with the user: only add a second
    category when it's clearly a core thing the resource *is*, not an
    activity mentioned once in its description (e.g. a professional org
    that "offers mentorship" as one of several member benefits doesn't
    automatically also get `Communities & Mentorship`). One deliberate,
    confirmed exception: `Cyberinfrastructure Resources` now also includes
    PEARC exhibitor/vendor entries (AWS, Dell, Globus, PSC, SDSC, etc.)
    whenever their description says they directly provide computing/
    storage/network infrastructure — this was a conscious scope call, not
    scope creep, so don't narrow it back down without asking first.
  - **`Name` prefers `Full Expansion (ACRONYM)` when the acronym IS the
    whole resource** — e.g. `Abundant Frontier Institute (AFI)`,
    `Association for Computing Machinery (ACM)`,
    `Campus Research Computing Consortium (CaRCC)`. A full audit (session of
    2026-07-22) found and fixed 7 resources that were bare, unexpanded
    acronyms with **no** parenthetical at all (`ACM`, `AWS`, `DDN`, `NCSA`,
    `CASC`, `PNNL`, `SDSC`) — each was confirmed against the org's own site
    (not guessed) before renaming, and **the matching favicon SVG file was
    renamed to the new slug** in the same pass, since
    `assets/favicons/resources/<slug>.svg` is derived from the current
    `Name`, not stored separately (see the favicon bullet below) — renaming
    a `Name` without renaming its favicon file silently drops the icon. One
    acronym (`CIQ`) was deliberately left un-expanded because no source
    (their own site, Wikipedia) confirmed what it stands for — don't guess
    at an acronym expansion from general/half-remembered knowledge; if a
    source can't confirm it, leave it alone and say so.
  - **A pre-existing data error was also caught and fixed in that audit**:
    `CaRCC`'s row had **CASC's** real name attached to it
    (`"Coalition for Academic Scientific Computation"` is casc.org's actual
    name, confirmed directly on their site) — CaRCC's real name (confirmed
    on carcc.org) is `Campus Research Computing Consortium`. Also fixed:
    `HPDC`'s parenthetical was missing "and Distributed" (confirmed via
    hpdc.sci.utah.edu). Both were factual corrections, not renames-for-
    style — if you spot another mismatched acronym expansion, verify against
    the org's own site before touching it, and treat it as a correction
    worth calling out, not a silent fix.
  - **Acronyms that are a *prefix* to a longer name** (e.g. `ACCESS Campus
    Champions`, `NCAR Internships`, `NSF REU Sites`, `IEEE Cluster
    Computing`, `TACC Analysis Portal (TAP)`, `PATh/Open Science Pool`,
    `ISC High Performance`) were deliberately **left as-is in the `Name`
    column** — expanding those in the name itself would make them
    unwieldy and require synchronized edits to `MAJOR_RESOURCE_MAP` (see
    below) for every renamed entry. Instead, the acronym gets expanded
    inline in that resource's own `Description` the first time it wasn't
    already explained there (e.g. "...from ACCESS (Advanced
    Cyberinfrastructure Coordination Ecosystem: Services & Support)").
    Don't re-expand an acronym in every row that merely mentions it in
    passing (e.g. bare "NSF" inside an ACCESS-prefixed resource's
    description) — only the acronym(s) that are actually part of that row's
    own `Name` need expanding in that row.

**`_data/mentors.csv`** — columns: `Name` (required), `Affiliation`,
`Affiliation URL` (optional), `Role URL` (optional), `LinkedIn` (should be a
real per-person profile URL, not a bare `linkedin.com/`), `Focus`, `Email`.
The JS matches a resource's `Contact Person` name against `mentors.csv`'s
`Name` column (case-insensitive, trimmed) to auto-link a resource card to
that mentor's profile — so if you add a mentor, the name in `Contact Person`
on the resource CSV must match exactly for the link to appear.
- **`Affiliation` follows an `Org Name · Role/Team` convention** (separated
  by ` · `, not a plain hyphen). `mentorAffiliationHtml()` in `assets/js/app.js`
  splits on the first ` · ` and independently links each half via the shared
  `affiliationLink()` helper: the org-name portion links to `Affiliation URL`
  if set, and the role/team portion links to `Role URL` if set (e.g. Suzanna
  Gardner's "RCAC / Anvil Supercomputer" links to
  `rcac.purdue.edu/anvil`, separate from her "Purdue University" link).
  Either or both can be blank, in which case that segment just renders as
  plain text.

**`_data/speakers.yml`** — a list of mappings with `name`, `title`, `photo`
(optional path under `/assets/speakers/` — falls back to initials avatar if
absent), `affiliations` (a **list**, not a single field — each item has
`name`, `url`, and either `icon` (path under `/assets/favicons/`, an SVG
wrapping a base64-embedded PNG favicon fetched from the org's site) or
`emoji` (fallback for orgs with no real favicon, e.g. Abundant Frontier
Institute's 🌾) — a speaker can have more than one affiliation, each
rendered as its own linked, icon-prefixed badge), `session` (free-text
date/time string), `linkedin`, `email`, `bio` (multi-paragraph block scalar
— separate paragraphs with a blank line; the JS splits on blank lines to
render `<p>` tags).

  - To add a new affiliation icon: find the org's real favicon (check
    `<link rel="icon">` in their page source, prefer the largest PNG or a
    genuine vector if one exists), wrap it in a minimal
    `<svg><image href="data:image/png;base64,...">` file under
    `assets/favicons/`, and reference it via `icon` in `speakers.yml`. Don't
    fabricate an icon for an org with no real favicon — use `emoji` instead
    (ask the user what to use if it's not obvious).

## Notable behaviors (mostly in assets/js/app.js)

- **Resource favicons**: each resource card shows a small icon to the left
  of its title, at `/assets/favicons/resources/<slugified-title>.svg` —
  computed client-side in `cardTemplate()` from `slugify(resource.title)`,
  **not** from a CSV column. If the file doesn't exist (a fetch failed, or
  the resource has no URL), the `<img>`'s `onerror="this.remove()"` just
  removes it — no broken-image icon, no CSV change needed either way.
  These were bulk-fetched from each resource's real `URL` (parse the site's
  `<link rel="icon">` tags, prefer a real SVG > largest PNG/ICO, fall back
  to plain `/favicon.ico`, convert non-SVG raster to an SVG wrapper exactly
  like the speaker-affiliation icons). `rel` can be multi-token
  (`rel="shortcut icon"`) — match the whole quoted attribute value, not
  just up to the first space, or you'll silently miss those. If new
  resources are added later without a matching icon file, they'll just
  render without one — fetch and drop a new `<slug>.svg` into that folder
  if you want one to appear.
  - **Reusing icons already vendored in the sibling repo**
    (`HackHPC/facultyhack-gateways26`, under
    `_includes/icons/favicons/<domain-slug>.svg`) is fine and faster than
    re-fetching from scratch — but that repo inlines its SVGs directly into
    HTML via Jekyll includes, so their root `<svg>` tags have **no
    `xmlns="http://www.w3.org/2000/svg"` attribute** (optional when
    inlined, required when loaded standalone via `<img src>`). Copying one
    over as-is renders as a blank/broken image here with no error — always
    add the `xmlns` attribute back when reusing one of their vendored SVGs.
  - **A "placeholder-looking" favicon isn't necessarily wrong.** A couple
    of small/newer sites' real favicons genuinely are a plain solid-color
    shape or a single letter on a colored square (no elaborate logo) —
    before assuming a fetched icon is a broken/generic fallback, fetch the
    site's own `<link rel="icon">` URL live and compare; if it matches
    byte-for-byte, that's their real branding, not an error.
  - **For sites that block simple `curl`** (Akamai/Cloudflare bot
    challenges — ACM, HPCWire, Mark III Systems, HPE, and others hit this):
    try the Wayback Machine first
    (`http://archive.org/wayback/available?url=<domain>`) for either the
    favicon file directly or the homepage HTML (to find the real
    `<link rel="icon">` path, then fetch *that* asset, possibly also via
    Wayback if the live path is also blocked). Some sites also serve brand
    assets from a separate CDN path that isn't behind the same WAF as the
    main domain (e.g. ACM's `/binaries/content/gallery/...` AEM path) —
    worth trying before reaching for Wayback. `curl -sIL`/HEAD requests can
    behave differently than a real `GET` on these hosts, so don't trust a
    HEAD-only check as proof a favicon is missing.
  - **Genuinely icon-less sites** (an empty `data:,` favicon, dead/
    sinkholed DNS, no Wayback snapshot at all — PEARC's own domain, SC,
    SHI Public Sector all hit this) get an emoji fallback instead: a tiny
    SVG containing just a `<text>` element with the emoji glyph, saved at
    the same computed path. Ask the user which emoji if it's not obvious
    (don't invent branding for an org that has none).
- **Four tabs** (`#tab-directory` / `#tab-mentors` / `#tab-speakers` /
  `#tab-faq`), toggled client-side by `activateTab()` — no page reload, no
  URL change. `setupTabs()` wires every `.tab-btn` (matched by its
  `data-tab` attribute) to `activateTab()`; if you ever add a fifth tab, add
  its button + panel markup, then add one line to `activateTab()`'s
  hidden-class toggling — the click wiring itself is already generic.
- **The FAQ tab's screenshots are static PNGs, not live-rendered** — they
  were captured once via headless Chrome + CDP (see the "Verifying
  JS-driven UI changes" convention below) at `assets/screenshots/faq-*.png`
  and referenced with plain `<img src="{{ site.baseurl }}/assets/
  screenshots/...">` tags. If the UI they depict changes meaningfully
  (filter panel layout, share menu, the multi-select modal, mentor cards),
  **the screenshots go stale silently** — nothing will error, they'll just
  show the old UI. Re-capture and overwrite the same filenames rather than
  adding new ones. One gotcha hit while capturing the share-menu
  screenshot: headless Chrome reports `navigator.share` as present, so a
  plain click on the share toggle invokes the native share API instead of
  opening the visible dropdown menu — override it first with
  `Object.defineProperty(navigator, 'share', { value: undefined,
  configurable: true })` (via `Page.addScriptToEvaluateOnNewDocument`
  before navigating) to force the fallback menu open for the screenshot.
- **Filtering is three independent, composable controls**, all client-side
  and all AND'd together (search AND category AND major):
  - **Search box** — matches title/category/description substrings.
  - **Category filter** — a button that opens a checkbox multi-select panel
    (`data-multiselect-toggle/-panel/-option="category"`), sourced from
    `state.categories` (derived from the CSV's `Category` column, sorted
    alphabetically via `localeCompare`). Selecting multiple checkboxes is OR
    logic (matches any selected category).
  - **Major filter** — same checkbox multi-select UI (also alphabetized),
    but sourced from a **hardcoded JS mapping**, `MAJOR_RESOURCE_MAP`
    (search for it in `assets/js/app.js`), not from the CSV. It maps ~10 broad
    student fields of study (e.g. "Data Science, AI, Statistics, and
    Analytics") to a curated list of resource *names* that must exactly
    string-match the CSV's `Name` column. **If you rename a resource in the
    CSV, you must also update its name everywhere it appears in
    `MAJOR_RESOURCE_MAP`**, or it silently drops out of that major's filter
    results (no error — it just won't match).
    - **A resource can (and often should) be linked to multiple majors** —
      just list its exact name in more than one major's array.
      `RESOURCE_MAJORS` (built right below `MAJOR_RESOURCE_MAP`) is a
      reverse index that already handles this automatically: a name
      appearing in 2+ major arrays ends up with 2+ entries in its
      `majors` array, and the major-filter checkbox logic is OR-across-
      selected-majors, so it just works — this isn't a feature that needed
      building, it's inherent to how the map is structured. As of
      2026-07-22 every one of the 122 resources is mapped to at least one
      major (a full audit filled in ~78 that had been added since the map
      was first written — mainly the `PEARC EXHIBITOR` vendor batch and
      the `AI Tools & Resources` batch — neither of which had ever been
      touched here), and 34 resources are deliberately tagged to 2+ majors
      where genuinely relevant (e.g. hardware/cloud vendors under both
      "Cybersecurity, IT, Networking, and Cloud" and "Computer Engineering
      and Electrical Engineering"; AI dev-tool/API products under both
      "Data Science, AI, Statistics, and Analytics" and "Computer Science
      and Software Engineering"). If a resource is added later, check
      whether it fits more than one major before assuming a single tag —
      don't force a fit just to pad the count, but a genuine dual/triple
      fit is normal and encouraged here, not overreach.
  - Both multi-selects share one generic implementation
    (`MULTISELECT_CONFIGS`, `renderMultiSelectPanel`, `setupMultiSelects`)
    — extend that object if a third multi-select filter is ever needed
    rather than writing a new one from scratch.
- **Sort dropdown** (`#sort-filter`) — "Name (A–Z)" (default) or "Category
  (A–Z)" (groups by each resource's first category, then by name). Applied
  after filtering, in `sortResources()`.
- **Deep linking**: every resource card has id `resource-<slugified-title>`
  and every mentor card has id `mentor-<slugified-name>`; a `#resource-...`
  or `#mentor-...` URL hash scrolls to and glow-highlights the target on
  load, and switches to the mentors tab if needed (`handleHashScroll()`).
  Speaker cards intentionally have **no** per-card id/deep-link — that
  wasn't part of the original standalone `speakers.html` behavior and
  wasn't requested when it became a tab, so don't add it unprompted.
- **Tabs are also directly linkable**: a bare `#directory` / `#mentors` /
  `#speakers` / `#faq` hash activates that tab on load (added 2026-07-22).
  `handleHashScroll()` checks this generically — `document.getElementById(
  'tab-' + hash.slice(1))` — against existing tab-panel ids, so a future
  fifth tab needs **no code change** here as long as its panel id follows
  the `tab-<data-tab-value>` convention. Clicking a tab button also updates
  the hash (`history.replaceState`, not `pushState` — consistent with
  `goToMentor()` elsewhere, deliberately not polluting browser history per
  click) so the current tab is always copy-shareable from the address bar.
  This hash-updating lives in the tab button's own click handler
  (`setupTabs()`), **not** inside `activateTab()` itself — `activateTab()`
  is also called internally by `goToMentor()` and `handleHashScroll()` for
  the more specific `#mentor-<slug>` links, and if it rewrote the hash
  unconditionally on every call, it would clobber those more specific
  hashes back down to the bare `#mentors`. Keep it that way if you touch
  this code.
- **Speakers tab data flow mirrors the Mentors tab**: `loadSpeakers()`
  parses `#speaker-data` into `state.speakers` and renders `#speaker-list`
  via `speakerCard()`, exactly like `loadMentors()`/`renderMentors()` do for
  `#mentor-grid`. It has no search/filter/sort — if one gets added later,
  follow the resources tab's `state`/`filteredResources()` pattern rather
  than inventing a new one.
- **Share menu** per resource card (copy link / SMS / email / X / LinkedIn /
  Facebook, or the native OS share sheet if available).
- **Icons instead of emoji for "share" and "LinkedIn"**: all three
  share-related affordances (the per-card `data-share-toggle` button, the
  "Share Multiple Resources" button, and the modal's Share button) use the
  same inline square-and-arrow-up SVG (a plain path with
  `stroke="currentColor"`, copy-pasted identically in all three spots rather
  than factored into a shared template-string constant — if you touch one,
  check the other two haven't drifted). Every "Connect on LinkedIn ↗" link
  (mentor cards and speaker cards) similarly got an inline LinkedIn glyph SVG
  with `fill="currentColor"` right before the text, so it always matches
  that link's current text color (including its hover-darkened shade) —
  don't hardcode LinkedIn's brand blue here, that was a deliberate choice to
  match the site's orange/blue link styling instead.
- **Mentor & speaker "Email" links**: both render just the word "Email" (not
  the raw address) and both append
  `?subject=${encodeURIComponent('[PEARC26 Student Program]')}` to the
  `mailto:` href. This is deliberately **not** applied to the per-resource
  card's Share→Email action (`runShareAction()`'s `'email'` case) — that one
  keeps the resource's own title as the subject, since it identifies what's
  being shared; don't unify the two without asking, that was an explicit
  user decision.
- **"Launch Opportunity" buttons were replaced with the resource's actual
  URL as the link text** (still opens in a new tab, still has a trailing
  `↗`, plus a `title` attribute with the full URL for a hover tooltip). The
  anchor needs both `truncate` and `min-w-0` classes together to actually
  ellipsis long URLs instead of overflowing the card — `truncate` alone
  doesn't shrink within a flex parent unless `min-w-0` overrides the
  default `min-width: auto` on the flex item. Verified this holds even for
  the longest URL in the CSV at a 375px mobile width.
- **Multi-resource selection & bulk share/export**: every resource card has a
  checkbox (`data-select-resource="<slug>"`) toggling membership in
  `state.selectedResources` (a `Set` of slugs, kept in JS state so it
  survives search/filter/sort re-renders — `cardTemplate()` reads
  `state.selectedResources.has(slug)` fresh on every render rather than
  relying on the checkbox DOM surviving). The "Share Multiple Resources"
  button above the search bar (`#share-multiple-btn`) shows a live count
  badge and is disabled at zero, as is the adjacent `#clear-selected-btn`
  ("Clear All Selected"), which empties `state.selectedResources`, re-renders
  the grid to uncheck every box, and closes the modal if it's open. Clicking
  it opens `#share-multiple-modal`,
  listing each selected resource's categories/name/url/description (with a
  per-row `×` to deselect without leaving the modal) plus five actions, all
  operating on `getSelectedResourcesOrdered()`:
  - **Download PDF** opens a new tab with a plain print-styled HTML doc and
    calls `window.print()` so the user saves it via the browser's own
    print-to-PDF — deliberately not using a PDF-generation library, to stay
    consistent with this project's no-build-step/no-extra-dependency
    approach (Tailwind's CDN script is the only external script it loads).
  - **Download CSV** / **Download Markdown** build the file content in
    memory (`shareMultipleCsv()` / `shareMultipleMarkdown()`) and trigger it
    via a Blob + temporary `<a download>`, no server round-trip.
  - **Copy to Clipboard** and **Share** both use the plain-text form
    (`shareMultiplePlainText()`); Share prefers `navigator.share()` (native
    OS share sheet) and falls back to clipboard-copy + toast if unavailable.
  - All the CSV/Markdown/plain-text builder functions are scoped inside the
    same page-wide IIFE as everything else — they're not reachable from the
    browser console's top-level scope, which is expected, not a bug.
- **"Suggest a Resource" modal**, **"Become a Connected Mentor" form**, and
  the **FAQ tab's support-question form** all follow the same no-backend
  pattern: build a pre-filled GitHub Issue URL via the shared
  `buildGithubIssueUrl(title, bodyLines, labels)` helper
  (`github.com/HackHPC/hpcresources-pearc26/issues/new?...`) and open it in
  a new tab. Maintainers triage issues manually — resource/mentor
  submissions get added to the CSVs, support questions get answered/closed.
  If a fourth "opens a GitHub issue" form is ever needed, reuse
  `buildGithubIssueUrl()` rather than duplicating the URLSearchParams logic.

## Local dev — Ruby/Jekyll gotchas (read before touching the Gemfile)

The Gemfile used to pin `gem "github-pages", group: :jekyll_plugins` to
exactly mirror GitHub's production Jekyll environment. **This was removed**
because that gem's dependency chain (nokogiri, minitest, etc., as native
precompiled binaries) is pinned to old versions that only resolve on
**Ruby ≥2.6, <3.2** — it will not `bundle install` on a modern Ruby (this repo
hit this failing on Ruby 4.0.6). Since the site uses zero Jekyll plugins (no
`{% seo %}`, no jemoji, no feed, nothing), the fix was to drop straight to:

```ruby
gem "jekyll", "3.9.5"   # pinned to whatever GitHub Pages currently runs — check https://pages.github.com/versions/
gem "csv"
gem "base64"
gem "bigdecimal"
gem "webrick"
```

`csv`, `base64`, and `bigdecimal` exist only because Ruby 3.4+ stopped
bundling them as default gems, but Jekyll 3.9.5 and its dependency
`safe_yaml` still `require` them unconditionally — without these,
`jekyll build` fails with `LoadError: cannot load such file -- csv` (or
`base64`) even though `bundle install` succeeds. `webrick` is the same
pattern one layer deeper: Ruby 3.0+ dropped it as a default gem, and it's
only pulled in by `jekyll serve`'s dev server code path, not `jekyll build`
— so it stayed hidden until someone actually ran `serve`/`--livereload`
rather than just `build`.

**If `bundle install`, `jekyll build`, or `jekyll serve` starts failing
again after a Ruby upgrade**: don't reach for `rbenv`/an older Ruby as the
first move — check whether it's another dropped-default-gem (same pattern
as `csv`/`base64`/`webrick`) first, since that's a one-line Gemfile fix.
The error is always a plain `LoadError: cannot load such file -- <gemname>`
with a "used to be loaded from the standard library" warning right above
it — that warning is the tell. Only fall back to pinning an older Ruby via
`.ruby-version` if the failure is a genuine native-extension incompatibility
that can't be worked around (e.g. a gem requiring an ABI Ruby doesn't have
yet, like the `github-pages`/nokogiri case above).

`Gemfile.lock` is gitignored on purpose — each machine regenerates its own,
so don't commit it or treat a diff in it as meaningful.

To preview locally:

```bash
bundle install
bundle exec jekyll build     # outputs to _site/, gitignored
bundle exec jekyll serve     # http://localhost:4000
```

## Conventions this project has settled on (from prior sessions)

- **Always write full URLs with `https://` scheme** in the CSVs/YAML — several
  older rows were missing it and relied on the JS's `normalizeUrl()` fallback;
  don't add new rows that depend on that fallback.
- **Don't silently mass-import external data.** HackHPC's sibling repo
  `facultyhack-gateways26`'s `_data/resources.yml` (a much broader, general-
  hackathon-tooling resource list) has been used as a *source* here more
  than once — but only for a specific, user-named slice, never a blanket
  sync. The concrete precedent: the user pasted 27 named "AI Tools &
  Resources" entries (with descriptions but no URLs) and pointed at that
  file specifically to fill in the URLs — all 27 names matched exactly,
  confirming it as the right source. That yml also bundles a lot of content
  (GitHub, Python, Figma, generic dev tools) that doesn't fit this site's
  HPC/career/mentorship focus — don't pull anything beyond what's actually
  been asked for, and don't assume "sync everything" is wanted just because
  the source file is available.
- **Confirm before removing or restructuring existing entries** — e.g.
  mentor/resource rows have been removed before (placeholder mentors with
  fake LinkedIn URLs, duplicate/dead resources) but only on explicit user
  request, not proactively.
- **Prefer a new tab (as a new `_includes/tab-*.html` partial) over a new
  standalone page** — this is exactly what happened to `speakers.html` (see
  top of this file): it started as its own page, and was merged into a
  third tab once the site had an established tab pattern (Resource
  Directory / Connected Mentors) to match. If a genuinely standalone page
  is ever warranted again, follow the same `layout: null` +
  embedded-JSON-from-`_data` + vanilla-JS-render pattern rather than
  introducing a new templating approach, a JS framework, or a build step.
- **Splitting `index.html` into `_includes`/`assets/js`/`assets/css`
  (2026-07-22) was a request to simplify the source file, not an
  architecture change** — the built output is byte-for-byte the same kind
  of single static page it always was; only where the source *text* lives
  changed. Don't read this split as license to introduce a bundler, a JS
  framework, or `type="module"`/ES-import semantics — `app.js` is still one
  classic (non-module) script sharing the global scope the same way the
  original inline `<script>` did, just relocated. If this project ever
  needs real modularization beyond what a few `_includes` and 2 JS files
  provide, that's a bigger decision worth raising with the user first, same
  as any other architecture-level change here.
- **Verifying JS-driven UI changes**: this repo has no npm/Puppeteer/
  Selenium. To actually confirm interactive behavior (not just that the
  page loads), launch Chrome headless with remote debugging and drive it
  over the DevTools Protocol using Node's built-in `WebSocket` (Node ≥21) —
  no extra packages needed:
  ```bash
  bundle exec jekyll serve --port 4321 --baseurl /hpcresources-pearc26 &
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --headless=new --disable-gpu --remote-debugging-port=9222 \
    --user-data-dir=/tmp/chrome-profile "http://localhost:4321/hpcresources-pearc26/" &
  curl -s http://localhost:9222/json | python3 -c "import json,sys; [print(d['webSocketDebuggerUrl']) for d in json.load(sys.stdin) if d['type']=='page']"
  ```
  then connect a small `.mjs` script to that `ws://` URL and send
  `Runtime.evaluate` commands to click buttons, check checkboxes, and read
  back rendered DOM state. Wrap each eval's body in
  `(function(){ ...; return X; })()` — separate `Runtime.evaluate` calls
  share one global scope, so bare top-level `const`/`let` in one call
  collides with the same identifier in another call on the same page.
  For simpler visual-only checks, `--screenshot=out.png
  --window-size=W,H` is faster than driving CDP, but can't verify
  click/toggle/filter interactions.

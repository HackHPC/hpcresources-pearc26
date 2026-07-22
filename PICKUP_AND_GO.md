# Pickup & Go

Read this file first. It's written for a fresh Claude Code session with zero
prior context on this repo — it should be enough to start making correct
changes immediately, without re-deriving the architecture from scratch.

## What this is

`hpcresources-pearc26` is a static resource directory for the **ACM PEARC26
Student Program**, built by HackHPC. It's a GitHub Pages site: push to
`main`, GitHub builds and deploys it automatically, no CI config needed.

There is exactly **one page**, `index.html` — everything lives there as
three client-side tabs, toggled with no page reload or URL change:

- **Resource Directory** (`#tab-directory`) — searchable/filterable
  directory of HPC communities, funding, training, conferences, and career
  resources.
- **Connected Mentors** (`#tab-mentors`) — mentor roster + signup form.
- **Groundwork for Greatness** (`#tab-speakers`) — speaker bios for the
  morning speaker series.

There used to be a second standalone page, `speakers.html`, for the speaker
bios — it was merged into `index.html` as a third tab (to match how
Connected Mentors already worked) and deleted. If you find a stray reference
to `speakers.html` anywhere (a link, a doc, an old bookmark), it's stale —
point it at `index.html` and let the tab button handle it.

There is no separate frontend build step, no npm, no bundler beyond Ruby's
Bundler for Jekyll itself. Tailwind is loaded from a CDN (`cdn.tailwindcss.com`)
and configured inline in the page's `<script>` block.

## How the page actually works

1. Front matter `layout: null` — Jekyll processes Liquid in the file but
   doesn't wrap it in a theme layout. The file *is* the whole page.
2. Data lives in `_data/*.csv` or `_data/*.yml`. Jekyll parses these at
   **build time** and exposes them as `site.data.<filename-without-extension>`.
3. Each dataset is embedded as JSON in its own
   `<script type="application/json">` tag via
   `{{ site.data.whatever | jsonify | replace: "</", "<\/" }}` — the
   `replace` guards against a literal `</script>` inside a description
   breaking out of the tag. There are three: `#resource-data`,
   `#mentor-data`, `#speaker-data`.
4. One vanilla-JS IIFE at the bottom of the page reads each JSON blob with
   `JSON.parse(document.getElementById('...').textContent)` and renders it
   client-side into that tab's markup (card grid, mentor grid, or speaker
   list). No runtime fetch, no CSV/YAML parsing in the browser — Jekyll
   already did that at build time. All three tabs' data loads eagerly on
   `DOMContentLoaded` regardless of which tab is visible — switching tabs
   only toggles a `hidden` class, it doesn't lazy-load anything.

This means: **to change what data appears, edit the file in `_data/`, not
the HTML.** The HTML only needs to change if you're changing *how* something
renders, adding a new data file, or changing page structure/behavior.

## File map

```
_config.yml                                  Jekyll site config (title, description, exclude list)
Gemfile / Gemfile.lock                       Ruby deps (Gemfile.lock is gitignored — see "Local dev" below)
_data/
  PEARC26-HPCResourceList-FullList.csv       Resource directory data → "Resource Directory" tab
  mentors.csv                                Connected Mentors roster → "Connected Mentors" tab
  speakers.yml                               Groundwork for Greatness speaker bios → "Groundwork for Greatness" tab
assets/
  favicons/                                  SVG-wrapped org favicons for speaker affiliations (see below)
  favicons/resources/                        SVG-wrapped favicons for resource cards, one per resource (see below)
  speakers/                                  Speaker headshot photos, referenced by speakers.yml `photo`
index.html                                   The entire site: layout + styles + JS + all three tabs
README.md                                    Human-facing project README (may lag behind this file — check both)
```

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

  - The category `PEARC EXHIBITOR` is special-cased in `index.html`
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

**`_data/mentors.csv`** — columns: `Name` (required), `Affiliation`,
`Affiliation URL` (optional), `Role URL` (optional), `LinkedIn` (should be a
real per-person profile URL, not a bare `linkedin.com/`), `Focus`, `Email`.
The JS matches a resource's `Contact Person` name against `mentors.csv`'s
`Name` column (case-insensitive, trimmed) to auto-link a resource card to
that mentor's profile — so if you add a mentor, the name in `Contact Person`
on the resource CSV must match exactly for the link to appear.
- **`Affiliation` follows an `Org Name · Role/Team` convention** (separated
  by ` · `, not a plain hyphen). `mentorAffiliationHtml()` in `index.html`
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

## Notable behaviors in index.html

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
- **Three tabs** (`#tab-directory` / `#tab-mentors` / `#tab-speakers`),
  toggled client-side by `activateTab()` — no page reload, no URL change.
  `setupTabs()` wires every `.tab-btn` (matched by its `data-tab` attribute)
  to `activateTab()`; if you ever add a fourth tab, add its button + panel
  markup, then add one line to `activateTab()`'s hidden-class toggling — the
  click wiring itself is already generic.
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
    (search for it in `index.html`), not from the CSV. It maps ~10 broad
    student fields of study (e.g. "Data Science, AI, Statistics, and
    Analytics") to a curated list of resource *names* that must exactly
    string-match the CSV's `Name` column. **If you rename a resource in the
    CSV, you must also update its name everywhere it appears in
    `MAJOR_RESOURCE_MAP`**, or it silently drops out of that major's filter
    results (no error — it just won't match). Not every resource is mapped
    to a major; unmapped ones only show up under "All".
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
- **Speakers tab data flow mirrors the Mentors tab**: `loadSpeakers()`
  parses `#speaker-data` into `state.speakers` and renders `#speaker-list`
  via `speakerCard()`, exactly like `loadMentors()`/`renderMentors()` do for
  `#mentor-grid`. It has no search/filter/sort — if one gets added later,
  follow the resources tab's `state`/`filteredResources()` pattern rather
  than inventing a new one.
- **Share menu** per resource card (copy link / SMS / email / X / LinkedIn /
  Facebook, or the native OS share sheet if available).
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
- **"Suggest a Resource" modal** and **"Become a Connected Mentor" form**
  don't hit a backend — they build a pre-filled GitHub Issue URL
  (`github.com/HackHPC/hpcresources-pearc26/issues/new?...`) and open it in a
  new tab. Maintainers triage issues and manually add entries to the CSVs.

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
- **Prefer a new tab in `index.html` over a new standalone page** — this is
  exactly what happened to `speakers.html` (see top of this file): it
  started as its own page, and was merged into a third tab once the site
  had an established tab pattern (Resource Directory / Connected Mentors)
  to match. If a genuinely standalone page is ever warranted again, follow
  the same `layout: null` + embedded-JSON-from-`_data` + vanilla-JS-render
  pattern rather than introducing a new templating approach, a JS
  framework, or a build step.
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

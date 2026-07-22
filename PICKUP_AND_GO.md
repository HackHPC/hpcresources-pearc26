# Pickup & Go

Read this file first. It's written for a fresh Claude Code session with zero
prior context on this repo — it should be enough to start making correct
changes immediately, without re-deriving the architecture from scratch.

## What this is

`hpcresources-pearc26` is a static resource directory for the **ACM PEARC26
Student Program**, built by HackHPC. It's a GitHub Pages site: push to
`main`, GitHub builds and deploys it automatically, no CI config needed.

It has two independent pages, both built the same way:

- **`index.html`** — the main app. A searchable/filterable directory of HPC
  communities, funding, training, conferences, and career resources, plus a
  "Connected Mentors" tab.
- **`speakers.html`** — a standalone bio page for the "Groundwork for
  Greatness" morning speaker series.

There is no separate frontend build step, no npm, no bundler beyond Ruby's
Bundler for Jekyll itself. Tailwind is loaded from a CDN (`cdn.tailwindcss.com`)
and configured inline in each page's `<script>` block.

## How a page actually works

Both `index.html` and `speakers.html` follow the same pattern:

1. Front matter `layout: null` — Jekyll processes Liquid in the file but
   doesn't wrap it in a theme layout. The file *is* the whole page.
2. Data lives in `_data/*.csv` or `_data/*.yml`. Jekyll parses these at
   **build time** and exposes them as `site.data.<filename-without-extension>`.
3. Each page embeds that data as JSON in a `<script type="application/json">`
   tag via `{{ site.data.whatever | jsonify | replace: "</", "<\/" }}` — the
   `replace` guards against a literal `</script>` inside a description
   breaking out of the tag.
4. A vanilla-JS IIFE at the bottom of the page reads that JSON with
   `JSON.parse(document.getElementById('...').textContent)` and renders it
   client-side into card grids. No runtime fetch, no CSV/YAML parsing in the
   browser — Jekyll already did that at build time.

This means: **to change what data appears, edit the file in `_data/`, not
the HTML.** The HTML only needs to change if you're changing *how* something
renders, adding a new data file, or changing page structure/behavior.

## File map

```
_config.yml                                  Jekyll site config (title, description, exclude list)
Gemfile / Gemfile.lock                       Ruby deps (Gemfile.lock is gitignored — see "Local dev" below)
_data/
  PEARC26-HPCResourceList-FullList.csv       Resource directory data → index.html "Resource Directory" tab
  mentors.csv                                Connected Mentors roster → index.html "Connected Mentors" tab
  speakers.yml                               Groundwork for Greatness speaker bios → speakers.html
assets/
  favicons/                                  SVG-wrapped org favicons for speaker affiliations (see below)
  speakers/                                  Speaker headshot photos, referenced by speakers.yml `photo`
index.html                                   Main app: layout + styles + JS, reads resource/mentor JSON
speakers.html                                Standalone speaker bio page, reads speaker JSON
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

**`_data/mentors.csv`** — columns: `Name` (required), `Affiliation`,
`LinkedIn` (should be a real per-person profile URL, not a bare
`linkedin.com/`), `Focus`, `Email`. The JS matches a resource's
`Contact Person` name against `mentors.csv`'s `Name` column (case-insensitive,
trimmed) to auto-link a resource card to that mentor's profile — so if you
add a mentor, the name in `Contact Person` on the resource CSV must match
exactly for the link to appear.

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

- **Two tabs**, toggled client-side (`#tab-directory` / `#tab-mentors`), no
  page reload.
- **Filtering is three independent, composable controls**, all client-side
  and all AND'd together (search AND category AND major):
  - **Search box** — matches title/category/description substrings.
  - **Category filter** — a button that opens a checkbox multi-select panel
    (`data-multiselect-toggle/-panel/-option="category"`), sourced from
    `state.categories` (derived from the CSV's `Category` column). Selecting
    multiple checkboxes is OR logic (matches any selected category).
  - **Major filter** — same checkbox multi-select UI, but sourced from a
    **hardcoded JS mapping**, `MAJOR_RESOURCE_MAP` (search for it in
    `index.html`), not from the CSV. It maps ~10 broad student fields of
    study (e.g. "Data Science, AI, Statistics, and Analytics") to a curated
    list of resource *names* that must exactly string-match the CSV's
    `Name` column. **If you rename a resource in the CSV, you must also
    update its name everywhere it appears in `MAJOR_RESOURCE_MAP`**, or it
    silently drops out of that major's filter results (no error — it just
    won't match). Not every resource is mapped to a major; unmapped ones
    only show up under "All".
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
  load, and switches to the mentors tab if needed.
- **Share menu** per resource card (copy link / SMS / email / X / LinkedIn /
  Facebook, or the native OS share sheet if available).
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
- **Don't silently mass-import external data.** A prior session pulled from
  HackHPC's sibling repo `facultyhack-gateways26`'s `_data/resources.yml`
  (a much broader, general-hackathon-tooling resource list) to refresh URLs/
  descriptions here — but only after explicitly confirming scope with the
  user (fix overlaps only vs. add new vs. full mirror), because that yml
  bundles in a lot of content (GitHub, Python, Figma, generic AI tools) that
  doesn't fit this site's HPC/career/mentorship focus. Ask before broad
  imports; don't assume "sync everything" is wanted.
- **Confirm before removing or restructuring existing entries** — e.g.
  mentor/resource rows have been removed before (placeholder mentors with
  fake LinkedIn URLs, duplicate/dead resources) but only on explicit user
  request, not proactively.
- New standalone pages (like `speakers.html`) follow the same `layout: null`
  + embedded-JSON-from-`_data`+ vanilla-JS-render pattern as `index.html`
  rather than introducing a new templating approach, a JS framework, or a
  build step.
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

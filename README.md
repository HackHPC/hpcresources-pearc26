# HPC Resources — PEARC26 Student Program

An open-source, student-focused HPC resource hub built by **HackHPC** as a companion to the official [ACM PEARC26 Student Program](https://pearc.acm.org/pearc26/student-program/).

The site is built with **Jekyll** for GitHub Pages — a single page (vanilla JS + Tailwind CSS via CDN) whose data comes from Jekyll data files. Jekyll parses the CSV/YAML files at build time and embeds them as JSON directly in the page, so there's no runtime CSV/YAML fetch or parse, and no separate build tooling beyond Jekyll itself. `index.html` is a thin shell that assembles the page from Jekyll `_includes/` partials, with all JS/CSS in their own files under `assets/` — there's no bundler or JS framework, just plain `<script src>`/`<link>` tags.

## Project structure

```
_config.yml     Jekyll site config (title, description, canonical/social-share URL)
Gemfile         Pins Jekyll to match GitHub Pages
_data/
  PEARC26-HPCResourceList-FullList.csv   Resource directory data → "Resource Directory" tab
  mentors.csv                            Connected Mentors roster → "Connected Mentors" tab
  speakers.yml                           Speaker bios → "Groundwork for Greatness" tab
_includes/
  head.html                              <head> contents: meta/OG/Twitter tags, fonts, Tailwind
  site-header.html                       Brand stripe, top banner, header, and tab nav
  tab-directory.html                     "Resource Directory" tab
  tab-mentors.html                       "Connected Mentors" tab
  tab-speakers.html                      "Groundwork for Greatness" tab
  tab-faq.html                           "FAQ" tab
  site-footer.html                       Footer
  suggest-modal.html                     "Suggest a Resource" modal
  share-multiple-modal.html              "Share Multiple Resources" modal
assets/
  css/main.css                           Custom CSS (Tailwind handles the rest via CDN)
  js/app.js                              All client-side JS — state, rendering, filtering, sharing, forms, tabs
  js/tailwind-config.js                  Tailwind theme config (fonts, brand colors)
  favicons/                              Icons for speaker affiliations
  favicons/resources/                    Icons for each resource card, one SVG per resource
  speakers/                              Speaker headshot photos
  screenshots/                           Screenshots embedded in the FAQ tab
  og-image.png                           Social-share preview image (link previews on Slack, X, LinkedIn, etc.)
index.html      Thin shell: assembles the page from the includes above, plus the embedded JSON data
```

## What each file affects on the site

**`_includes/` (page structure — each renders as plain HTML in the built page)**

| File | What it controls |
| --- | --- |
| `head.html` | The browser tab title, search-engine description, favicon, the social-share preview card shown when the site's link is pasted into Slack/X/LinkedIn/etc., and loading the fonts + Tailwind. |
| `site-header.html` | The top info banner, the sticky header (title, "Pipelines Live" counter, "Suggest a Resource" button), and the 4-tab navigation bar — visible on every tab. |
| `tab-directory.html` | The **Resource Directory** tab: the search box, category/major filter dropdowns, sort dropdown, the "Share Multiple Resources"/"Clear All Selected" buttons, and the resource card grid. |
| `tab-mentors.html` | The **Connected Mentors** tab: the mentor sign-up form and the mentor card grid. |
| `tab-speakers.html` | The **Groundwork for Greatness** tab: the heading and the speaker bio list. |
| `tab-faq.html` | The **FAQ** tab: every accordion question/answer and the "Still Need Help?" support form. |
| `site-footer.html` | The footer at the bottom of the page (GitHub link, copyright, conference links). |
| `suggest-modal.html` | The "Suggest a Resource" popup form (opened from the header button). |
| `share-multiple-modal.html` | The "Share Multiple Resources" popup (opened after selecting one or more resource checkboxes). |

**CSS**

| File | What it controls |
| --- | --- |
| `assets/css/main.css` | The handful of visual effects Tailwind's utility classes can't express: smooth scrolling, the orange→blue "brand-bar" gradient, description text truncating to 4 lines until hovered, the pulsing "live" dot and "Mentorship Available" badge, the highlight glow when jumping to a linked card, and the toast notification's slide/fade transition. |

**JavaScript**

| File | What it controls |
| --- | --- |
| `assets/js/tailwind-config.js` | The site's color palette (the `pearc` orange/blue/navy shades used throughout, e.g. `bg-pearc-orange`) and fonts — every Tailwind utility class on the site depends on this. |
| `assets/js/app.js` | Everything interactive: loading/rendering resources, mentors, and speakers from the embedded data; search, filtering, and sorting; resource favicons; tab switching and URL deep-linking; single- and multi-resource sharing (PDF/CSV/Markdown/clipboard/native share); the Suggest a Resource, Become a Mentor, and Support Question forms; and toast notifications. |

## Live features

**Resource Directory**
- Searchable, filterable card grid of HPC-related communities, funding, training, conferences, career, and AI-tool resources, generated from `_data/PEARC26-HPCResourceList-FullList.csv`.
- **Multi-select filtering** by category and by academic major (checkbox dropdowns, OR logic within each filter, AND'd together with search) — a resource can carry more than one category.
- **Sort** by name or by category.
- Each card shows a real favicon fetched from the resource's own site, its category badge(s) — including a distinct violet "🎪 PEARC EXHIBITOR" badge for on-site conference exhibitors — and its actual URL as a clickable link.
- **Mentorship highlighting** — any resource with a `Contact Person` gets a highlighted border, a pulsing "⚡ Mentorship Available" badge, and a link to that person's profile on the Connected Mentors tab.
- **Share menu** per card (copy link, text, email, X, LinkedIn, Facebook, or the native OS share sheet), plus **multi-select sharing**: check any number of resources, then export the whole list as a PDF, CSV, or Markdown file, copy it to the clipboard, or share it via the OS share sheet.
- **Suggest a Resource** — a modal form that opens a pre-filled GitHub Issue with the submitted title, category, URL, description, and contact person.

**Connected Mentors**
- A directory of active mentors generated from `_data/mentors.csv`, each with a linked affiliation (organization and, where applicable, their specific team/program), LinkedIn, and email.
- A sign-up form that opens a pre-filled GitHub Issue on this repository — no backend needed.

**Groundwork for Greatness**
- Speaker bios for the morning speaker series, generated from `_data/speakers.yml` — photo or initials avatar, session time, linked affiliations, LinkedIn, email, and a multi-paragraph bio.

**FAQ**
- A quick-reference accordion covering search, filters, sorting, badges, sharing (single and multi-resource), suggesting a resource, mentors, and speakers — with real screenshots.
- A **support question form** at the bottom that also opens a pre-filled GitHub Issue for anything not covered above.

**Deep linking** — every resource card and mentor card has a stable id; visiting a `#resource-<slug>` or `#mentor-<slug>` link scrolls to and highlights that card, switching tabs automatically if needed.

## Updating the data

Edit the relevant file in `_data/` directly — Jekyll picks up the new data on the next build.

**`_data/PEARC26-HPCResourceList-FullList.csv`**

| Column | Required | Notes |
| --- | --- | --- |
| `Name` | Yes | Resource/opportunity title. Prefer `Full Name (ACRONYM)` when the resource's whole identity is an acronym (e.g. `Abundant Frontier Institute (AFI)`). |
| `URL` | No | Shown as the card's clickable link; `https://` is added automatically if missing, but write full URLs directly |
| `Contact Person` | No | Triggers the mentorship highlight; must match a `Name` in `mentors.csv` to auto-link |
| `Category` | No | Can hold **multiple, comma-separated values** (e.g. `PEARC EXHIBITOR, Communities & Mentorship`) — a resource can match more than one filter |
| `Description` | No | Shown on the card, clamped to 4 lines until hovered/focused |

**`_data/mentors.csv`**

| Column | Required | Notes |
| --- | --- | --- |
| `Name` | Yes | Mentor's full name — must match a resource's `Contact Person` to auto-link that resource |
| `Affiliation` | No | Shown under the name, as `Org Name · Role/Team` |
| `Affiliation URL` | No | Links the org-name portion of `Affiliation` |
| `Role URL` | No | Links the role/team portion of `Affiliation` (after the `·`) |
| `LinkedIn` | No | "Connect on LinkedIn" link; `https://` is added automatically if missing |
| `Focus` | No | Short area-of-focus tag |
| `Email` | No | Adds an "✉️ Email" mailto link, pre-filled with subject `[PEARC26 Student Program]` |

**`_data/speakers.yml`**

A list of speakers, each with `name`, `title`, `photo` (optional, falls back to initials), `affiliations` (a list, each with `name`, `url`, and an `icon` or `emoji`), `session`, `linkedin`, `email`, and `bio` (blank-line-separated paragraphs).

## Contributing

- **Suggest a resource**, **become a mentor**, or **ask a support question** using the forms on the live site — all three open a pre-filled GitHub Issue for maintainers to review.
- Pull requests to the data files, `_includes/`, or `assets/js/app.js` are welcome.

## Local preview

Requires Ruby + Bundler.

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`. GitHub Pages builds and deploys the site automatically on push — no CI config needed.

## Credits

Site created by [Je'aime H. Powell](mailto:jeaimehp@gmail.com?subject=%5BPEARC26%20HPC%20Resources%20Site%5D).

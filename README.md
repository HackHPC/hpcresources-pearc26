# HPC Resources — PEARC26 Student Program

An open-source, student-focused HPC resource hub built by **HackHPC** as a companion to the official [ACM PEARC26 Student Program](https://pearc.acm.org/pearc26/student-program/).

The site is built with **Jekyll** for GitHub Pages. `index.html` is a single Jekyll page (vanilla JS + Tailwind CSS via CDN) whose data comes from Jekyll data files — Jekyll parses the CSVs at build time and embeds them as JSON directly in the page, so there's no runtime CSV fetch/parse and no separate build tooling beyond Jekyll itself.

## Project structure

```
_config.yml     Jekyll site config
Gemfile         Pins Jekyll/plugin versions to match GitHub Pages
_data/
  PEARC26-HPCResourceList-FullList.csv   Resource data, auto-loaded by Jekyll as site.data
  mentors.csv                            Connected Mentors roster, auto-loaded by Jekyll as site.data
index.html      The entire app: layout, styles, and JS (reads the embedded resource/mentor JSON)
```

## Live features

- **Resource Directory** — searchable, filterable card grid of HPC-related communities, funding, training, conferences, and career resources, generated from `_data/PEARC26-HPCResourceList-FullList.csv`. Category filter pills are derived automatically from the CSV's `Category` column.
- **Mentorship highlighting** — any resource with a `Contact Person` gets a highlighted border, a "Mentorship Available" badge, and an auto-linked `mailto:` if an email address is present.
- **Connected Mentors tab** — a mentor sign-up form that opens a pre-filled GitHub Issue on this repository (no backend needed), plus a directory of active mentors generated from `_data/mentors.csv`.
- **Suggest a Resource form** — a modal form that opens a pre-filled GitHub Issue with the submitted title, category, URL, description, and contact person.
- **Deep linking & sharing** — every resource card has a Share menu (copy link, text, email, X, LinkedIn, Facebook, or the native OS share sheet where supported) that builds a link to that card (`#resource-<slug>`) and auto-scrolls/glows when visited.

## Updating the data

Edit the relevant CSV in `_data/` directly — Jekyll picks up the new data on the next build.

**`_data/PEARC26-HPCResourceList-FullList.csv`**

| Column | Required | Notes |
| --- | --- | --- |
| `Name` | Yes | Resource/opportunity title |
| `URL` | No | Link for the "Launch Opportunity" button; `https://` is added automatically if missing |
| `Contact Person` | No | Triggers the mentorship highlight; any email address inside is auto-linked |
| `Category` | No | Used to generate the filter pills |
| `Description` | No | Shown on the card, clamped to 4 lines until hovered/focused |

**`_data/mentors.csv`**

| Column | Required | Notes |
| --- | --- | --- |
| `Name` | Yes | Mentor's full name |
| `Affiliation` | No | Shown under the name |
| `LinkedIn` | No | "Connect on LinkedIn" link; `https://` is added automatically if missing |
| `Focus` | No | Short area-of-focus tag |
| `Email` | No | Adds an "✉️ Email" mailto link on the mentor card |

## Contributing

- **Suggest a resource** or **become a mentor** using the buttons on the live site — both open a pre-filled GitHub Issue for maintainers to review, who then add the entry to the appropriate CSV.
- Pull requests to the CSVs or `index.html` are welcome.

## Local preview

Requires Ruby + Bundler.

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`. GitHub Pages builds and deploys the site automatically on push — no CI config needed.

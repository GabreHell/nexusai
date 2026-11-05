# NexusIA

An independent job-opportunity board for people exploring work in AI and related fields.

**Status: work in progress.** This is a functional local prototype with a snapshot-based catalog. Source integrations, automated updates and broader browser validation are still in development. It is not an AI assistant or a hiring platform.

## Design and development

**Gabriel Valerio Alves / Gabre Studio created the visual identity and developed the project.** NexusIA brings brand design, interface design and software development together in one product: a recognizable identity and a browsable, platform-based view of opportunities.

## Available today

- Search job titles, locations and any skills present in the catalog; filter by platform.
- Browse opportunities in columns and reorder them with drag-and-drop, arrow buttons or keyboard controls.
- Keep column order and language preferences in the browser.
- Switch between Portuguese and English interface text.
- Open official opportunity links or disclosed referral destinations.
- Import validated micro1 snapshots and public Mercor HTML using local scripts.

## Run locally

Requires Node.js 22+. No npm dependencies or build step are needed.

```sh
git clone https://github.com/GabreHell/nexusai.git
cd nexusai
node scripts/serve.mjs
```

Open **http://127.0.0.1:4173**. Run `node --test` to execute the tests. Equivalent npm scripts are `npm run dev` and `npm test`. The `public/` directory contains the static website.

## Catalog and integration status

The included snapshot contains 362 micro1 listings, 19 Handshake AI opportunity areas and 320 Mercor listings. These counts describe the collected snapshot, not current availability or complete coverage. Collection timestamps are recorded in `public/jobs.json`.

- **micro1:** manually collected catalog; 12 individual referral destinations were verified during collection. Other listings use the general referral catalog and ask visitors to find the job title.
- **Handshake AI:** manually collected areas with 13 area-specific and 6 general referral destinations. Referral reward caps are not presented as job compensation.
- **Mercor:** imported from public HTML, with individual official links and no referral attribution in this version.
- Other platform columns and links do not imply a working data integration.

Listings may expire. Missing location does not mean remote work or eligibility in Brazil. Compensation units are preserved where supplied. Most imported listings have no skills metadata, so searching skills is limited. The project does not collect applications or candidate records; applications happen on the destination platforms.

## Referrals and data

Some public links contain the creator's referral codes. These are intended sharing links, not login credentials. The interface discloses that eligible referrals may generate a reward. Attribution has not been validated end to end, and there is no guarantee of a reward, interview or job. NexusIA is independent and does not represent the listed platforms.

`public/config.json`, `public/jobs.json` and `micro1-referrals.json` contain public-facing destinations and catalog metadata. Do not add API keys, session cookies, private dashboard exports, candidate data or authenticated HTML captures to this repository.

## Import and update workflows

For micro1, provide an authorized normalized JSON snapshot:

```json
{"complete":true,"jobs":[{"id":"official-id","title":"Example title","platform":"micro1","location":"As reported","compensation":"","skills":[],"sourceUrl":"https://jobs.micro1.ai/post/official-id"}]}
```

```sh
node scripts/sync.mjs path/to/snapshot.json
node scripts/import-mercor.mjs path/to/public-mercor.html
```

The micro1 importer replaces only micro1 entries, retaining other platforms. Invalid feeds preserve the previous catalog. Empty replacement feeds require the explicit `ALLOW_EMPTY_FEED=true` override.

A daily GitHub Actions workflow is included but skips synchronization unless the repository variable `JOBS_FEED_URL` is configured. No authorized automatic feed has been validated or configured for this publication. The endpoint must return the documented JSON format over HTTPS, not an HTML jobs page. Never put credentials in a public repository variable or URL. Hosting is a separate setup; publishing this repository does not deploy the website.

## Structure

| Path | Responsibility |
| --- | --- |
| `public/` | Interface, translations, referral validation and catalog. |
| `scripts/` | Local server, catalog validation and import tools. |
| `test/` | Feed validation, referral integrity and column-order tests. |
| `.github/workflows/daily.yml` | Conditional catalog synchronization. |

## Roadmap

- Validate authorized data sources and reliable automated refreshes.
- Improve freshness reporting and platform coverage.
- Complete responsive, keyboard and browser acceptance checks.
- Validate referral attribution through legitimate, consented usage.

[Gabre Studio](https://gabrestudio.com) · [GitHub profile](https://github.com/GabreHell)

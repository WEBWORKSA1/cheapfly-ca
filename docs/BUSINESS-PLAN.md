# CheapFly.ca — Business Plan & Revenue Model

_Prepared November 2026. All figures are planning assumptions in CAD, not guarantees._

## 1. The decision: what should cheapfly.ca be?

Five candidate models were scored on revenue potential, time-to-revenue, defensibility, AdSense fit and build cost on a free static host (GitHub Pages).

| Model | Revenue ceiling | Time to revenue | Defensibility | AdSense fit | Static-host fit | Verdict |
|---|---|---|---|---|---|---|
| A. Flight booking engine / OTA clone | High | Very slow (needs IATA/host agency, APIs) | Low vs. giants | Poor (thin, transactional) | No | Reject |
| B. Generic "cheap flights" metasearch | Medium | Slow | None (Google Flights wins) | Poor | No | Reject |
| C. Travel blog only | Low–medium | Medium | Low | Good | Yes | Too small |
| **D. Canadian flight-deal alert hub (newsletter + price-watch + guides + tools)** | **High** | **Fast** | **Medium–high (owned email list, Canadian focus)** | **Excellent** | **Yes** | **Chosen** |
| E. Points/credit-card affiliate site | High | Medium | Medium (crowded: Prince of Travel, Milesopedia) | Good | Yes | Fold into D as a content pillar |

**Why D wins:** the domain literally says "cheap fly" and ends in **.ca**. The highest-intent, most monetizable audience it can capture is *Canadians hunting cheap flights*. The proven model in this space (Going.com, Jack's Flight Club, regional sites like YYZ Deals) monetizes an **owned email list**, not page views. AdSense is the floor; the list is the asset.

**Where we will challenge the brief:** AdSense alone will under-earn. Canadian travel page RPMs are modest, and deal-hunters are ad-blind. The real money is in four levers below, in this order: (1) affiliate (cards, insurance, eSIM, hotels), (2) newsletter sponsorships, (3) lead-gen (group travel/destination weddings), (4) a paid Pro tier. The site is already built for all four.

## 2. Positioning

- **Promise:** "Cheap flights from *your* Canadian airport — free alerts, honest price targets, no booking fees."
- **Wedge:** 16 Canadian airports with local pages, a *deal-threshold* price watch (a unique, linkable asset), and Canada-specific tools (APPR compensation, carry-on checker, US-border-airport math).
- **Moat over time:** subscriber list segmented by airport/region/budget → sponsors and partners pay for that targeting.

## 3. Revenue streams built into the site

| Stream | Where it lives | Status at launch |
|---|---|---|
| Google AdSense (auto ads + optional manual units) | Every content page (`_includes/head.html`, `_includes/ad.html`) | Script installed; `ads.txt` live |
| Lead generation — deal-alert subscribers | `/deal-alerts/` 4-step wizard, hero, footer, inline, sidebar, exit-intent | Live (FormSubmit → owner inbox) |
| Lead generation — group / wedding / vacation quotes | `/deal-alerts/` tabs (consented sharing with partners) | Live |
| Partner (B2B) lead buyers | `/deal-alerts/#p-partner`, `/advertise/` | Live |
| Sponsorships & advertising packages | `/advertise/` (Starter $149+/mo, Growth $499+/mo, Founding) | Live |
| Donations / supporters (operations, promotion, talent, prizes) | `/support/` pledge form + optional PayPal/Stripe/Ko-fi/BMC buttons | Live; add payment links in `_config.yml` |
| Contests (audience growth + sponsor inventory) | `/contests/` | "Opening soon" — fund prize, then launch |
| Talent pipeline | `/careers/` | Live |
| YouTube / video | `/videos/` hub + creator submission funnel + `_data/videos.yml` | Live; add video IDs |
| Pro subscription | Waitlist checkbox in wizard; comparison table | Waitlist live |
| Domain / site acquisition interest | Top bar on every page → web.works/contact | Live |

## 4. Unit economics (assumptions)

| Assumption | Conservative | Base | Bold |
|---|---|---|---|
| AdSense page RPM (CAD) | $5 | $9 | $15 |
| Visitor → subscriber conversion | 1.5% | 3% | 5% |
| Newsletter sponsor CPM (per send) | $15 | $30 | $50 |
| Affiliate revenue per 1,000 visitors | $8 | $20 | $40 |
| Qualified group/vacation leads per 10k visitors | 1 | 3 | 6 |
| Revenue per qualified lead (partner payout) | $25 | $50 | $100 |
| Pro conversion of subscribers (at CA$49/yr) | 1% | 2% | 4% |
| Visitors per page view | 1 visitor ≈ 1.5 page views | | |

## 5. 24-month projection (base case)

Computed from the base-case column above (visitors = page views ÷ 1.5; sponsorship = 4 weekly sends × subscribers × CPM; Pro = 2% of subscribers × $49 ÷ 12).

| Month | Page views / mo | Subscribers (cumulative) | AdSense | Affiliate | Sponsorship | Leads | Pro | **Total / mo** |
|---|---|---|---|---|---|---|---|---|
| 3 | 8,000 | 250 | $70 | $100 | $0 | $0 | $0 | **~$170** |
| 6 | 25,000 | 1,100 | $225 | $330 | $0 | $250 | $0 | **~$800** |
| 12 | 80,000 | 5,000 | $720 | $1,050 | $600 | $800 | $400 | **~$3,600** |
| 18 | 160,000 | 11,000 | $1,440 | $2,100 | $1,300 | $1,600 | $900 | **~$7,300** |
| 24 | 260,000 | 19,000 | $2,340 | $3,400 | $2,300 | $2,600 | $1,550 | **~$12,200** |

**Valuation logic:** content + newsletter businesses commonly trade at roughly 30–45× monthly net profit. At ~$9k/month net by month 24 (after writers, ESP and tools), that implies roughly **$270k–$400k** — versus a few hundred dollars of domain value today. The bold case roughly doubles this; the conservative case lands near $3k/month.

**The two numbers that matter:** visitor→subscriber conversion and subscriber→revenue. Track both weekly from day one.

## 6. Cost base (lean)

| Item | Month 1–6 | Month 12+ |
|---|---|---|
| Hosting (GitHub Pages) | $0 | $0 |
| Domain renewal | ~$2/mo | ~$2/mo |
| Email service provider (MailerLite / Brevo / Beehiiv free tiers → paid) | $0 | $50–$150/mo |
| Freelance deal analysts & writers | $0–$500 | $1,500–$3,000 |
| Contest prizes (sponsor-funded where possible) | $0 | $0–$300 |

## 7. 90-day launch plan

1. **Week 1:** connect cheapfly.ca DNS, enable HTTPS, activate FormSubmit, submit sitemap to Google Search Console and Bing.
2. **Week 1–2:** create a free ESP account (MailerLite or Beehiiv); import subscribers weekly from the inbox; send the first weekly digest. *Alerts are the product — if nobody sends them, nothing else matters.*
3. **Week 2–3:** apply for AdSense once the custom domain has served the site for ~1–2 weeks and Search Console shows pages indexed.
4. **Week 3–6:** join affiliate programs that accept new Canadian travel sites (hotel/OTA programs via major networks, travel insurance, eSIM, luggage); add links to guides.
5. **Week 4–8:** publish 2 new guides/week targeting Canadian long-tail queries; refresh price-watch thresholds monthly.
6. **Week 6–12:** short-form video (Shorts/TikTok/Reels) of the week's best deal → link to `/deal-alerts/`. Pitch 10 travel advisors for lead partnerships. Open the first funded contest.

## 8. Bold moves worth considering

- **French-language edition (fr-CA)** for Québec — YUL and YQB travellers are underserved in French; it roughly doubles the addressable content footprint with low competition.
- **Pro tier at CA$49–$79/yr** once the list passes ~5,000: business-class deals, points sweet spots, SMS alerts.
- **Destination-wedding lead desk** — the highest-value leads in Canadian leisure travel; partner with 2–3 licensed agencies on revenue share.
- **Programmatic airport×destination pages** (e.g. "Cheap flights Calgary to Cancún") generated from `_data/routes.yml` — 80+ new long-tail pages from data already in the repo.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Trademark confusion with "Cheapflights" | Distinct brand/colours, explicit non-affiliation notice, never use competitor marks in titles, meta or ads; run CIPO/USPTO search (see `FACT-CHECK.md`) before paid marketing |
| AdSense rejection (thin content, no domain) | 80+ substantial original pages, legal pages, `ads.txt`; apply only on the custom domain after indexing |
| Stale facts (fees, APPR, airlines) | Dated, hedged content; 6-month review cycle; `_data/*.yml` makes updates one-line edits |
| CASL non-compliance | Express-consent checkboxes on every list form; unsubscribe in every email via ESP |
| Form service limits | FormSubmit alias to hide the inbox; migrate list capture to the ESP's embedded form when volume grows |

Good, this is exactly the level of data we need. Let’s turn this into a tight PRD you can literally build tonight.

I’ll write it like something you’d drop in Notion / Linear.

⸻

PRD — CH Virtual Budtender V1 (MVP)

1. Objective

Ship a simple virtual budtender widget for Cannabis Healing’s website that:
	•	Uses CH’s product catalog (CSV export from Dutchie) as the source of truth.
	•	Asks the user a few guided questions (goal, experience, format, budget).
	•	Returns 2–4 recommended SKUs from current inventory with short explanations and links to buy (Dutchie product pages or generic menu URL).
	•	Is branded for CH and can be reused as a template for other retailers later.

Must be buildable in one night (scrappy, manual ops are fine).

⸻

2. Scope (V1 Only)

In Scope
	1.	Website Widget (React/Tailwind/Vite)
	•	Floating button: “Ask the Budtender” or “Ask Flight Club”.
	•	Slide-up panel chat UI:
	•	Bot greeting.
	•	3–4 multiple-choice questions.
	•	Final response with product recommendations.
	2.	Guided Q&A Flow (No free-form input for V1)
	•	Q1: Goal / effect
	•	Options: Sleep, Relax, Stress relief, Social, Focus/creative, Just get high, Not sure
	•	Q2: Experience
	•	New, Casual, Heavy, Medical but rec shopping
	•	Q3: Preferred format
	•	Flower, Pre-roll, Vape, Edible, Any
	•	Q4: Budget (optional)
	•	Under $25, $25–$50, $50+, No preference
	3.	Recommendation Engine
	•	Simple rule-based filter + LLM ranking:
	•	Filter by:
	•	In stock (Available > 0)
	•	Cannabis vs non-cannabis (Is cannabis == Yes)
	•	Category / Type (mapped from Dutchie Category / Master category)
	•	Price (from Current price)
	•	Use THC % and basic product tags/strain as lightweight signals:
	•	High THC (>= 27%) not recommended for New unless user chooses “Just get high”.
	•	For Sleep/Relax → prefer higher THC + indica-leaning SKUs (you may not have strain type, but certain strain names like “OG”, “Kush”, “Breath” can be tagged manually in V1 or ignored).
	•	LLM gets a small list (e.g., top 15 candidates) and chooses 2–4 with reasoning.
	4.	Catalog Ingestion (CSV → Firestore)
	•	Manual CSV export from Dutchie by CH staff / you.
	•	Simple Node script (run locally or as a one-off endpoint) to convert CSV to a normalized Firestore collection.
	5.	Branding for CH
	•	Colors: CH’s white/gold/black vibe.
	•	Name: “Flight Club Virtual Budtender” or “Ask Flight Club”.
	•	Tone: friendly, helpful, street-lux but no medical claims.

⸻

3. Out of Scope (V1)
	•	Real-time Dutchie API integration.
	•	Real-time stock sync.
	•	Analytics dashboard (beyond basic logging).
	•	Multi-tenant UI (only CH; future clients later).
	•	COA parsing.
	•	In-store kiosk mode.
	•	SMS or text integration.

If you try to do any of this tonight, you’re self-sabotaging.

⸻

4. Personas
	1.	Website Shopper (Primary)
	•	On CH site or embedded Dutchie menu.
	•	Unsure what to buy, overwhelmed by SKUs.
	•	Wants a quick “just tell me 2–3 good options” answer.
	2.	CH Owner/Manager (Internal)
	•	Wants:
	•	Slightly better conversion.
	•	A cooler, more modern customer experience.
	•	Something that doesn’t require their staff learning a new tool.

⸻

5. User Flows

5.1 Shopper Flow
	1.	Shopper visits CH website.
	2.	Sees floating button: “Ask the Budtender”.
	3.	Clicks → chat widget opens with intro.
	4.	Q&A sequence:
	•	Q1 goal → user taps a chip.
	•	Q2 experience → chip.
	•	Q3 format → chip.
	•	(Optional) Q4 budget → chip.
	5.	Frontend calls POST /recommend with answers.
	6.	Backend:
	•	Filters Firestore products.
	•	Calls LLM with candidate set.
	•	Returns JSON with message + recommended product IDs + reasons.
	7.	Frontend renders:
	•	Bot message explaining choices.
	•	2–4 product cards with image, price, brand, THC %, and “View on menu” link.

⸻

6. Data Model (V1)

6.1 Source Columns (from your sample)

Useful columns from the CSV you pasted:
	•	SKU
	•	Product
	•	Category (Flower, Pre-Rolls, Rolling Papers, etc.)
	•	Strain
	•	Vendor (Brand-ish / producer)
	•	Available (stock)
	•	Current price
	•	Master category / Type (Flower / Accessories etc.)
	•	Is cannabis
	•	Is available online
	•	Brand
	•	Online title
	•	Online Description
	•	Image URL
	•	THC
	•	THCA
	•	THC-D9
	•	CBD
	•	CBDA
	•	Calculated THC (mg)

We ignore almost everything else in V1.

6.2 Normalized Product Schema (Firestore)

Collection: products

Example document:

{
  id: string;             // SKU or combination of SKU + Package ID
  name: string;           // Online title || Product
  brand: string;          // Brand || Vendor
  category: 'flower' | 'pre-roll' | 'vape' | 'edible' | 'accessory' | 'other';
  isCannabis: boolean;
  isAvailableOnline: boolean;
  inStock: number;        // from Available
  price: number;          // Current price
  strain: string | null;  // Strain column
  thcPercent: number | null;  // THC or THCA
  cbdPercent: number | null;  // CBD or CBDA
  thcMg: number | null;       // Calculated THC (mg) if present
  imageUrl: string | null;    // Image URL
  dutchieUrl: string | null;  // can be null in V1, you can use generic menu URL
  tags: string[];         // derived tags we may manually add in script later (e.g. ['strong', 'budget']) or empty
}

Category Mapping Rules (script-level)
From CSV → schema:
	•	If Master category or Category includes:
	•	Flower → category = 'flower'
	•	Pre-Rolls, Pre-Rolls-1g, 1g - Infused - Prerolls → category = 'pre-roll'
	•	Accessories, Grinders, Bongs, Rolling Papers, etc. → category = 'accessory'
	•	Else → category = 'other'

isCannabis:
	•	Is cannabis == Yes → true
	•	Else → false.

THC:
	•	thcPercent = THC || THCA || THC-D9 (pick one, prefer THC if populated, fall back to THCA).

⸻

7. API Design (Backend)

Endpoint 1: POST /recommend

Request:

{
  "answers": {
    "goal": "sleep",              // 'sleep' | 'relax' | 'stress' | 'social' | 'focus' | 'high' | 'unsure'
    "experience": "casual",       // 'new' | 'casual' | 'heavy' | 'medical'
    "format": "pre-roll",         // 'flower' | 'pre-roll' | 'vape' | 'edible' | 'any'
    "budget": "25-50"             // '<25' | '25-50' | '50+' | 'none'
  }
}

Backend Logic (high-level):
	1.	Build Firestore query:
	•	isCannabis == true
	•	inStock > 0
	•	if format != 'any' → filter by category == format
	2.	Apply budget filter to price:
	•	<25 → price < 25
	•	25-50 → 25 <= price <= 50
	•	50+ → price > 50
	3.	Optional: simple heuristics:
	•	If experience == 'new' AND goal != 'high' → deprioritize products with thcPercent >= 28.
	4.	From the filtered set, pick max 20 candidates.
	5.	Construct LLM prompt with:
	•	System message (budtender persona).
	•	Structured list of candidate products.
	•	Instructions to select 2–4 items and respond in JSON.

Response:

{
  "message": "string", // bot explanation to show in chat
  "recommendations": [
    {
      "id": "57754810",
      "reason": "1g infused pre-roll, strong but not overkill for casual users looking to relax after work."
    },
    {
      "id": "59642470",
      "reason": "3.5g flower option if you prefer to roll your own and want a heavier, sedating effect."
    }
  ]
}

Frontend then fetches full product details from previously loaded products (or you include minimal fields in the response).

⸻

8. LLM Prompt (Spec-Level)

System Prompt (concept)
	•	You are the virtual budtender for Cannabis Healing, a dispensary.
	•	You ONLY recommend products from the list I give you.
	•	You never make medical claims or say products “treat” or “cure” anything.
	•	You can describe effects in general terms: relaxing, euphoric, uplifting, sleepy, etc.
	•	Always give 2–4 recommendations, each with a short explanation.
	•	Keep it short, clear, and friendly.

Product Context (example based on your dataset)

You’ll pass something like this:

The user told you:
	•	Goal: sleep
	•	Experience: casual
	•	Format: pre-roll
	•	Budget: under 25

Here are the available products (each has an id and fields):
	1.	id: “57754810”, name: “Advanced Cultivators | Truffle Popz | Preroll | 1g”, brand: “Advanced Cultivators”, category: “pre-roll”, thcPercent: 28.45, price: 10
	2.	id: “60736587”, name: “Advanced Cultivator | Eastie Rollz | Preroll | 1g”, brand: “Eastie Rollz”, category: “pre-roll”, thcPercent: 18.70, price: 6
	3.	id: “9009809”, name: “Advanced Cultivators | Suave | Preroll | 1g”, brand: “Advanced Cultivators”, category: “pre-roll”, thcPercent: 25.01, price: 10
	4.	id: “27385283”, name: “Breathe Free I Chem D x Runtz I 1G Pre-roll”, brand: “Breathe Free”, category: “pre-roll”, thcPercent: 20.27, price: 10
…

Using ONLY these products, choose 2–4 that best match the user. Respond in valid JSON:

{
  "message": "short explanation to the user",
  "recommendations": [
    { "id": "string", "reason": "why this fits" }
  ]
}



Backend parses and returns it.

⸻

9. Frontend UX Details

Layout
	•	Floating trigger button
	•	Bottom-right on desktop, bottom-centered on mobile if needed.
	•	Tailwind: fixed bottom-4 right-4 rounded-full shadow-lg.
	•	Chat panel
	•	Tailwind: fixed bottom-16 right-4 w-[320px] max-h-[70vh] rounded-2xl bg-white border shadow-xl flex flex-col.
	•	Sections:
	•	Header: “Flight Club Virtual Budtender”
	•	Messages area: scrollable.
	•	Quick option chips below messages.

Chat Flow (Hard-coded Logic)
	•	State machine in React:
	•	step = 0 → greeting + Q1
	•	step = 1 → Q2
	•	step = 2 → Q3
	•	step = 3 → Q4 (or skip)
	•	step = 4 → call backend, show spinner, then show recs.

No need for fancy conversation logic yet.

⸻

10. Ops / Admin Flow

For V1:
	•	You (dev) own catalog updates:
	1.	CH exports CSV from Dutchie.
	2.	You run Node script locally: node importCatalog.js ch-menu-2025-11-07.csv.
	3.	Script parses, normalizes, and writes to Firestore products.

If they like it, you later build a simple internal “Upload CSV” UI and call the script via Cloud Function.

⸻

11. Risks / Caveats
	•	Data quality:
	•	No explicit indica/sativa/hybrid in the current dataset, so your recommendations will be THC + price + brand biased until you derive more.
	•	Compliance:
	•	You MUST keep prompt tight to avoid medical language.
	•	Cold-start:
	•	If filters produce < 3 products, fallback to:
	•	broader price range or
	•	any format.

⸻

If you want next, I can give you concrete examples of:
	•	The Node import script mapping the columns you pasted → Firestore schema.
	•	The exact JSON contract for /recommend.
	•	A sample LLM prompt + dummy response using your actual SKUs so you can test the logic quickly.

But as a PRD: this is enough to build tonight without getting lost.
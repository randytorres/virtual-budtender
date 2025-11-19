Here’s the clean, simple “new_prd” that captures ONLY what you need tonight, AND shows exactly how it plugs into the earlier steps so you don’t lose the SaaS angle later.

This is the smallest-possible real PRD that moves the project forward without dragging you into platform-land prematurely.

⸻

new_prd — CH Virtual Budtender (MVP Build Tonight)

1. Goal

Ship a working Virtual Budtender V1 for Cannabis Healing that:
	•	Uses CH’s Dutchie CSV catalog.
	•	Runs on React/Tailwind/Vite frontend + Firebase + Node backend.
	•	Provides guided Q&A → 2–4 product recommendations.
	•	Is architected to support multi-tenant SaaS later without adding extra work tonight.

⸻

2. Core Features (MVP Tonight)

2.1 Floating Widget (Frontend)

A reusable React component inserted into CH’s website.

Includes:
	•	Floating trigger button: “Ask the Budtender”
	•	Slide-up chat panel:
	•	Bot greeting
	•	Sequential multiple-choice questions (chips)
	•	Recommendation results with product cards

No free-form text yet.

⸻

2.2 Guided Question Flow

Step-by-step, no deviation:
	1.	Goal / Effect
	•	Sleep, Relax, Stress, Social, Focus, Just get high, Not sure
	2.	Experience Level
	•	New, Casual, Heavy, Medical
	3.	Product Format
	•	Flower, Pre-roll, Vape, Edible, Any
	4.	Budget
	•	<25, 25–50, 50+, No preference

Front-end collects answers → sends to backend.

⸻

2.3 Recommendation API (Backend)

Endpoint: POST /recommend

Input:

{
  "tenantId": "ch",
  "answers": { ... }
}

Backend steps:
	1.	Query Firestore products where:
	•	tenantId == "ch"
	•	inStock > 0
	•	isCannabis == true
	2.	Filter by format, budget.
	3.	Apply simple heuristics (optional):
	•	New user → avoid extreme THC unless they chose “Just get high”
	4.	Select top ~20 candidates.
	5.	Call LLM with:
	•	System prompt (budtender persona)
	•	Candidate product list
	•	User answers
	6.	Return:

{
  "message": "short explanation",
  "recommendations": [
    { "id": "57754810", "reason": "..." },
    ...
  ]
}


⸻

2.4 Product Catalog Import Script

Node CLI script that normalizes CH Dutchie CSV → Firestore.

Run manually tonight.

Usage:

node importCatalog.js ch ./exports/ch-menu.csv

The script:
	•	Reads CSV
	•	Maps fields to simplified schema
	•	Adds tenantId: "ch"
	•	Writes into products collection

⸻

3. Data Model (Firestore)

Collection: products

Structure:

{
  tenantId: string,
  id: string,
  name: string,
  brand: string,
  category: string,
  isCannabis: boolean,
  isAvailableOnline: boolean,
  inStock: number,
  price: number,
  strain: string | null,
  thcPercent: number | null,
  cbdPercent: number | null,
  thcMg: number | null,
  imageUrl: string | null,
  dutchieUrl: string | null,
  tags: string[]
}

This matches your CSV exactly with only the fields needed for V1.

⸻

4. System Prompt (LLM)

Basic structure:
	•	Identity: Virtual Budtender for CH.
	•	Always recommend 2–4 items from product list.
	•	No medical claims.
	•	Friendly, concise, clear.
	•	JSON output only.

This ties directly into the backend task.

⸻

5. Integration Timeline (Same-Day Build)

Step 1 — Build Import Script (1–2 hrs)

Turn CSV → Firestore.
Supports future SaaS by adding tenantId.

Step 2 — Build Recommendation Backend (2–3 hrs)
	•	Node route
	•	Firestore query
	•	LLM call
	•	JSON response

Step 3 — Build React Widget (2–3 hrs)
	•	Floating button
	•	Chat panel
	•	Chips-based question flow
	•	Display product cards

Step 4 — Connect Widget → Backend (30 min)

On last step, call /recommend.

Step 5 — Add to CH Site (10 min)

Drop React widget into their site or load via script tag.

⸻

6. SaaS Readiness (Quiet Prep Built-In Tonight)

You do not build SaaS today.
You do build with these decisions baked in:

✔ Add tenantId to every product

Future multi-stores = simply upload a different CSV.

✔ POST /recommend requires tenantId

Widget passes its own ID.

✔ Avoid hardcoding CH in the engine

Branding goes in a small config object:

tenantConfig.ch = {
  name: "Cannabis Healing",
  tone: "friendly street-lux",
  primaryColor: "#HEX",
}

✔ React widget accepts config

Later you’ll expose it via a script embed.

These tiny choices make the entire system “SaaS-friendly” without doing any heavy SaaS engineering today.

⸻

7. Out of Scope (Not Tonight)
	•	Billing (Stripe)
	•	Auth & dashboards for store owners
	•	Real-time POS integration
	•	Analytics panel
	•	Multi-store UI
	•	In-store kiosks
	•	SMS

This protects you from scope creep.

⸻

8. Success Criteria

MVP is successful if:
	•	Chat widget loads on CH site reliably.
	•	Users can answer 3–4 questions.
	•	They receive 2–4 legit product recommendations with:
	•	image
	•	price
	•	brand
	•	Dutchie link
	•	No broken flows or weird LLM output.
	•	CH sees value and wants it live ASAP.

⸻

9. What You Build Next (After MVP Works)

Once CH confirms use + value:
	1.	Add second dispensary (copy-paste CSV → new tenantId).
	2.	Add simple admin panel (upload CSV).
	3.	Add Stripe subscriptions.
	4.	Add analytics (basic tracking).
	5.	Start pitching other shops.

⸻


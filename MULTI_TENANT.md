# Multi-Tenant (SaaS) Architecture

## Overview

The Virtual Budtender is built to support multiple dispensaries from day one, even though we're launching with just Cannabis Healing. This document explains how the multi-tenant system works.

## Key Concept: Tenant ID

Every product, recommendation, and API call includes a `tenantId` that identifies which store it belongs to.

**Example:**
- Cannabis Healing = `ch`
- Future Store #2 = `greenleaf`
- Future Store #3 = `highlife`

## How It Works

### 1. Product Data (Firestore)

Every product has a `tenantId` field:

```javascript
{
  tenantId: "ch",  // Identifies which store owns this product
  id: "12345",
  name: "Blue Dream",
  price: 45,
  // ... other fields
}
```

### 2. Tenant Configuration (`backend/tenantConfig.js`)

Each tenant has a configuration object:

```javascript
export const tenantConfigs = {
  ch: {
    name: 'Cannabis Healing',
    displayName: 'Flight Club',
    tone: 'friendly, street, luxury, high end, street-lux, premium',
    colors: {
      primary: '#D4AF37',
      primaryLight: '#E5C158',
    },
    menuUrl: 'https://cannabishealingllc.com/shop',
    systemPrompt: '...',
  },
  
  // Future tenants go here
};
```

### 3. Backend API

All endpoints filter by `tenantId`:

```javascript
// POST /recommend
{
  "tenantId": "ch",
  "answers": { ... }
}

// Backend queries: WHERE tenantId == "ch"
```

### 4. Frontend Widget

Widget accepts a `tenantId` prop:

```javascript
<BudtenderWidget tenantId="ch" />
```

## Adding a New Tenant (Store)

### Step 1: Add Configuration

Edit `backend/tenantConfig.js`:

```javascript
export const tenantConfigs = {
  // ... existing ch config ...
  
  greenleaf: {
    name: 'Green Leaf Dispensary',
    displayName: 'Ask Your Budtender',
    tone: 'professional and welcoming',
    colors: {
      primary: '#4CAF50',
      primaryLight: '#66BB6A',
      secondary: '#212121',
      background: '#FFFFFF',
    },
    menuUrl: 'https://greenleaf.com/menu',
    systemPrompt: `You are the virtual budtender for Green Leaf Dispensary...`,
  },
};
```

### Step 2: Import Their Catalog

```bash
npm run import-csv greenleaf path/to/greenleaf-inventory.csv
```

This adds all their products with `tenantId: "greenleaf"`.

### Step 3: Deploy Widget

Add to their website:

```html
<div id="budtender-root"></div>
<script type="module">
  import { BudtenderWidget } from 'https://your-cdn.com/widget.js';
  BudtenderWidget.init({
    tenantId: 'greenleaf',
    container: '#budtender-root'
  });
</script>
```

Or if embedding in React:

```javascript
<BudtenderWidget tenantId="greenleaf" />
```

### Step 4: Done! ✅

The widget will now:
- Show Green Leaf branding
- Only recommend Green Leaf products
- Use Green Leaf's custom system prompt
- Link to Green Leaf's menu

## Data Isolation

**Products are completely isolated:**
- Cannabis Healing queries only see `tenantId: "ch"` products
- Green Leaf queries only see `tenantId: "greenleaf"` products
- No cross-contamination

**Configuration is separate:**
- Each tenant has their own colors, branding, tone
- System prompts can be customized per tenant
- Menu URLs are tenant-specific

## API Endpoints

### Get Tenant Config

```bash
GET /tenant/:tenantId/config
```

Returns public configuration for a tenant (colors, name, menu URL).

**Example:**
```bash
curl http://localhost:3001/tenant/ch/config
```

Response:
```json
{
  "tenantId": "ch",
  "name": "Cannabis Healing",
  "displayName": "Flight Club",
  "colors": {
    "primary": "#D4AF37",
    "primaryLight": "#E5C158"
  },
  "menuUrl": "https://cannabishealing.com/menu"
}
```

### List All Tenants

```bash
GET /tenants
```

Returns list of all configured tenants.

## Database Structure

### Firestore Collection: `products`

All products in one collection, filtered by `tenantId`:

```
products/
  ├── 12345 (tenantId: "ch")
  ├── 12346 (tenantId: "ch")
  ├── 67890 (tenantId: "greenleaf")
  └── 67891 (tenantId: "greenleaf")
```

**Why one collection?**
- Simpler to manage
- Easy to add composite indexes
- Firestore queries are fast even with millions of docs
- No need to create new collections for each tenant

**Alternative (future):**
Each tenant gets their own collection:
```
products_ch/
products_greenleaf/
```

This works too, but adds complexity in the import script.

## Pricing Model (Future SaaS)

When you're ready to turn this into a SaaS:

### Subscription Tiers

**Basic** - $99/month
- 1,000 recommendations/month
- CSV import only
- Email support

**Pro** - $299/month
- 5,000 recommendations/month
- Real-time POS sync
- Priority support
- Custom branding

**Enterprise** - Custom
- Unlimited recommendations
- White-label
- Dedicated support
- Custom integrations

### Implementation

1. Add `subscriptionTier` to tenant config
2. Create Stripe customer per tenant
3. Track usage in Firestore:

```javascript
{
  tenantId: "ch",
  month: "2025-11",
  recommendationsUsed: 342,
  limit: 5000,
  tier: "pro"
}
```

4. Rate limit `/recommend` endpoint based on usage

## Security Considerations

### Current (V1)

- No authentication required
- Any frontend can call API with any `tenantId`
- Acceptable for MVP

### Future (V2+)

Add API key authentication:

```javascript
// Each tenant gets an API key
POST /recommend
Headers:
  X-API-Key: ch_live_abcd1234...

Body:
{
  "tenantId": "ch",  // Must match the API key
  "answers": { ... }
}
```

Backend validates:
```javascript
const apiKey = req.headers['x-api-key'];
const tenant = await validateApiKey(apiKey);
if (tenant.id !== req.body.tenantId) {
  return res.status(403).json({ error: 'Invalid tenant' });
}
```

## Testing Multi-Tenant

### Local Testing

Create a test tenant in `tenantConfig.js`:

```javascript
test: {
  name: 'Test Store',
  displayName: 'Test Budtender',
  // ... minimal config
}
```

Import test data:
```bash
npm run import-csv test test-data.csv
```

Use in widget:
```javascript
<BudtenderWidget tenantId="test" />
```

### Testing Isolation

Verify products don't leak across tenants:

```javascript
// Should only return CH products
POST /recommend
{ "tenantId": "ch", "answers": {...} }

// Should only return GreenLeaf products  
POST /recommend
{ "tenantId": "greenleaf", "answers": {...} }
```

## Migration Path

### Today (V1)
- Single tenant (CH)
- Manual CSV imports
- No billing
- Free for CH as pilot customer

### Week 2
- Add 2nd tenant
- Build admin dashboard for CSV uploads
- Test multi-tenant in production

### Month 2
- Add Stripe integration
- Launch marketing site
- Open to public sign-ups
- Onboard 5-10 dispensaries

### Month 3+
- Real-time POS sync
- Advanced analytics
- White-label options
- Scale to 50+ dispensaries

## Code Organization

All multi-tenant code is isolated:

```
backend/
├── tenantConfig.js       # Tenant definitions
├── tenantEndpoints.js    # Tenant API endpoints
└── server.js            # Main API (uses tenant config)

scripts/
└── importCatalog.js     # Accepts tenantId parameter

src/components/
├── BudtenderWidget.jsx  # Accepts tenantId prop
└── ChatPanel.jsx        # Uses tenantId for API calls
```

To add a tenant, you only touch:
1. `tenantConfig.js` (add config)
2. Run import script with new tenant ID
3. Deploy widget with new tenant ID

**No other code changes needed!**

## Benefits of This Architecture

✅ **Launch fast**: Single tenant works today
✅ **Scale ready**: Multi-tenant built-in from day one
✅ **No refactoring**: Adding tenants doesn't require code changes
✅ **Simple ops**: One database, one deployment
✅ **Easy testing**: Can test multiple tenants locally
✅ **Future-proof**: Ready for SaaS when you are

## Questions?

See also:
- [README.md](./README.md) - General project info
- [SETUP.md](./SETUP.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

For SaaS-specific questions, this doc is your guide!


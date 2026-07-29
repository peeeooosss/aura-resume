# Aura Resume — Credit System Plan

## One-Time 3-Month Allocation + Refill Model

### Overview
- Credits allocated **one-time for 3 months** (not monthly refill)
- Users can **refill** when credits run out (min 50, max 500 credits per refill)
- **90-92% profit margins** targeted at current prices
- Pro users do **NOT** get Cold Emails (VIP only)
- AI Interview is **highest credit cost** action

---

## Plan Pricing & Allocations

| Plan | Price/3mo | Initial Credits (3mo) | Refill Price |
|------|-----------|----------------------|--------------|
| **Free** | Free | 50 credits (one-time, no refill) | N/A |
| **Pro** | ₹499/3mo | 900 credits (3 months) | ₹99 per 100 credits |
| **VIP** | ₹1,499/3mo | 1,800 credits (3 months) | ₹149 per 100 credits |

### Refill Options
| Refill Amount | Pro Price | VIP Price |
|--------------|-----------|-----------|
| 50 credits | ₹49 | ₹79 |
| 100 credits | ₹99 | ₹149 |
| 200 credits | ₹189 | ₹289 |
| 500 credits | ₹449 | ₹699 |

---

## Credit Costs Per Action

| Action | Credits | Rationale |
|--------|---------|-----------|
| Resume Analysis | 8 | Core feature |
| LinkedIn Analysis | 12 | High compute |
| Job Search | 3 | Discovery feature |
| Cover Letter | 6 | Standard |
| Roadmap Generation | 12 | High compute |
| Resume Fix | 4 | Moderate |
| **AI Interview** | **15** | **HIGHEST — premium** |
| Cold Email | 5 | Low compute — **VIP ONLY** |
| **Job Match (Resume vs JD)** | **10** | Premium feature |

---

## Usage Budgets (3-Month Period)

### Free Plan (50 credits one-time)
| Action | Cost | Max Uses |
|--------|------|----------|
| Resume Analysis | 8 | 2 analyses |
| Job Search | 3 | 5 searches |
| Job Match (view only) | 10 | 1 match |

### Pro Plan (900 credits / 3 months)
| Action | Cost | Monthly Equivalent | 3-Month Total |
|--------|------|-------------------|---------------|
| Resume Analysis | 8 | ~25/mo | 75 |
| LinkedIn Analysis | 12 | ~12/mo | 36 |
| Job Search | 3 | ~50/mo | 150 |
| Cover Letter | 6 | ~15/mo | 45 |
| Roadmap | 12 | ~8/mo | 24 |
| Resume Fix | 4 | ~20/mo | 60 |
| AI Interview | 15 | ~8/mo | 24 |
| Job Match | 10 | ~15/mo | 45 |
| **Cold Email** | **5** | **NOT AVAILABLE** | **N/A** |

**Total: ~900 credits** ✓

### VIP Plan (1,800 credits / 3 months)
| Action | Cost | Monthly Equivalent | 3-Month Total |
|--------|------|-------------------|---------------|
| Resume Analysis | 8 | ~50/mo | 150 |
| LinkedIn Analysis | 12 | ~30/mo | 90 |
| Job Search | 3 | ~100/mo | 300 |
| Cover Letter | 6 | ~25/mo | 75 |
| Roadmap | 12 | ~15/mo | 45 |
| Resume Fix | 4 | ~30/mo | 90 |
| AI Interview | 15 | ~15/mo | 45 |
| Cold Email | 5 | ~25/mo | 75 |
| Job Match | 10 | ~20/mo | 60 |
| Portfolio Builder | 0 | ✓ | ✓ |

**Total: ~1,800 credits** ✓

---

## Feature Access Matrix

| Feature | Free | Pro | VIP |
|---------|------|-----|-----|
| Resume Analysis | 2 total | Unlimited | Unlimited |
| LinkedIn Analysis | ✗ | ✓ | Unlimited |
| Job Search | 5 only | Unlimited | Unlimited |
| Job Match | View only | ✓ | Unlimited |
| Cover Letter | ✗ | ✓ | Unlimited |
| Roadmap | ✗ | ✓ | Unlimited |
| Resume Fixer | ✗ | ✓ | Unlimited |
| AI Interview | ✗ | 24 total | Unlimited |
| **Cold Email** | **✗** | **✗** | **✓ (VIP ONLY)** |
| Portfolio Builder | ✗ | ✗ | ✓ |
| Portfolio Preview | ✗ | ✗ | ✓ |
| Resume vs Job | ✗ | ✓ | Unlimited |

---

## Profit Validation

### Per User (3-Month Period)
| Plan | Revenue | Est. API Cost | Margin |
|------|---------|---------------|--------|
| Pro (₹499) | ₹499 | ~₹35-40 | **92%** |
| VIP (₹1,499) | ₹1,499 | ~₹120-150 | **92%** |

### 200-300 Users Projection
| Scenario | Users | Monthly Revenue | Monthly Profit | Annual Profit |
|----------|-------|-----------------|----------------|---------------|
| 200 Pro + 100 VIP | 300 | ₹1.5L | ₹1.4L | ₹16.8L |
| 300 Pro + 150 VIP | 450 | ₹2.2L | ₹2.0L | ₹24L |
| 500 Pro + 200 VIP | 700 | ₹3.5L | ₹3.2L | ₹38L |

---

## Refill Revenue (Additional)

| Refill Scenario | Monthly Additional |
|-----------------|-------------------|
| 20% of Pro users refill 100 credits | +₹1,980/month |
| 20% of VIP users refill 100 credits | +₹2,980/month |
| **Total additional/month (300 users)** | **+₹4,960** |

---

## Implementation Files

| # | File | Changes |
|---|------|---------|
| 1 | `lib/constants/credits.ts` | Update `CREDIT_COSTS`, add `getInitialCredits()`, `getRefillOptions()` |
| 2 | `lib/constants/plans.ts` | Update `limits` to 3-month caps, add `credits` field |
| 3 | `app/api/credits/refill/route.ts` | **NEW** — Refill credits via payment |
| 4 | `app/api/analyze/route.ts` | Deduct 8 credits per analysis |
| 5 | `app/api/linkedin/route.ts` | Deduct 12 credits |
| 6 | `app/api/roadmap/route.ts` | Deduct 12 credits |
| 7 | `app/api/templates/route.ts` | Deduct 6 credits |
| 8 | `app/api/jobs/search/route.ts` | Add 3 credit deduction |
| 9 | `app/api/generate-resume/route.ts` | Deduct 10 credits (job_match) |
| 10 | `lib/constants/nav.ts` | Update nav items — hide Cold Email for Pro |
| 11 | `components/dashboard/PlanGate.tsx` | Check credit balance + feature access |
| 12 | `components/dashboard/Sidebar.tsx` | Show credit balance + refill button |
| 13 | `components/dashboard/PlanBadge.tsx` | Display remaining credits |

---

## Key Rules

1. **Pro users NEVER see Cold Email** — locked to VIP only
2. **AI Interview is 15 credits** — highest cost action (premium compute)
3. **Refill available** when credits ≤ 50 remaining
4. **Refill increments**: 50, 100, 200, 500 credits
5. **No monthly refresh** — one-time 3-month allocation
6. **Credits expire** after subscription ends
7. **No roll over** — use-it-or-lose-it per subscription period

---

## User Flow

1. **Free**: Gets 50 credits → 2 analyses, few searches → hits limit → upgrade prompt
2. **Pro Upgrade**: Pays ₹499 → 900 credits → uses ~300/month → when ≤50 left → refill at ₹99/100 credits
3. **VIP Upgrade**: Pays ₹1,499 → 1,800 credits → refill at ₹149/100 credits
4. **Refill**: Credit refill is instant payment through Razorpay → credits added immediately

---

*Last updated: July 2026*

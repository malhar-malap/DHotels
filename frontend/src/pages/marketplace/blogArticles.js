import { CATEGORIES } from '../../utils/hospitality';

const imageOf = (name) => CATEGORIES.find((c) => c.name === name)?.image;

// Long-form guides rendered at /blogs/:slug (keep slugs in sync with SitemapService.STATIC_PATHS)
export const blogArticles = [
  {
    slug: 'how-to-lease-a-hotel-in-india',
    title: 'How to Lease a Hotel in India: A Step-by-Step Guide',
    description: 'A practical guide to taking a hotel on lease in India — choosing the right property, reading the numbers, negotiating rent and lock-in, checking approvals and licences, and taking over operations.',
    category: 'Hotels',
    readTime: '7 min read',
    image: imageOf('Hotels'),
    datePublished: '2026-11-11',
    sections: [
      {
        paragraphs: [
          'Leasing a running hotel lets an operator grow without owning the land and building. You take over rooms that are already approved, an existing booking history and often a trained team, and you pay the owner a rent instead of a large upfront investment. The returns depend on getting the rent, the lock-in and the condition of the property right before you sign.',
          'This guide walks through the steps experienced operators follow, from setting criteria to the day you take over the keys.',
        ],
      },
      {
        heading: '1. Define what you are looking for',
        paragraphs: ['Clear criteria save weeks of chasing unsuitable properties and make your first conversation with an owner far more productive.'],
        list: [
          'Location and demand driver: business district, airport, pilgrimage town, hill station or beach destination',
          'Size: number of rooms (keys), banquet and restaurant space, and parking',
          'Positioning: budget, mid-scale, upscale or boutique, and whether you will run it under your own brand',
          'Budget: monthly rent you can carry, the security deposit, and the capital needed for refurbishment',
          'Condition: a running hotel you can take over as-is, or a bare shell you will fit out',
        ],
      },
      {
        heading: '2. Shortlist properties',
        paragraphs: [
          'On DHotels24.com you can filter hotels by city, room count and rent, compare plot and constructed area side by side, and unlock the owner’s contact when you are ready to talk. Shortlist three or four properties and visit them on both a busy and a quiet day.',
        ],
      },
      {
        heading: '3. Read the numbers',
        paragraphs: [
          'Ask for at least two years of occupancy, average room rate and revenue by month, split across rooms, food and beverage and banqueting. Build your own forecast: what the hotel can earn under your management, minus operating costs, should comfortably cover the rent with room for seasonality.',
          'A common rule of thumb is that rent should not exceed roughly a quarter to a third of the revenue you expect, but this varies widely with location and positioning.',
        ],
      },
      {
        heading: '4. Negotiate the lease terms',
        list: [
          'Rent and escalation: fixed rent, revenue share, or a mix, and how often it increases',
          'Lock-in period: the minimum term during which neither side can exit',
          'Security deposit: amount, interest (if any) and when it is returned',
          'Rent-free fit-out period: time to refurbish before rent starts',
          'Maintenance: who pays for structural repairs, lifts, generators and major equipment',
          'Sub-letting and branding: whether you can sub-let outlets or put the hotel under your brand',
        ],
      },
      {
        heading: '5. Check approvals and licences',
        paragraphs: [
          'Confirm that the building is approved for hotel use and that the constructed area matches the sanctioned plan. Check which licences can be transferred to you and which you must apply for afresh — typically the trade licence, FSSAI, fire NOC, the police or tourism registration and, if there is a bar, the excise licence.',
        ],
      },
      {
        heading: '6. Plan the takeover',
        paragraphs: [
          'Agree an inventory of furniture and equipment, how existing staff will be handled, and how bookings already on the books will be honoured. Update the online travel agency listings, payment accounts and signage on the day you take charge.',
          'DHotels24.com’s advisors can help you compare properties and structure the lease. Get in touch through the contact page when you have a shortlist.',
        ],
      },
    ],
  },
  {
    slug: 'hospitality-lease-agreement-checklist',
    title: 'Hotel & Restaurant Lease Agreements: What to Check Before You Sign',
    description: 'The clauses that matter most in an Indian hospitality lease — rent and escalation, lock-in, security deposit, fit-out period, maintenance, licences and exit — for hotels, resorts, restaurants and banquet halls.',
    category: 'Leasing',
    readTime: '5 min read',
    image: imageOf('Banquet halls'),
    datePublished: '2026-11-11',
    sections: [
      {
        paragraphs: [
          'A hospitality lease runs for years and decides how much of the business’s profit you keep. Most disputes between owners and operators trace back to a clause that was vague or missing. Use this checklist with your lawyer before you sign.',
        ],
      },
      {
        heading: 'Money',
        list: [
          'Base rent, whether it is fixed or linked to revenue, and when it is due',
          'Escalation: the percentage and frequency (for example 5% every year or 15% every three years)',
          'Security deposit: number of months, whether it earns interest, and the deadline for refund at exit',
          'GST, property tax, and who pays municipal and society charges',
        ],
      },
      {
        heading: 'Term and exit',
        list: [
          'Total lease term and renewal option, and on what terms rent resets at renewal',
          'Lock-in period for each side, and the penalty for leaving early',
          'Notice period after the lock-in ends',
          'What happens to your fit-out, equipment and brand signage when you leave',
        ],
      },
      {
        heading: 'Running the property',
        list: [
          'Permitted use — hotel, restaurant, bar, banqueting — written explicitly',
          'Rent-free period for refurbishment or fit-out',
          'Responsibility for structural repairs, lifts, DG sets, fire systems and major equipment',
          'Right to sub-let outlets, brand the property, or bring in a management company',
          'Owner’s cooperation in transferring or applying for licences in your name',
        ],
      },
      {
        heading: 'Paperwork',
        paragraphs: [
          'Leases longer than eleven months generally need to be registered, with stamp duty paid according to state rules. Keep copies of the owner’s title documents, the sanctioned building plan and the occupancy certificate with the agreement, and make sure the person signing has the authority to lease the property.',
        ],
      },
    ],
  },
  {
    slug: 'restaurant-takeover-checklist-india',
    title: 'Taking Over a Running Restaurant in India: A Checklist',
    description: 'What to check before taking over a running restaurant, café or bar in India — lease terms, licences, fit-out, trading history and staff — so the outlet keeps trading from day one.',
    category: 'Restaurants',
    readTime: '6 min read',
    image: imageOf('Restaurants and Bar'),
    datePublished: '2026-10-31',
    sections: [
      {
        paragraphs: [
          'Taking over an existing restaurant, café or bar can save months of fit-out and licensing compared with starting fresh. The risk is inheriting problems you cannot see in a single visit. Work through this checklist before you pay a deposit.',
        ],
      },
      {
        heading: 'The lease',
        list: [
          'Remaining term and lock-in, and whether the landlord consents to the transfer in writing',
          'Rent, escalation and security deposit — and who gets the existing deposit back',
          'Permitted use: confirm that food service and, if relevant, alcohol are allowed',
          'Restrictions on signage, exhaust ducts, operating hours and outdoor seating',
        ],
      },
      {
        heading: 'Licences and registrations',
        paragraphs: ['Requirements vary by state and city, but most outlets need some combination of:'],
        list: [
          'FSSAI licence or registration, in the name of the operating entity',
          'Health or trade licence from the municipal corporation',
          'Fire NOC, depending on seating capacity and premises size',
          'Shops and establishments registration and GST registration',
          'Excise licence for serving alcohol — check carefully whether it can be transferred or must be applied for afresh',
          'Music and performance licences if you play recorded music or host events',
        ],
      },
      {
        heading: 'Fit-out and equipment',
        paragraphs: [
          'Get a written inventory of what is included: kitchen equipment, exhaust and fresh-air systems, refrigeration, furniture, POS hardware and software, and any brand assets. Check the condition and age of the expensive items, and whether any are leased or financed.',
        ],
      },
      {
        heading: 'Trading history',
        list: [
          'Monthly sales for at least a year, split by dine-in, takeaway and delivery platforms',
          'Platform ratings, reviews and any account-level penalties',
          'Food and beverage cost percentages and wastage',
          'Pending dues to suppliers, landlords and statutory authorities',
        ],
      },
      {
        heading: 'People and handover',
        paragraphs: [
          'Decide early which staff you will retain, especially the head chef and floor manager, and agree how existing liabilities to employees will be settled. Plan the handover on a slow trading day, update delivery-platform and payment accounts, and keep recipes and supplier relationships documented.',
        ],
      },
    ],
  },
  /* Sale & profit sharing paused (only lease deals are offered). Uncomment to bring these guides back,
     and re-add their slugs to SitemapService.STATIC_PATHS.
  {
    slug: 'how-to-buy-a-hotel-in-india',
    title: 'How to Buy a Hotel in India: A Step-by-Step Guide',
    description: 'A practical guide to buying a running hotel in India — setting criteria, sourcing deals, reading the numbers, checking title and licences, structuring the deal and taking over operations.',
    category: 'Hotels',
    readTime: '8 min read',
    image: imageOf('Hotels'),
    datePublished: '2026-10-31',
    sections: [
      {
        paragraphs: [
          'Buying an operating hotel is usually faster than building one. You inherit rooms that are already approved, a booking history on the online travel agencies, trained staff and a reputation in the market. But the price you pay depends on details that rarely appear in a listing: how the land is held, whether the building matches its approvals, and how much of the revenue would survive a change of owner.',
          'This guide walks through the steps most successful buyers follow, from writing down what you want to the day you take over the keys.',
        ],
      },
      {
        heading: '1. Define what you are looking for',
        paragraphs: ['Clear criteria save weeks of chasing unsuitable deals and make your first conversation with an owner far more productive.'],
        list: [
          'Location and demand driver: business district, airport, pilgrimage town, hill station or beach destination',
          'Size: number of rooms (keys), plot area and constructed area',
          'Positioning: budget, mid-scale, upscale or boutique, and whether it is branded or independent',
          'Budget: total ticket size and how much will come from debt versus equity',
          'Deal type: outright purchase, long-term lease, or a profit-sharing partnership with the current owner',
          'Ownership: freehold land and building, or a leasehold you will step into',
        ],
      },
      {
        heading: '2. Source and shortlist properties',
        paragraphs: [
          'Owners are often reluctant to advertise a sale widely because staff, guests and travel partners may hear about it. Most good deals come through specialised marketplaces, brokers and industry networks.',
          'On DHotels24.com you can filter hotels by city, deal type, room count and price, compare plot and constructed area side by side, and unlock the owner’s contact when you are ready to talk.',
        ],
      },
      {
        heading: '3. Read the operating numbers',
        paragraphs: ['Before visiting, ask for the last three years of financial statements and the current year to date. The key metrics for a hotel are:'],
        list: [
          'Occupancy: the share of available room-nights actually sold, month by month across the season',
          'ADR (average daily rate): room revenue divided by room-nights sold',
          'RevPAR: room revenue divided by available room-nights — it combines occupancy and rate',
          'Revenue mix: rooms, food and beverage, banquets and other income',
          'Channel mix: direct bookings versus OTAs and corporate contracts, and the commissions paid',
          'GOP and EBITDA: what the hotel actually earns after operating costs, before and after fixed charges',
        ],
      },
      {
        heading: '4. Check title, approvals and licences',
        paragraphs: [
          'This is where many hotel deals stall. Have a lawyer and an architect review the documents before you commit to a price.',
        ],
        list: [
          'Land title chain and encumbrance certificate; for leasehold land, the lease term, rent and transfer conditions',
          'Land-use or conversion permission for commercial or hospitality use',
          'Sanctioned building plan and completion or occupancy certificate, compared with what is actually built',
          'Fire NOC and lift licences',
          'Trade licence, FSSAI registration and, where applicable, a police or lodging licence',
          'Excise (bar) licence, if alcohol is served, and whether it can be transferred',
          'Pollution control consents for larger properties, and any coastal or heritage restrictions',
        ],
      },
      {
        heading: '5. Agree terms and run due diligence',
        paragraphs: [
          'If the numbers and documents look right, agree indicative terms in a non-binding letter of intent: price, structure, what is included (furniture, equipment, brand, booking-engine accounts, website), an exclusivity period and the conditions for closing.',
          'Detailed due diligence then covers financial, tax, legal and technical checks — including the condition of the roof, plumbing, kitchens and air-conditioning, which drive near-term capital spending.',
        ],
      },
      {
        heading: '6. Plan the handover',
        paragraphs: [
          'Most of a hotel’s value lives in its operations, so plan the transition carefully. Agree which staff stay, transfer licences and utility connections, take over OTA and channel-manager accounts, honour advance bookings and settle supplier dues. A short overlap period with the previous owner often makes guests and staff barely notice the change.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-value-a-hotel-or-restaurant',
    title: 'How to Value a Hotel or Restaurant in India',
    description: 'The main methods used to value hotels, restaurants and other hospitality businesses in India — earnings multiples, per-key benchmarks, replacement cost and comparable sales — and what moves the price.',
    category: 'Valuation',
    readTime: '7 min read',
    image: imageOf('Restaurants'),
    datePublished: '2026-10-31',
    sections: [
      {
        paragraphs: [
          'There is no single “correct” price for a hospitality business. Buyers and sellers usually triangulate between a few methods, then negotiate on the risks each side sees. Understanding those methods helps owners set a realistic asking price and helps buyers spot when a number does not add up.',
        ],
      },
      {
        heading: 'Earnings-based valuation',
        paragraphs: [
          'For running businesses, the starting point is usually sustainable profit — typically EBITDA, adjusted for one-off items and for the owner’s own salary or perks. That profit is multiplied by a factor that reflects risk and growth, or capitalised at a yield an investor would expect.',
          'Smaller restaurants and cafés are often priced on the owner’s total earnings from the business plus the value of the fit-out and equipment, because they depend heavily on the operator.',
        ],
      },
      {
        heading: 'Per-key and per-square-foot benchmarks',
        paragraphs: [
          'Hotels are frequently compared on value per room (per key). It is a quick sense-check against recent deals in the same city and segment, but it ignores differences in land, F&B income and condition, so it should never be the only method.',
          'For restaurants, banquet halls and cafés, the rent or value per square foot of carpet area plays a similar role, especially when the premises are leased.',
        ],
      },
      {
        heading: 'Replacement cost',
        paragraphs: [
          'What would it cost to buy similar land, get approvals and build and furnish the same property today — and how long would it take? Replacement cost sets a ceiling for many buyers, and the time saved by buying an operating asset is part of what they are paying for.',
        ],
      },
      {
        heading: 'What pushes the price up or down',
        list: [
          'Freehold land in a strong location versus a short or restrictive lease',
          'Consistent occupancy and rate across seasons, not just a single strong year',
          'Transferable licences, especially excise licences for bars',
          'Building condition and the capital expenditure needed in the next few years',
          'Dependence on the owner, a single chef or one corporate contract',
          'Clean, verifiable accounts — undocumented cash income rarely gets paid for',
        ],
      },
      {
        heading: 'Setting your asking price',
        paragraphs: [
          'Owners who price close to what the documents support tend to close faster. On DHotels24.com you can mark a price as negotiable, and our advisors can help you prepare a valuation note that answers buyers’ first questions before they ask.',
        ],
      },
    ],
  },
  {
    slug: 'hotel-profit-sharing-agreements-explained',
    title: 'Hotel Profit-Sharing Agreements, Explained',
    description: 'How profit-sharing partnerships for hotels work in India — who brings what, how profit is split, lock-ins, reporting and exits — and what owners and partners should agree in writing.',
    category: 'Profit Sharing',
    readTime: '6 min read',
    image: imageOf('Resorts'),
    datePublished: '2026-10-31',
    sections: [
      {
        paragraphs: [
          'Not every hotel owner wants to sell. Some want capital to renovate, a professional operator, or a brand that brings more bookings — while keeping the land and building. A profit-sharing partnership lets them do that, and lets a partner earn from a hotel without buying it outright.',
        ],
      },
      {
        heading: 'Who brings what',
        list: [
          'The owner usually contributes the land, building and existing licences',
          'The partner contributes capital, operating expertise, a brand or distribution — or a mix',
          'Both agree who controls day-to-day operations and who approves major spending',
        ],
      },
      {
        heading: 'How profit is shared',
        paragraphs: [
          'The split can be applied to revenue, to gross operating profit or to net profit, and each choice shifts risk between the parties. Revenue shares are simple to verify but ignore costs; profit shares align incentives but depend on trustworthy accounting. Some agreements guarantee the owner a minimum payment with a share of profit above it.',
        ],
      },
      {
        heading: 'What to put in writing',
        list: [
          'The basis and percentage of the split, and how often it is paid',
          'Lock-in period, renewal terms and notice periods',
          'Who funds capital expenditure and how it is recovered',
          'Monthly reporting, audit rights and access to booking and accounting systems',
          'What happens on exit — buy-back rights, valuation method and handover of staff and accounts',
          'Dispute resolution and the governing law',
        ],
      },
      {
        heading: 'Finding a partner on DHotels24.com',
        paragraphs: [
          'Owners can list a hotel under the “Profit Sharing” deal type and describe the share, lock-in and contribution they are looking for. Investors and operators can browse every open opportunity on the profit sharing page and speak to owners directly.',
        ],
      },
    ],
  },
  */
];

export const getBlogArticle = (slug) => blogArticles.find((a) => a.slug === slug);

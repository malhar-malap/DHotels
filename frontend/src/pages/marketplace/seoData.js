/**
 * Location landing pages for search. Each key is also the route path (e.g. /hotels-for-lease-goa)
 * and must stay in sync with STATIC_PATHS in backend SitemapService. `legacyPath` is the page's old
 * "for sale" URL, which now redirects here.
 *
 * `cityFilter` is passed to the listings search; state-level pages leave it empty and show
 * the category nationally, because listings store a city, not a state.
 */
export const seoData = {
  'hotels-for-lease-goa': {
    legacyPath: '/hotels-for-sale-goa',
    guides: ['how-to-lease-a-hotel-in-india', 'hospitality-lease-agreement-checklist'],
    title: 'Hotels for Lease in Goa | Boutique & Beach Hotels | DHotels24.com',
    description: 'Browse hotels for lease in Goa — beach hotels, boutique stays and heritage properties in North and South Goa. Reviewed listings with rooms, area and rent details.',
    h1: 'Hotels for lease in Goa',
    eyebrow: 'Goa',
    categoryName: 'Hotels',
    locationName: 'Goa',
    cityFilter: 'Goa',
    introduction: 'Goa’s year-round domestic travel and long winter season make it one of India’s most active markets for hotel leases. Owners offer everything from 10-room boutique villas near the beach belts to mid-scale business hotels in Panaji and Margao to operators on long-term lease. DHotels24.com lets you compare these properties on the facts that matter — rooms, plot and constructed area and rent — before you speak to the owner.',
    sections: [
      {
        heading: 'What is typically offered on lease',
        content: `- **Boutique and villa hotels**: smaller keys counts, often in Anjuna, Assagao, Candolim and the South Goa beach villages.
- **Mid-scale hotels**: 30–80 rooms near Calangute, Baga, Panaji and Margao, often with a restaurant or bar licence.
- **Heritage properties**: Portuguese-era homes converted to stays, where conservation rules can affect refurbishment.
- **Bare-shell buildings**: new hotels the owner wants an operator to fit out and run.`,
      },
      {
        heading: 'What to check before you sign',
        content: `Confirm that the building is approved for hotel use and that the constructed area matches the sanctioned plan, and whether the property falls within coastal regulation limits. For running hotels, ask for occupancy and average room rate history across both the peak and monsoon seasons — your rent has to work in both — and check which trade, FSSAI, excise (if there is a bar) and fire licences can be transferred to you.`,
      },
    ],
    faqs: [
      { q: 'How is rent usually structured for a hotel lease in Goa?', a: 'Most leases have a fixed monthly or yearly rent with an agreed escalation, plus a refundable security deposit. Some owners accept a revenue share in the off-season. Each listing shows the expected rent and whether it is per month or per year.' },
      { q: 'What lock-in period should I expect?', a: 'Hotel leases commonly run 9 to 15 years with a lock-in of 3 to 5 years, but this is negotiable. Agree a rent-free period for any refurbishment before rent starts.' },
      { q: 'How do I contact the owner of a listing?', a: 'Open the listing — the owner’s name, phone and email are shown right there, free of charge. Call or email them directly and mention the listing code.' },
    ],
  },
  'hotels-for-lease-maharashtra': {
    legacyPath: '/hotels-for-sale-maharashtra',
    guides: ['how-to-lease-a-hotel-in-india', 'hospitality-lease-agreement-checklist'],
    title: 'Hotels for Lease in Maharashtra | Mumbai, Pune, Lonavala | DHotels24.com',
    description: 'Hotels for lease across Maharashtra — business hotels in Mumbai and Pune, weekend properties in Lonavala and Mahabaleshwar. Compare rooms, area and rent.',
    h1: 'Hotels for lease in Maharashtra',
    eyebrow: 'Maharashtra',
    categoryName: 'Hotels',
    locationName: 'Maharashtra',
    cityFilter: '',
    introduction: 'Maharashtra combines dense business-travel demand in Mumbai, Pune and Nagpur with strong weekend leisure markets in the Western Ghats and along the Konkan coast. Many owners prefer to hand their hotel to an experienced operator on a long-term lease — from compact business hotels near IT parks to hill-station properties. Use DHotels24.com to shortlist by room count and rent, then speak to owners directly.',
    sections: [
      {
        heading: 'Popular micro-markets',
        content: `- **Mumbai & Navi Mumbai**: business hotels near airports, MIDC areas and commercial districts.
- **Pune**: properties around Hinjewadi, Kharadi and the airport serving corporate travel.
- **Lonavala, Khandala & Mahabaleshwar**: weekend leisure hotels with seasonal peaks.
- **Nashik & Aurangabad**: pilgrimage, wine-country and heritage-circuit demand.`,
      },
      {
        heading: 'How hotel leases are structured',
        content: `Owners of newer buildings often offer a bare shell for the operator to fit out, usually with a rent-free period, while running hotels are handed over with furniture and equipment. Rent may be fixed with a yearly escalation, or partly linked to revenue. The listing description states the rent, deposit and condition of the property.`,
      },
    ],
    faqs: [
      { q: 'Are all these hotels currently operating?', a: 'Most are running hotels; some are newly built or shut buildings offered as a bare shell. The description and status on each listing explain the current condition.' },
      { q: 'Why does this page show hotels outside Maharashtra?', a: 'Listings are tagged by city, so the results below show hotels across India. Use the city filter on the marketplace to narrow to Mumbai, Pune or any other city.' },
    ],
  },
  'restaurants-for-lease-mumbai': {
    legacyPath: '/restaurants-for-sale-mumbai',
    guides: ['restaurant-takeover-checklist-india', 'hospitality-lease-agreement-checklist'],
    title: 'Restaurants for Lease in Mumbai | Running Outlets | DHotels24.com',
    description: 'Restaurants, cafés and resto-bars for lease in Mumbai — Bandra, Andheri, Lower Parel and beyond. See carpet area and rent before you call the owner.',
    h1: 'Restaurants for lease in Mumbai',
    eyebrow: 'Mumbai',
    categoryName: 'Restaurants',
    locationName: 'Mumbai',
    cityFilter: 'Mumbai',
    introduction: 'Taking a running or fitted-out restaurant on lease in Mumbai can save months of fit-out and licensing compared with starting fresh. Owners offer equipped kitchens, dine-in spaces and delivery-first outlets across the city. Every DHotels24.com listing shows the carpet area and rent up front, so you can compare outlets quickly.',
    sections: [
      {
        heading: 'Lease checklist',
        content: `- **Lease terms**: rent, escalation, lock-in and security deposit, in writing.
- **Licences**: FSSAI, health/trade licence, fire NOC, and the excise licence if alcohol is served.
- **Equipment & fit-out**: what is included in the rent and its condition.
- **Trading history**: for running outlets, dine-in covers and delivery-platform ratings and sales.`,
      },
      {
        heading: 'Neighbourhoods operators ask about',
        content: `- **Bandra & Khar**: destination dining and cafés with strong weekend trade.
- **Lower Parel & Worli**: office catchments that support lunch, after-work and bar trade.
- **Andheri & Powai**: dense residential and corporate demand with a large delivery share.
- **Navi Mumbai & Thane**: newer high streets and malls where rents are often lower.`,
      },
    ],
    faqs: [
      { q: 'Is the rent per month or per square foot?', a: 'It varies. Each listing shows whether the rent is a monthly amount or a rate per square foot per month, along with the carpet area.' },
      { q: 'Can I find a restaurant with a bar licence?', a: 'Yes — browse the Restaurant & Bar category, which is reserved for licensed resto-bars, pubs and lounges.' },
    ],
  },
  'resorts-for-lease-kerala': {
    legacyPath: '/resorts-for-sale-kerala',
    guides: ['how-to-lease-a-hotel-in-india', 'hospitality-lease-agreement-checklist'],
    title: 'Resorts for Lease in Kerala | Munnar, Kochi, Wayanad | DHotels24.com',
    description: 'Resorts for lease in Kerala — hill resorts in Munnar and Wayanad, backwater and beach properties near Kochi, Alleppey and Kovalam. Reviewed listings with area and rent.',
    h1: 'Resorts for lease in Kerala',
    eyebrow: 'Kerala',
    categoryName: 'Resorts',
    locationName: 'Kerala',
    cityFilter: '',
    introduction: 'Kerala’s hill stations, backwaters and beaches support a large base of leisure and wellness resorts, many of them family-owned. Owners regularly look for operators to take over on lease, particularly for properties that would benefit from new marketing or an ayurveda and wellness programme. DHotels24.com helps you compare these resorts by size, location and rent.',
    sections: [
      {
        heading: 'Things specific to resort leases',
        content: `Check access roads, water supply and power backup, and environmental clearances where the property is in an ecologically sensitive zone. Seasonality matters more than in city hotels — ask for monthly occupancy across the monsoon as well as peak months, and consider a rent structure that is lighter in the off-season.`,
      },
      {
        heading: 'Where resorts are offered',
        content: `- **Munnar, Thekkady & Wayanad**: hill and plantation resorts with cooler-weather demand.
- **Alleppey & Kumarakom**: backwater properties, often with houseboat or lake access.
- **Kovalam & Varkala**: beach resorts with strong winter seasons.
- **Kochi**: city and heritage properties that combine business and leisure travel.`,
      },
    ],
    faqs: [
      { q: 'What does a resort lease usually include?', a: 'Most resort leases give you the right to operate the property — rooms, restaurant, pool and grounds — for a fixed rent. Confirm in the description and with the owner which equipment and staff are included.' },
      { q: 'Why might I see resorts outside Kerala here?', a: 'Listings are tagged by city, so the results show resorts across India. Use the city filter in the marketplace to narrow to Munnar, Kochi or another town.' },
    ],
  },
  'banquet-halls-for-lease-delhi': {
    legacyPath: '/banquet-halls-for-sale-delhi',
    guides: ['hospitality-lease-agreement-checklist', 'restaurant-takeover-checklist-india'],
    title: 'Banquet Halls for Lease in Delhi NCR | DHotels24.com',
    description: 'Banquet halls, wedding venues and conference spaces for lease in Delhi, Gurugram and Noida. Compare carpet area and rent on reviewed listings.',
    h1: 'Banquet halls for lease in Delhi NCR',
    eyebrow: 'Delhi NCR',
    categoryName: 'Banquet halls',
    locationName: 'Delhi NCR',
    cityFilter: 'Delhi',
    introduction: 'Delhi NCR’s wedding and corporate-events calendar keeps banquet halls in demand year-round, and many owners prefer to lease their venue to a caterer or events operator. DHotels24.com lists banquet halls with their carpet area and rent so you can judge capacity and value at a glance.',
    sections: [
      {
        heading: 'What to evaluate',
        content: `- **Capacity and layout**: carpet area, pillar-free space, ceiling height and lawn or terrace areas.
- **Parking and access**: often the deciding factor for large weddings.
- **Kitchen and catering**: whether the kitchen is equipped and who may cater.
- **Permissions**: event, fire and, where relevant, excise permissions, and sound-limit compliance.`,
      },
      {
        heading: 'Where venues are offered',
        content: `Banquet halls cluster along arterial roads with space for parking — around the outer ring roads in Delhi, along major highways in Gurugram, and near the expressways in Noida and Greater Noida. Farmhouse venues on city outskirts are a separate segment with their own land-use and approval questions.`,
      },
      {
        heading: 'Numbers to ask for',
        content: `Ask for booking calendars and revenue across a full wedding season and the off-season, and the split between venue hire, catering and décor. Your rent should still work in the quieter months.`,
      },
    ],
    faqs: [
      { q: 'Can I lease a banquet hall for a fixed term?', a: 'Yes. Most banquet hall leases run for several years with a lock-in and a yearly rent escalation. Each listing shows the expected rent.' },
    ],
  },
};

/* Sale & profit sharing paused (only lease deals are offered). These were the original "for sale"
   landing pages; to bring them back, restore this object and their paths in SitemapService.
export const seoData = {
  'hotels-for-sale-goa': {
    guides: ['how-to-buy-a-hotel-in-india', 'hotel-profit-sharing-agreements-explained'],
    title: 'Hotels for Sale & Lease in Goa | Boutique & Beach Hotels | DHotels24.com',
    description: 'Browse hotels for sale, lease and profit sharing in Goa — beach hotels, boutique stays and heritage properties in North and South Goa. Reviewed listings with rooms, area and title details.',
    h1: 'Hotels for sale & lease in Goa',
    eyebrow: 'Goa',
    categoryName: 'Hotels',
    locationName: 'Goa',
    cityFilter: 'Goa',
    introduction: 'Goa’s year-round domestic travel and long winter season make it one of India’s most actively traded hotel markets. Owners list everything from 10-room boutique villas near the beach belts to mid-scale business hotels in Panaji and Margao. DHotels24.com lets you compare these properties on the facts that matter — rooms, plot and constructed area, ownership title and price — before you speak to the owner.',
    sections: [
      {
        heading: 'What is typically on the market',
        content: `- **Boutique and villa hotels**: smaller keys counts, often in Anjuna, Assagao, Candolim and the South Goa beach villages.
- **Mid-scale hotels**: 30–80 rooms near Calangute, Baga, Panaji and Margao, often with a restaurant or bar licence.
- **Heritage properties**: Portuguese-era homes converted to stays, where conservation rules can affect expansion.
- **Lease and profit-sharing deals**: owners who prefer an operator to run the hotel for a fixed rent or a share of profit.`,
      },
      {
        heading: 'What to check before you buy',
        content: `Confirm the land title and conversion status, the approved built-up area against what is actually constructed, and whether the property falls within coastal regulation limits. For running hotels, ask for occupancy and average room rate history across both the peak and monsoon seasons, and check that trade, FSSAI, excise (if there is a bar) and fire licences are current and transferable.`,
      },
    ],
    faqs: [
      { q: 'Can I lease a hotel in Goa instead of buying it?', a: 'Yes. Many Goa listings on DHotels24.com are offered on lease, where you pay the owner a fixed rent or premium and run the hotel yourself. Filter by “For Lease” to see them.' },
      { q: 'What does “Title” mean on a hotel listing?', a: 'It is the ownership title of the land and building — usually freehold or leasehold. Leasehold properties carry a ground lease with its own term and transfer conditions, which you should review before an offer.' },
      { q: 'How do I contact the owner of a listing?', a: 'Open the listing — the owner’s name, phone and email are shown right there, free of charge. Call or email them directly and mention the listing code.' },
    ],
  },
  'hotels-for-sale-maharashtra': {
    guides: ['how-to-buy-a-hotel-in-india', 'how-to-value-a-hotel-or-restaurant'],
    title: 'Hotels for Sale in Maharashtra | Mumbai, Pune, Lonavala | DHotels24.com',
    description: 'Hotels for sale, lease and profit sharing across Maharashtra — business hotels in Mumbai and Pune, weekend properties in Lonavala and Mahabaleshwar. Compare rooms, area, title and price.',
    h1: 'Hotels for sale in Maharashtra',
    eyebrow: 'Maharashtra',
    categoryName: 'Hotels',
    locationName: 'Maharashtra',
    cityFilter: '',
    introduction: 'Maharashtra combines dense business-travel demand in Mumbai, Pune and Nagpur with strong weekend leisure markets in the Western Ghats and along the Konkan coast. That mix creates a steady supply of hotels changing hands — from compact business hotels near IT parks to hill-station resorts-turned-hotels. Use DHotels24.com to shortlist by room count and land size, then speak to owners directly.',
    sections: [
      {
        heading: 'Popular micro-markets',
        content: `- **Mumbai & Navi Mumbai**: business hotels near airports, MIDC areas and commercial districts.
- **Pune**: properties around Hinjewadi, Kharadi and the airport serving corporate travel.
- **Lonavala, Khandala & Mahabaleshwar**: weekend leisure hotels with seasonal peaks.
- **Nashik & Aurangabad**: pilgrimage, wine-country and heritage-circuit demand.`,
      },
      {
        heading: 'Deal structures owners offer',
        content: `Outright sales are common for owner-run hotels, while many owners of newer buildings prefer a long-term lease to an operator. Profit sharing suits owners who want to keep the asset but bring in a partner’s capital or brand — the listing description usually states the share and lock-in being offered.`,
      },
    ],
    faqs: [
      { q: 'Are all these hotels currently operating?', a: 'Most are running businesses; some are newly built or shut buildings offered for lease or conversion. The description and deal type on each listing explain the current status.' },
      { q: 'Why does this page show hotels outside Maharashtra?', a: 'Listings are tagged by city, so the results below show hotels across India. Use the city filter on the marketplace to narrow to Mumbai, Pune or any other city.' },
    ],
  },
  'restaurants-for-sale-mumbai': {
    guides: ['restaurant-takeover-checklist-india', 'how-to-value-a-hotel-or-restaurant'],
    title: 'Restaurants for Sale & Lease in Mumbai | Running Outlets | DHotels24.com',
    description: 'Running restaurants, cafés and resto-bars for sale or lease in Mumbai — Bandra, Andheri, Lower Parel and beyond. See carpet area and price before you call the owner.',
    h1: 'Restaurants for sale & lease in Mumbai',
    eyebrow: 'Mumbai',
    categoryName: 'Restaurants',
    locationName: 'Mumbai',
    cityFilter: 'Mumbai',
    introduction: 'Taking over a running restaurant in Mumbai can save months of fit-out and licensing compared with starting fresh. Owners list fully equipped kitchens, dine-in spaces and delivery-first outlets across the city. Every DHotels24.com listing shows the carpet area and asking price up front, so you can compare outlets quickly.',
    sections: [
      {
        heading: 'Takeover checklist',
        content: `- **Lease terms**: remaining lock-in, escalation and whether the landlord consents to assignment.
- **Licences**: FSSAI, health/trade licence, fire NOC, and the excise licence if alcohol is served.
- **Equipment & fit-out**: what is included in the price and its condition.
- **Trading history**: dine-in covers and delivery-platform ratings and sales.`,
      },
      {
        heading: 'Neighbourhoods buyers ask about',
        content: `- **Bandra & Khar**: destination dining and cafés with strong weekend trade.
- **Lower Parel & Worli**: office catchments that support lunch, after-work and bar trade.
- **Andheri & Powai**: dense residential and corporate demand with a large delivery share.
- **Navi Mumbai & Thane**: newer high streets and malls where rents are often lower.`,
      },
      {
        heading: 'Sale or lease?',
        content: `Many Mumbai outlets are on leased premises, so a “sale” is often the sale of the running business, fit-out and goodwill rather than the property itself. A lease deal means you negotiate a fresh agreement with the landlord and may pay the outgoing operator for the fit-out. Check the deal type and description on each listing.`,
      },
    ],
    faqs: [
      { q: 'Is the price for the business or the property?', a: 'It depends on the deal type. “For Sale” listings may include the premises or only the running business and fit-out — the description clarifies. “For Lease” listings show the expected rent or premium.' },
      { q: 'Can I find a restaurant with a bar licence?', a: 'Yes — browse the Restaurant & Bar category, which is reserved for licensed resto-bars, pubs and lounges.' },
    ],
  },
  'resorts-for-sale-kerala': {
    guides: ['how-to-buy-a-hotel-in-india', 'how-to-value-a-hotel-or-restaurant'],
    title: 'Resorts for Sale & Lease in Kerala | Munnar, Kochi, Wayanad | DHotels24.com',
    description: 'Resorts for sale and lease in Kerala — hill resorts in Munnar and Wayanad, backwater and beach properties near Kochi, Alleppey and Kovalam. Reviewed listings with carpet area and price.',
    h1: 'Resorts for sale & lease in Kerala',
    eyebrow: 'Kerala',
    categoryName: 'Resorts',
    locationName: 'Kerala',
    cityFilter: '',
    introduction: 'Kerala’s hill stations, backwaters and beaches support a large base of leisure and wellness resorts, many of them family-owned. Owners regularly look for buyers or operators to take over, particularly for properties that would benefit from new marketing or an ayurveda and wellness programme. DHotels24.com helps you compare these resorts by size, location and price.',
    sections: [
      {
        heading: 'Things specific to resort deals',
        content: `Check land classification and any plantation or forest-land restrictions, access roads and water supply, and environmental clearances where the property is in an ecologically sensitive zone. For running resorts, seasonality matters — ask for monthly occupancy across the monsoon as well as peak months.`,
      },
      {
        heading: 'Where resorts are listed',
        content: `- **Munnar, Thekkady & Wayanad**: hill and plantation resorts with cooler-weather demand.
- **Alleppey & Kumarakom**: backwater properties, often with houseboat or lake access.
- **Kovalam & Varkala**: beach resorts with strong winter seasons.
- **Kochi**: city and heritage properties that combine business and leisure travel.`,
      },
      {
        heading: 'Operating models',
        content: `Owners may sell outright, lease the resort to an operator for a fixed rent, or bring in a brand on a management contract. Leases can suit buyers who want to test a destination before committing capital to land and buildings.`,
      },
    ],
    faqs: [
      { q: 'Do resort listings include the land?', a: 'Most “For Sale” resort listings include land and buildings; “For Lease” listings are for operating rights only. Confirm in the description and with the owner.' },
      { q: 'Why might I see resorts outside Kerala here?', a: 'Listings are tagged by city, so the results show resorts across India. Use the city filter in the marketplace to narrow to Munnar, Kochi or another town.' },
    ],
  },
  'banquet-halls-for-sale-delhi': {
    guides: ['how-to-value-a-hotel-or-restaurant', 'restaurant-takeover-checklist-india'],
    title: 'Banquet Halls for Sale & Lease in Delhi NCR | DHotels24.com',
    description: 'Banquet halls, wedding venues and conference spaces for sale or lease in Delhi, Gurugram and Noida. Compare carpet area and price on reviewed listings.',
    h1: 'Banquet halls for sale & lease in Delhi NCR',
    eyebrow: 'Delhi NCR',
    categoryName: 'Banquet halls',
    locationName: 'Delhi NCR',
    cityFilter: 'Delhi',
    introduction: 'Delhi NCR’s wedding and corporate-events calendar keeps banquet halls in demand year-round. Venues change hands as owners retire, re-develop or switch to leasing the space to a caterer-operator. DHotels24.com lists banquet halls with their carpet area and price so you can judge capacity and value at a glance.',
    sections: [
      {
        heading: 'What to evaluate',
        content: `- **Capacity and layout**: carpet area, pillar-free space, ceiling height and lawn or terrace areas.
- **Parking and access**: often the deciding factor for large weddings.
- **Kitchen and catering**: whether catering is in-house or outsourced, and the condition of the kitchen.
- **Permissions**: event, fire and, where relevant, excise permissions, and sound-limit compliance.`,
      },
      {
        heading: 'Where venues trade hands',
        content: `Banquet halls cluster along arterial roads with space for parking — around the outer ring roads in Delhi, along major highways in Gurugram, and near the expressways in Noida and Greater Noida. Farmhouse venues on city outskirts are a separate segment with their own land-use and approval questions.`,
      },
      {
        heading: 'Revenue to look for',
        content: `Ask for booking calendars and revenue across a full wedding season and the off-season, the split between venue hire, catering and décor, and any long-term tie-ups with caterers or event planners that would transfer to you.`,
      },
    ],
    faqs: [
      { q: 'Can I lease a banquet hall for a fixed term?', a: 'Yes. Many owners prefer to lease their venue to an operator. Filter by “For Lease” to see these opportunities.' },
    ],
  },
};
*/

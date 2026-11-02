import {
  PiBuildings,
  PiForkKnife,
  PiCoffee,
  PiChampagne,
  PiMartini,
  PiTreePalm,
} from 'react-icons/pi';

/**
 * Single source of truth for the DHotels24.in marketplace taxonomy.
 * `name` must match the `categories.name` rows seeded in database/dhotels_portal.sql.
 */
const unsplashBase = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=`;
const unsplash = (id) => `${unsplashBase(id)}1400`;

// Responsive widths for full-bleed photos. index.html preloads the home hero with the same widths.
export const HERO_WIDTHS = [640, 1080, 1600, 2000];
export const unsplashSrcSet = (url) => {
  const base = url.replace(/w=\d+$/, 'w=');
  return HERO_WIDTHS.map((w) => `${base}${w} ${w}w`).join(', ');
};

export const CATEGORIES = [
  {
    name: 'Hotels',
    label: 'Hotels',
    singular: 'Hotel',
    path: '/hotels-for-sale-india',
    icon: PiBuildings,
    image: unsplash('photo-1566073771259-6a8506099945'),
    blurb: 'Business, boutique and heritage hotels with operating history.',
    dealTypes: ['For Sale', 'For Lease', 'Profit Sharing'],
  },
  {
    name: 'Resorts',
    label: 'Resorts',
    singular: 'Resort',
    path: '/resorts-for-sale-india',
    icon: PiTreePalm,
    image: unsplash('photo-1582719508461-905c673771fd'),
    blurb: 'Leisure, wellness and destination resorts across India.',
    dealTypes: ['For Sale', 'For Lease'],
  },
  {
    name: 'Restaurants',
    label: 'Restaurants',
    singular: 'Restaurant',
    path: '/restaurants-for-sale-india',
    icon: PiForkKnife,
    image: unsplash('photo-1517248135467-4c7edcad34c4'),
    blurb: 'Fine dine, casual dining and QSR outlets in proven locations.',
    dealTypes: ['For Sale', 'For Lease'],
  },
  {
    name: 'Restaurants and Bar',
    label: 'Restaurant & Bar',
    singular: 'Restaurant & Bar',
    path: '/restaurant-and-bar-for-sale-india',
    icon: PiMartini,
    image: unsplash('photo-1514933651103-005eec06c04b'),
    blurb: 'Licensed resto-bars, pubs and lounges with active permits.',
    dealTypes: ['For Sale', 'For Lease'],
  },
  {
    name: 'Cafe',
    label: 'Cafés',
    singular: 'Café',
    path: '/cafes-for-sale-india',
    icon: PiCoffee,
    image: unsplash('photo-1554118811-1e0d58224f24'),
    blurb: 'Coffee shops, bakeries and bistros in high-footfall streets.',
    dealTypes: ['For Sale', 'For Lease'],
  },
  {
    name: 'Banquet halls',
    label: 'Banquet Halls',
    singular: 'Banquet Hall',
    path: '/banquet-halls-for-sale-india',
    icon: PiChampagne,
    image: unsplash('photo-1519167758481-83f550bb49b3'),
    blurb: 'Wedding, conference and celebration venues.',
    dealTypes: ['For Sale', 'For Lease'],
  },
];

export const DEAL_TYPES = [
  { name: 'For Sale', label: 'Buy', description: 'Outright acquisition of the property or running business.' },
  { name: 'For Lease', label: 'Lease', description: 'Take over operations on a long-term lease.' },
  { name: 'Profit Sharing', label: 'Profit Sharing', description: 'Co-own a hotel and share in its operating profit.' },
];

export const TITLE_TYPES = ['Freehold', 'Leasehold', 'Other'];

// One-time fee to unlock an owner's contact (PaymentService.CONTACT_ACCESS_AMOUNT_PAISE)
export const CONTACT_FEE = '₹1,000';

export const priceLabelFor = (dealTypeName) =>
  dealTypeName === 'For Lease' ? 'Expected rent / premium'
    : dealTypeName === 'Profit Sharing' ? 'Investment ask'
      : 'Asking price';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const getCategoryMeta = (nameOrPath) => {
  const key = normalize(nameOrPath);
  if (!key) return null;
  return CATEGORIES.find((c) => normalize(c.name) === key || c.path === nameOrPath || normalize(c.label) === key) || null;
};

export const isHotelCategory = (name) => normalize(name) === 'hotels';

export const CATEGORY_FALLBACK_IMAGE = CATEGORIES[0].image;

export const categoryImage = (categoryName) => getCategoryMeta(categoryName)?.image || CATEGORY_FALLBACK_IMAGE;

export const formatArea = (sqft) => {
  if (sqft === null || sqft === undefined || sqft === '' || isNaN(sqft)) return null;
  return `${Number(sqft).toLocaleString('en-IN', { maximumFractionDigits: 0 })} sq ft`;
};

/**
 * Category-specific facts in display order.
 * Hotels: rooms, plot area, constructed area, title. Everything else: carpet area.
 */
export const getSpecs = (categoryName, details) => {
  if (!details) return [];
  const specs = isHotelCategory(categoryName)
    ? [
        { key: 'numberOfRooms', label: 'Rooms', value: details.numberOfRooms ? `${details.numberOfRooms}` : null },
        { key: 'plotAreaSqft', label: 'Plot area', value: formatArea(details.plotAreaSqft) },
        { key: 'constructedAreaSqft', label: 'Constructed area', value: formatArea(details.constructedAreaSqft) },
        { key: 'titleType', label: 'Title', value: details.titleType || null },
      ]
    : [{ key: 'carpetAreaSqft', label: 'Carpet area', value: formatArea(details.carpetAreaSqft) }];
  return specs.filter((s) => s.value);
};

/** One-line summary for cards, e.g. "48 rooms · 22,000 sq ft plot" */
export const getSpecSummary = (categoryName, details) => {
  if (!details) return '';
  if (isHotelCategory(categoryName)) {
    return [
      details.numberOfRooms ? `${details.numberOfRooms} rooms` : null,
      details.plotAreaSqft ? `${formatArea(details.plotAreaSqft)} plot` : null,
    ].filter(Boolean).join(' · ');
  }
  return details.carpetAreaSqft ? `${formatArea(details.carpetAreaSqft)} carpet` : '';
};

/** Resolves upload paths and absolute URLs for <img src>. */
export const resolveImage = (src) => {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  return `/${src}`;
};

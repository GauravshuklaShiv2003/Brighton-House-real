// =====================================================================
//  BRIGHTON HOUSE: ALL CONTENT LIVES HERE
//  Change a number or a sentence in this file and the whole site updates.
//  Lines marked  >>> ADD <<<  are things the project doc did not contain.
// =====================================================================

export const site = {
  name: 'Brighton House',
  tagline: 'Upscale living. Thoughtfully priced.',

  developer: {
    name: 'Anabia Infrastructure Pvt. Ltd.',
    // >>> ADD <<< a short developer story and real track record. The "Developer" section
    // appears automatically once `story` has text. Only add facts you can prove.
    story: '',
    facts: [], // e.g. [{ value: '12', label: 'Projects delivered' }]
  },

  address: {
    line: 'Lakhnawali, Ecotech-II, Knowledge Park, Greater Noida',
    area: 'Surajpur',
    approach:
      'Come in from Surajpur Roundabout and take the first left exit. The site is just before the ITBP Camp.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Surajpur+Roundabout+Greater+Noida',
  },

  // >>> ADD <<< Phone and WhatsApp numbers, digits only with country code, e.g. '919876543210'.
  // While these are empty, the Call and WhatsApp buttons quietly turn into "enquire" buttons.
  contact: {
    phone: '',
    phoneDisplay: '',
    whatsapp: '',
    email: '',
  },

  // >>> ADD <<< UP RERA registration number (required on real-estate advertising).
  rera: { number: '', website: 'https://www.up-rera.in' },

  // Lead form. Paste a Google Apps Script / Zapier / CRM webhook URL in `endpoint`
  // and every enquiry is POSTed there as JSON. Empty = preview mode (nothing is sent).
  lead: { endpoint: '', brochureUrl: '' },

  pricing: {
    ratePerSqft: 4999,
    note:
      '*Indicative base price at ₹4,999 per sq ft of saleable area. Final price depends on the home, floor and applicable charges and taxes. Please confirm with our sales team.',
  },
};

// ---------------------------------------------------------------------
// Numbers about the project (from the master project document)
// ---------------------------------------------------------------------
export const facts = {
  homes: 185,
  towers: 10,
  floors: 'G+5',
  readyTowers: 4,
  readyHomes: 60,
  twoBhkHomes: 85,
  threeBhkHomes: 100,
};

// ---------------------------------------------------------------------
// Towers. "ready" = ready to move in.
// ---------------------------------------------------------------------
export const towers = [
  { id: 'galaxy-1', name: 'Galaxy 1', family: 'galaxy', ready: true },
  { id: 'galaxy-2', name: 'Galaxy 2', family: 'galaxy', ready: true },
  { id: 'galaxy-3', name: 'Galaxy 3', family: 'galaxy', ready: false },
  { id: 'jupiter-1', name: 'Jupiter 1', family: 'jupiter', ready: true },
  { id: 'jupiter-2', name: 'Jupiter 2', family: 'jupiter', ready: true },
  { id: 'jupiter-3', name: 'Jupiter 3', family: 'jupiter', ready: false },
  { id: 'orbit-1', name: 'Orbit 1', family: 'orbit', ready: false },
  { id: 'orbit-2', name: 'Orbit 2', family: 'orbit', ready: false },
  { id: 'venus-1', name: 'Venus 1', family: 'venus', ready: false },
  { id: 'venus-2', name: 'Venus 2', family: 'venus', ready: false },
];

export const families = [
  {
    id: 'galaxy',
    name: 'Galaxy',
    type: '3 BHK',
    perFloor: '3 homes per floor',
    sizes: '1,300 to 1,650 sq ft',
    blurb: 'The largest 3 BHK homes in the community.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: '3 BHK',
    perFloor: '3 homes per floor',
    sizes: '1,150 to 1,200 sq ft',
    blurb: 'Well-planned 3 BHK homes at the most accessible 3 BHK size.',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    type: '2 BHK',
    perFloor: '6 homes per floor',
    sizes: '1,100 to 1,275 sq ft',
    blurb: 'Spacious 2 BHK homes in the two largest towers.',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: '2 BHK',
    perFloor: '3 to 4 homes per floor',
    sizes: '900 to 1,275 sq ft',
    blurb: 'The widest range of 2 BHK sizes. Venus 2 also has 3 BHK homes.',
  },
];

// Typical floor plates (units per floor) used by the floor schematic.
export const plates = [
  { id: 'galaxy', label: 'Galaxy', units: 3, type: '3 BHK' },
  { id: 'jupiter', label: 'Jupiter', units: 3, type: '3 BHK' },
  { id: 'orbit', label: 'Orbit', units: 6, type: '2 BHK' },
  { id: 'venus-1', label: 'Venus 1', units: 4, type: '2 BHK' },
  { id: 'venus-2', label: 'Venus 2', units: 3, type: '2 BHK + 3 BHK' },
];

// ---------------------------------------------------------------------
// Homes: sizes (sq ft) and where they are found
// ---------------------------------------------------------------------
export const homes = {
  '2bhk': {
    label: '2 BHK',
    sizes: [
      { area: 900, towers: 'Venus' },
      { area: 1100, towers: 'Orbit' },
      { area: 1275, towers: 'Orbit, Venus' },
    ],
  },
  '3bhk': {
    label: '3 BHK',
    sizes: [
      { area: 1150, towers: 'Jupiter' },
      { area: 1200, towers: 'Jupiter' },
      { area: 1300, towers: 'Galaxy' },
      { area: 1450, towers: 'Galaxy' },
      { area: 1650, towers: 'Galaxy' },
    ],
  },
};

// ---------------------------------------------------------------------
// Amenities, written as lifestyle benefits
// ---------------------------------------------------------------------
export const amenityGroups = [
  {
    id: 'wellness',
    label: 'Wellness',
    items: [
      {
        id: 'park',
        icon: 'leaf',
        title: 'Central Park',
        fact: 'About 700 sq yd',
        text: 'A landscaped park at the heart of the community. Walk in the morning, sit under the trees in the evening.',
      },
      {
        id: 'yoga',
        icon: 'sun',
        title: 'Yoga & Fitness Deck',
        fact: 'On the rooftop',
        text: 'Stretch, train or meditate in the open air, a few floors above the day.',
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      {
        id: 'clubhouse',
        icon: 'users',
        title: 'Community Clubhouse',
        fact: '3,000 sq ft',
        text: 'A flexible space for birthdays, festivals and resident meetings. This is where neighbours become friends.',
      },
      {
        id: 'library',
        icon: 'book',
        title: 'Library',
        fact: 'Air-conditioned',
        text: 'A fully equipped library with dedicated reading spaces. A quiet room for students, readers and anyone who needs to focus.',
      },
      {
        id: 'roofs',
        icon: 'layers',
        title: 'Connected Rooftops',
        fact: 'Curated roof spaces',
        text: 'Rooftops of adjoining towers connect, so the open sky becomes a place to meet your neighbours.',
      },
    ],
  },
  {
    id: 'generations',
    label: 'Every generation',
    items: [
      {
        id: 'kids',
        icon: 'smile',
        title: "Children's Activity Zone",
        fact: 'Safe, planned play',
        text: 'A designed play zone where children can run, climb and make friends, close to home.',
      },
      {
        id: 'seniors',
        icon: 'bench',
        title: 'Senior Citizens’ Garden',
        fact: 'Shaded and quiet',
        text: 'A calm, shaded garden for elders to sit, read and catch up with friends.',
      },
    ],
  },
  {
    id: 'smart',
    label: 'Smart & secure',
    items: [
      {
        id: 'smart',
        icon: 'chip',
        title: 'Smart Homes',
        fact: 'Tata Power EZ Home',
        text: 'Smart-home solutions from Tata Power EZ Home, for everyday convenience.',
      },
      {
        id: 'security',
        icon: 'shield',
        title: '24×7 Security',
        fact: 'Controlled entry and exit',
        text: 'Round-the-clock security with controlled entry and exit. Peace of mind starts at the gate.',
      },
      {
        id: 'ev',
        icon: 'plug',
        title: 'EV Charging',
        fact: 'Multiple charging points',
        text: 'Charging points for electric vehicles, so switching to an EV does not mean switching homes.',
      },
    ],
  },
];

// A day at Brighton House. Each moment maps to a real amenity.
export const dayMoments = [
  {
    time: '6:30 AM',
    title: 'Yoga above the rooftops',
    text: 'The deck is quiet and the sky is still changing colour. Your day starts before the traffic does.',
    amenity: 'Yoga & Fitness Deck',
    tod: 'dawn',
  },
  {
    time: '11:00 AM',
    title: 'A quiet hour in the library',
    text: 'Air-conditioned, calm and close to home. Good for study, a long read or focused work.',
    amenity: 'Library',
    tod: 'day',
  },
  {
    time: '4:30 PM',
    title: 'Garden time for grandparents',
    text: 'Shade, benches and familiar faces. Elders get a corner of the park that is theirs.',
    amenity: 'Senior Citizens’ Garden',
    tod: 'day',
  },
  {
    time: '6:00 PM',
    title: 'Children out to play',
    text: 'The activity zone fills up as school bags come off. You can see them from the park path.',
    amenity: "Children's Activity Zone",
    tod: 'dusk',
  },
  {
    time: '8:30 PM',
    title: 'Birthdays, festivals, family nights',
    text: 'The clubhouse and connected rooftops give every celebration somewhere to happen.',
    amenity: 'Community Clubhouse',
    tod: 'night',
  },
];

// ---------------------------------------------------------------------
// Location and connectivity (travel times as supplied by the project team)
// ---------------------------------------------------------------------
export const connectivity = {
  road: [
    { name: 'Pari Chowk', min: 12 },
    { name: 'Yamuna Expressway', min: 12 },
    { name: 'Greater Noida Expressway', min: 18 },
    { name: 'Gaur Chowk', min: 25 },
    { name: 'Dadri', min: 25 },
    { name: 'Eastern Peripheral Expressway', min: 28 },
  ],
  rail: [
    { name: 'Gaur Chowk', min: 8 },
    { name: 'Ghaziabad', min: 10 },
    { name: 'Delhi Metro', min: 15 },
    { name: 'Anand Vihar', min: 15, tag: 'MMTS' },
    { name: 'Faridabad, Bata Chowk', min: 15 },
    { name: 'Boraki', min: 20, tag: 'MMTS' },
    { name: 'Gurugram, IFFCO Chowk', min: 35 },
    { name: 'IGI Airport', min: 40 },
    { name: 'Noida International Airport, Jewar', min: 45 },
    { name: 'Meerut', min: 75 },
  ],
  disclaimer:
    'Travel times are indicative, measured from Surajpur. Metro and rapid-rail links are upcoming or proposed and depend on their completion.',
  future: [
    {
      tag: 'Upcoming',
      title: 'Rapid Rail-cum-Metro interchange',
      text: 'Surajpur is designated as a key interchange on the upcoming Rapid Rail-cum-Metro Corridor, which will link the Ghaziabad RRTS station directly to Noida International Airport in Jewar.',
    },
    {
      tag: 'Proposed',
      title: 'Gurgaon to Surajpur corridor',
      text: 'A proposed 60 km corridor from IFFCO Chowk, Gurgaon will give commuters from southern NCR fast access to Surajpur, and onward to IGI Airport.',
    },
  ],
};

// ---------------------------------------------------------------------
// Why Brighton House: ranked by what matters most to a buyer
// ---------------------------------------------------------------------
export const reasons = [
  {
    icon: 'key',
    title: 'Ready to move in',
    text: 'Four finished towers with 60 homes. Walk through the real building, the real park and your real floor before you decide.',
  },
  {
    icon: 'train',
    title: 'A connected address',
    text: 'Surajpur is planned as an interchange on the upcoming Rapid Rail-cum-Metro corridor, between Ghaziabad RRTS and Noida International Airport.',
  },
  {
    icon: 'building',
    title: 'Low-rise, close-knit',
    text: 'Ground-floor parking plus five floors of homes. Ten towers, 185 homes, and neighbours you will actually know.',
  },
  {
    icon: 'tag',
    title: 'Upscale, without the premium',
    text: 'A park, library, clubhouse and rooftops, in a bracket most families can reach. Not luxury you will never use.',
  },
  {
    icon: 'chip',
    title: 'Smart homes, built in',
    text: 'Smart-home solutions from Tata Power EZ Home and multiple EV charging points.',
  },
  {
    icon: 'sun',
    title: 'Roofs with a purpose',
    text: 'Connected, curated rooftops, including a yoga and fitness deck, give the community room to breathe.',
  },
];

// ---------------------------------------------------------------------
// FAQ (answers use only verified project information)
// ---------------------------------------------------------------------
export function buildFaq(price) {
  const reraAnswer = site.rera.number
    ? `Yes. UP RERA registration number: ${site.rera.number}.`
    : 'Our sales team will share the project’s registration details when you enquire.';
  return [
    {
      q: 'Where is Brighton House located?',
      a: `At ${site.address.line}. ${site.address.approach}`,
    },
    {
      q: 'What types of homes are available?',
      a: `2 BHK homes from 900 to 1,275 sq ft and 3 BHK homes from 1,150 to 1,650 sq ft. There are ${facts.homes} homes across ${facts.towers} towers.`,
    },
    {
      q: 'What does a home cost?',
      a: `2 BHK homes start from ₹${price.from2} Lac* and 3 BHK homes from ₹${price.from3} Lac*, at an indicative base rate of ₹4,999 per sq ft. Final price depends on the home you choose, so please ask our team for an exact quote.`,
    },
    {
      q: 'Which towers are ready to move in?',
      a: `Galaxy 1, Galaxy 2, Jupiter 1 and Jupiter 2. That is ${facts.readyHomes} ready homes. You can visit them today.`,
    },
    {
      q: 'What is the possession timeline for the other towers?',
      a: 'Please contact our sales team for the current status of each remaining tower.',
    },
    {
      q: 'What amenities will I get?',
      a: 'A landscaped central park, a 3,000 sq ft community clubhouse, an air-conditioned library, connected rooftops with a yoga and fitness deck, a children’s activity zone, a shaded senior citizens’ garden, smart-home solutions, 24×7 controlled entry and EV charging points.',
    },
    {
      q: 'How well connected is the project?',
      a: 'Pari Chowk and the Yamuna Expressway are about 12 minutes away, and the Greater Noida Expressway about 18 minutes. Surajpur is also planned as an interchange on the upcoming Rapid Rail-cum-Metro corridor to Noida International Airport.',
    },
    { q: 'Who is the developer?', a: `${site.developer.name}` },
    { q: 'Is the project RERA registered?', a: reraAnswer },
    {
      q: 'How do I schedule a site visit?',
      a: 'Tap “Book a site visit”, share your name and number, and choose a time that suits you. Our team will confirm with a call.',
    },
  ];
}

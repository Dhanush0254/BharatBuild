const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../modules/users/user.model');
const Listing = require('../modules/listings/listing.model');

// ── Telangana Locations ──────────────────────────────────────────────────────
const locations = [
  { area: 'Kukatpally', district: 'Medchal-Malkajgiri', coords: [78.3968, 17.4933] },
  { area: 'LB Nagar', district: 'Rangareddy', coords: [78.5528, 17.3457] },
  { area: 'Dilsukhnagar', district: 'Rangareddy', coords: [78.5247, 17.3685] },
  { area: 'Miyapur', district: 'Medchal-Malkajgiri', coords: [78.3489, 17.4968] },
  { area: 'Secunderabad', district: 'Hyderabad', coords: [78.5016, 17.4399] },
  { area: 'Medchal', district: 'Medchal-Malkajgiri', coords: [78.4820, 17.6294] },
  { area: 'Sangareddy', district: 'Sangareddy', coords: [78.0815, 17.6294] },
  { area: 'Uppal', district: 'Medchal-Malkajgiri', coords: [78.5594, 17.4065] },
  { area: 'Begumpet', district: 'Hyderabad', coords: [78.4706, 17.4440] },
  { area: 'Ameerpet', district: 'Hyderabad', coords: [78.4480, 17.4375] },
  { area: 'Kompally', district: 'Medchal-Malkajgiri', coords: [78.4860, 17.5405] },
  { area: 'Nagole', district: 'Rangareddy', coords: [78.5590, 17.3720] },
];

const providerNames = [
  { name: 'Raju Kumar', phone: '9876543210' },
  { name: 'Suresh Reddy', phone: '9876543211' },
  { name: 'Venkatesh Yadav', phone: '9876543212' },
  { name: 'Ravi Shankar', phone: '9876543213' },
  { name: 'Naresh Goud', phone: '9876543214' },
  { name: 'Mahesh Kumar', phone: '9876543215' },
  { name: 'Srinivas Reddy', phone: '9876543216' },
  { name: 'Padma Devi', phone: '9876543217' },
  { name: 'Lakshmi Bai', phone: '9876543218' },
  { name: 'Rajesh Sharma', phone: '9876543219' },
  { name: 'Ganesh Patel', phone: '9876543220' },
  { name: 'Kishore Babu', phone: '9876543221' },
  { name: 'Anand Rao', phone: '9876543222' },
  { name: 'Prasad Reddy', phone: '9876543223' },
  { name: 'Ramesh Naidu', phone: '9876543224' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (val) => val + (Math.random() - 0.5) * 0.04;

// ── Listing Templates ────────────────────────────────────────────────────────
const workerTemplates = [
  { sub: 'mestri', title: 'Experienced Mestri for Construction Work', price: [700, 1000], unit: 'per day', meta: { experience: '8 years', specialization: 'Residential construction' } },
  { sub: 'mestri', title: 'Professional Mason / Mestri Available', price: [800, 1200], unit: 'per day', meta: { experience: '12 years', specialization: 'Commercial buildings' } },
  { sub: 'helper', title: 'Construction Helper Available for Daily Wage', price: [400, 600], unit: 'per day', meta: { experience: '3 years' } },
  { sub: 'helper', title: 'Reliable Construction Labour Available', price: [450, 550], unit: 'per day', meta: { experience: '5 years' } },
  { sub: 'electrician', title: 'Licensed Electrician — Wiring & Repairs', price: [600, 900], unit: 'per day', meta: { experience: '7 years', certification: 'Government Licensed' } },
  { sub: 'electrician', title: 'Electrical Contractor for New Construction', price: [700, 1100], unit: 'per day', meta: { experience: '10 years', certification: 'Certified' } },
  { sub: 'plumber', title: 'Expert Plumber — Pipeline & Fitting Work', price: [600, 850], unit: 'per day', meta: { experience: '6 years' } },
  { sub: 'plumber', title: 'Professional Plumber for Bathroom & Kitchen', price: [650, 900], unit: 'per day', meta: { experience: '8 years' } },
  { sub: 'carpenter', title: 'Skilled Carpenter — Furniture & Woodwork', price: [700, 1000], unit: 'per day', meta: { experience: '10 years', specialization: 'Door frames & windows' } },
  { sub: 'carpenter', title: 'Wooden Door & Window Frame Specialist', price: [750, 1100], unit: 'per day', meta: { experience: '15 years' } },
  { sub: 'painter', title: 'House Painting — Interior & Exterior', price: [500, 800], unit: 'per day', meta: { experience: '6 years', type: 'Emulsion & texture' } },
  { sub: 'painter', title: 'Professional Wall Painter with Texture Work', price: [600, 900], unit: 'per day', meta: { experience: '8 years' } },
  { sub: 'welder', title: 'Welding & Fabrication Work Available', price: [700, 1000], unit: 'per day', meta: { experience: '9 years', type: 'Arc & gas welding' } },
  { sub: 'welder', title: 'Gate & Grills Fabrication — Expert Welder', price: [750, 1100], unit: 'per day', meta: { experience: '11 years' } },
];

const machineryTemplates = [
  { sub: 'JCB', title: 'JCB Excavator for Rent', price: [2500, 4000], unit: 'per hour', meta: { model: 'JCB 3DX', capacity: '3.5 ton', operator: 'Included' } },
  { sub: 'JCB', title: 'JCB Machine with Operator — Earthwork', price: [3000, 4500], unit: 'per hour', meta: { model: 'JCB 4DX', capacity: '4 ton', operator: 'Included' } },
  { sub: 'crane', title: 'Hydraulic Crane for Construction Site', price: [5000, 8000], unit: 'per hour', meta: { capacity: '15 ton', height: '30 meters', operator: 'Included' } },
  { sub: 'crane', title: 'Mobile Crane Available for Hire', price: [4000, 7000], unit: 'per hour', meta: { capacity: '10 ton', operator: 'Included' } },
  { sub: 'tractor', title: 'Tractor with Trolley — Material Transport', price: [1500, 2500], unit: 'per trip', meta: { capacity: '3 ton', driver: 'Included' } },
  { sub: 'tractor', title: 'Tractor for Earthwork & Land Leveling', price: [1800, 3000], unit: 'per hour', meta: { model: 'Mahindra 575', driver: 'Included' } },
  { sub: 'drilling rig', title: 'Borewell Drilling Rig — Deep Boring', price: [8000, 15000], unit: 'per 100ft', meta: { depth: 'Up to 500ft', type: 'Rotary' } },
  { sub: 'mixer machine', title: 'Concrete Mixer Machine on Rent', price: [800, 1500], unit: 'per day', meta: { capacity: '400 liters', type: 'Tilting drum' } },
  { sub: 'mixer machine', title: 'Mini Concrete Mixer for Small Projects', price: [500, 900], unit: 'per day', meta: { capacity: '200 liters' } },
  { sub: 'lorry', title: 'Tata Lorry for Heavy Material Transport', price: [3000, 5000], unit: 'per trip', meta: { capacity: '10 ton', driver: 'Included' } },
  { sub: 'lorry', title: 'Transport Lorry — Sand, Gravel, Steel', price: [2500, 4500], unit: 'per trip', meta: { capacity: '8 ton', driver: 'Included' } },
];

const materialTemplates = [
  { sub: 'sand', title: 'River Sand — Premium Quality', price: [4000, 6000], unit: 'per tractor', meta: { type: 'River sand', quality: 'Zone II' } },
  { sub: 'sand', title: 'M-Sand for Construction — Best Price', price: [3500, 5000], unit: 'per tractor', meta: { type: 'M-Sand (Manufactured)', quality: 'IS standard' } },
  { sub: 'bricks', title: 'Red Clay Bricks — Bulk Supply', price: [5000, 7000], unit: 'per 1000 pieces', meta: { type: 'Wire-cut', size: '9x4x3 inch' } },
  { sub: 'bricks', title: 'Fly Ash Bricks — Lightweight & Durable', price: [4500, 6000], unit: 'per 1000 pieces', meta: { type: 'Fly ash', size: '9x4x3 inch' } },
  { sub: 'cement', title: 'UltraTech Cement — 53 Grade OPC', price: [370, 420], unit: 'per bag', meta: { brand: 'UltraTech', grade: 'OPC 53', weight: '50 kg' } },
  { sub: 'cement', title: 'ACC Cement — PPC Grade', price: [350, 400], unit: 'per bag', meta: { brand: 'ACC', grade: 'PPC', weight: '50 kg' } },
  { sub: 'cement', title: 'Ambuja Cement — OPC 43 Grade', price: [360, 410], unit: 'per bag', meta: { brand: 'Ambuja', grade: 'OPC 43', weight: '50 kg' } },
  { sub: 'steel', title: 'TMT Steel Bars — Fe 500 Grade', price: [55000, 65000], unit: 'per ton', meta: { brand: 'Tata Tiscon', grade: 'Fe 500', type: 'TMT' } },
  { sub: 'steel', title: 'Vizag Steel TMT Bars — Fe 500D', price: [52000, 62000], unit: 'per ton', meta: { brand: 'Vizag Steel', grade: 'Fe 500D' } },
  { sub: 'gravel', title: 'Crushed Stone Gravel — 20mm & 40mm', price: [1200, 2000], unit: 'per cubic meter', meta: { sizes: '20mm, 40mm', type: 'Crushed granite' } },
  { sub: 'gravel', title: 'Metal Jelly for RCC & Road Work', price: [1500, 2200], unit: 'per cubic meter', meta: { sizes: '12mm, 20mm' } },
];

const repairTemplates = [
  { sub: 'AC repair', title: 'AC Repair & Service — All Brands', price: [500, 800], unit: 'per visit', meta: { brands: 'All brands', type: 'Split & Window AC' } },
  { sub: 'AC repair', title: 'AC Installation & Gas Refill', price: [1000, 2000], unit: 'per unit', meta: { service: 'Installation + Gas refill' } },
  { sub: 'electrical repair', title: 'Home Electrical Repair — Wiring & Switches', price: [300, 600], unit: 'per visit', meta: { type: 'Residential', experience: '5 years' } },
  { sub: 'electrical repair', title: 'Electrical Fault Finding & Repair', price: [400, 700], unit: 'per visit', meta: { type: 'Residential & Commercial' } },
  { sub: 'plumbing repair', title: 'Plumbing Repair — Leakage & Blockage Fix', price: [300, 500], unit: 'per visit', meta: { type: 'Emergency service available' } },
  { sub: 'plumbing repair', title: 'Bathroom Plumbing Repair & Fitting', price: [400, 700], unit: 'per visit', meta: { type: 'Installation & repair' } },
  { sub: 'borewell repair', title: 'Borewell Motor Repair & Service', price: [1500, 3000], unit: 'per visit', meta: { type: 'Submersible & Monoblock', experience: '10 years' } },
  { sub: 'borewell repair', title: 'Borewell Flush & Motor Installation', price: [2000, 5000], unit: 'per job', meta: { service: 'Flushing + Motor fitting' } },
];

const descriptionTemplates = {
  workers: (sub, loc) => [
    `Experienced ${sub} available for work in ${loc.area} and surrounding areas. I have been working in the construction industry and ensure quality workmanship on every project. Available for both residential and commercial jobs. Contact me directly for immediate availability.`,
    `Professional ${sub} with years of experience in ${loc.area}, Hyderabad. Specializing in quality construction work with timely completion. I bring my own basic tools and work with dedication. Daily wage and contract work both accepted.`,
    `Skilled ${sub} looking for construction work around ${loc.area}. I have completed many projects in the ${loc.district} district and have good references. Available for immediate joining. Weekend work also accepted.`,
  ],
  machinery: (sub, loc) => [
    `Well-maintained ${sub} available for rent in ${loc.area} area. Experienced operator included. We ensure on-time delivery to your construction site. Serving ${loc.district} district and nearby areas. Hourly and daily rates available.`,
    `${sub} on rent for construction and earthwork in ${loc.area}. Our machine is in excellent working condition and comes with a skilled operator. Contact us for best rates. Bulk booking discounts available.`,
  ],
  materials: (sub, loc) => [
    `We supply top-quality ${sub} directly to your construction site in ${loc.area} and across ${loc.district} district. Fast delivery guaranteed. We deal only in certified quality materials. Bulk orders welcome.`,
    `Premium ${sub} available at competitive prices with delivery to ${loc.area} and surrounding areas. We have been supplying construction materials for over 10 years. Quality tested and certified.`,
  ],
  repairs: (sub, loc) => [
    `${sub} expert serving ${loc.area} and nearby areas. Quick response time and professional service. All types of ${sub.toLowerCase()} handled. Warranty on service provided. Call for emergency service.`,
    `Professional ${sub} service in ${loc.area}, ${loc.district}. We provide quick, reliable and affordable repair services. Customer satisfaction guaranteed. Available on weekends and holidays.`,
  ],
};

// ── Build listings ───────────────────────────────────────────────────────────
const buildListings = (templates, category, providerIds) => {
  const listings = [];

  templates.forEach((tpl) => {
    // Create 1-2 listings per template
    const count = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const loc = rand(locations);
      const provider = rand(providerIds);
      const descs = descriptionTemplates[category](tpl.sub, loc);
      const price = tpl.price[0] + Math.floor(Math.random() * (tpl.price[1] - tpl.price[0]));

      listings.push({
        provider,
        category,
        subCategory: tpl.sub,
        title: tpl.title,
        description: rand(descs),
        pricing: { amount: price, unit: tpl.unit },
        location: {
          type: 'Point',
          coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])],
        },
        address: {
          area: loc.area,
          city: 'Hyderabad',
          district: loc.district,
          state: 'Telangana',
        },
        metadata: tpl.meta,
        availability: Math.random() > 0.1, // 90% available
        status: 'approved',
        viewCount: Math.floor(Math.random() * 200),
        inquiryCount: Math.floor(Math.random() * 30),
      });
    }
  });

  return listings;
};

// ── Main Seed Function ───────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Listing.deleteMany(),
    ]);
    console.log('✓ Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bharatbuild.in',
      password: 'admin123',
      role: 'admin',
      phone: '9000000000',
    });
    console.log('✓ Admin created: admin@bharatbuild.in / admin123');

    // Create seeker user
    const seeker = await User.create({
      name: 'Priya Sharma',
      email: 'seeker@bharatbuild.in',
      password: 'seeker123',
      role: 'seeker',
      phone: '9000000001',
    });
    console.log('✓ Seeker created: seeker@bharatbuild.in / seeker123');

    // Create provider users
    const providerDocs = [];
    for (const p of providerNames) {
      const loc = rand(locations);
      const doc = await User.create({
        name: p.name,
        email: `${p.name.split(' ')[0].toLowerCase()}@bharatbuild.in`,
        password: 'provider123',
        role: 'provider',
        phone: p.phone,
        location: {
          type: 'Point',
          coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])],
        },
        address: {
          area: loc.area,
          city: 'Hyderabad',
          district: loc.district,
          state: 'Telangana',
        },
      });
      providerDocs.push(doc);
    }
    console.log(`✓ ${providerDocs.length} providers created`);

    const providerIds = providerDocs.map((p) => p._id);

    // Build all listings
    const allListings = [
      ...buildListings(workerTemplates, 'workers', providerIds),
      ...buildListings(machineryTemplates, 'machinery', providerIds),
      ...buildListings(materialTemplates, 'materials', providerIds),
      ...buildListings(repairTemplates, 'repairs', providerIds),
    ];

    await Listing.insertMany(allListings);
    console.log(`✓ ${allListings.length} listings seeded successfully!`);
    console.log('\n── Seed Summary ──');
    console.log(`  Users:    ${providerDocs.length + 2}`);
    console.log(`  Listings: ${allListings.length}`);
    console.log(`  Workers:  ${allListings.filter(l => l.category === 'workers').length}`);
    console.log(`  Machinery: ${allListings.filter(l => l.category === 'machinery').length}`);
    console.log(`  Materials: ${allListings.filter(l => l.category === 'materials').length}`);
    console.log(`  Repairs:  ${allListings.filter(l => l.category === 'repairs').length}`);

    process.exit(0);
  } catch (err) {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  }
};

seedDatabase();

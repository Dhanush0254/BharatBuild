const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../modules/users/user.model');
const Listing = require('../modules/listings/listing.model');
const Booking = require('../modules/bookings/booking.model');
const Review = require('../modules/reviews/review.model');
const Chat = require('../modules/chats/chat.model');
const Message = require('../modules/chats/message.model');

const locations = [
  { area: 'Kukatpally', district: 'Medchal-Malkajgiri', coords: [78.3968, 17.4933] },
  { area: 'LB Nagar', district: 'Rangareddy', coords: [78.5528, 17.3457] },
  { area: 'Dilsukhnagar', district: 'Rangareddy', coords: [78.5247, 17.3685] },
  { area: 'Miyapur', district: 'Medchal-Malkajgiri', coords: [78.3489, 17.4968] },
  { area: 'Secunderabad', district: 'Hyderabad', coords: [78.5016, 17.4399] },
  { area: 'Patancheru', district: 'Sangareddy', coords: [78.2640, 17.5330] },
  { area: 'Gachibowli', district: 'Rangareddy', coords: [78.3498, 17.4401] },
  { area: 'Uppal', district: 'Medchal-Malkajgiri', coords: [78.5594, 17.4065] },
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

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (val) => val + (Math.random() - 0.5) * 0.04;
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min));

// V2 subcategories matching master spec
const workerTemplates = [
  { sub: 'Mestri', title: 'Experienced Mestri for Construction', price: [800, 1200], unit: 'per day', meta: { experience: '10 years', specialization: 'Residential' } },
  { sub: 'Mestri', title: 'Professional Mestri — Full Site Supervision', price: [1000, 1500], unit: 'per day', meta: { experience: '15 years', specialization: 'Commercial' } },
  { sub: 'Mason', title: 'Skilled Mason — Brickwork & Plastering', price: [700, 1000], unit: 'per day', meta: { experience: '8 years' } },
  { sub: 'Mason', title: 'Mason Available for Wall & Foundation Work', price: [650, 950], unit: 'per day', meta: { experience: '12 years' } },
  { sub: 'Carpenter', title: 'Carpenter — Doors, Windows & Furniture', price: [800, 1100], unit: 'per day', meta: { experience: '10 years' } },
  { sub: 'Electrician', title: 'Licensed Electrician — Wiring & Repairs', price: [600, 900], unit: 'per day', meta: { experience: '7 years', certification: 'Government Licensed' } },
  { sub: 'Painter', title: 'Professional Painter — Interior & Exterior', price: [500, 800], unit: 'per day', meta: { experience: '6 years' } },
  { sub: 'Welder', title: 'Welder — Gates, Grills & Steel Work', price: [700, 1000], unit: 'per day', meta: { experience: '8 years' } },
  { sub: 'Plumber', title: 'Expert Plumber — Pipeline & Fitting', price: [600, 850], unit: 'per day', meta: { experience: '6 years' } },
  { sub: 'Tile Worker', title: 'Tile Worker — Floor & Wall Tiling', price: [700, 1000], unit: 'per day', meta: { experience: '5 years' } },
  { sub: 'POP Worker', title: 'POP & False Ceiling Specialist', price: [800, 1100], unit: 'per day', meta: { experience: '7 years' } },
  { sub: 'Helper', title: 'Construction Helper — Daily Wage', price: [400, 600], unit: 'per day', meta: { experience: '3 years' } },
  { sub: 'AC Technician', title: 'AC Technician — Install & Service', price: [600, 900], unit: 'per visit', meta: { experience: '5 years', brands: 'All brands' } },
];

const machineryTemplates = [
  { sub: 'JCB', title: 'JCB Excavator for Rent — Earthwork', price: [2500, 4000], unit: 'per hour', meta: { model: 'JCB 3DX', operator: 'Included' } },
  { sub: 'JCB', title: 'JCB 4DX with Operator Available', price: [3000, 4500], unit: 'per hour', meta: { model: 'JCB 4DX', operator: 'Included' } },
  { sub: 'Crane', title: 'Hydraulic Crane for Construction Site', price: [5000, 8000], unit: 'per hour', meta: { capacity: '15 ton', operator: 'Included' } },
  { sub: 'Dumper', title: 'Dumper Truck for Material Transport', price: [2000, 3500], unit: 'per trip', meta: { capacity: '6 ton', driver: 'Included' } },
  { sub: 'Tractor', title: 'Tractor with Trolley — Material Transport', price: [1500, 2500], unit: 'per trip', meta: { capacity: '3 ton', driver: 'Included' } },
  { sub: 'Concrete Mixer', title: 'Concrete Mixer Machine on Rent', price: [800, 1500], unit: 'per day', meta: { capacity: '400 liters' } },
  { sub: 'Borewell Rig', title: 'Borewell Drilling Rig — Deep Boring', price: [8000, 15000], unit: 'per 100ft', meta: { depth: 'Up to 500ft' } },
];

const materialTemplates = [
  { sub: 'Sand', title: 'River Sand — Premium Quality', price: [4000, 6000], unit: 'per tractor', meta: { type: 'River sand', quality: 'Zone II' } },
  { sub: 'Sand', title: 'M-Sand for Construction', price: [3500, 5000], unit: 'per tractor', meta: { type: 'M-Sand' } },
  { sub: 'Cement', title: 'UltraTech Cement — 53 Grade OPC', price: [370, 420], unit: 'per bag', meta: { brand: 'UltraTech', weight: '50 kg' } },
  { sub: 'Cement', title: 'ACC Cement — PPC Grade', price: [350, 400], unit: 'per bag', meta: { brand: 'ACC', weight: '50 kg' } },
  { sub: 'Bricks', title: 'Red Clay Bricks — Bulk Supply', price: [5000, 7000], unit: 'per 1000 pieces', meta: { type: 'Wire-cut' } },
  { sub: 'Bricks', title: 'Fly Ash Bricks — Lightweight', price: [4500, 6000], unit: 'per 1000 pieces', meta: { type: 'Fly ash' } },
  { sub: 'Steel', title: 'TMT Steel Bars — Fe 500 Grade', price: [55000, 65000], unit: 'per ton', meta: { brand: 'Tata Tiscon' } },
  { sub: 'Gravel', title: 'Crushed Stone Gravel — 20mm & 40mm', price: [1200, 2000], unit: 'per cubic meter', meta: { type: 'Crushed granite' } },
  { sub: 'Tiles', title: 'Vitrified Floor Tiles — Premium Quality', price: [35, 80], unit: 'per sq ft', meta: { brand: 'Kajaria', type: 'Vitrified' } },
  { sub: 'Tiles', title: 'Wall & Bathroom Tiles — All Sizes', price: [25, 60], unit: 'per sq ft', meta: { brand: 'Somany' } },
];

const repairTemplates = [
  { sub: 'AC Repair', title: 'AC Repair & Service — All Brands', price: [500, 800], unit: 'per visit', meta: { brands: 'All brands' } },
  { sub: 'AC Repair', title: 'AC Installation & Gas Refill', price: [1000, 2000], unit: 'per unit', meta: { service: 'Installation + Gas refill' } },
  { sub: 'Electrical Repair', title: 'Home Electrical Repair — Wiring', price: [300, 600], unit: 'per visit', meta: { type: 'Residential' } },
  { sub: 'Electrical Repair', title: 'Electrical Fault Finding & Repair', price: [400, 700], unit: 'per visit', meta: { type: 'Commercial' } },
  { sub: 'Plumbing Repair', title: 'Plumbing Repair — Leakage & Blockage', price: [300, 500], unit: 'per visit', meta: { type: 'Emergency' } },
  { sub: 'Plumbing Repair', title: 'Bathroom Plumbing Repair & Fitting', price: [400, 700], unit: 'per visit', meta: { type: 'Installation' } },
  { sub: 'Borewell Repair', title: 'Borewell Motor Repair & Service', price: [1500, 3000], unit: 'per visit', meta: { type: 'Submersible' } },
];

const descs = {
  workers: (sub, loc) => [
    `Experienced ${sub} available in ${loc.area}. Quality workmanship, timely completion. Available for residential and commercial jobs.`,
    `Professional ${sub} with years of experience in ${loc.area}, Hyderabad. Daily wage and contract work accepted.`,
  ],
  machinery: (sub, loc) => [
    `Well-maintained ${sub} for rent in ${loc.area}. Operator included. Hourly and daily rates available.`,
    `${sub} on rent for construction in ${loc.area}. Excellent condition, skilled operator. Bulk booking discounts.`,
  ],
  materials: (sub, loc) => [
    `Top-quality ${sub} delivered to your site in ${loc.area}. Certified quality, bulk orders welcome.`,
    `Premium ${sub} at competitive prices with delivery to ${loc.area}. 10+ years in business.`,
  ],
  repairs: (sub, loc) => [
    `${sub} expert in ${loc.area}. Quick response, professional service. Warranty on service provided.`,
    `Professional ${sub} service in ${loc.area}. Reliable, affordable. Available on weekends.`,
  ],
};

const reviewComments = [
  'Excellent work! Very professional and completed on time.',
  'Good service. Arrived on time and did quality work.',
  'Decent work, could improve on punctuality.',
  'Very skilled worker. Will definitely hire again!',
  'Fair price and honest work. Recommended.',
  'Great experience. Very knowledgeable and efficient.',
  'Satisfactory work. Communication could be better.',
  'Outstanding quality! Exceeded expectations.',
];

const buildListings = (templates, category, providerIds) => {
  const listings = [];
  templates.forEach((tpl) => {
    const count = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const loc = rand(locations);
      const provider = rand(providerIds);
      const price = tpl.price[0] + Math.floor(Math.random() * (tpl.price[1] - tpl.price[0]));
      listings.push({
        provider,
        category,
        subCategory: tpl.sub,
        title: tpl.title,
        description: rand(descs[category](tpl.sub, loc)),
        pricing: { amount: price, unit: tpl.unit },
        location: { type: 'Point', coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])] },
        address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
        metadata: tpl.meta,
        availability: Math.random() > 0.1,
        status: 'approved',
        workerStatus: Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'busy' : 'active'),
        viewCount: Math.floor(Math.random() * 200),
        inquiryCount: Math.floor(Math.random() * 30),
        ratings: { average: Math.round((3 + Math.random() * 2) * 10) / 10, count: randInt(2, 15) },
      });
    }
  });
  return listings;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected for seeding...');

    await Promise.all([
      User.deleteMany(), Listing.deleteMany(), Booking.deleteMany(),
      Review.deleteMany(), Chat.deleteMany(), Message.deleteMany(),
    ]);
    console.log('✓ Cleared existing data');

    // Admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@bharatbuild.in', password: 'admin123', role: 'admin', phone: '9000000000' });
    console.log('✓ Admin: admin@bharatbuild.in / admin123');

    // Seeker
    const seeker = await User.create({ name: 'Priya Sharma', email: 'seeker@bharatbuild.in', password: 'seeker123', role: 'seeker', phone: '9000000001',
      location: { type: 'Point', coordinates: [78.3968, 17.4933] }, address: { area: 'Kukatpally', district: 'Medchal-Malkajgiri' } });
    const seeker2 = await User.create({ name: 'Arjun Reddy', email: 'arjun@bharatbuild.in', password: 'seeker123', role: 'seeker', phone: '9000000002',
      location: { type: 'Point', coordinates: [78.5016, 17.4399] }, address: { area: 'Secunderabad', district: 'Hyderabad' } });
    console.log('✓ Seekers created');

    // Providers
    const providerDocs = [];
    for (const p of providerNames) {
      const loc = rand(locations);
      const doc = await User.create({
        name: p.name, email: `${p.name.split(' ')[0].toLowerCase()}@bharatbuild.in`, password: 'provider123', role: 'provider', phone: p.phone,
        location: { type: 'Point', coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])] },
        address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
      });
      providerDocs.push(doc);
    }
    // Mark some as verified
    for (let i = 0; i < 3; i++) {
      providerDocs[i].verificationStatus = 'verified';
      providerDocs[i].verificationDocs = { gst: 'GST12345678', shopLicense: 'LIC-HYD-' + (i + 1), shopPhotos: [], addressProof: 'Aadhaar verified' };
      await providerDocs[i].save();
    }
    console.log(`✓ ${providerDocs.length} providers created (3 verified)`);

    const providerIds = providerDocs.map((p) => p._id);

    // Build listings
    const allListings = [
      ...buildListings(workerTemplates, 'workers', providerIds),
      ...buildListings(machineryTemplates, 'machinery', providerIds),
      ...buildListings(materialTemplates, 'materials', providerIds),
      ...buildListings(repairTemplates, 'repairs', providerIds),
    ];
    // Mark verified provider listings
    allListings.forEach(l => {
      const verifiedIds = providerDocs.slice(0, 3).map(p => p._id.toString());
      if (verifiedIds.includes(l.provider.toString()) && l.category === 'materials') l.isVerified = true;
    });

    const insertedListings = await Listing.insertMany(allListings);
    console.log(`✓ ${insertedListings.length} listings seeded`);

    // Create bookings
    const bookings = [];
    const statuses = ['completed', 'completed', 'completed', 'accepted', 'pending'];
    for (let i = 0; i < 8; i++) {
      const listing = insertedListings[i % insertedListings.length];
      const status = statuses[i % statuses.length];
      const start = new Date(); start.setDate(start.getDate() - randInt(5, 30));
      const end = new Date(start); end.setDate(end.getDate() + randInt(1, 5));
      const b = await Booking.create({
        listing: listing._id, seeker: i % 2 === 0 ? seeker._id : seeker2._id, provider: listing.provider,
        dates: { start, end }, status, totalAmount: listing.pricing.amount * randInt(1, 5),
        notes: 'Need for my house construction project', isRebooking: false,
      });
      bookings.push(b);
    }
    console.log(`✓ ${bookings.length} bookings seeded`);

    // Create reviews for completed bookings
    const completedBookings = bookings.filter(b => b.status === 'completed');
    for (const b of completedBookings) {
      await Review.create({
        listing: b.listing, booking: b._id, reviewer: b.seeker, provider: b.provider,
        rating: randInt(3, 6), comment: rand(reviewComments),
      });
    }
    console.log(`✓ ${completedBookings.length} reviews seeded`);

    // Create chats
    const chat1 = await Chat.create({
      participants: [seeker._id, providerDocs[0]._id], listing: insertedListings[0]._id,
      lastMessage: { text: 'When can you start?', sender: seeker._id, timestamp: new Date() },
    });
    await Message.insertMany([
      { chat: chat1._id, sender: seeker._id, text: 'Hi, I need a mestri for my house construction in Kukatpally.', read: true },
      { chat: chat1._id, sender: providerDocs[0]._id, text: 'Hello! Yes, I am available. When do you want to start?', read: true },
      { chat: chat1._id, sender: seeker._id, text: 'When can you start?', read: false },
    ]);
    console.log('✓ Sample chat seeded');

    console.log('\n── Seed Summary ──');
    console.log(`  Users:    ${providerDocs.length + 3}`);
    console.log(`  Listings: ${insertedListings.length}`);
    console.log(`  Bookings: ${bookings.length}`);
    console.log(`  Reviews:  ${completedBookings.length}`);
    console.log(`  Chats:    1`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  }
};

seedDatabase();

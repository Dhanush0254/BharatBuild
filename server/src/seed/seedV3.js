const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../modules/users/user.model');
const Product = require('../modules/products/product.model');
const Vehicle = require('../modules/vehicles/vehicle.model');

const locations = [
  { area: 'Kukatpally', district: 'Medchal-Malkajgiri', coords: [78.3968, 17.4933] },
  { area: 'LB Nagar', district: 'Rangareddy', coords: [78.5528, 17.3457] },
  { area: 'Dilsukhnagar', district: 'Rangareddy', coords: [78.5247, 17.3685] },
  { area: 'Miyapur', district: 'Medchal-Malkajgiri', coords: [78.3489, 17.4968] },
  { area: 'Secunderabad', district: 'Hyderabad', coords: [78.5016, 17.4399] },
  { area: 'Gachibowli', district: 'Rangareddy', coords: [78.3498, 17.4401] },
  { area: 'Uppal', district: 'Medchal-Malkajgiri', coords: [78.5594, 17.4065] },
  { area: 'Kompally', district: 'Medchal-Malkajgiri', coords: [78.4860, 17.5405] },
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (v) => v + (Math.random() - 0.5) * 0.04;
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min));

const shopNames = [
  { name: 'Sri Lakshmi Cement Depot', phone: '9876500001' },
  { name: 'Balaji Hardware & Tiles', phone: '9876500002' },
  { name: 'Venkateshwara Sand Suppliers', phone: '9876500003' },
  { name: 'Sai Steel Traders', phone: '9876500004' },
  { name: 'Durga Paint House', phone: '9876500005' },
  { name: 'Mahalaxmi Bricks & Blocks', phone: '9876500006' },
  { name: 'Hyderabad Tiles Gallery', phone: '9876500007' },
  { name: 'Telangana Hardware Mart', phone: '9876500008' },
];

const transporterNames = [
  { name: 'Ramu Transport', phone: '9876600001' },
  { name: 'Sai Tractor Services', phone: '9876600002' },
  { name: 'Reddy Logistics', phone: '9876600003' },
  { name: 'Ganesh Mini Truck', phone: '9876600004' },
  { name: 'Vijay Load Carriers', phone: '9876600005' },
];

const productTemplates = [
  { cat: 'cement', title: 'UltraTech Cement 53 Grade OPC', price: [370, 420], unit: 'per bag', brand: 'UltraTech', tags: ['cement', 'opc', 'ultratech', 'construction'], specs: { weight: '50 kg', grade: '53 OPC' } },
  { cat: 'cement', title: 'ACC PPC Cement - Premium Quality', price: [340, 400], unit: 'per bag', brand: 'ACC', tags: ['cement', 'ppc', 'acc'], specs: { weight: '50 kg', grade: 'PPC' } },
  { cat: 'cement', title: 'Ambuja Cement - OPC 43 Grade', price: [350, 410], unit: 'per bag', brand: 'Ambuja', tags: ['cement', 'opc', 'ambuja'], specs: { weight: '50 kg', grade: '43 OPC' } },
  { cat: 'sand', title: 'River Sand - Premium Quality Zone II', price: [4000, 6000], unit: 'per tractor load', brand: '', tags: ['sand', 'river sand', 'construction', 'naapa isuka'], specs: { type: 'River Sand', quality: 'Zone II' } },
  { cat: 'sand', title: 'M-Sand (Manufactured Sand)', price: [3500, 5000], unit: 'per tractor load', brand: '', tags: ['msand', 'manufactured sand', 'sand'], specs: { type: 'M-Sand' } },
  { cat: 'bricks', title: 'Red Clay Bricks - Wire Cut', price: [5000, 7000], unit: 'per 1000 pcs', brand: '', tags: ['bricks', 'red bricks', 'clay bricks', 'itukallu'], specs: { type: 'Wire-cut', size: '9x4x3 inch' } },
  { cat: 'bricks', title: 'Fly Ash Bricks - Lightweight', price: [4500, 6000], unit: 'per 1000 pcs', brand: '', tags: ['bricks', 'fly ash', 'lightweight'], specs: { type: 'Fly ash', size: '9x4x3 inch' } },
  { cat: 'steel', title: 'TMT Steel Bars Fe 500 Grade', price: [55000, 65000], unit: 'per ton', brand: 'Tata Tiscon', tags: ['steel', 'tmt', 'rebar', 'ukku'], specs: { grade: 'Fe 500', brand: 'Tata Tiscon' } },
  { cat: 'steel', title: 'Vizag Steel TMT Bars Fe 500D', price: [52000, 62000], unit: 'per ton', brand: 'Vizag Steel', tags: ['steel', 'tmt', 'vizag'], specs: { grade: 'Fe 500D' } },
  { cat: 'tiles', title: 'Kajaria Vitrified Floor Tiles 2x2', price: [35, 80], unit: 'per sq ft', brand: 'Kajaria', tags: ['tiles', 'floor tiles', 'vitrified', 'ceramic'], specs: { size: '2x2 ft', type: 'Vitrified' } },
  { cat: 'tiles', title: 'Somany Wall Tiles - Bathroom', price: [25, 60], unit: 'per sq ft', brand: 'Somany', tags: ['tiles', 'wall tiles', 'bathroom'], specs: { size: '1x1.5 ft', type: 'Ceramic' } },
  { cat: 'paint', title: 'Asian Paints Tractor Emulsion', price: [180, 250], unit: 'per liter', brand: 'Asian Paints', tags: ['paint', 'emulsion', 'interior', 'asian paints'], specs: { type: 'Interior Emulsion' } },
  { cat: 'paint', title: 'Berger Weathercoat Exterior', price: [280, 380], unit: 'per liter', brand: 'Berger', tags: ['paint', 'exterior', 'weatherproof'], specs: { type: 'Exterior' } },
  { cat: 'gravel', title: 'Crushed Stone Aggregate 20mm', price: [1200, 2000], unit: 'per cubic meter', brand: '', tags: ['gravel', 'aggregate', 'stone', 'jelly'], specs: { size: '20mm', type: 'Crushed granite' } },
  { cat: 'hardware', title: 'GI Binding Wire Bundle', price: [80, 120], unit: 'per kg', brand: '', tags: ['wire', 'binding wire', 'gi wire', 'hardware'], specs: { type: 'GI', gauge: '18 SWG' } },
  { cat: 'pipes', title: 'Astral CPVC Pipes 1 inch', price: [120, 180], unit: 'per meter', brand: 'Astral', tags: ['pipes', 'cpvc', 'plumbing', 'astral'], specs: { size: '1 inch', type: 'CPVC' } },
  { cat: 'waterproofing', title: 'Dr Fixit LW+ Waterproofing', price: [180, 250], unit: 'per liter', brand: 'Dr Fixit', tags: ['waterproofing', 'dr fixit', 'sealant'], specs: { type: 'Integral Waterproofing' } },
  { cat: 'tools', title: 'Mason Trowel - Professional Grade', price: [150, 300], unit: 'per piece', brand: '', tags: ['tools', 'trowel', 'mason', 'hand tools'], specs: { material: 'Stainless Steel' } },
];

const vehicleTemplates = [
  { type: 'tractor', num: 'TS09EA', cap: 3, price: 12, base: 500, desc: '3 ton trolley capacity' },
  { type: 'mini_truck', num: 'TS07FB', cap: 2, price: 15, base: 400, desc: '2 ton Tata Ace' },
  { type: 'pickup_auto', num: 'TS08GC', cap: 0.5, price: 10, base: 200, desc: 'Ape auto load carrier' },
  { type: 'lorry', num: 'TS10HD', cap: 10, price: 18, base: 1500, desc: '10 ton heavy lorry' },
  { type: 'tipper', num: 'TS11IE', cap: 6, price: 20, base: 1000, desc: '6 ton tipper truck' },
  { type: 'bolero_pickup', num: 'TS12JF', cap: 1.5, price: 14, base: 350, desc: 'Mahindra Bolero Pickup' },
  { type: 'tempo', num: 'TS13KG', cap: 1, price: 12, base: 300, desc: 'Tempo for small loads' },
];

const seedV3 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected for V3 seeding...');

    // Clean V3 collections only
    await Product.deleteMany();
    await Vehicle.deleteMany();
    console.log('✓ Cleared V3 collections');

    // Get existing providers or create shop providers
    const shopProviders = [];
    for (const s of shopNames) {
      const email = s.name.split(' ')[0].toLowerCase() + '.shop@bharatbuild.in';
      let user = await User.findOne({ email });
      if (!user) {
        const loc = rand(locations);
        user = await User.create({
          name: s.name, email, password: 'shop123', role: 'provider', phone: s.phone,
          location: { type: 'Point', coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])] },
          address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
          verificationStatus: Math.random() > 0.4 ? 'verified' : 'unverified',
          verificationDocs: { gst: 'GST' + randInt(10000000, 99999999), shopLicense: 'LIC-HYD-' + randInt(100, 999) },
        });
      }
      shopProviders.push(user);
    }
    console.log(`✓ ${shopProviders.length} shop providers ready`);

    // Create products
    const products = [];
    for (const tpl of productTemplates) {
      for (let i = 0; i < 3; i++) {
        const shop = rand(shopProviders);
        const loc = shop.location?.coordinates
          ? { coords: shop.location.coordinates, area: shop.address?.area || 'Hyderabad', district: shop.address?.district || '' }
          : rand(locations);
        const coords = loc.coords || loc.coordinates;

        products.push({
          shop: shop._id,
          title: tpl.title,
          category: tpl.cat,
          description: `High quality ${tpl.title} available at competitive prices. Delivery available in ${loc.area || 'Hyderabad'} area. Bulk orders welcome.`,
          price: tpl.price[0] + Math.floor(Math.random() * (tpl.price[1] - tpl.price[0])),
          unit: tpl.unit,
          brand: tpl.brand,
          tags: tpl.tags,
          specifications: tpl.specs,
          location: { type: 'Point', coordinates: [jitter(coords[0]), jitter(coords[1])] },
          address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
          inStock: Math.random() > 0.1,
          deliveryAvailable: Math.random() > 0.3,
          pickupAvailable: true,
          estimatedDeliveryTime: rand(['Same day', '1-2 days', '2-3 hours', 'Next day']),
          isVerified: shop.verificationStatus === 'verified',
          ratings: { average: Math.round((3 + Math.random() * 2) * 10) / 10, count: randInt(2, 25) },
          viewCount: randInt(10, 300),
          orderCount: randInt(0, 50),
          status: 'active',
        });
      }
    }
    const inserted = await Product.insertMany(products);
    console.log(`✓ ${inserted.length} products seeded`);

    // Create transport providers
    const transportProviders = [];
    for (const t of transporterNames) {
      const email = t.name.split(' ')[0].toLowerCase() + '.transport@bharatbuild.in';
      let user = await User.findOne({ email });
      if (!user) {
        const loc = rand(locations);
        user = await User.create({
          name: t.name, email, password: 'driver123', role: 'provider', phone: t.phone,
          location: { type: 'Point', coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])] },
          address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
        });
      }
      transportProviders.push(user);
    }
    console.log(`✓ ${transportProviders.length} transport providers ready`);

    // Create vehicles
    const vehicles = [];
    for (const tpl of vehicleTemplates) {
      const owner = rand(transportProviders);
      const loc = rand(locations);
      vehicles.push({
        owner: owner._id,
        vehicleType: tpl.type,
        vehicleNumber: tpl.num + randInt(1000, 9999),
        capacity: { weight: tpl.cap, unit: 'tons', description: tpl.desc },
        pricingPerKm: tpl.price + Math.floor(Math.random() * 5),
        baseFare: tpl.base,
        location: { type: 'Point', coordinates: [jitter(loc.coords[0]), jitter(loc.coords[1])] },
        address: { area: loc.area, city: 'Hyderabad', district: loc.district, state: 'Telangana' },
        isAvailable: Math.random() > 0.2,
        verificationStatus: Math.random() > 0.5 ? 'verified' : 'unverified',
        ratings: { average: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, count: randInt(3, 20) },
        tripsCompleted: randInt(5, 100),
      });
    }
    const insertedV = await Vehicle.insertMany(vehicles);
    console.log(`✓ ${insertedV.length} vehicles seeded`);

    console.log('\n── V3 Seed Summary ──');
    console.log(`  Shop Providers:  ${shopProviders.length}`);
    console.log(`  Products:        ${inserted.length}`);
    console.log(`  Transporters:    ${transportProviders.length}`);
    console.log(`  Vehicles:        ${insertedV.length}`);
    process.exit(0);
  } catch (err) {
    console.error('✗ V3 Seed failed:', err);
    process.exit(1);
  }
};

seedV3();

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('Set MONGODB_URI env var first!'); process.exit(1); }
const AIRPORTS = {
  NZNE: { city: 'Auckland (Dairy Flat)', offsetMinutes: 720 },
  YSSY: { city: 'Sydney', offsetMinutes: 600 },
  NZRO: { city: 'Rotorua', offsetMinutes: 720 },
  NZCI: { city: 'Chatham Islands', offsetMinutes: 765 },
  NZGB: { city: 'Great Barrier Island', offsetMinutes: 720 },
  NZTL: { city: 'Lake Tekapo', offsetMinutes: 720 },
};
const AIRCRAFT = { 'SyberJet SJ30i': { seats: 6 }, 'Cirrus SF50': { seats: 4 }, 'HondaJet Elite': { seats: 5 } };
function localToUTC(date, hourMin, offsetMinutes) {
  const [h, m] = hourMin.split(':').map(Number);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h, m) - offsetMinutes * 60000);
}
const TEMPLATES = [
  { flightNumber: 'DF101', from: 'NZNE', to: 'YSSY', aircraft: 'SyberJet SJ30i', dep: '10:30', arr: '12:00', days: [5], price: 850 },
  { flightNumber: 'DF102', from: 'YSSY', to: 'NZNE', aircraft: 'SyberJet SJ30i', dep: '14:00', arr: '19:30', days: [0], price: 850 },
  { flightNumber: 'DF201', from: 'NZNE', to: 'NZRO', aircraft: 'Cirrus SF50', dep: '07:00', arr: '07:50', days: [1,2,3,4,5], price: 180 },
  { flightNumber: 'DF202', from: 'NZRO', to: 'NZNE', aircraft: 'Cirrus SF50', dep: '08:30', arr: '09:20', days: [1,2,3,4,5], price: 180 },
  { flightNumber: 'DF203', from: 'NZNE', to: 'NZRO', aircraft: 'Cirrus SF50', dep: '16:30', arr: '17:20', days: [1,2,3,4,5], price: 180 },
  { flightNumber: 'DF204', from: 'NZRO', to: 'NZNE', aircraft: 'Cirrus SF50', dep: '18:30', arr: '19:20', days: [1,2,3,4,5], price: 180 },
  { flightNumber: 'DF301', from: 'NZNE', to: 'NZGB', aircraft: 'Cirrus SF50', dep: '09:00', arr: '09:40', days: [1,3,5], price: 220 },
  { flightNumber: 'DF302', from: 'NZGB', to: 'NZNE', aircraft: 'Cirrus SF50', dep: '09:00', arr: '09:40', days: [2,4,6], price: 220 },
  { flightNumber: 'DF401', from: 'NZNE', to: 'NZCI', aircraft: 'HondaJet Elite', dep: '08:00', arr: '10:45', days: [2,5], price: 420 },
  { flightNumber: 'DF402', from: 'NZCI', to: 'NZNE', aircraft: 'HondaJet Elite', dep: '12:00', arr: '14:15', days: [3,6], price: 420 },
  { flightNumber: 'DF501', from: 'NZNE', to: 'NZTL', aircraft: 'HondaJet Elite', dep: '10:00', arr: '11:30', days: [1], price: 310 },
  { flightNumber: 'DF502', from: 'NZTL', to: 'NZNE', aircraft: 'HondaJet Elite', dep: '13:00', arr: '14:30', days: [2], price: 310 },
];
function generateFlights(weeksAhead = 5) {
  const flights = [];
  const now = new Date();
  const startDate = new Date(now);
  const day = startDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startDate.setDate(startDate.getDate() + diff);
  startDate.setHours(0, 0, 0, 0);
  for (let d = 0; d < weeksAhead * 7; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    const dow = date.getDay();
    for (const t of TEMPLATES) {
      if (!t.days.includes(dow)) continue;
      const depUTC = localToUTC(date, t.dep, AIRPORTS[t.from].offsetMinutes);
      let arrUTC = localToUTC(date, t.arr, AIRPORTS[t.to].offsetMinutes);
      if (arrUTC <= depUTC) arrUTC = new Date(arrUTC.getTime() + 86400000);
      flights.push({
        flightNumber: t.flightNumber, from: t.from, to: t.to,
        fromCity: AIRPORTS[t.from].city, toCity: AIRPORTS[t.to].city,
        aircraft: t.aircraft, seats: AIRCRAFT[t.aircraft].seats, seatsBooked: 0,
        departureUTC: depUTC, arrivalUTC: arrUTC,
        departureLocal: t.dep, arrivalLocal: t.arr,
        price: t.price, date: date.toISOString().split('T')[0],
      });
    }
  }
  return flights;
}
async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('airline');
    await db.collection('flights').deleteMany({});
    await db.collection('bookings').deleteMany({});
    const flights = generateFlights(5);
    await db.collection('flights').insertMany(flights);
    console.log('Inserted ' + flights.length + ' flights');
    await db.collection('flights').createIndex({ from: 1, to: 1, departureUTC: 1 });
    await db.collection('bookings').createIndex({ bookingRef: 1 }, { unique: true });
    await db.collection('bookings').createIndex({ passengerEmail: 1 });
    console.log('Seed complete!');
  } finally { await client.close(); }
}
seed().catch(console.error);

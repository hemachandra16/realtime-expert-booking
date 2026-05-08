require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Expert = require('./models/Expert');
const Slot = require('./models/Slot');

const experts = [
  {
    name: 'Pandit Arjun Shastri',
    category: 'Vedic Astrology',
    experience: 18,
    rating: 4.9,
    totalSessions: 1250,
    bio: 'Renowned Vedic astrologer with 18 years of experience in Kundli analysis, planetary transit predictions, and Dasha interpretation. Has guided over 1200 clients on career, marriage, and life decisions using ancient Jyotish Shastra principles.',
    languages: ['English', 'Hindi', 'Sanskrit'],
    pricePerSession: 1500,
    isAvailable: true
  },
  {
    name: 'Priya Joshi',
    category: 'Tarot Reading',
    experience: 8,
    rating: 4.7,
    totalSessions: 680,
    bio: 'Certified Tarot reader and intuitive healer. Specializes in Rider-Waite and Thoth Tarot systems. Provides clarity on relationships, career crossroads, and spiritual growth through accurate card interpretations.',
    languages: ['English', 'Hindi'],
    pricePerSession: 800,
    isAvailable: true
  },
  {
    name: 'Acharya Deepak Trivedi',
    category: 'Numerology',
    experience: 15,
    rating: 4.8,
    totalSessions: 920,
    bio: 'Expert numerologist who combines Chaldean and Pythagorean systems. Specializes in name correction, lucky number analysis, business name selection, and life path calculations for holistic life improvement.',
    languages: ['English', 'Hindi', 'Gujarati'],
    pricePerSession: 1200,
    isAvailable: true
  },
  {
    name: 'Dr. Kavitha Nair',
    category: 'Palmistry',
    experience: 20,
    rating: 4.6,
    totalSessions: 1500,
    bio: 'PhD in Occult Sciences with 20 years of palmistry practice. Reads heart line, head line, life line, and fate line with exceptional accuracy. Also certified in face reading and body language analysis.',
    languages: ['English', 'Malayalam', 'Tamil'],
    pricePerSession: 1000,
    isAvailable: true
  },
  {
    name: 'Vastu Guru Ramesh Agarwal',
    category: 'Vastu Shastra',
    experience: 22,
    rating: 4.8,
    totalSessions: 890,
    bio: 'India\'s leading Vastu consultant with 22 years of experience. Has corrected Vastu doshas for 800+ homes and offices. Specializes in residential Vastu, commercial Vastu, and industrial layout planning.',
    languages: ['English', 'Hindi'],
    pricePerSession: 2000,
    isAvailable: true
  },
  {
    name: 'Meena Kumari',
    category: 'Tarot Reading',
    experience: 6,
    rating: 4.5,
    totalSessions: 340,
    bio: 'Angel Tarot reader and Reiki healer. Combines Tarot with angel card guidance and crystal healing for a holistic spiritual experience. Popular for love and relationship readings with empathetic approach.',
    languages: ['English', 'Hindi', 'Marathi'],
    pricePerSession: 600,
    isAvailable: true
  },
  {
    name: 'Jyotish Ratna Suresh Iyer',
    category: 'KP Astrology',
    experience: 14,
    rating: 4.7,
    totalSessions: 760,
    bio: 'KP (Krishnamurti Paddhati) astrology specialist known for precise timing predictions. Expert in Prashna Kundli (horary astrology) and sub-lord theory. Accurately predicts job changes, marriage timing, and financial gains.',
    languages: ['English', 'Tamil', 'Kannada'],
    pricePerSession: 1300,
    isAvailable: true
  },
  {
    name: 'Neha Gupta',
    category: 'Numerology',
    experience: 10,
    rating: 4.9,
    totalSessions: 550,
    bio: 'Modern numerologist blending ancient number science with practical life coaching. Specializes in mobile number analysis, signature correction, and personal year predictions. Featured in leading astrology magazines.',
    languages: ['English', 'Hindi'],
    pricePerSession: 900,
    isAvailable: true
  },
  {
    name: 'Pandit Raghunath Sharma',
    category: 'Vedic Astrology',
    experience: 25,
    rating: 4.9,
    totalSessions: 2100,
    bio: 'Third-generation Vedic astrologer from Varanasi with 25 years of practice. Master of Brihat Parashara Hora Shastra. Specializes in Mangal Dosha analysis, Kundli matching for marriage, and gemstone recommendations.',
    languages: ['English', 'Hindi', 'Sanskrit'],
    pricePerSession: 2500,
    isAvailable: true
  },
  {
    name: 'Anita Desai',
    category: 'Palmistry',
    experience: 12,
    rating: 4.4,
    totalSessions: 480,
    bio: 'Palmistry expert and handwriting analyst (graphologist). Combines palm reading with fingerprint analysis for career guidance and personality assessment. Regular speaker at astrology conferences across India.',
    languages: ['English', 'Hindi', 'Bengali'],
    pricePerSession: 800,
    isAvailable: true
  },
  {
    name: 'Vastu Acharya Siddharth Patel',
    category: 'Vastu Shastra',
    experience: 16,
    rating: 4.6,
    totalSessions: 620,
    bio: 'Vastu Shastra consultant specializing in modern apartment and flat corrections without demolition. Uses pyramid Vastu and color therapy for effective remedies. Has consulted for top builders and real estate developers.',
    languages: ['English', 'Hindi', 'Gujarati'],
    pricePerSession: 1800,
    isAvailable: true
  },
  {
    name: 'Guru Balakrishnan',
    category: 'KP Astrology',
    experience: 19,
    rating: 4.3,
    totalSessions: 1100,
    bio: 'Senior KP astrologer and Nadi astrology practitioner from Tamil Nadu. Expert in lost object recovery predictions, disease diagnosis through astrology, and overseas travel predictions using stellar astrology methods.',
    languages: ['English', 'Tamil', 'Telugu'],
    pricePerSession: 1100,
    isAvailable: true
  }
];


const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Expert.deleteMany({});
    await Slot.deleteMany({});
    console.log('Cleared existing data');

    // Create experts
    const createdExperts = await Expert.insertMany(experts);
    console.log(`Created ${createdExperts.length} experts`);

    // Create slots for each expert
    const dates = getNext7Days();
    const slots = [];

    for (const expert of createdExperts) {
      for (const date of dates) {
        for (const time of timeSlots) {
          slots.push({
            expertId: expert._id,
            date,
            time,
            isBooked: false,
            bookedBy: null
          });
        }
      }
    }

    await Slot.insertMany(slots);
    console.log(`Created ${slots.length} slots (${createdExperts.length} experts × ${dates.length} days × ${timeSlots.length} slots/day)`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

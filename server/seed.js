require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Expert = require('./models/Expert');
const Slot = require('./models/Slot');

const experts = [
  {
    name: 'Dr. Arjun Mehta',
    category: 'Technology',
    experience: 12,
    rating: 4.9,
    totalSessions: 340,
    bio: 'Senior AI/ML architect with 12 years of experience at top tech companies. Specializes in deep learning, computer vision, and scalable ML infrastructure. Has mentored 200+ engineers and published research in top-tier conferences.',
    languages: ['English', 'Hindi'],
    pricePerSession: 2500,
    isAvailable: true
  },
  {
    name: 'Priya Sharma',
    category: 'Finance',
    experience: 8,
    rating: 4.7,
    totalSessions: 215,
    bio: 'Certified Financial Planner (CFP) and investment strategist. Expert in portfolio management, tax planning, and retirement strategies. Previously worked at Goldman Sachs and Morgan Stanley.',
    languages: ['English', 'Hindi', 'Gujarati'],
    pricePerSession: 2000,
    isAvailable: true
  },
  {
    name: 'Dr. Sarah Chen',
    category: 'Health',
    experience: 15,
    rating: 4.8,
    totalSessions: 520,
    bio: 'Board-certified nutritionist and wellness consultant. Specializes in holistic health, stress management, and personalized diet plans. Author of two bestselling health books.',
    languages: ['English', 'Mandarin'],
    pricePerSession: 3000,
    isAvailable: true
  },
  {
    name: 'Advocate Rajesh Kumar',
    category: 'Legal',
    experience: 20,
    rating: 4.6,
    totalSessions: 680,
    bio: 'Senior advocate at the Supreme Court of India with expertise in corporate law, IP rights, and startup compliance. Has successfully handled 500+ cases across various high courts.',
    languages: ['English', 'Hindi'],
    pricePerSession: 3500,
    isAvailable: true
  },
  {
    name: 'Neha Gupta',
    category: 'Business',
    experience: 10,
    rating: 4.8,
    totalSessions: 290,
    bio: 'Serial entrepreneur and business strategist. Founded 3 successful startups with combined revenue of ₹50Cr. Specializes in go-to-market strategy, fundraising, and scaling operations.',
    languages: ['English', 'Hindi'],
    pricePerSession: 2800,
    isAvailable: true
  },
  {
    name: 'Marcus Johnson',
    category: 'Marketing',
    experience: 9,
    rating: 4.5,
    totalSessions: 180,
    bio: 'Digital marketing expert and growth hacker. Has driven 10x growth for multiple D2C brands. Expert in SEO, paid acquisition, content strategy, and marketing analytics.',
    languages: ['English'],
    pricePerSession: 1800,
    isAvailable: true
  },
  {
    name: 'Dr. Kavitha Nair',
    category: 'Technology',
    experience: 14,
    rating: 4.7,
    totalSessions: 410,
    bio: 'Cybersecurity expert and cloud architecture specialist. Former CISO at a Fortune 500 company. Holds CISSP, CEH, and AWS Solutions Architect certifications.',
    languages: ['English', 'Malayalam', 'Tamil'],
    pricePerSession: 2700,
    isAvailable: true
  },
  {
    name: 'Amit Patel',
    category: 'Finance',
    experience: 11,
    rating: 4.9,
    totalSessions: 360,
    bio: 'Chartered Accountant and tax consultant with extensive experience in cross-border taxation, GST compliance, and financial restructuring for SMEs and startups.',
    languages: ['English', 'Hindi', 'Gujarati'],
    pricePerSession: 2200,
    isAvailable: true
  },
  {
    name: 'Dr. Emily Roberts',
    category: 'Health',
    experience: 18,
    rating: 4.9,
    totalSessions: 750,
    bio: 'Clinical psychologist specializing in cognitive behavioral therapy, anxiety disorders, and workplace burnout. 18 years of private practice with published research in mental health.',
    languages: ['English', 'French'],
    pricePerSession: 3200,
    isAvailable: true
  },
  {
    name: 'Vikram Singh',
    category: 'Legal',
    experience: 7,
    rating: 4.4,
    totalSessions: 130,
    bio: 'Tech-savvy lawyer specializing in data privacy laws (GDPR, DPDP), SaaS agreements, and startup legal frameworks. Advisor to 30+ funded startups.',
    languages: ['English', 'Hindi', 'Punjabi'],
    pricePerSession: 1500,
    isAvailable: true
  },
  {
    name: 'Lisa Wang',
    category: 'Business',
    experience: 13,
    rating: 4.6,
    totalSessions: 445,
    bio: 'Operations and supply chain expert with experience at Amazon and Flipkart. Specializes in logistics optimization, vendor management, and process automation.',
    languages: ['English', 'Mandarin'],
    pricePerSession: 2400,
    isAvailable: true
  },
  {
    name: 'David Miller',
    category: 'Marketing',
    experience: 6,
    rating: 4.3,
    totalSessions: 95,
    bio: 'Brand strategist and social media marketing specialist. Has built viral campaigns for top consumer brands. Expert in influencer marketing, brand positioning, and community building.',
    languages: ['English', 'Spanish'],
    pricePerSession: 1600,
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

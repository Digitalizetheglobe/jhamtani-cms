require('dotenv').config();
const { connectDB } = require('./config/db');
const Project = require('./models/Project');

const SITE = 'https://jhamtani.netlify.app';

const projects = [
  {
    title: 'ACE Ayodhya',
    location: 'Thergaon, Pune',
    status: 'Ongoing',
    plotSize: 'Premium 2 & 3 BHK Homes',
    naStatus: 'Residential',
    pageLink: '/ace-ayodha',
    category: 'residential',
    order: 1,
    isActive: true,
    image: `${SITE}/assets/ace-ayodha/hero.webp`,
  },
  {
    title: 'Jhamtani Abundance',
    location: 'Mundhwa, Pune',
    status: 'Ongoing',
    plotSize: 'Ultra-Luxury 3 & 4.5 Bed Residences',
    naStatus: 'XO Series',
    pageLink: '/ace-abundance',
    category: 'xo-series',
    order: 2,
    isActive: true,
    image: `${SITE}/assets/pojetcts/Abundacne_Elevaion.webp`,
  },
  {
    title: 'ACE Villas',
    location: 'Koregaon Park NX, Pune',
    status: 'Ongoing',
    plotSize: 'Ultra-Luxury Villas',
    naStatus: 'XO Series',
    pageLink: '/ace-villas',
    category: 'villas',
    order: 3,
    isActive: true,
    image: `${SITE}/assets/pojetcts/ace_villas.webp`,
  },
  {
    title: 'ACE Atmosphere',
    location: 'Ravet, Pune',
    status: 'Ongoing',
    plotSize: 'Premium 3 & 4 BHK Homes',
    naStatus: 'Residential',
    pageLink: '/ace-atmosphere',
    category: 'residential',
    order: 4,
    isActive: true,
    image: `${SITE}/assets/pojetcts/ace_atmosphere.webp`,
  },
  {
    title: 'ACE Aster',
    location: 'Ravet, Pune',
    status: 'Ongoing',
    plotSize: 'Spacious 2 & 3 BHK Homes',
    naStatus: 'Residential',
    pageLink: '/ace-aster',
    category: 'residential',
    order: 5,
    isActive: true,
    image: `${SITE}/assets/pojetcts/ace_aster.webp`,
  },
  {
    title: 'Jhamtani Bizcore',
    location: 'Koregaon Park NX, Pune',
    status: 'Ongoing',
    plotSize: 'Serviced Studio Apartments',
    naStatus: 'Studios',
    pageLink: '/jhamtani-bizcore',
    category: 'studios',
    order: 6,
    isActive: true,
    image: `${SITE}/assets/pojetcts/bizcore_image.webp`,
  },
  {
    title: 'Jhamtani Elevate',
    location: 'Mundhwa, Pune',
    status: 'Ongoing',
    plotSize: 'Studio Apartments',
    naStatus: 'Studios',
    pageLink: '/jhamtani-elevate',
    category: 'studios',
    order: 7,
    isActive: true,
    image: `${SITE}/assets/pojetcts/jhamtani-elevate.webp`,
  },
  {
    title: 'Jhamtani SpaceBiz',
    location: 'Baner, Pune',
    status: 'Ongoing',
    plotSize: 'Grade A Commercial Spaces',
    naStatus: 'Commercial',
    pageLink: '/jhamtani-spacebiz',
    category: 'commercial',
    order: 8,
    isActive: true,
    image: `${SITE}/assets/pojetcts/jhamtani-spacebiz.webp`,
  },
];

(async () => {
  await connectDB();
  for (const project of projects) {
    const existing = await Project.findOne({ title: project.title });
    if (existing) {
      console.log('Already exists:', project.title);
      continue;
    }
    await Project.create(project);
    console.log('Added:', project.title);
  }
  console.log('Jhamtani projects are in the jhamtani database.');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

const jobnewsindiaConfig = {
  niche: 'jobnewsindia',
  siteName: 'JobNewsIndia',
  domain: 'jobnewsindia.in',
  tagline: 'Government Jobs & Career Guide India',
  description: 'Latest sarkari naukri, private job alerts, UPSC updates and career tips for Indian job seekers.',
  siteUrl: 'https://jobnewsindia.in',

  author: {
    name: 'Sandeep Yadav',
    title: 'HR Expert & Career Coach | 8 Years Experience',
    bio: 'Sandeep Yadav has 8 years in HR and recruitment. He has helped 2000+ Indian candidates land their dream jobs through interview tips and career guidance on jobnewsindia.in',
    avatar: '/icons/author.jpg',
  },

  primaryKeyword: 'sarkari naukri india',
  secondaryKeywords: ['government jobs india', 'UPSC 2026', 'SSC recruitment', 'job vacancy india'],

  categories: [
    { slug: 'govt-jobs', name: 'Govt Jobs', color: '#1a6b3a' },
    { slug: 'upsc-ssc', name: 'UPSC & SSC', color: '#c0392b' },
    { slug: 'private-jobs', name: 'Private Jobs', color: '#2471a3' },
    { slug: 'career-tips', name: 'Career Tips', color: '#7d3c98' },
  ],

  rssSources: [
    {
      url: 'https://news.google.com/rss/search?q=sarkari+naukri+government+job+vacancy+india&hl=en-IN&gl=IN&ceid=IN:en',
      name: 'Google News - Sarkari Naukri',
      weight: 3,
    },
    {
      url: 'https://news.google.com/rss/search?q=UPSC+SSC+railway+job+recruitment+2026&hl=en-IN&gl=IN&ceid=IN:en',
      name: 'Google News - UPSC SSC',
      weight: 3,
    },
    {
      url: 'https://news.google.com/rss/search?q=private+job+IT+hiring+india+2026&hl=en-IN&gl=IN&ceid=IN:en',
      name: 'Google News - Private Jobs',
      weight: 2,
    },
  ],

  reddit: ['india', 'UPSC', 'cscareerquestionsIN'],

  // liveData removed — ticker now derives real counts from published posts (lib/live-data.js)

  imageKeywords: ['job interview india office', 'career growth professional india', 'government job examination'],

  cron: '30 8 * * *',

  aiPersonality: `You are Sandeep Yadav, career coach at jobnewsindia.in. Write like a senior HR professional who gives real insider tips. Always mention specific job portals: Naukri.com, LinkedIn, Shine.com. India-specific: form filling dates, age limits, reservation categories. Motivational but realistic. End with exact action steps. Never say "Furthermore" or "In this article".`,

  theme: {
    primaryColor: '#c0392b',
    secondaryColor: '#1a252f',
    accentColor: '#f39c12',
    headerBg: '#1a252f',
    navBg: '#2c3e50',
    tickerBg: '#c0392b',
    linkColor: '#2471a3',
    categoryColors: {
      'govt-jobs': '#1a6b3a',
      'upsc-ssc': '#c0392b',
      'private-jobs': '#2471a3',
      'career-tips': '#7d3c98',
    },
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Govt Jobs', href: '/category/govt-jobs' },
    { label: 'UPSC & SSC', href: '/category/upsc-ssc' },
    { label: 'Private Jobs', href: '/category/private-jobs' },
    { label: 'Career Tips', href: '/category/career-tips' },
    { label: 'About', href: '/about' },
  ],

  footer: {
    columns: [
      {
        title: 'Quick Links',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Contact', href: '/about#contact' },
          { label: 'Search Jobs', href: '/search' },
        ],
      },
      {
        title: 'Job Categories',
        links: [
          { label: 'Govt Jobs', href: '/category/govt-jobs' },
          { label: 'UPSC & SSC', href: '/category/upsc-ssc' },
          { label: 'Private Jobs', href: '/category/private-jobs' },
          { label: 'Career Tips', href: '/category/career-tips' },
        ],
      },
      {
        title: 'Popular Searches',
        links: [
          { label: 'UPSC 2026', href: '/search?q=UPSC+2026' },
          { label: 'SSC CGL', href: '/search?q=SSC+CGL' },
          { label: 'Railway Jobs', href: '/search?q=Railway+Jobs' },
          { label: 'Bank Jobs', href: '/search?q=Bank+Jobs' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'Terms of Use', href: '/terms' },
          { label: 'Disclaimer', href: '/disclaimer' },
          { label: 'Cookie Policy', href: '/cookie-policy' },
        ],
      },
    ],
    tagline: 'Your trusted source for sarkari naukri and career guidance in India.',
  },
};

module.exports = jobnewsindiaConfig;

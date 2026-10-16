// Profile, education and competencies — all taken from the CV.

export const aboutShared = {
  school: 'VNUHCM — University of Science',
  schoolYears: '2009 — 2013',
  providers: ['ZaloPay', 'VNPay', 'Techcombank', 'Stripe', 'Fiserv US'],
  langLevels: [
    { code: 'VI', color: 'teal' },
    { code: 'EN', color: 'blue' },
    { code: 'JA', color: 'orange' },
  ],
}

export const aboutText = {
  en: {
    tag: 'Profile',
    title: ['Twelve years,', 'five industries'],
    summary:
      'Backend engineer and engineering lead with 12+ years building server-side systems. For the last three years I set up Hasaki.vn’s backend from scratch and grew it into a 25-engineer team across five product domains — moving from hands-on architecture into management as it scaled. Before that, I set the architecture and coding standards on VieON’s 30-engineer streaming platform, which scaled to 50,000 concurrent viewers.',
    education: 'Education',
    degree: 'B.Sc. Computer Software Engineering',
    languages: 'Languages',
    langNotes: ['Native', 'Working language', '3 years on-site in Nagoya'],
    langNames: ['Vietnamese', 'English', 'Japanese'],
    looking: 'Looking for',
    lookingText: 'A Backend Engineering Manager role — owning both the platform and the people who build it.',
    industries: 'Industries',
    industryList: ['Japanese banking', 'Internet infrastructure', 'Ad-tech', 'OTT streaming', 'E-commerce & manufacturing'],
    providersLabel: 'Payment providers integrated',
    competencies: 'Core competencies',
    groups: [
      { label: 'Leadership', items: ['Building and scaling backend teams', 'Mentoring & technical hiring', 'Roadmap ownership & task breakdown', 'Cross-functional delivery', 'Engineering standards & documentation', 'Production ownership'] },
      { label: 'AI-assisted engineering', items: ['Custom agent skills written against a live codebase', 'Automated code review on every change', 'AI-driven task management & progress visibility', 'Team workflow automation'] },
      { label: 'Domains', items: ['E-commerce promotion & pricing', 'Payment gateways, domestic & international', 'Manufacturing & product lifecycle (BOM / PLM)', 'Multi-market pricing, tax & fees', 'OTT streaming'] },
      { label: 'Architecture', items: ['Microservices', 'Domain & service boundary design', 'Event-driven systems', 'gRPC & REST API design', 'API gateway', 'High availability & legacy migration'] },
      { label: 'Data & messaging', items: ['MongoDB', 'MySQL', 'Redis Sentinel', 'Schema design & data migration', 'Kafka / Kafka Connect', 'RabbitMQ', 'Change-data capture'] },
      { label: 'Platform', items: ['Docker', 'CI/CD pipelines', 'Distributed job scheduling', 'Performance tuning & capacity planning'] },
    ],
  },
}

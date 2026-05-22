/* ============================================================
   Workforce Busytown — entity data
   Every building / character / hotspot on the map.
   Positions are in scene-svg units: scene width 3600, height 1100.
     - Federal Mall:    x   0 – 1100
     - State Capital:   x 1100 – 2200
     - Local Town:      x 2200 – 3600
   ============================================================ */

window.LEVELS = {
  federal:   { label: 'federal',   color: 'var(--scarry-blue)',   chip: 'level-federal' },
  state:     { label: 'state',     color: 'var(--scarry-green)',  chip: 'level-state' },
  local:     { label: 'local',     color: 'var(--scarry-orange)', chip: 'level-local' },
  education: { label: 'education', color: 'var(--scarry-pink)',   chip: 'level-education' },
  employer:  { label: 'employer',  color: 'var(--scarry-yellow)', chip: 'level-employer' },
  funder:    { label: 'funder',    color: 'var(--scarry-purple)', chip: 'level-funder' },
  people:    { label: 'people',    color: 'var(--brown)',         chip: 'level-people' },
};

/* ===================== Funding flows =====================
   Each flow becomes (a) a tinted dashed line connecting its
   stops on the map, and (b) one or more whimsical vehicles
   that drive along it when "animate vehicles" is on. */
window.FLOWS = {
  'title1': {
    label: 'WIOA Title I',
    sub: 'adult & dislocated worker',
    color: 'var(--flow-title1)',
    amount: '$3.6 B/yr',
    blurb: 'The biggest piece. Pays for adult, dislocated worker, and youth services at the jobs office.',
    stops: ['congress', 'dol', 'eta', 'state-agency', 'lwdb', 'ajc'],
    vehicle: 'dollar-truck',
  },
  'title2': {
    label: 'WIOA Title II',
    sub: 'adult education & literacy',
    color: 'var(--flow-title2)',
    amount: '$700 M/yr',
    blurb: 'Pays for adult basic education, GED prep, and English classes.',
    stops: ['congress', 'ed', 'octae', 'state-ed', 'community-college', 'ajc'],
    vehicle: 'book-bus',
  },
  'title3': {
    label: 'WIOA Title III',
    sub: 'employment service (Wagner-Peyser)',
    color: 'var(--flow-title3)',
    amount: '$700 M/yr',
    blurb: 'The oldest piece (1933). Universal job-matching for any worker, any employer.',
    stops: ['congress', 'dol', 'eta', 'state-agency', 'ajc'],
    vehicle: 'mail-truck',
  },
  'title4': {
    label: 'WIOA Title IV',
    sub: 'vocational rehabilitation',
    color: 'var(--flow-title4)',
    amount: '$3.7 B/yr',
    blurb: 'Employment services for workers with disabilities.',
    stops: ['congress', 'ed', 'rsa', 'state-vr', 'voc-rehab'],
    vehicle: 'ramp-van',
  },
  'pell': {
    label: 'Pell Grants',
    sub: 'incl. new Workforce Pell',
    color: 'var(--flow-pell)',
    amount: '$30+ B/yr',
    blurb: 'School-money letters that go straight from the federal government to students at eligible colleges.',
    stops: ['congress', 'ed', 'fsa', 'community-college', 'university'],
    vehicle: 'envelope-van',
  },
  'perkins': {
    label: 'Perkins V (CTE)',
    sub: 'career & technical education',
    color: 'var(--flow-perkins)',
    amount: '$1.4 B/yr',
    blurb: 'The biggest federal investment in career and technical education in high schools and community colleges.',
    stops: ['congress', 'ed', 'octae', 'state-ed', 'community-college', 'high-school'],
    vehicle: 'wrench-truck',
  },
  'tanf': {
    label: 'TANF & SNAP E&T',
    sub: 'work-with-cash-aid',
    color: 'var(--flow-tanf)',
    amount: 'block grant',
    blurb: 'Cash aid and food assistance that can pay for job search and training for low-income workers.',
    stops: ['congress', 'hhs', 'state-hs', 'cbo', 'ajc'],
    vehicle: 'grocery-truck',
  },
  'apprent': {
    label: 'Apprenticeship',
    sub: 'earn & learn',
    color: 'var(--flow-apprent)',
    amount: '$285 M/yr',
    blurb: 'Federal grants register and grow apprenticeships. Sponsors are employers, unions, and joint trusts.',
    stops: ['congress', 'dol', 'oa', 'state-saa', 'union', 'apprenticeship', 'employer-mfg'],
    vehicle: 'wrench-truck-brown',
  },
};

/* ===================== ENTITIES =====================
   Every named entity is a candidate hotspot. */
window.ENTITIES = {

  /* ---------- FEDERAL MALL (x 0 – 1100) ---------- */

  'congress': {
    label: 'congress',
    longName: 'U.S. Congress',
    acronym: 'Article I',
    level: 'federal',
    scarry: 'the capitol where the laws are made',
    role: 'Writes the laws and decides how much money the workforce system gets each year.',
    narr: 'Every year, Congress decides how much money the workforce system will get. Then the money goes to the federal agencies, and from there out to the states.',
    facts: [
      ['Authorizes', 'WIOA (2014)'],
      ['Appropriates', 'all WIOA & Pell funds'],
    ],
    connects: ['dol', 'ed', 'hhs', 'commerce'],
    pos: { x: 550, y: 380 },
  },

  'dol': {
    label: 'department of labor',
    longName: 'U.S. Department of Labor',
    acronym: 'DOL',
    level: 'federal',
    scarry: 'the labor building',
    role: 'The cabinet department most centrally responsible for the workforce system. Headed by the Secretary of Labor.',
    narr: 'The Department of Labor sends money to the states so they can run job centers, training programs, and apprenticeships.',
    facts: [
      ['Houses', 'ETA, OA, BLS, VETS, Women\'s Bureau'],
      ['Cabinet rank', 'yes — Secretary of Labor'],
    ],
    connects: ['congress', 'eta', 'oa', 'bls', 'vets'],
    pos: { x: 230, y: 540 },
  },

  'eta': {
    label: 'employment & training',
    longName: 'Employment and Training Administration',
    acronym: 'ETA',
    level: 'federal',
    scarry: 'the loading dock at the labor building',
    role: 'The DOL wing that actually moves WIOA Title I & III money out to the states and oversees apprenticeship and Job Corps.',
    narr: 'ETA is the part of the Labor Department where the money trucks are loaded up and pointed at the states.',
    facts: [
      ['Staff', '~1,000'],
      ['Regional offices', '6 (Boston, Philly, Atlanta, Chicago, Dallas, SF)'],
      ['Programs', 'WIOA I & III, Apprenticeship, Job Corps, YouthBuild, TAA'],
    ],
    connects: ['dol', 'state-agency', 'oa'],
    pos: { x: 360, y: 600 },
  },

  'oa': {
    label: 'office of apprenticeship',
    longName: 'Office of Apprenticeship',
    acronym: 'OA',
    level: 'federal',
    scarry: 'the apprenticeship desk',
    role: 'Registers apprenticeship programs and sets national standards. About 28 states have their own State Apprenticeship Agency that does this work locally.',
    facts: [['Inside', 'ETA / DOL']],
    connects: ['eta', 'state-saa', 'apprenticeship'],
    pos: { x: 130, y: 640 },
  },

  'bls': {
    label: 'labor statistics',
    longName: 'Bureau of Labor Statistics',
    acronym: 'BLS',
    level: 'federal',
    scarry: 'the data library',
    role: 'Not a service agency — the data backbone. Counts jobs, wages, unemployment, and in-demand occupations.',
    facts: [['Surveys', 'CPS, OES, JOLTS, LAUS, Employment Projections']],
    connects: ['dol'],
    pos: { x: 60, y: 690 },
  },

  'vets': {
    label: 'veterans\' employment',
    longName: 'Veterans\' Employment and Training Service',
    acronym: 'VETS',
    level: 'federal',
    scarry: 'the veterans desk',
    role: 'Funds the veteran-employment specialists who sit inside American Job Centers.',
    connects: ['dol', 'ajc'],
    pos: { x: 380, y: 700 },
  },

  'ed': {
    label: 'department of education',
    longName: 'U.S. Department of Education',
    acronym: 'ED',
    level: 'federal',
    scarry: 'the schoolhouse on the federal mall',
    role: 'Houses Adult Ed, CTE, Pell, and Voc Rehab. About a third of federal workforce money actually flows through Education.',
    facts: [['Houses', 'OCTAE, FSA, RSA']],
    connects: ['octae', 'fsa', 'rsa', 'congress'],
    pos: { x: 720, y: 540 },
  },

  'octae': {
    label: 'adult ed & CTE office',
    longName: 'Office of Career, Technical, and Adult Education',
    acronym: 'OCTAE',
    level: 'federal',
    scarry: 'the desk where Title II and Perkins live',
    role: 'Administers WIOA Title II (Adult Ed) and Perkins V (Career & Technical Education).',
    facts: [['Perkins V', '~$1.4 B/yr']],
    connects: ['ed', 'state-ed'],
    pos: { x: 620, y: 640 },
  },

  'fsa': {
    label: 'federal student aid',
    longName: 'Federal Student Aid',
    acronym: 'FSA',
    level: 'federal',
    scarry: 'the desk that sends the school money letters',
    role: 'Administers Pell Grants, federal student loans, and the new Workforce Pell for short-term programs.',
    narr: 'Workforce Pell, starting in 2026, will let students use Pell for 8-to-15-week training programs. This is the biggest policy change on the credential horizon.',
    facts: [['Pell Grants', '~$30+ B/yr'], ['Workforce Pell', 'launches 2026']],
    connects: ['ed', 'community-college', 'university'],
    pos: { x: 780, y: 650 },
  },

  'rsa': {
    label: 'rehab services',
    longName: 'Rehabilitation Services Administration',
    acronym: 'RSA',
    level: 'federal',
    scarry: 'the voc-rehab desk',
    role: 'Administers WIOA Title IV — vocational rehabilitation for workers with disabilities.',
    facts: [['Title IV', '~$3.7 B/yr']],
    connects: ['ed', 'state-vr'],
    pos: { x: 870, y: 700 },
  },

  'hhs': {
    label: 'health & human services',
    longName: 'U.S. Department of Health & Human Services',
    acronym: 'HHS',
    level: 'federal',
    scarry: 'the clinic on the federal mall',
    role: 'Administers TANF (cash aid) and oversees programs states use to pay for job search and training.',
    facts: [['TANF block grant', '$16.5 B/yr']],
    connects: ['congress', 'state-hs'],
    pos: { x: 920, y: 600 },
  },

  'commerce': {
    label: 'commerce & EDA',
    longName: 'U.S. Department of Commerce / Economic Development Administration',
    acronym: 'DOC / EDA',
    level: 'federal',
    scarry: 'the factory office on the mall',
    role: 'Funds regional economic development that often pairs with workforce strategy — Build Back Better, Recompete, EDA grants.',
    connects: ['eda-district'],
    pos: { x: 1010, y: 640 },
  },

  /* ---------- STATE CAPITAL (x 1100 – 2200) ---------- */

  'governor': {
    label: 'governor\'s office',
    longName: 'Office of the Governor',
    acronym: '',
    level: 'state',
    scarry: 'the house on the hill',
    role: 'The single most important workforce actor at the state level. Appoints the State Board, designates local areas, submits the WIOA plan.',
    narr: 'The Governor decides where the state\'s local jobs boards will be, who sits on the State Board, and how the federal money is shared among regions.',
    facts: [
      ['Appoints', 'State Workforce Board'],
      ['Designates', 'Local Workforce Areas'],
      ['Submits', 'state WIOA plan'],
    ],
    connects: ['state-board', 'state-agency'],
    pos: { x: 1340, y: 380 },
  },

  'state-board': {
    label: 'state workforce board',
    longName: 'State Workforce Development Board',
    acronym: 'SWDB',
    level: 'state',
    scarry: 'the round-table room',
    role: 'A board of business, labor, education, and government members who set state workforce policy. 51%+ must be private-sector employers, by law.',
    narr: 'Around a big round table, business owners, union reps, and college presidents argue about how to spend the money. Half plus one of the chairs belong to business.',
    facts: [
      ['Business majority', '≥ 51% by law'],
      ['Labor seats', '≥ 20%'],
      ['Meets', 'quarterly'],
    ],
    contested: 'Business-majority governance: feature or bug? Critics say it gives employers veto over worker-centered design. Defenders say it keeps boards focused on real labor demand.',
    connects: ['governor', 'state-agency'],
    pos: { x: 1490, y: 540 },
  },

  'state-legislature': {
    label: 'state legislature',
    longName: 'State Legislature',
    acronym: '',
    level: 'state',
    scarry: 'the debate building',
    role: 'Sets state appropriations, passes state workforce laws, often adds state-only training dollars on top of federal WIOA funds.',
    connects: ['governor'],
    pos: { x: 1170, y: 540 },
  },

  'state-agency': {
    label: 'state workforce agency',
    longName: 'State Workforce Agency (Dept. of Labor / Workforce Development)',
    acronym: 'SWA',
    level: 'state',
    scarry: 'the state labor office',
    role: 'Administers WIOA Title I & III, unemployment insurance, and most workforce programs. Sends money on to the local boards.',
    facts: [
      ['Examples', 'CA EDD, TX Workforce Commission, NY DOL, PA L&I'],
    ],
    connects: ['eta', 'lwdb', 'state-board', 'governor'],
    pos: { x: 1380, y: 700 },
  },

  'state-ed': {
    label: 'state education agency',
    longName: 'State Education Agency',
    acronym: 'SEA',
    level: 'state',
    scarry: 'the state schoolhouse',
    role: 'Usually administers WIOA Title II (Adult Ed) and Perkins V for the state.',
    connects: ['octae', 'community-college', 'high-school'],
    pos: { x: 1560, y: 720 },
  },

  'state-higher-ed': {
    label: 'state higher ed',
    longName: 'State Higher Education Coordinating Agency',
    acronym: '',
    level: 'state',
    scarry: 'the college board office',
    role: 'Oversees public community colleges and universities. Runs many state free-college or Promise programs.',
    connects: ['community-college', 'university'],
    pos: { x: 1730, y: 730 },
  },

  'state-vr': {
    label: 'state voc rehab',
    longName: 'State Vocational Rehabilitation Agency',
    acronym: 'VR',
    level: 'state',
    scarry: 'the voc-rehab office',
    role: 'Administers WIOA Title IV for the state. Almost always a separate agency from the main workforce agency.',
    connects: ['rsa', 'voc-rehab'],
    pos: { x: 1880, y: 700 },
  },

  'state-saa': {
    label: 'state apprenticeship',
    longName: 'State Apprenticeship Agency',
    acronym: 'SAA',
    level: 'state',
    scarry: 'the apprenticeship registry',
    role: 'In ~28 states, registers and oversees apprenticeship programs locally instead of the federal Office of Apprenticeship.',
    connects: ['oa', 'apprenticeship'],
    pos: { x: 2030, y: 720 },
  },

  'state-hs': {
    label: 'state human services',
    longName: 'State Department of Human Services',
    acronym: 'DHS',
    level: 'state',
    scarry: 'the state aid office',
    role: 'Administers TANF and SNAP Employment & Training for the state. Both can pay for job search and training.',
    connects: ['hhs', 'cbo'],
    pos: { x: 2110, y: 690 },
  },

  /* ---------- LOCAL TOWN (x 2200 – 3600) ---------- */

  'ceo': {
    label: 'mayor & county exec',
    longName: 'Chief Elected Officials',
    acronym: 'CEOs',
    level: 'local',
    scarry: 'the mayor on the steps',
    role: 'The local elected officials — mayor, county executive, board of commissioners — who share fiduciary authority with the LWDB.',
    facts: [['Shares authority with', 'the local board']],
    connects: ['lwdb'],
    pos: { x: 2310, y: 540 },
  },

  'lwdb': {
    label: 'local workforce board',
    longName: 'Local Workforce Development Board',
    acronym: 'LWDB',
    level: 'local',
    scarry: 'the town hall',
    role: 'Governs the local jobs office. Picks the operator, sets local plans, brokers employer partnerships, manages the eligible training provider list.',
    narr: 'The local board is where business owners, college folks, and union reps decide how the federal money will be spent in this town.',
    facts: [
      ['Nationwide', '~580 local areas'],
      ['Business majority', '≥ 51%'],
      ['Picks', 'the one-stop operator'],
    ],
    contested: 'Local boards vary enormously in capacity. Some are strategic powerhouses; others are mostly ceremonial. The 580-LWDA structure is either responsive federalism or expensive fragmentation, depending on who you ask.',
    connects: ['state-agency', 'ceo', 'ajc', 'one-stop-op'],
    pos: { x: 2440, y: 540 },
  },

  'one-stop-op': {
    label: 'one-stop operator',
    longName: 'One-Stop Operator',
    acronym: '',
    level: 'local',
    scarry: 'the manager of the jobs office',
    role: 'A contractor — sometimes a nonprofit, sometimes a for-profit firm, sometimes a college — that runs the AJC day-to-day.',
    facts: [['Selected by', 'the local board, competitively']],
    connects: ['lwdb', 'ajc'],
    pos: { x: 2570, y: 540 },
  },

  'ajc': {
    label: 'the jobs office',
    longName: 'American Job Center (One-Stop)',
    acronym: 'AJC',
    level: 'local',
    scarry: 'the jobs office with four colored doors',
    role: 'The physical place a worker walks in. Title I, Title II, Title III, and Title IV all live behind doors here, with case management trying to braid them.',
    narr: 'When somebody loses a job, they come to the jobs office. There are four doors — one for each WIOA title — and helpers behind each one.',
    facts: [
      ['Nationwide', '~2,400 centers (1,400 comprehensive)'],
      ['Required partners', '15+ programs'],
      ['Title I door', 'adult & dislocated worker'],
      ['Title II door', 'adult ed & literacy'],
      ['Title III door', 'job matching'],
      ['Title IV door', 'voc rehab'],
    ],
    contested: 'AJC quality varies wildly. Federal one-stop certification standards exist but are softly enforced. Some centers are vibrant hubs; others are quiet rooms with brochures.',
    connects: ['one-stop-op', 'lwdb', 'community-college', 'cbo', 'employer-mfg', 'employer-hosp', 'job-seeker'],
    pos: { x: 2830, y: 540 },
  },

  'unemployment': {
    label: 'unemployment office',
    longName: 'Unemployment Insurance',
    acronym: 'UI',
    level: 'local',
    scarry: 'the line outside the UI window',
    role: 'Where workers file for unemployment insurance when laid off. State-run, federally overseen. Often the first place people learn the jobs office exists.',
    connects: ['state-agency', 'ajc'],
    pos: { x: 2970, y: 540 },
  },

  /* ---------- TRAINING ROW (x 2200 – 3600, lower band) ---------- */

  'community-college': {
    label: 'community college',
    longName: 'Community College',
    acronym: '',
    level: 'education',
    scarry: 'the schoolhouse on the corner',
    role: 'The single most important institution in the system. ~1,000 nationally. The largest provider of WIOA-funded training, adult ed, and CTE.',
    narr: 'The community college teaches grown-ups how to be nurses, machinists, programmers, welders. Most people who train through the jobs office train here.',
    facts: [
      ['Nationwide', '~1,000 colleges'],
      ['Credit students', '~4–5 million'],
      ['Workforce continuing ed', 'noncredit, employer-facing'],
    ],
    connects: ['ajc', 'fsa', 'state-higher-ed', 'apprenticeship', 'employer-mfg'],
    pos: { x: 2560, y: 870 },
  },

  'apprenticeship': {
    label: 'earn & learn workshop',
    longName: 'Registered Apprenticeship Sponsor',
    acronym: 'RA',
    level: 'education',
    scarry: 'the workshop where masters teach apprentices',
    role: 'Employer- or union-sponsored programs where workers earn a paycheck while they learn. Most are in the construction trades; healthcare, IT, and manufacturing are growing.',
    facts: [
      ['Active apprentices', '~600,000'],
      ['Sponsors', 'employers, unions, joint trusts'],
    ],
    connects: ['oa', 'state-saa', 'union', 'community-college', 'employer-mfg'],
    pos: { x: 2740, y: 870 },
  },

  'high-school': {
    label: 'high school CTE',
    longName: 'High School Career & Technical Education',
    acronym: 'CTE',
    level: 'education',
    scarry: 'the high school career center',
    role: 'Secondary CTE programs, career academies, and dual-enrollment with community colleges — funded by Perkins V.',
    connects: ['state-ed', 'octae', 'community-college'],
    pos: { x: 2380, y: 860 },
  },

  'university': {
    label: 'university',
    longName: 'Four-Year University',
    acronym: '',
    level: 'education',
    scarry: 'the college with the tall tower',
    role: 'Engages the system unevenly. Strong in nursing, teaching, and regional economic development; weaker in WIOA service delivery.',
    connects: ['fsa', 'state-higher-ed'],
    pos: { x: 2210, y: 860 },
  },

  'voc-rehab': {
    label: 'voc rehab office',
    longName: 'Vocational Rehabilitation Office',
    acronym: 'VR',
    level: 'education',
    scarry: 'the office with the ramp',
    role: 'Local Title IV office. Helps workers with disabilities find jobs, training, and accommodations.',
    connects: ['state-vr', 'ajc'],
    pos: { x: 2930, y: 860 },
  },

  'cbo': {
    label: 'community nonprofit',
    longName: 'Community-Based Organization',
    acronym: 'CBO',
    level: 'education',
    scarry: 'the storefront with the mission',
    role: 'The connective tissue of the local system. Goodwill, Urban League, YMCA, plus thousands of local nonprofits running training and supportive services.',
    narr: 'Many of the most loved workforce programs are CBOs. Some are inside the system; many work alongside it.',
    facts: [['National names', 'Goodwill, Urban League, YWCA, Catholic Charities']],
    connects: ['ajc', 'state-hs', 'employer-mfg', 'employer-hosp'],
    pos: { x: 3070, y: 860 },
  },

  /* ---------- EMPLOYER DISTRICT (right edge of local town) ---------- */

  'employer-mfg': {
    label: 'manufacturer',
    longName: 'Local Manufacturer',
    acronym: '',
    level: 'employer',
    scarry: 'the factory with the smokestack',
    role: 'Anchor employer. Often the lead partner in a regional sector partnership.',
    connects: ['ajc', 'community-college', 'apprenticeship', 'sector-partner', 'union'],
    pos: { x: 3260, y: 540 },
  },

  'employer-hosp': {
    label: 'hospital',
    longName: 'Hospital / Health System',
    acronym: '',
    level: 'employer',
    scarry: 'the big red-cross building',
    role: 'Huge employer of nurses, techs, medical assistants. Increasingly running its own apprenticeship and tuition-assistance programs.',
    connects: ['ajc', 'community-college', 'cbo'],
    pos: { x: 3410, y: 540 },
  },

  'employer-shops': {
    label: 'main-street shops',
    longName: 'Small Employers',
    acronym: '',
    level: 'employer',
    scarry: 'the row of shops with awnings',
    role: 'Most small employers never engage the workforce system at all. They hire through referrals, posted jobs, and online platforms.',
    connects: ['ajc'],
    pos: { x: 3460, y: 540 },
  },

  'distribution-center': {
    label: 'distribution center',
    longName: 'Logistics & Distribution Center',
    acronym: '',
    level: 'employer',
    scarry: 'the warehouse with the long loading dock',
    role: 'Warehouse and last-mile logistics — Amazon, UPS, FedEx, big-box retailers. One of the fastest-growing entry-level employers in the country.',
    narr: 'Most of the people sorting and driving packages started here in the last two years. Many will move into forklift, fleet, or supervisor roles — most of that promotion happens through on-site training.',
    facts: [
      ['Employs', 'sorters, forklift drivers, last-mile drivers, mechanics'],
      ['On-site training', 'forklift cert, OSHA-10, fleet maintenance, supervisor academy'],
      ['Partners with', 'AJC for hiring events, CCs for CDL'],
    ],
    connects: ['ajc', 'community-college', 'sector-partner', 'cbo'],
    pos: { x: 3580, y: 540 },
  },

  'hotel': {
    label: 'hotel & hospitality',
    longName: 'Hotel & Hospitality Employer',
    acronym: '',
    level: 'employer',
    scarry: 'the tall hotel with the awning',
    role: 'Lodging, food service, conference. Large entry-level employer with internal career ladders — housekeeping → supervisor → front-of-house → management.',
    narr: 'Many hotel workers learn on the job. Big chains run their own academies; independent properties usually train through community colleges or CBOs.',
    facts: [
      ['Employs', 'housekeeping, front-desk, kitchen, maintenance, conference staff'],
      ['On-site training', 'customer service, food safety, ESL, supervisor track'],
      ['Often hires from', 'CBO and TANF referrals, immigrant networks'],
    ],
    connects: ['ajc', 'community-college', 'cbo'],
    pos: { x: 3780, y: 540 },
  },

  'chamber': {
    label: 'chamber of commerce',
    longName: 'Chamber of Commerce',
    acronym: '',
    level: 'employer',
    scarry: 'the clubhouse for business folks',
    role: 'The primary employer-side coordinating body in most regions. Often holds the convening pen on sector partnerships.',
    connects: ['lwdb', 'sector-partner'],
    pos: { x: 3240, y: 700 },
  },

  'sector-partner': {
    label: 'sector roundtable',
    longName: 'Regional Sector Partnership',
    acronym: '',
    level: 'employer',
    scarry: 'the table in the square where employers and trainers meet',
    role: 'Industry-led collaborative around one sector (manufacturing, healthcare, IT). Where mature regional workforce work actually happens.',
    connects: ['lwdb', 'chamber', 'community-college', 'employer-mfg', 'employer-hosp'],
    pos: { x: 3380, y: 720 },
  },

  'union': {
    label: 'union hall',
    longName: 'Labor Union',
    acronym: '',
    level: 'employer',
    scarry: 'the union hall',
    role: 'Where they exist, sponsor apprenticeships, hold Taft-Hartley training trusts, and fill the 20% labor-rep seats on every board.',
    connects: ['apprenticeship', 'state-board', 'lwdb'],
    pos: { x: 3500, y: 720 },
  },

  /* ---------- ADJACENT ECOSYSTEM ---------- */

  'foundation': {
    label: 'foundation',
    longName: 'Foundation / Philanthropy',
    acronym: '',
    level: 'funder',
    scarry: 'the grant-makers\' office',
    role: 'Lumina, Walton, JPMC, Ascendium, Strada, Ballmer Group, Schultz, GitLab. A few hundred million a year — small vs. federal, but more flexible.',
    connects: ['cbo', 'intermediary'],
    pos: { x: 3220, y: 870 },
  },

  'intermediary': {
    label: 'national intermediary',
    longName: 'National Intermediary',
    acronym: '',
    level: 'funder',
    scarry: 'the office that runs the program in many cities at once',
    role: 'Year Up, Per Scholas, Climb Hire, NPower, JVS. Multi-city training & placement programs that mostly operate alongside WIOA, not inside it.',
    connects: ['foundation', 'employer-mfg', 'employer-hosp'],
    pos: { x: 3360, y: 870 },
  },

  'eda-district': {
    label: 'economic dev district',
    longName: 'Economic Development District',
    acronym: 'EDD',
    level: 'funder',
    scarry: 'the regional planning office',
    role: 'Multi-county planning bodies designated by EDA. ~400 nationwide. Workforce and economic development overlap here.',
    connects: ['commerce', 'lwdb'],
    pos: { x: 3500, y: 870 },
  },

  /* ---------- THE PEOPLE ---------- */

  'job-seeker': {
    label: 'the job seeker',
    longName: 'A Job Seeker',
    acronym: '',
    level: 'people',
    scarry: 'a rabbit with a backpack and a résumé',
    role: 'Just laid off from a manufacturing job. Walks into the AJC, gets assessed, enrolls in training at the community college, finishes a credential, and is placed at a new employer.',
    narr: 'The whole system exists for this rabbit. Sometimes the system works for her. Sometimes she falls through the cracks.',
    contested: 'WIOA performance metrics reward placing workers most likely to succeed quickly. Workers furthest from the labor market are the hardest — and most important — to serve. This tension is structural.',
    connects: ['ajc', 'community-college', 'employer-mfg'],
    pos: { x: 2820, y: 940 },
  },
};

/* ===================== Helper: per-flow path ===================== */
window.flowPath = function (flowId) {
  const flow = window.FLOWS[flowId];
  if (!flow) return [];
  return flow.stops.map(id => window.ENTITIES[id]).filter(Boolean);
};

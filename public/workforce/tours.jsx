/* ============================================================
   TOURS — guided walkthroughs of the Workforce Busytown.
   Two kinds:
     persona   — a worker moves through the system
     flow      — money moves through the system
   Each tour is a series of steps:
     { from, to, view, caption, focusEntities, duration }
   The App animates the map view and a focal sprite between
   each step's from→to over the step's duration.
   ============================================================ */

window.TOURS = {

  /* ------------------ PERSONAS ------------------ */

  'machinist': {
    kind: 'persona',
    title: 'The Laid-Off Machinist',
    sub: 'Carl loses his factory shift. Now what?',
    color: 'var(--scarry-orange)',
    sprite: {
      kind: 'character',
      species: 'bear', costume: 'var(--scarry-orange)',
      fur: 'var(--brown)', hat: 'hardhat', prop: 'resume',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 3220, y: 700 }, to: { x: 3220, y: 700 },
        view: { cx: 3220, cy: 580, scale: 0.95 },
        caption: 'Carl is a welder at the manufacturer. This morning the plant cut a shift. He picks up his final paycheck and a flyer about the jobs office.',
        focus: ['employer-mfg'],
        duration: 6500,
      },
      {
        from: { x: 3220, y: 700 }, to: { x: 3025, y: 700 },
        view: { cx: 3100, cy: 620, scale: 0.85 },
        caption: 'First stop: the UI office. Carl files for unemployment insurance. The state pays him a weekly check while he looks for new work.',
        focus: ['unemployment'],
        duration: 6500,
      },
      {
        from: { x: 3025, y: 700 }, to: { x: 2810, y: 700 },
        view: { cx: 2920, cy: 620, scale: 0.8 },
        caption: 'Then the jobs office. Carl walks in the red Title I door — adult & dislocated worker programs. A counselor takes his story and runs a skills assessment.',
        focus: ['ajc'],
        duration: 7500,
      },
      {
        from: { x: 2810, y: 700 }, to: { x: 2605, y: 900 },
        view: { cx: 2705, cy: 800, scale: 0.85 },
        caption: 'The counselor sends him to the community college. With WIOA Title I money, Carl enrolls in a 14-week robotic-welding refresher.',
        focus: ['community-college'],
        duration: 7000,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 2605, y: 900 },
        view: { cx: 2605, cy: 880, scale: 1.15 },
        caption: 'Inside the college: an owl teaches welding to a row of students. This is where most WIOA-funded training actually happens — about 1,000 community colleges nationwide.',
        focus: ['community-college'],
        duration: 7000,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 3220, y: 700 },
        view: { cx: 2920, cy: 760, scale: 0.55 },
        caption: 'Credential in hand, Carl is placed at the manufacturer — a different one, but down the same street. The AJC reports the outcome to the state and the state to DOL.',
        focus: ['employer-mfg', 'ajc'],
        duration: 8000,
      },
    ],
  },

  'returning-mom': {
    kind: 'persona',
    title: 'The Returning Mom',
    sub: 'Maya, on cash aid, has to do "work activities." She has to figure out what that means.',
    color: 'var(--scarry-pink)',
    sprite: {
      kind: 'character',
      species: 'pig', costume: 'var(--scarry-pink)',
      fur: 'var(--scarry-pink)', prop: 'envelope',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 2140, y: 800 }, to: { x: 2140, y: 800 },
        view: { cx: 2140, cy: 720, scale: 0.95 },
        caption: 'Maya is a single parent. She just opened a TANF case at the state human services office. The caseworker tells her she has to do "work activities" to keep the cash aid.',
        focus: ['state-hs'],
        duration: 7500,
      },
      {
        from: { x: 2140, y: 800 }, to: { x: 3050, y: 940 },
        view: { cx: 2620, cy: 870, scale: 0.45 },
        caption: 'Work activities can mean job search, training, or actual work. The state contracts a community nonprofit — Goodheart — to run the program for the county.',
        focus: ['cbo'],
        duration: 8000,
      },
      {
        from: { x: 3050, y: 940 }, to: { x: 2820, y: 700 },
        view: { cx: 2940, cy: 820, scale: 0.85 },
        caption: 'Goodheart walks her over to the jobs office. The blue Title II door is for adult education — Maya finishes her high-school equivalency here.',
        focus: ['ajc', 'cbo'],
        duration: 7000,
      },
      {
        from: { x: 2820, y: 700 }, to: { x: 2605, y: 900 },
        view: { cx: 2720, cy: 800, scale: 0.85 },
        caption: 'The AJC pairs her education with a medical-assistant training cohort at the community college. Title I pays for tuition; TANF covers child care while she\'s in class.',
        focus: ['community-college'],
        duration: 7500,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 3385, y: 700 },
        view: { cx: 3000, cy: 800, scale: 0.55 },
        caption: 'A few months later, the hospital is hiring medical assistants. Maya is referred and hired. Her TANF case closes. The hospital becomes the AJC\'s case study for the year.',
        focus: ['employer-hosp'],
        duration: 8000,
      },
    ],
  },

  'young-apprentice': {
    kind: 'persona',
    title: 'The Young Apprentice',
    sub: 'Pip finishes high school and enters the trades.',
    color: 'var(--scarry-yellow)',
    sprite: {
      kind: 'character',
      species: 'rabbit', costume: 'var(--scarry-yellow)',
      fur: 'var(--paper-shadow)', hat: 'hardhat', prop: 'tool',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 2445, y: 940 }, to: { x: 2445, y: 940 },
        view: { cx: 2445, cy: 880, scale: 1.0 },
        caption: 'Pip is a senior at the high school. He takes a CTE class in welding, funded by Perkins V — the biggest federal investment in career & technical education.',
        focus: ['high-school'],
        duration: 6500,
      },
      {
        from: { x: 2445, y: 940 }, to: { x: 3520, y: 740 },
        view: { cx: 2920, cy: 820, scale: 0.6 },
        caption: 'He likes the work. After graduation, an electricians\' union sponsors him into a Registered Apprenticeship. The union hall is where they sign him in.',
        focus: ['union'],
        duration: 6500,
      },
      {
        from: { x: 3520, y: 740 }, to: { x: 2780, y: 940 },
        view: { cx: 3000, cy: 850, scale: 0.7 },
        caption: 'Apprentices earn a paycheck from day one. Pip starts at $18/hr and gets a raise every six months. A master welder teaches him at the shop.',
        focus: ['apprenticeship'],
        duration: 7000,
      },
      {
        from: { x: 2780, y: 940 }, to: { x: 2605, y: 900 },
        view: { cx: 2700, cy: 880, scale: 1.0 },
        caption: 'Apprenticeships have a classroom side too. Pip\'s "related instruction" — code, math, blueprints — happens at the community college, two nights a week.',
        focus: ['community-college', 'apprenticeship'],
        duration: 6500,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 3220, y: 700 },
        view: { cx: 2920, cy: 780, scale: 0.65 },
        caption: 'Four years later, Pip is a journeyman welder. Wage tripled. No student debt. The federal Office of Apprenticeship logged every hour and issued a nationally portable credential.',
        focus: ['employer-mfg', 'oa'],
        duration: 7500,
      },
    ],
  },

  'veteran': {
    kind: 'persona',
    title: 'The Returning Veteran',
    sub: 'Sgt. Hank just separated. His DD-214 unlocks priority of service.',
    color: 'var(--scarry-blue-deep)',
    sprite: {
      kind: 'character',
      species: 'dog', costume: 'var(--scarry-blue-deep)',
      fur: 'var(--brown)', hat: 'cap', prop: 'resume',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 2830, y: 700 }, to: { x: 2830, y: 700 },
        view: { cx: 2830, cy: 620, scale: 0.9 },
        caption: 'Hank just separated from the service. The first place he walks into is the jobs office. By federal law, veterans get priority of service in every WIOA program — they get seen first.',
        focus: ['ajc'],
        duration: 7000,
      },
      {
        from: { x: 2830, y: 700 }, to: { x: 2830, y: 700 },
        view: { cx: 2830, cy: 620, scale: 1.1 },
        caption: 'A DVOP — Disabled Veterans\' Outreach Program specialist — sits inside the AJC. Their salary is paid by JVSG, a separate ~$180 M/yr grant DOL\'s VETS office sends straight to states.',
        focus: ['ajc', 'vets'],
        duration: 7500,
      },
      {
        from: { x: 2830, y: 700 }, to: { x: 3500, y: 720 },
        view: { cx: 3120, cy: 700, scale: 0.7 },
        caption: 'The DVOP routes Hank into Helmets-to-Hardhats — a national pathway from military service into the building trades. The local union hall is the front door.',
        focus: ['union'],
        duration: 7000,
      },
      {
        from: { x: 3500, y: 720 }, to: { x: 2780, y: 940 },
        view: { cx: 3120, cy: 830, scale: 0.65 },
        caption: 'Hank starts a Registered Apprenticeship as a millwright. The Post-9/11 GI Bill pays him a monthly housing allowance on top of apprentice wages — a rare double-dip Congress explicitly allowed.',
        focus: ['apprenticeship'],
        duration: 7500,
      },
      {
        from: { x: 2780, y: 940 }, to: { x: 3580, y: 700 },
        view: { cx: 3180, cy: 820, scale: 0.6 },
        caption: 'Three years on, Hank is a journey-level millwright running a maintenance crew at the regional distribution center — and a nationally credentialed civilian for life.',
        focus: ['distribution-center', 'apprenticeship'],
        duration: 7500,
      },
    ],
  },

  'vr-client': {
    kind: 'persona',
    title: 'The VR Client',
    sub: 'Iris opens a Vocational Rehabilitation case for the workplace she has in mind.',
    color: 'var(--scarry-purple)',
    sprite: {
      kind: 'character',
      species: 'cat', costume: 'var(--scarry-purple)',
      fur: 'var(--paper-shadow)', prop: 'book',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 2930, y: 900 }, to: { x: 2930, y: 900 },
        view: { cx: 2930, cy: 860, scale: 1.05 },
        caption: 'Iris has a visual disability. She walks into the local Voc Rehab office. A counselor opens her case and together they sketch an IPE — Individualized Plan for Employment.',
        focus: ['voc-rehab'],
        duration: 7500,
      },
      {
        from: { x: 2930, y: 900 }, to: { x: 2930, y: 900 },
        view: { cx: 2400, cy: 800, scale: 0.55 },
        caption: 'VR is its own slice of WIOA — Title IV. It runs through Education, not Labor, and the state VR agency is who actually pays for everything in Iris\'s plan.',
        focus: ['voc-rehab', 'state-vr'],
        duration: 7500,
      },
      {
        from: { x: 2930, y: 900 }, to: { x: 2605, y: 900 },
        view: { cx: 2770, cy: 880, scale: 0.95 },
        caption: 'Step one of the plan: a community-college certificate in medical coding. VR pays tuition, books, and any assistive technology — screen readers, magnification, refreshable braille.',
        focus: ['community-college'],
        duration: 7500,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 2930, y: 900 },
        view: { cx: 2770, cy: 880, scale: 0.95 },
        caption: 'During and after training, VR sends a job coach — someone who shows up at the workplace, helps negotiate accommodations, and fades out when Iris is settled.',
        focus: ['voc-rehab'],
        duration: 7000,
      },
      {
        from: { x: 2930, y: 900 }, to: { x: 3410, y: 700 },
        view: { cx: 3160, cy: 800, scale: 0.7 },
        caption: 'Iris is hired by the hospital as a medical coder, with accommodations in place from day one. After 90 days of stable employment, VR closes the case "26" — a successful employment outcome.',
        focus: ['employer-hosp'],
        duration: 7500,
      },
    ],
  },

  'returnee': {
    kind: 'persona',
    title: 'The Returning Citizen',
    sub: 'Rex came home last month. He needs ID, an address, and a job — in that order.',
    color: 'var(--brown-deep)',
    sprite: {
      kind: 'character',
      species: 'bear', costume: 'var(--brown)',
      fur: 'var(--brown-deep)', hat: 'cap', prop: 'backpack',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 3070, y: 900 }, to: { x: 3070, y: 900 },
        view: { cx: 3070, cy: 860, scale: 1.05 },
        caption: 'Rex was released two weeks ago. The reentry CBO is his first stop — they help him replace his ID, find a bed at a halfway house, and write a résumé that doesn\'t hide the gap.',
        focus: ['cbo'],
        duration: 7500,
      },
      {
        from: { x: 3070, y: 900 }, to: { x: 2830, y: 700 },
        view: { cx: 2950, cy: 800, scale: 0.85 },
        caption: 'The CBO walks him over to the jobs office. WIOA Title I has no carve-out that excludes people with records — and a Second Chance Act grant pays for the CBO\'s staff time inside the AJC.',
        focus: ['ajc', 'cbo'],
        duration: 7500,
      },
      {
        from: { x: 2830, y: 700 }, to: { x: 2605, y: 900 },
        view: { cx: 2720, cy: 800, scale: 0.9 },
        caption: 'The AJC enrolls Rex in a CDL Class-A program at the community college. The Federal Bonding Program also issues a six-month fidelity bond to reassure his first employer.',
        focus: ['community-college'],
        duration: 7500,
      },
      {
        from: { x: 2605, y: 900 }, to: { x: 3580, y: 700 },
        view: { cx: 3100, cy: 800, scale: 0.55 },
        caption: 'Twelve weeks later: CDL in hand. The regional distribution center is a fair-chance employer — they hire from this exact pipeline. Rex starts the next Monday.',
        focus: ['distribution-center'],
        duration: 8000,
      },
      {
        from: { x: 3580, y: 700 }, to: { x: 3580, y: 700 },
        view: { cx: 3580, cy: 620, scale: 0.95 },
        caption: 'One year later, Rex is mentoring two newer hires from the same reentry CBO. The pipeline is starting to run in both directions.',
        focus: ['distribution-center', 'cbo'],
        duration: 7000,
      },
    ],
  },

  /* ------------------ FUNDING FLOWS ------------------ */

  'flow-title1': {
    kind: 'flow',
    title: 'WIOA Title I — the biggest piece',
    sub: 'Follow $3.6 billion from Congress to the jobs office.',
    color: 'var(--flow-title1)',
    sprite: { kind: 'vehicle', type: 'dollar-truck' },
    steps: [
      {
        from: { x: 550, y: 540 }, to: { x: 550, y: 540 },
        view: { cx: 550, cy: 540, scale: 0.95 },
        caption: 'Every year Congress passes a labor appropriations bill. About $3.6 billion is set aside for WIOA Title I — adult, dislocated worker, and youth programs.',
        focus: ['congress'],
        duration: 7000,
      },
      {
        from: { x: 550, y: 540 }, to: { x: 360, y: 620 },
        view: { cx: 400, cy: 620, scale: 0.95 },
        caption: 'The money goes to the Department of Labor. A wing of DOL called ETA — the Employment and Training Administration — actually loads the trucks.',
        focus: ['dol', 'eta'],
        duration: 6500,
      },
      {
        from: { x: 360, y: 620 }, to: { x: 1380, y: 700 },
        view: { cx: 880, cy: 700, scale: 0.45 },
        caption: 'ETA splits the money among the 50 states by a formula based on unemployment and the low-income population. The truck heads down the road to the state capital.',
        focus: ['eta', 'state-agency'],
        duration: 8500,
      },
      {
        from: { x: 1380, y: 700 }, to: { x: 1380, y: 700 },
        view: { cx: 1500, cy: 600, scale: 0.8 },
        caption: 'The state workforce agency receives it. The Governor — with the State Workforce Board\'s sign-off — then divides the money among the local areas.',
        focus: ['state-agency', 'state-board', 'governor'],
        duration: 7500,
      },
      {
        from: { x: 1380, y: 700 }, to: { x: 2440, y: 640 },
        view: { cx: 1920, cy: 660, scale: 0.5 },
        caption: 'The truck heads down the highway to one of ~580 local workforce areas. Each has its own board, its own plan, and its own contractors.',
        focus: ['lwdb'],
        duration: 7500,
      },
      {
        from: { x: 2440, y: 640 }, to: { x: 2820, y: 700 },
        view: { cx: 2640, cy: 660, scale: 0.85 },
        caption: 'Final stop: the jobs office. This is where a laid-off worker can actually walk in and use the money — for assessment, training, or job search.',
        focus: ['lwdb', 'ajc'],
        duration: 7500,
      },
    ],
  },

  'flow-pell': {
    kind: 'flow',
    title: 'Pell Grants — the school money letter',
    sub: 'And the new Workforce Pell launching in 2026.',
    color: 'var(--flow-pell)',
    sprite: { kind: 'vehicle', type: 'envelope-van' },
    steps: [
      {
        from: { x: 550, y: 540 }, to: { x: 550, y: 540 },
        view: { cx: 550, cy: 540, scale: 0.95 },
        caption: 'Congress appropriates Pell Grants — over $30 billion a year. This is the single largest federal investment in postsecondary access.',
        focus: ['congress'],
        duration: 6500,
      },
      {
        from: { x: 550, y: 540 }, to: { x: 780, y: 660 },
        view: { cx: 700, cy: 620, scale: 0.9 },
        caption: 'Pell flows through the Department of Education — specifically Federal Student Aid (FSA). Workforce Pell, starting 2026, extends Pell to 8-to-15-week training programs.',
        focus: ['ed', 'fsa'],
        duration: 7000,
      },
      {
        from: { x: 780, y: 660 }, to: { x: 2560, y: 870 },
        view: { cx: 1700, cy: 780, scale: 0.42 },
        caption: 'Pell skips the states entirely. The school money letter goes straight from the federal government to participating colleges, attached to individual students.',
        focus: ['community-college'],
        duration: 8500,
      },
      {
        from: { x: 2560, y: 870 }, to: { x: 2560, y: 870 },
        view: { cx: 2560, cy: 870, scale: 1.1 },
        caption: 'Most Pell dollars today land at community colleges. Workforce Pell will route many more to shorter, job-focused programs — reshaping the credential landscape.',
        focus: ['community-college', 'university'],
        duration: 7500,
      },
    ],
  },

  'flow-perkins': {
    kind: 'flow',
    title: 'Perkins V — for career & technical ed',
    sub: '$1.4 B a year for the welding, nursing, and IT shops.',
    color: 'var(--flow-perkins)',
    sprite: { kind: 'vehicle', type: 'wrench-truck' },
    steps: [
      {
        from: { x: 550, y: 540 }, to: { x: 550, y: 540 },
        view: { cx: 550, cy: 540, scale: 0.95 },
        caption: 'The Carl D. Perkins Career and Technical Education Act — about $1.4 billion a year. Most recently reauthorized in 2018.',
        focus: ['congress'],
        duration: 6500,
      },
      {
        from: { x: 550, y: 540 }, to: { x: 620, y: 660 },
        view: { cx: 680, cy: 620, scale: 0.9 },
        caption: 'It flows through the Department of Education — specifically OCTAE, the Office of Career, Technical, and Adult Education.',
        focus: ['ed', 'octae'],
        duration: 6500,
      },
      {
        from: { x: 620, y: 660 }, to: { x: 1560, y: 740 },
        view: { cx: 1080, cy: 700, scale: 0.48 },
        caption: 'OCTAE sends it to the state education agencies — not the workforce agencies. This split is part of why Perkins-WIOA alignment is uneven from state to state.',
        focus: ['state-ed'],
        duration: 8000,
      },
      {
        from: { x: 1560, y: 740 }, to: { x: 2445, y: 940 },
        view: { cx: 2000, cy: 850, scale: 0.5 },
        caption: 'States divide Perkins between secondary CTE (high schools) and postsecondary CTE (community colleges) — typically about 60/40, but states choose the split.',
        focus: ['high-school', 'community-college'],
        duration: 7500,
      },
      {
        from: { x: 2445, y: 940 }, to: { x: 2605, y: 900 },
        view: { cx: 2530, cy: 890, scale: 1.0 },
        caption: 'The downstream effect: a welding shop at the high school, a nursing lab at the community college, an IT classroom paid for by Perkins.',
        focus: ['high-school', 'community-college'],
        duration: 7000,
      },
    ],
  },

  'flow-apprent': {
    kind: 'flow',
    title: 'Apprenticeship — earn while you learn',
    sub: '$285 M a year to register and grow programs.',
    color: 'var(--flow-apprent)',
    sprite: { kind: 'vehicle', type: 'wrench-truck-brown' },
    steps: [
      {
        from: { x: 130, y: 720 }, to: { x: 130, y: 720 },
        view: { cx: 260, cy: 680, scale: 0.85 },
        caption: 'The federal Office of Apprenticeship sits inside DOL/ETA. It registers programs, sets standards, and sends out grants — about $285 million a year for state expansion.',
        focus: ['oa'],
        duration: 6500,
      },
      {
        from: { x: 130, y: 720 }, to: { x: 2030, y: 720 },
        view: { cx: 1080, cy: 720, scale: 0.45 },
        caption: 'About 28 states have their own State Apprenticeship Agency. In the other 22, OA registers programs directly. Either way, the rules are the same.',
        focus: ['state-saa'],
        duration: 7500,
      },
      {
        from: { x: 2030, y: 720 }, to: { x: 3520, y: 740 },
        view: { cx: 2800, cy: 740, scale: 0.55 },
        caption: 'Sponsors — employers, unions, joint trusts — register their programs. About 600,000 active apprentices nationwide. Most are still in the construction trades.',
        focus: ['union'],
        duration: 7500,
      },
      {
        from: { x: 3520, y: 740 }, to: { x: 2780, y: 940 },
        view: { cx: 3100, cy: 850, scale: 0.7 },
        caption: 'The sponsor (here, a union) runs the program at the shop. Apprentices earn wages, learn from a master, and take related instruction at the community college at night.',
        focus: ['apprenticeship', 'union'],
        duration: 7500,
      },
      {
        from: { x: 2780, y: 940 }, to: { x: 3220, y: 700 },
        view: { cx: 3000, cy: 820, scale: 0.7 },
        caption: 'By the end, the apprentice has earned wages instead of paying tuition — and holds a nationally portable credential the federal government certifies.',
        focus: ['employer-mfg', 'apprenticeship'],
        duration: 7500,
      },
    ],
  },

  'flow-title4': {
    kind: 'flow',
    title: 'WIOA Title IV — Vocational Rehabilitation',
    sub: '$3.7 B/yr for workers with disabilities, run through Education.',
    color: 'var(--flow-title4)',
    sprite: { kind: 'vehicle', type: 'ramp-van' },
    steps: [
      {
        from: { x: 550, y: 540 }, to: { x: 550, y: 540 },
        view: { cx: 550, cy: 540, scale: 0.95 },
        caption: 'WIOA Title IV — Vocational Rehabilitation — is the second-biggest workforce stream at about $3.7 billion a year, just behind Title I. It serves only workers with disabilities.',
        focus: ['congress'],
        duration: 7000,
      },
      {
        from: { x: 550, y: 540 }, to: { x: 720, y: 660 },
        view: { cx: 640, cy: 600, scale: 0.9 },
        caption: 'Title IV is the part of WIOA that lives in the Department of Education, not Labor. That historical accident is part of why workforce-VR alignment is so uneven across states.',
        focus: ['ed'],
        duration: 6500,
      },
      {
        from: { x: 720, y: 660 }, to: { x: 870, y: 700 },
        view: { cx: 800, cy: 660, scale: 1.0 },
        caption: 'Inside Education sits RSA — the Rehabilitation Services Administration. Small office, very big check. RSA writes the rules and ships the formula to the states.',
        focus: ['rsa'],
        duration: 6500,
      },
      {
        from: { x: 870, y: 700 }, to: { x: 1880, y: 700 },
        view: { cx: 1380, cy: 700, scale: 0.5 },
        caption: 'The money goes to 50 state VR agencies — and in 24 of those states there\'s also a separate Blind Services agency that gets its own slice.',
        focus: ['state-vr'],
        duration: 8000,
      },
      {
        from: { x: 1880, y: 700 }, to: { x: 2930, y: 900 },
        view: { cx: 2400, cy: 800, scale: 0.5 },
        caption: 'The state agency funds local Voc Rehab offices — and, through them, training, assistive tech, job coaches, and supported employment for hundreds of thousands of workers each year.',
        focus: ['voc-rehab'],
        duration: 8000,
      },
    ],
  },

  'flow-tanf': {
    kind: 'flow',
    title: 'TANF — Work-with-Cash-Aid',
    sub: '$16.5 B block grant, fixed since 1996, run through HHS — not Labor.',
    color: 'var(--flow-tanf)',
    sprite: { kind: 'vehicle', type: 'grocery-truck' },
    steps: [
      {
        from: { x: 550, y: 540 }, to: { x: 550, y: 540 },
        view: { cx: 550, cy: 540, scale: 0.95 },
        caption: 'Temporary Assistance for Needy Families — TANF — is a $16.5 billion block grant. It has been frozen at that exact number since 1996; inflation has eaten roughly half of it.',
        focus: ['congress'],
        duration: 7500,
      },
      {
        from: { x: 550, y: 540 }, to: { x: 920, y: 660 },
        view: { cx: 740, cy: 600, scale: 0.85 },
        caption: 'TANF flows through HHS — Health and Human Services — not Labor. The Office of Family Assistance, inside ACF, administers it.',
        focus: ['hhs'],
        duration: 6500,
      },
      {
        from: { x: 920, y: 660 }, to: { x: 2110, y: 720 },
        view: { cx: 1500, cy: 700, scale: 0.5 },
        caption: 'States get the block grant in a single check. They can spend it on cash aid, child care, work programs, or pre-K — a huge amount of state-level discretion.',
        focus: ['state-hs'],
        duration: 8000,
      },
      {
        from: { x: 2110, y: 720 }, to: { x: 3070, y: 900 },
        view: { cx: 2580, cy: 820, scale: 0.5 },
        caption: 'Most states contract a community nonprofit to actually run the "work activities" a TANF recipient has to do to keep the cash aid — job search, training, and subsidized work experience.',
        focus: ['cbo'],
        duration: 8000,
      },
      {
        from: { x: 3070, y: 900 }, to: { x: 2830, y: 700 },
        view: { cx: 2950, cy: 800, scale: 0.85 },
        caption: 'The CBO and the AJC sit on the same street for a reason: a TANF recipient often uses both. The handoff between them is where states win or lose at integration.',
        focus: ['cbo', 'ajc'],
        duration: 7500,
      },
    ],
  },
};

window.TOUR_ORDER = [
  ['Personas', ['machinist', 'returning-mom', 'young-apprentice', 'veteran', 'vr-client', 'returnee']],
  ['Funding flows', ['flow-title1', 'flow-pell', 'flow-perkins', 'flow-apprent', 'flow-title4', 'flow-tanf']],
];

/* ============================================================
   TourLayer — renders the focal sprite for the active tour.
   Position is interpolated from step.from → step.to over the
   first ~70% of step.duration; then the sprite holds at .to.
   ============================================================ */

function TourLayer({ tour, step, progress, focusSet }) {
  if (!tour) return null;
  const s = tour.steps[step];
  if (!s) return null;

  // Movement curve: ease-in-out, completes by 70% of step
  const mt = Math.min(1, progress / 0.7);
  const eased = mt < 0.5
    ? 2 * mt * mt
    : 1 - Math.pow(-2 * mt + 2, 2) / 2;

  const x = s.from.x + (s.to.x - s.from.x) * eased;
  const y = s.from.y + (s.to.y - s.from.y) * eased;
  const dx = s.to.x - s.from.x;
  const mirror = dx < 0;
  const moving = Math.abs(dx) > 4 || Math.abs(s.to.y - s.from.y) > 4;

  return (
    <g id="tour-layer" style={{ pointerEvents: 'none' }}>
      {/* Halo on the focal entities */}
      {focusSet && [...focusSet].map(id => {
        const e = window.ENTITIES[id];
        if (!e) return null;
        return (
          <g key={id}>
            <rect x={e.pos.x - 60} y={e.pos.y - 80} width="200" height="240"
                  fill="none" stroke={tour.color} strokeWidth="4"
                  strokeDasharray="9 6" rx="10"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.6))' }}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </rect>
          </g>
        );
      })}

      {/* Focal sprite */}
      <g transform={`translate(${x} ${y})`}>
        {/* Pulse ring */}
        <circle cx="0" cy={tour.sprite.kind === 'vehicle' ? 0 : -12} r="42"
                fill={tour.color} opacity="0.18">
          <animate attributeName="r" values="34;46;34" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.28;0.08;0.28" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy={tour.sprite.kind === 'vehicle' ? 0 : -12} r="38"
                fill="none" stroke={tour.color} strokeWidth="2.5"
                strokeDasharray="5 3" opacity="0.85" />

        {tour.sprite.kind === 'character' && (
          <Character
            species={tour.sprite.species}
            costume={tour.sprite.costume}
            fur={tour.sprite.fur}
            hat={tour.sprite.hat || 'none'}
            prop={tour.sprite.prop || null}
            size={tour.sprite.size || 1}
            walking={moving && mt < 1}
            mirror={mirror}
          />
        )}
        {tour.sprite.kind === 'vehicle' && (
          <g transform="translate(-30 -16)">
            <Vehicle type={tour.sprite.type} mirror={mirror} />
          </g>
        )}
      </g>
    </g>
  );
}

window.TourLayer = TourLayer;

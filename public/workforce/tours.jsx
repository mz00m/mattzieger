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
    /* Ghost paths — alternate routes for Carl when a grantee is on. */
    ghosts: {
      'per-scholas': {
        // AJC → Per Scholas tech retraining → placed at hospital IT.
        stepOverrides: {
          3: { from: { x: 2810, y: 700 }, to: { x: 2440, y: 1010 } },
          4: { from: { x: 2440, y: 1010 }, to: { x: 2440, y: 1010 } },
          5: { from: { x: 2440, y: 1010 }, to: { x: 3385, y: 700 } },
        },
      },
      'soar': {
        // SOAR convenes EKCEP + eKAMI; Carl trains in advanced manufacturing
        // and lands a regional placement at the distribution center.
        stepOverrides: {
          3: { from: { x: 2810, y: 700 }, to: { x: 2640, y: 1010 } },
          4: { from: { x: 2640, y: 1010 }, to: { x: 2780, y: 940 } },
          5: { from: { x: 2780, y: 940 }, to: { x: 3580, y: 700 } },
        },
      },
      'skillup': {
        // After the layoff, Carl finds SkillUp first — algorithmic match
        // surfaces the right training and employer, faster.
        stepOverrides: {
          1: { from: { x: 3220, y: 700 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 2810, y: 700 } },
        },
      },
      'empower-work': {
        // Crisis at layoff. Empower Work catches Carl emotionally and
        // helps him walk into the AJC instead of disengaging.
        stepOverrides: {
          1: { from: { x: 3220, y: 700 }, to: { x: 3040, y: 1010 } },
          2: { from: { x: 3040, y: 1010 }, to: { x: 2810, y: 700 } },
        },
      },
    },
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
    ghosts: {
      'skillup': {
        // Maya finds SkillUp first; it surfaces a faster path than the
        // CBO-mediated TANF "work activities" pipeline.
        stepOverrides: {
          1: { from: { x: 2140, y: 800 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 2820, y: 700 } },
        },
      },
      'empower-work': {
        // Overwhelmed by the "work activities" requirement; Empower Work
        // peer counselor keeps Maya engaged through the CBO/AJC handoff.
        stepOverrides: {
          1: { from: { x: 2140, y: 800 }, to: { x: 3040, y: 1010 } },
          2: { from: { x: 3040, y: 1010 }, to: { x: 2820, y: 700 } },
        },
      },
    },
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
    ghosts: {
      'soar': {
        // SOAR routes Pip through eKAMI (advanced manufacturing) — a
        // Lockheed-Martin-aligned pipeline that exists only because the
        // regional convener exists.
        stepOverrides: {
          1: { from: { x: 2445, y: 940 }, to: { x: 2640, y: 1010 } },
          2: { from: { x: 2640, y: 1010 }, to: { x: 2780, y: 940 } },
        },
      },
      'skillup': {
        // SkillUp surfaces apprenticeship matches and bypasses the union-
        // hall sign-in as the first step in the journey.
        stepOverrides: {
          1: { from: { x: 2445, y: 940 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 2780, y: 940 } },
        },
      },
    },
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
    ghosts: {
      'skillup': {
        // SkillUp's veteran-aware filters surface Helmets-to-Hardhats and
        // GI Bill-stackable apprenticeships before the DVOP would.
        stepOverrides: {
          1: { from: { x: 2830, y: 700 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 3500, y: 720 } },
        },
      },
    },
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
    ghosts: {
      'skillup': {
        // SkillUp's accessibility-aware filters surface coding programs
        // with assistive-tech support before Iris and her counselor sketch
        // the IPE in full.
        stepOverrides: {
          1: { from: { x: 2930, y: 900 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 2605, y: 900 } },
        },
      },
    },
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
    ghosts: {
      'per-scholas': {
        // Per Scholas's open enrollment + bonded-employer pipeline lets
        // Rex route into IT support at the distribution center instead
        // of CDL driving.
        stepOverrides: {
          2: { from: { x: 2830, y: 700 }, to: { x: 2440, y: 1010 } },
          3: { from: { x: 2440, y: 1010 }, to: { x: 3580, y: 700 } },
        },
      },
      'skillup': {
        // SkillUp surfaces fair-chance employers and routes Rex to the
        // AJC with a target employer already lined up.
        stepOverrides: {
          1: { from: { x: 3070, y: 900 }, to: { x: 2840, y: 1010 } },
          2: { from: { x: 2840, y: 1010 }, to: { x: 2830, y: 700 } },
        },
      },
    },
  },

  /* ------------------ GRANTEE TOURS ------------------
     Auto-started when the matching toggle flips on. Each tour walks
     through (a) where the grantee plugs into the public system,
     (b) what it specifically adds, and (c) the outcome it claims. */

  'grantee-per-scholas': {
    kind: 'grantee',
    granteeId: 'per-scholas',
    title: 'Per Scholas in the system',
    sub: 'A sectoral tech-training nonprofit, plugged in via WIOA ITAs.',
    color: '#2a8a8a',
    sprite: {
      kind: 'character',
      species: 'owl', costume: '#2a8a8a',
      fur: 'var(--tan)', hat: 'cardigan', prop: 'book',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 360, y: 620 }, to: { x: 360, y: 620 },
        view: { cx: 400, cy: 620, scale: 0.9 },
        caption: 'The federal money for adult training starts here — at ETA, the Employment and Training Administration. WIOA Title I funds (about $3.6 B/yr) flow from this loading dock out to the states.',
        focus: ['eta', 'dol'],
        duration: 7000,
      },
      {
        from: { x: 360, y: 620 }, to: { x: 2810, y: 700 },
        view: { cx: 1600, cy: 700, scale: 0.4 },
        caption: 'A laid-off worker walks into the local American Job Center. The counselor opens an Individual Training Account — a WIOA voucher the worker can spend at any provider on the state\'s Eligible Training Provider List.',
        focus: ['ajc'],
        duration: 8000,
      },
      {
        from: { x: 2810, y: 700 }, to: { x: 2560, y: 870 },
        view: { cx: 2680, cy: 800, scale: 0.85 },
        caption: 'Most ITAs land at the community college — about 1,000 of them nationwide, the largest training partner the system has.',
        focus: ['community-college'],
        duration: 7000,
      },
      {
        from: { x: 2560, y: 870 }, to: { x: 2440, y: 1010 },
        view: { cx: 2500, cy: 950, scale: 1.0 },
        caption: 'Per Scholas sits right next door. It\'s on the ETPL in many states — so the same WIOA voucher can buy a 14-week tech cohort instead of a 2-year associate. IT support, cybersecurity, AWS, network engineering.',
        focus: ['per-scholas'],
        duration: 8000,
      },
      {
        from: { x: 2440, y: 1010 }, to: { x: 3385, y: 700 },
        view: { cx: 2900, cy: 860, scale: 0.55 },
        caption: 'Placement is the point. The MDRC 10-year RCT (n=1,143) found Per Scholas graduates earned ~15% more than the control group. Roughly $8 of economic benefit per $1 spent on training.',
        focus: ['per-scholas', 'employer-hosp', 'employer-mfg'],
        duration: 9000,
      },
    ],
  },

  'grantee-soar': {
    kind: 'grantee',
    granteeId: 'soar',
    title: 'SOAR in the system',
    sub: 'A regional convener wrapping the Eastern Kentucky workforce board.',
    color: '#7a5cb3',
    sprite: {
      kind: 'character',
      species: 'bear', costume: '#7a5cb3',
      fur: 'var(--brown)', hat: 'cap', prop: 'clipboard',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 1010, y: 660 }, to: { x: 1010, y: 660 },
        view: { cx: 1010, cy: 660, scale: 0.95 },
        caption: 'Commerce and the EDA fund regional economic development. SOAR is one of six awardees of a $40 M EDA Recompete implementation grant — covering 12 Eastern Kentucky counties.',
        focus: ['commerce'],
        duration: 7500,
      },
      {
        from: { x: 1010, y: 660 }, to: { x: 1380, y: 700 },
        view: { cx: 1200, cy: 680, scale: 0.75 },
        caption: 'EDA dollars land at the state and regional level — separate from the WIOA pipeline, but braided with it on the ground.',
        focus: ['state-agency'],
        duration: 7000,
      },
      {
        from: { x: 1380, y: 700 }, to: { x: 2440, y: 640 },
        view: { cx: 1900, cy: 680, scale: 0.45 },
        caption: 'The local workforce board — in Eastern Kentucky\'s case, EKCEP — is SOAR\'s closest partner. EKCEP staffs the Eastern Kentucky WIB and administers WIOA across 23 counties.',
        focus: ['lwdb'],
        duration: 8000,
      },
      {
        from: { x: 2440, y: 640 }, to: { x: 2640, y: 1010 },
        view: { cx: 2540, cy: 820, scale: 0.7 },
        caption: 'SOAR doesn\'t deliver workforce services itself — it convenes the partners that do. EKCEP, KCTCS, eKAMI, Teleworks USA — the regional plan lives here.',
        focus: ['soar'],
        duration: 8000,
      },
      {
        from: { x: 2640, y: 1010 }, to: { x: 2780, y: 940 },
        view: { cx: 2710, cy: 980, scale: 0.95 },
        caption: 'Programs SOAR convenes — like eKAMI\'s advanced-manufacturing CNC training — placed former coal miners with employers including Lockheed Martin. The EKY Remote initiative drove ~$11 M in community impact.',
        focus: ['apprenticeship'],
        duration: 9000,
      },
    ],
  },

  'grantee-skillup': {
    kind: 'grantee',
    granteeId: 'skillup',
    title: 'SkillUp in the system',
    sub: 'A national digital navigation layer that sits above the workforce system.',
    color: '#d9622c',
    sprite: {
      kind: 'character',
      species: 'rabbit', costume: '#d9622c',
      fur: 'var(--paper-shadow)', prop: 'phone',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 3220, y: 700 }, to: { x: 3220, y: 700 },
        view: { cx: 3220, cy: 640, scale: 0.95 },
        caption: 'A worker — laid off, switching careers, finishing high school — pulls out their phone. Before they ever walk into the AJC, they\'re looking for what to do.',
        focus: ['employer-mfg'],
        duration: 6500,
      },
      {
        from: { x: 3220, y: 700 }, to: { x: 2810, y: 700 },
        view: { cx: 3020, cy: 660, scale: 0.7 },
        caption: 'The public answer is the American Job Center — but referrals depend on what a single counselor happens to know about local options.',
        focus: ['ajc'],
        duration: 7000,
      },
      {
        from: { x: 2810, y: 700 }, to: { x: 2840, y: 1010 },
        view: { cx: 2830, cy: 850, scale: 0.85 },
        caption: 'SkillUp is the layer above all of it. A national digital platform that surfaces training providers, apprenticeships, and jobs — matched to who you are and what you can do.',
        focus: ['skillup'],
        duration: 8500,
      },
      {
        from: { x: 2840, y: 1010 }, to: { x: 2560, y: 870 },
        view: { cx: 2700, cy: 940, scale: 0.85 },
        caption: 'It routes people to ETPL providers, community colleges, bootcamps, and apprenticeships — without claiming WIOA dollars itself.',
        focus: ['community-college'],
        duration: 7000,
      },
      {
        from: { x: 2560, y: 870 }, to: { x: 3260, y: 540 },
        view: { cx: 2900, cy: 700, scale: 0.55 },
        caption: 'Self-reported reach (2020–2026): 4.8M+ workers, 277K+ jobs attained, $17.8B+ in additional wages. The navigation function the AJC has never quite delivered on.',
        focus: ['skillup', 'employer-mfg'],
        duration: 9000,
      },
    ],
  },

  'grantee-empower-work': {
    kind: 'grantee',
    granteeId: 'empower-work',
    title: 'Empower Work in the system',
    sub: 'The wraparound layer the workforce system has never had.',
    color: '#cc4677',
    sprite: {
      kind: 'character',
      species: 'cat', costume: '#cc4677',
      fur: 'var(--tan)', prop: 'phone',
      size: 1.1,
    },
    steps: [
      {
        from: { x: 3220, y: 700 }, to: { x: 3220, y: 700 },
        view: { cx: 3220, cy: 640, scale: 0.95 },
        caption: 'A workplace crisis — a layoff, a hostile boss, a panic attack at the start of a training cohort. The public system doesn\'t catch this; people drop out.',
        focus: ['employer-mfg'],
        duration: 7000,
      },
      {
        from: { x: 3220, y: 700 }, to: { x: 3040, y: 1010 },
        view: { cx: 3130, cy: 860, scale: 0.85 },
        caption: 'Empower Work is a text-based peer counseling line. Trained peers — not therapists — meet workers in distress at the moment it matters.',
        focus: ['empower-work'],
        duration: 8000,
      },
      {
        from: { x: 3040, y: 1010 }, to: { x: 2440, y: 1010 },
        view: { cx: 2740, cy: 1010, scale: 0.75 },
        caption: 'A 2024 collaboration partnered Empower Work with Per Scholas, SkillUp, NPower, and Year Up — text-based wraparound for workforce alumni at the hard moments of their journey.',
        focus: ['empower-work', 'per-scholas'],
        duration: 8500,
      },
      {
        from: { x: 2440, y: 1010 }, to: { x: 3070, y: 860 },
        view: { cx: 2750, cy: 940, scale: 0.55 },
        caption: 'It also partners with community nonprofits and the AJC — adding the emotional and navigational support the formal system was never designed to provide.',
        focus: ['cbo', 'ajc'],
        duration: 7500,
      },
      {
        from: { x: 3070, y: 860 }, to: { x: 3385, y: 700 },
        view: { cx: 3230, cy: 800, scale: 0.7 },
        caption: '92% of workers supported report improved wellbeing. The Connection Protection partnership with Visible: 84% said the program helped, 31% received job offers, 19% accepted a new job.',
        focus: ['employer-hosp'],
        duration: 9000,
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

   When a grantee toggle is on AND this tour has a matching
   ghost path in tour.ghosts[granteeId], a second sprite walks
   the alternate route in parallel, tinted with the grantee
   color. Multiple ghosts can run concurrently.
   ============================================================ */

// Helper: get the (from, to) for a tour step, optionally remapped by a
// grantee's ghost stepOverrides. If no override exists for this step, the
// ghost walks the baseline path.
function resolveStepRoute(tour, stepIdx, granteeId) {
  const base = tour.steps[stepIdx];
  if (!base) return null;
  if (!granteeId || !tour.ghosts || !tour.ghosts[granteeId]) {
    return { from: base.from, to: base.to };
  }
  const override = tour.ghosts[granteeId].stepOverrides
    && tour.ghosts[granteeId].stepOverrides[stepIdx];
  if (!override) return { from: base.from, to: base.to };
  return {
    from: override.from || base.from,
    to:   override.to   || base.to,
  };
}

function TourLayer({ tour, step, progress, focusSet, grantees }) {
  if (!tour) return null;
  const s = tour.steps[step];
  if (!s) return null;

  // Movement curve: ease-in-out, completes by 70% of step
  const mt = Math.min(1, progress / 0.7);
  const eased = mt < 0.5
    ? 2 * mt * mt
    : 1 - Math.pow(-2 * mt + 2, 2) / 2;

  // Active ghosts for this tour: any grantee that has a path defined here AND is toggled on.
  const activeGhosts = (tour.ghosts && grantees)
    ? Object.keys(tour.ghosts).filter(gid => grantees[gid])
    : [];

  // Baseline sprite position
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

      {/* Ghost sprites — one per active grantee, walking alternate paths */}
      {activeGhosts.map((gid, i) => {
        const route = resolveStepRoute(tour, step, gid);
        if (!route) return null;
        const grantee = window.GRANTEES && window.GRANTEES[gid];
        const gx = route.from.x + (route.to.x - route.from.x) * eased;
        const gy = route.from.y + (route.to.y - route.from.y) * eased;
        const gdx = route.to.x - route.from.x;
        const gmirror = gdx < 0;
        const gmoving = Math.abs(gdx) > 4 || Math.abs(route.to.y - route.from.y) > 4;
        // Stagger ghosts side-by-side to reduce overlap when paths are identical
        const sideOffset = (i + 1) * 26;
        return (
          <g key={gid}
             className="tour-ghost"
             transform={`translate(${gx + sideOffset} ${gy})`}
             style={{ opacity: 0.78 }}>
            {/* Grantee-colored pulse ring */}
            <circle cx="0" cy={tour.sprite.kind === 'vehicle' ? 0 : -12} r="40"
                    fill={grantee ? grantee.color : tour.color} opacity="0.18">
              <animate attributeName="r" values="32;44;32" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy={tour.sprite.kind === 'vehicle' ? 0 : -12} r="34"
                    fill="none"
                    stroke={grantee ? grantee.color : tour.color} strokeWidth="2.2"
                    strokeDasharray="3 3" opacity="0.85" />
            {/* Ghosted character — same species/costume, but tinted with the grantee accent */}
            {tour.sprite.kind === 'character' && (
              <g style={{ filter: 'opacity(0.85)' }}>
                <Character
                  species={tour.sprite.species}
                  costume={grantee ? grantee.color : tour.sprite.costume}
                  fur={tour.sprite.fur}
                  hat={tour.sprite.hat || 'none'}
                  prop={tour.sprite.prop || null}
                  size={(tour.sprite.size || 1) * 0.95}
                  walking={gmoving && mt < 1}
                  mirror={gmirror}
                />
              </g>
            )}
            {/* Grantee label tag floating above ghost */}
            {grantee && (
              <g transform="translate(0 -56)" style={{ pointerEvents: 'none' }}>
                <rect x="-44" y="-9" width="88" height="18" rx="3"
                      fill={grantee.color} stroke="var(--ink)" strokeWidth="1.2" />
                <text x="0" y="4" textAnchor="middle"
                      style={{
                        fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 700,
                        fill: 'var(--paper)', letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                  {grantee.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Focal sprite (baseline) */}
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

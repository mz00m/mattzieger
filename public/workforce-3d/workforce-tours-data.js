/* ============================================================
   Workforce Tours — pure data
   Persona tours extracted from /workforce/tours.jsx, stripped of
   2D-specific fields (from/to/view), JSX, and grantee ghost paths.
   Only the fields the 3D consumer needs:
     - tour.title, tour.sub, tour.color
     - tour.steps[].focus[], tour.steps[].caption, tour.steps[].duration
   ============================================================ */

window.TOURS = {
  'machinist': {
    kind: 'persona',
    title: 'The Laid-Off Machinist',
    sub: 'Carl loses his factory shift. Now what?',
    color: '#d97757',
    steps: [
      { focus: ['employer-mfg'],            caption: "Carl is a welder at the manufacturer. This morning the plant cut a shift. He picks up his final paycheck and a flyer about the jobs office.",                                                                            duration: 6500 },
      { focus: ['unemployment'],            caption: "First stop: the UI office. Carl files for unemployment insurance. The state pays him a weekly check while he looks for new work.",                                                                                duration: 6500 },
      { focus: ['ajc'],                     caption: "Then the jobs office. Carl walks in the red Title I door — adult & dislocated worker programs. A counselor takes his story and runs a skills assessment.",                                                         duration: 7500 },
      { focus: ['community-college'],       caption: "The counselor sends him to the community college. With WIOA Title I money, Carl enrolls in a 14-week robotic-welding refresher.",                                                                                  duration: 7000 },
      { focus: ['community-college'],       caption: "Inside the college: an owl teaches welding to a row of students. This is where most WIOA-funded training actually happens — about 1,000 community colleges nationwide.",                                           duration: 7000 },
      { focus: ['employer-mfg', 'ajc'],     caption: "Credential in hand, Carl is placed at the manufacturer — a different one, but down the same street. The AJC reports the outcome to the state and the state to DOL.",                                              duration: 8000 },
    ],
  },

  'returning-mom': {
    kind: 'persona',
    title: 'The Returning Mom',
    sub: 'Maya, on cash aid, has to do "work activities." She has to figure out what that means.',
    color: '#d4806f',
    steps: [
      { focus: ['state-hs'],                caption: "Maya is a single parent. She just opened a TANF case at the state human services office. The caseworker tells her she has to do \"work activities\" to keep the cash aid.",                                         duration: 7500 },
      { focus: ['cbo'],                     caption: "Work activities can mean job search, training, or actual work. The state contracts a community nonprofit — Goodheart — to run the program for the county.",                                                       duration: 8000 },
      { focus: ['ajc', 'cbo'],              caption: "Goodheart walks her over to the jobs office. The blue Title II door is for adult education — Maya finishes her high-school equivalency here.",                                                                    duration: 7000 },
      { focus: ['community-college'],       caption: "The AJC pairs her education with a medical-assistant training cohort at the community college. Title I pays for tuition; TANF covers child care while she's in class.",                                            duration: 7500 },
      { focus: ['employer-hosp'],           caption: "A few months later, the hospital is hiring medical assistants. Maya is referred and hired. Her TANF case closes. The hospital becomes the AJC's case study for the year.",                                          duration: 8000 },
    ],
  },

  'young-apprentice': {
    kind: 'persona',
    title: 'The Young Apprentice',
    sub: 'Pip finishes high school and enters the trades.',
    color: '#e8b04a',
    steps: [
      { focus: ['high-school'],                       caption: "Pip is a senior at the high school. He takes a CTE class in welding, funded by Perkins V — the biggest federal investment in career & technical education.",                                              duration: 6500 },
      { focus: ['union'],                             caption: "He likes the work. After graduation, an electricians' union sponsors him into a Registered Apprenticeship. The union hall is where they sign him in.",                                                    duration: 6500 },
      { focus: ['apprenticeship'],                    caption: "Apprentices earn a paycheck from day one. Pip starts at $18/hr and gets a raise every six months. A master welder teaches him at the shop.",                                                             duration: 7000 },
      { focus: ['community-college', 'apprenticeship'], caption: "Apprenticeships have a classroom side too. Pip's \"related instruction\" — code, math, blueprints — happens at the community college, two nights a week.",                                              duration: 6500 },
      { focus: ['employer-mfg', 'oa'],                caption: "Four years later, Pip is a journeyman welder. Wage tripled. No student debt. The federal Office of Apprenticeship logged every hour and issued a nationally portable credential.",                       duration: 7500 },
    ],
  },

  'veteran': {
    kind: 'persona',
    title: 'The Returning Veteran',
    sub: 'Sgt. Hank just separated. His DD-214 unlocks priority of service.',
    color: '#2a4a72',
    steps: [
      { focus: ['ajc'],                       caption: "Hank just separated from the service. The first place he walks into is the jobs office. By federal law, veterans get priority of service in every WIOA program — they get seen first.",                          duration: 7000 },
      { focus: ['ajc', 'vets'],               caption: "A DVOP — Disabled Veterans' Outreach Program specialist — sits inside the AJC. Their salary is paid by JVSG, a separate ~$180 M/yr grant DOL's VETS office sends straight to states.",                            duration: 7500 },
      { focus: ['union'],                     caption: "The DVOP routes Hank into Helmets-to-Hardhats — a national pathway from military service into the building trades. The local union hall is the front door.",                                                     duration: 7000 },
      { focus: ['apprenticeship'],            caption: "Hank starts a Registered Apprenticeship as a millwright. The Post-9/11 GI Bill pays him a monthly housing allowance on top of apprentice wages — a rare double-dip Congress explicitly allowed.",                duration: 7500 },
      { focus: ['distribution-center', 'apprenticeship'], caption: "Three years on, Hank is a journey-level millwright running a maintenance crew at the regional distribution center — and a nationally credentialed civilian for life.",                              duration: 7500 },
    ],
  },

  'vr-client': {
    kind: 'persona',
    title: 'The VR Client',
    sub: 'Iris opens a Vocational Rehabilitation case for the workplace she has in mind.',
    color: '#7a5cb3',
    steps: [
      { focus: ['voc-rehab'],                 caption: "Iris has a visual disability. She walks into the local Voc Rehab office. A counselor opens her case and together they sketch an IPE — Individualized Plan for Employment.",                                       duration: 7500 },
      { focus: ['voc-rehab', 'state-vr'],     caption: "VR is its own slice of WIOA — Title IV. It runs through Education, not Labor, and the state VR agency is who actually pays for everything in Iris's plan.",                                                       duration: 7500 },
      { focus: ['community-college'],         caption: "Step one of the plan: a community-college certificate in medical coding. VR pays tuition, books, and any assistive technology — screen readers, magnification, refreshable braille.",                             duration: 7500 },
      { focus: ['voc-rehab'],                 caption: "During and after training, VR sends a job coach — someone who shows up at the workplace, helps negotiate accommodations, and fades out when Iris is settled.",                                                   duration: 7000 },
      { focus: ['employer-hosp'],             caption: "Iris is hired by the hospital as a medical coder, with accommodations in place from day one. After 90 days of stable employment, VR closes the case \"26\" — a successful employment outcome.",                  duration: 7500 },
    ],
  },

  'returnee': {
    kind: 'persona',
    title: 'The Returning Citizen',
    sub: 'Rex came home last month. He needs ID, an address, and a job — in that order.',
    color: '#5a3e2e',
    steps: [
      { focus: ['cbo'],                       caption: "Rex was released two weeks ago. The reentry CBO is his first stop — they help him replace his ID, find a bed at a halfway house, and write a résumé that doesn't hide the gap.",                                 duration: 7500 },
      { focus: ['ajc', 'cbo'],                caption: "The CBO walks him over to the jobs office. WIOA Title I has no carve-out that excludes people with records — and a Second Chance Act grant pays for the CBO's staff time inside the AJC.",                       duration: 7500 },
      { focus: ['community-college'],         caption: "The AJC enrolls Rex in a CDL Class-A program at the community college. The Federal Bonding Program also issues a six-month fidelity bond to reassure his first employer.",                                       duration: 7500 },
      { focus: ['distribution-center'],       caption: "Twelve weeks later: CDL in hand. The regional distribution center is a fair-chance employer — they hire from this exact pipeline. Rex starts the next Monday.",                                                  duration: 8000 },
      { focus: ['distribution-center', 'cbo'], caption: "One year later, Rex is mentoring two newer hires from the same reentry CBO. The pipeline is starting to run in both directions.",                                                                                duration: 7000 },
    ],
  },
};

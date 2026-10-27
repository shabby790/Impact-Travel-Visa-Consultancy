const fs = require('fs');
const path = require('path');

const ALL_29_SCHENGEN = [
  {
    id: 'austria', name: 'Austria', code: 'AT', region: 'Europe', flag: '🇦🇹', popular: true,
    description: 'Classical music heritage, Alpine splendor, and central European culture.',
    visas: {
      student: { processingTime: '3 - 6 Months', visaFee: '€160 (Student Residence Permit)', applyingProcess: ['University admission letter.', 'Submit residence permit application at Austrian Embassy.'], essentialDocuments: ['Admission Notice', 'Police Clearance with Apostille', 'Accommodation Agreement'], financialRequirements: '€1,033 per month for applicants over 24.', embassyContact: 'Austrian Embassy, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://visa.vfsglobal.com/pak/en/aut/',
        onlineFormUrl: 'https://www.bmeia.gv.at/en/',
        applyingProcess: [
          'Check Austria official Pakistan page for current appointment route: https://www.bmeia.gv.at/en/',
          'Book appointment at VFS Global: https://visa.vfsglobal.com/pak/en/aut/',
          'Submit biometrics and travel documents at VFS centre.'
        ],
        essentialDocuments: ['Original valid passport (3mo validity)', 'Completed Schengen visa form', 'Travel medical insurance (€30,000 cover)', 'Hotel booking & flight reservation', '6-month bank statements & bank certificate'],
        financialRequirements: 'Sufficient funds per day according to travel plan & 6-month bank statements.', 
        embassyContact: 'Austrian Embassy, Islamabad (VFS Pakistan).' 
      }
    }
  },
  {
    id: 'belgium', name: 'Belgium', code: 'BE', region: 'Europe', flag: '🇧🇪', popular: true,
    description: 'Heart of the European Union, international institutions, and research universities.',
    visas: {
      student: { processingTime: '4 - 8 Weeks', visaFee: '€215 (Administrative Fee) + €180 Visa', applyingProcess: ['University enrollment.', 'Submit national visa (Type D) at Gerrys VFS.'], essentialDocuments: ['Admission Letter', 'Annex 32 sponsorship or blocked account', 'Medical Certificate'], financialRequirements: 'Solvency of €666 per month.', embassyContact: 'Embassy of Belgium, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist)', 
        appointmentUrl: 'https://pakistan.diplomatie.belgium.be/en/travel-belgium/visa-belgium-and-grand-duchy-luxembourg/general-information-schengen-visas',
        onlineFormUrl: 'https://pakistan.diplomatie.belgium.be/en',
        applyingProcess: [
          'Follow Belgian Embassy Pakistan visa guidance: https://pakistan.diplomatie.belgium.be/en',
          'Follow stated appointment/provider instructions.',
          'Submit biometrics and documents at authorized application centre.'
        ],
        essentialDocuments: ['Passport (3mo validity after departure)', 'Signed Schengen visa application form', 'Schengen travel insurance (€30,000 min cover)', '6-month bank statement', 'Flight and hotel vouchers'],
        financialRequirements: '€95 per day if staying in hotel, or €45/day if staying with host.', 
        embassyContact: 'Belgian Embassy Pakistan.' 
      }
    }
  },
  {
    id: 'bulgaria', name: 'Bulgaria', code: 'BG', region: 'Europe', flag: '🇧🇬', popular: false,
    description: 'Black Sea beaches, ancient Roman heritage, and affordable European living.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria',
        onlineFormUrl: 'https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria',
        applyingProcess: [
          'Confirm which Bulgarian mission accepts applications from Pakistan: https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria',
          'Verify representation arrangements in Pakistan.',
          'Submit short-stay visa dossier.'
        ],
        essentialDocuments: ['Valid Passport', 'Schengen Visa Form', 'Travel Insurance (€30,000)', 'Flight reservation & Hotel proof', '6-Month Bank Statements'],
        financialRequirements: 'Minimum €50 per day of stay (minimum €500 total).',
        embassyContact: 'Embassy of the Republic of Bulgaria.'
      }
    }
  },
  {
    id: 'croatia', name: 'Croatia', code: 'HR', region: 'Europe', flag: '🇭🇷', popular: false,
    description: 'Adriatic coast, historic Dubrovnik walls, and vibrant European culture.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://mvep.gov.hr/en/consular-information/visas/22802',
        onlineFormUrl: 'https://mvep.gov.hr/en/consular-information/visas/22802',
        applyingProcess: [
          'Use Croatia official visa page to identify competent mission: https://mvep.gov.hr/en/consular-information/visas/22802',
          'Follow designated appointment route and submit application form.',
          'Attend biometric appointment.'
        ],
        essentialDocuments: ['Passport (6mo validity)', 'Completed Visa Application Form', 'Travel Insurance (€30k)', 'Hotel booking & Return tickets', 'Personal bank statement'],
        financialRequirements: '€70 per day of stay in Croatia.',
        embassyContact: 'Croatia Ministry of Foreign Affairs / Designated Mission.'
      }
    }
  },
  {
    id: 'czech-republic', name: 'Czech Republic', code: 'CZ', region: 'Europe', flag: '🇨🇿', popular: false,
    description: 'Historic Prague, high-ranking technical universities, and central European connectivity.',
    visas: {
      student: { processingTime: '60 - 90 Days', visaFee: 'CZK 2,500', applyingProcess: ['University admission.', 'Submit long-term visa application at Czech Embassy.'], essentialDocuments: ['Admission Letter', 'Proof of Accommodation', 'Czech translated police clearance'], financialRequirements: 'Approx CZK 5,000 per month of stay.', embassyContact: 'Embassy of the Czech Republic, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist)', 
        appointmentUrl: 'https://mzv.gov.cz/islamabad/en/visa_1/appointments/index.html',
        onlineFormUrl: 'https://mzv.gov.cz/islamabad/en/visa_1/appointments/index.html',
        applyingProcess: [
          'Check Czech Embassy Islamabad appointment info: https://mzv.gov.cz/islamabad/en/visa_1/appointments/index.html',
          'Register for appointment following Embassy jurisdiction rules.',
          'Submit application and biometrics.'
        ], 
        essentialDocuments: ['Passport', 'Insurance (€30,000)', 'Hotel Booking & Flight reservation', '6-Month Bank Statements', 'CNIC & FRC'], 
        financialRequirements: 'CZK 1,565 per day of stay.', 
        embassyContact: 'Czech Embassy Diplomatic Enclave, Islamabad.' 
      }
    }
  },
  {
    id: 'denmark', name: 'Denmark', code: 'DK', region: 'Europe', flag: '🇩🇰', popular: false,
    description: 'Green technology pioneer, happy society, and highly respected design schools.',
    visas: {
      student: { processingTime: '2 Months', visaFee: 'DKK 1,900 (SIRI Case Order ID)', applyingProcess: ['University admission.', 'Create Case Order ID and submit on SIRI portal.'], essentialDocuments: ['Letter of Acceptance', 'Tuition Fee Payment Receipt', 'Bank statement'], financialRequirements: 'DKK 6,300 per month of stay.', embassyContact: 'Royal Danish Embassy, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://visa.vfsglobal.com/pak/en/dnk/',
        onlineFormUrl: 'https://pakistan.um.dk/en/travel-and-residence',
        applyingProcess: [
          'Check Denmark official Pakistan page: https://pakistan.um.dk/en/travel-and-residence',
          'Apply via VFS Global Denmark Pakistan: https://visa.vfsglobal.com/pak/en/dnk/',
          'Submit documents and biometrics at VFS.'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30k)', 'Bank Statements (6 months)', 'Hotel booking', 'Employment letter'], 
        financialRequirements: 'DKK 500 per day in hotel.', 
        embassyContact: 'Royal Danish Embassy / VFS Global Pakistan.' 
      }
    }
  },
  {
    id: 'estonia', name: 'Estonia', code: 'EE', region: 'Europe', flag: '🇪🇪', popular: false,
    description: 'Global e-Residency pioneer, Baltic medieval towns, and advanced digital society.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://vm.ee/en/consular-visa-and-travel-information/visa-information',
        onlineFormUrl: 'https://vm.ee/en/consular-visa-and-travel-information/visa-information',
        applyingProcess: [
          'Check Estonia official consular page: https://vm.ee/en/consular-visa-and-travel-information/visa-information',
          'Confirm which representing embassy accepts Estonia short-stay visas in Pakistan.',
          'Lodge application through authorized mission.'
        ],
        essentialDocuments: ['Valid Passport', 'Schengen Application Form', 'Insurance (€30,000)', 'Accommodation proof', '6-Month Bank statement'],
        financialRequirements: '€130 per day of stay in Estonia.',
        embassyContact: 'Estonia Ministry of Foreign Affairs / Representing Mission.'
      }
    }
  },
  {
    id: 'finland', name: 'Finland', code: 'FI', region: 'Europe', flag: '🇫🇮', popular: false,
    description: 'Top-ranking education system, pristine nature, and leading technological universities.',
    visas: {
      student: { processingTime: '1 - 3 Months', visaFee: '€350 (EnterFinland Electronic Application)', applyingProcess: ['University admission.', 'Submit application on EnterFinland portal.'], essentialDocuments: ['Acceptance Letter', 'Comprehensive Health Insurance', 'Bank statement in applicant name'], financialRequirements: '€560 per month (€6,720 per year).', embassyContact: 'Embassy of Finland, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist Visa)', 
        appointmentUrl: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-pakistan',
        onlineFormUrl: 'https://finlandabroad.fi/web/pak/where-and-how-to-apply-for-a-visa',
        applyingProcess: [
          'Official guidance: Finland applications are submitted via Netherlands visa locations in Pakistan: https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-pakistan',
          'Confirm Finland-specific checklist on Finland Abroad: https://finlandabroad.fi/web/pak/where-and-how-to-apply-for-a-visa',
          'Submit at designated VFS Netherlands location.'
        ], 
        essentialDocuments: ['Passport', 'Insurance policy (€30,000)', 'Bank Statement (6 months)', 'Flight & Hotel reservations'], 
        financialRequirements: '€50 per day of stay.', 
        embassyContact: 'Finland Abroad / Netherlands Representation in Pakistan.' 
      }
    }
  },
  {
    id: 'france', name: 'France', code: 'FR', region: 'Europe', flag: '🇫🇷', popular: true,
    description: 'Renowned art, business schools, gastronomy, and cultural heritage across Paris and Provence.',
    visas: {
      student: { processingTime: '3 - 5 Weeks', visaFee: '€50 + Campus France fee', applyingProcess: ['Campus France interview & NOC.', 'Submit VFS long-stay student visa application.'], essentialDocuments: ['Campus France NOC', 'Admission Letter', 'Proof of Accommodation'], financialRequirements: '€615 per month for the academic year.', embassyContact: 'Embassy of France, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://www.france-visas.gouv.fr/en/pakistan',
        onlineFormUrl: 'https://www.france-visas.gouv.fr/en/pakistan',
        applyingProcess: [
          'Use France-Visas official application wizard: https://www.france-visas.gouv.fr/en/pakistan',
          'Complete France-Visas online form and generate registration receipt.',
          'Attend biometrics/interview at French Embassy Islamabad or external provider.'
        ], 
        essentialDocuments: ['Valid Passport', 'France-Visas Application Receipt', 'Travel Insurance (€30,000)', 'Bank Statements (6 months)', 'Hotel Bookings'], 
        financialRequirements: '€65/day if hotel pre-booked, €120/day without pre-booking.', 
        embassyContact: 'French Embassy Islamabad & France-Visas.' 
      }
    }
  },
  {
    id: 'germany', name: 'Germany', code: 'DE', region: 'Europe', flag: '🇩🇪', popular: true,
    description: 'Tuition-free public universities, economic powerhouse, and leading engineering hub.',
    visas: {
      student: { processingTime: '8 - 12 Weeks', visaFee: '€75 (National Visa Category D)', applyingProcess: ['Receive university admission.', 'Open Blocked Account (€11,208).', 'Book appointment at German Embassy Islamabad.'], essentialDocuments: ['University Admission Letter', 'Blocked Account Confirmation', 'Language Proficiency (German/English)'], financialRequirements: 'Blocked account balance of €11,208 for 1 year.', embassyContact: 'German Embassy, Diplomatic Enclave, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://videx.diplo.de/',
        onlineFormUrl: 'https://pakistan.diplo.de/pk-en/service/visa-shortterm-1673126',
        applyingProcess: [
          'Check German Missions Pakistan guidance: https://pakistan.diplo.de/pk-en/service/visa-shortterm-1673126',
          'Fill out VIDEX online application form: https://videx.diplo.de/',
          'Join online appointment waiting list by jurisdiction and submit 19 mandatory documents.'
        ], 
        essentialDocuments: ['Current & previous passports', 'VIDEX visa form (signed)', 'Biometrical photos', 'Health insurance (€30,000 cover)', 'Hotel & flight vouchers', 'Personal & company 6-month bank statements'], 
        financialRequirements: 'Personal bank statements (past 6 months), salary slips, and tax returns.', 
        embassyContact: 'German Embassy Islamabad & Consulate General Karachi.' 
      }
    }
  },
  {
    id: 'greece', name: 'Greece', code: 'GR', region: 'Europe', flag: '🇬🇷', popular: false,
    description: 'Cradle of Western civilization, picturesque Greek islands, and English-taught classical degrees.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: '€90 (National D Visa)', applyingProcess: ['University registration.', 'Consular interview at Greek Embassy Islamabad.'], essentialDocuments: ['Enrollment Certificate', 'Health Certificate', 'Bank statement showing funds'], financialRequirements: '€400 per month living costs.', embassyContact: 'Embassy of Greece, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://pk-gr.gvcworld.eu/en/schedule-appointment',
        onlineFormUrl: 'https://pk-gr.gvcworld.eu/en',
        applyingProcess: [
          'GVC World is Greek authorities external provider in Pakistan: https://pk-gr.gvcworld.eu/en',
          'Schedule appointment for Islamabad or Lahore centre: https://pk-gr.gvcworld.eu/en/schedule-appointment',
          'Submit visa file and biometrics.'
        ], 
        essentialDocuments: ['Passport', 'Insurance policy (€30,000)', 'Bank Statements (6 months)', 'Flight & Hotel reservations'], 
        financialRequirements: '€50 per day of visit.', 
        embassyContact: 'Greek Embassy Islamabad & GVC World Centres.' 
      }
    }
  },
  {
    id: 'hungary', name: 'Hungary', code: 'HU', region: 'Europe', flag: '🇭🇺', popular: false,
    description: 'Stipendium Hungaricum scholarships, thermal baths, and picturesque Danube river views.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: '€60 (Residence Permit for Studies)', applyingProcess: ['Admission / Scholarship letter.', 'Submit at Hungarian Embassy Islamabad.'], essentialDocuments: ['Admission Letter', 'Accommodation verification', 'Bank statement / Scholarship letter'], financialRequirements: 'Proof of living subsistence (€300 - €500/mo).', embassyContact: 'Embassy of Hungary, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://konzinfo.mfa.gov.hu/en',
        onlineFormUrl: 'https://konzinfo.mfa.gov.hu/en',
        applyingProcess: [
          'Check official Konzinfo portal: https://konzinfo.mfa.gov.hu/en',
          'Confirm competent Hungarian mission/representation for Pakistan.',
          'Book appointment and lodge application.'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30,000)', 'Bank statement (6 months)', 'Hotel Booking & Flight reservation'], 
        financialRequirements: 'HUF 10,000 per entry / daily subsistence proof.', 
        embassyContact: 'Hungarian Embassy, Islamabad.' 
      }
    }
  },
  {
    id: 'iceland', name: 'Iceland', code: 'IS', region: 'Europe', flag: '🇮🇸', popular: false,
    description: 'Land of geysers, Northern Lights, volcanic landscapes, and unique Nordic culture.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://island.is/en/get-a-visa',
        onlineFormUrl: 'https://island.is/en/get-a-visa',
        applyingProcess: [
          'Check Iceland official guidance: https://island.is/en/get-a-visa',
          'Confirm Schengen state representing Iceland in Pakistan.',
          'Apply via that designated mission/provider.'
        ],
        essentialDocuments: ['Valid Passport', 'Schengen Visa Application', 'Travel Insurance (€30,000)', 'Hotel Vouchers & Return Ticket', 'Bank Statements'],
        financialRequirements: 'ISK 8,000 per day of stay.',
        embassyContact: 'Icelandic Directorate of Immigration / Representing Mission.'
      }
    }
  },
  {
    id: 'italy', name: 'Italy', code: 'IT', region: 'Europe', flag: '🇮🇹', popular: true,
    description: 'Historic universities, world fashion & design capitals, and generous regional scholarships.',
    visas: {
      student: { processingTime: '4 - 8 Weeks', visaFee: '€50 (Type D Long-stay)', applyingProcess: ['Universitaly pre-enrollment.', 'Declaration of Value (DOV).', 'Submit visa dossier at Gerrys / Embassy.'], essentialDocuments: ['Universitaly Summary', 'Admission Letter', 'Bank statements showing solvency'], financialRequirements: '€467.43 per month (~€6,000/year minimum).', embassyContact: 'Embassy of Italy, Islamabad & Consulate Karachi.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist)', 
        appointmentUrl: 'https://ambislamabad.esteri.it/en/',
        onlineFormUrl: 'https://ambislamabad.esteri.it/en/',
        applyingProcess: [
          'Use Italian Embassy Pakistan visa portal: https://ambislamabad.esteri.it/en/',
          'Confirm active appointment provider (Gerrys/BLS/VFS).',
          'Submit form, biometrics and travel dossier.'
        ], 
        essentialDocuments: ['Passport', 'Schengen Insurance (€30k)', '6-Month Bank Statements', 'Flight & Hotel reservations'], 
        financialRequirements: 'Italian Ministry of Interior subsistence scale (€40/day).', 
        embassyContact: 'Italian Embassy Islamabad & Consulate General Karachi.' 
      }
    }
  },
  {
    id: 'latvia', name: 'Latvia', code: 'LV', region: 'Europe', flag: '🇱🇻', popular: false,
    description: 'Art Nouveau Riga, Baltic forests, and growing European education hub.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.mfa.gov.lv/en/consular-information',
        onlineFormUrl: 'https://www.mfa.gov.lv/en/consular-information',
        applyingProcess: [
          'Confirm which mission represents Latvia in Pakistan: https://www.mfa.gov.lv/en/consular-information',
          'Follow that mission instructions for short-stay visas.',
          'Submit biometrics and travel documents.'
        ],
        essentialDocuments: ['Passport', 'Schengen Application Form', 'Travel Insurance (€30,000)', 'Bank Statement (6 months)', 'Flight & Hotel Proof'],
        financialRequirements: '€14 per day of stay in Latvia.',
        embassyContact: 'Latvia Ministry of Foreign Affairs / Representing Mission.'
      }
    }
  },
  {
    id: 'liechtenstein', name: 'Liechtenstein', code: 'LI', region: 'Europe', flag: '🇱🇮', popular: false,
    description: 'Alpine principality, scenic Rhine valley, and high financial development.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.schweiz-pakistan.eda.admin.ch/en/where-to-apply-for-a-schengen-visa',
        onlineFormUrl: 'https://www.schweiz-pakistan.eda.admin.ch/en/application-schengen-visa-procedure',
        applyingProcess: [
          'Swiss authorities handle Liechtenstein Schengen applications in Pakistan: https://www.schweiz-pakistan.eda.admin.ch/en/application-schengen-visa-procedure',
          'Confirm eligibility and current procedure with Swiss mission.',
          'Apply via Swiss / Gerrys VFS centres.'
        ],
        essentialDocuments: ['Passport', 'Schengen Visa Form', 'Travel Insurance (€30,000)', '6-Month Bank Statement', 'Hotel Voucher'],
        financialRequirements: 'CHF 100 per day of stay.',
        embassyContact: 'Embassy of Switzerland, Islamabad (representing Liechtenstein).'
      }
    }
  },
  {
    id: 'lithuania', name: 'Lithuania', code: 'LT', region: 'Europe', flag: '🇱🇹', popular: false,
    description: 'Vilnius Old Town, Baltic sand dunes, and expanding fintech sector.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.migracija.lt/en/',
        onlineFormUrl: 'https://www.migracija.lt/en/',
        applyingProcess: [
          'Use Lithuania official migration portal: https://www.migracija.lt/en/',
          'Confirm mission authorized to accept Pakistani-resident applications.',
          'Lodge short-stay application.'
        ],
        essentialDocuments: ['Valid Passport', 'Visa Application Form', 'Insurance (€30,000)', 'Proof of lodging', 'Bank statement'],
        financialRequirements: '€40 per day of stay.',
        embassyContact: 'Lithuanian Migration Department / Representing Consulate.'
      }
    }
  },
  {
    id: 'luxembourg', name: 'Luxembourg', code: 'LU', region: 'Europe', flag: '🇱🇺', popular: false,
    description: 'Wealthy Grand Duchy, European banking capital, and multicultural heart of Europe.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://mae.gouvernement.lu/en/directions-du-ministere/affaires-consulaires.html',
        onlineFormUrl: 'https://mae.gouvernement.lu/en/directions-du-ministere/affaires-consulaires.html',
        applyingProcess: [
          'Check Luxembourg consular portal: https://mae.gouvernement.lu/en/directions-du-ministere/affaires-consulaires.html',
          'Confirm competent mission representing Luxembourg in Pakistan.',
          'Book appointment before preparing file.'
        ],
        essentialDocuments: ['Passport', 'Schengen Form', 'Insurance (€30,000)', 'Hotel & Flight Booking', '6-Month Bank statement'],
        financialRequirements: 'Proof of sufficient personal financial means for stay.',
        embassyContact: 'Luxembourg Ministry of Foreign Affairs / Representing Embassy.'
      }
    }
  },
  {
    id: 'malta', name: 'Malta', code: 'MT', region: 'Europe', flag: '🇲🇹', popular: false,
    description: 'English language learning capital of the Mediterranean, fortified history, and Schengen member.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: '€100 (National Student Visa D)', applyingProcess: ['Acceptance at University of Malta or English academy.', 'Identity Malta application via VFS.'], essentialDocuments: ['Acceptance Letter', 'Proof of Accommodation', 'Bank statement showing maintenance'], financialRequirements: '€18 per day of course duration + tuition.', embassyContact: 'Consulate of Malta, Pakistan.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist Visa)', 
        appointmentUrl: 'https://identita.gov.mt/visa-unit/',
        onlineFormUrl: 'https://identita.gov.mt/visa-unit/',
        applyingProcess: [
          'Check Malta official Visa Unit guidance: https://identita.gov.mt/visa-unit/',
          'Identify competent mission/provider for Pakistani applicants.',
          'Submit biometrics and visa application.'
        ], 
        essentialDocuments: ['Passport', 'Travel Health Insurance (€30,000)', 'Bank statement (6 months)', 'Flight & Hotel Vouchers'], 
        financialRequirements: '€48 per day of stay.', 
        embassyContact: 'Malta Visa Unit / Authorized Application Centre.' 
      }
    }
  },
  {
    id: 'netherlands', name: 'Netherlands', code: 'NL', region: 'Europe', flag: '🇳🇱', popular: false,
    description: 'Pioneers in English higher education, cycling culture, and vibrant tech ecosystem.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: '€210 (MVV / Residence Permit)', applyingProcess: ['University handles IND application on your behalf.', 'Collect MVV from Dutch Embassy.'], essentialDocuments: ['University Admission', 'Proof of Sufficient Means', 'Antecedents Certificate'], financialRequirements: '€950 per month living costs + tuition.', embassyContact: 'Embassy of the Kingdom of the Netherlands, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://visa.vfsglobal.com/pak/en/nld/',
        onlineFormUrl: 'https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-pakistan',
        applyingProcess: [
          'NetherlandsWorldwide official guide lists VFS centres in Islamabad, Karachi and Lahore: https://www.netherlandsworldwide.nl/visa-the-netherlands/schengen-visa/apply-pakistan',
          'Complete online form on NetherlandsWorldwide.',
          'Book appointment at VFS Netherlands: https://visa.vfsglobal.com/pak/en/nld/'
        ], 
        essentialDocuments: ['Passport', 'Insurance policy (€30,000)', 'Bank statement (6 months)', 'Flight & Hotel reservations'], 
        financialRequirements: '€55 per day minimum.', 
        embassyContact: 'Netherlands Embassy / VFS Global Islamabad, Karachi, Lahore.' 
      }
    }
  },
  {
    id: 'norway', name: 'Norway', code: 'NO', region: 'Europe', flag: '🇳🇴', popular: false,
    description: 'Spectacular fjords, high human development index, and premier academic institutions.',
    visas: {
      student: { processingTime: '8 - 10 Weeks', visaFee: 'NOK 5,400 (Student Residence Permit)', applyingProcess: ['Admission confirmation.', 'Transfer funds to university deposit account.', 'UDI application.'], essentialDocuments: ['Admission Letter', 'Confirmation of Housing', 'Deposit Account Receipt'], financialRequirements: 'NOK 137,907 per academic year.', embassyContact: 'Royal Norwegian Embassy, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visitor Visa)', 
        appointmentUrl: 'https://visa.vfsglobal.com/pak/en/nor/',
        onlineFormUrl: 'https://www.udi.no/en/want-to-apply/visit-and-holiday/',
        applyingProcess: [
          'UDI official guidance for visit visa: https://www.udi.no/en/want-to-apply/visit-and-holiday/',
          'Register application on UDI Application Portal.',
          'Book appointment at VFS Norway Pakistan: https://visa.vfsglobal.com/pak/en/nor/'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30,000)', 'Bank Statements (6 months)', 'UDI cover letter'], 
        financialRequirements: 'NOK 500 per day of stay.', 
        embassyContact: 'Royal Norwegian Embassy / VFS Global Pakistan.' 
      }
    }
  },
  {
    id: 'poland', name: 'Poland', code: 'PL', region: 'Europe', flag: '🇵🇱', popular: false,
    description: 'Fastest-growing European economy, rich historical heritage, and budget-friendly universities.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: 'PLN 370 (approx €80)', applyingProcess: ['University acceptance letter.', 'Book e-Konsulat appointment for National Visa D.'], essentialDocuments: ['Acceptance Letter', 'Tuition payment receipt', 'Bank statement showing maintenance funds'], financialRequirements: 'PLN 701 per month + return travel cost.', embassyContact: 'Embassy of the Republic of Poland, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist)', 
        appointmentUrl: 'https://secure.e-konsulat.gov.pl/',
        onlineFormUrl: 'https://www.gov.pl/web/pakistan',
        applyingProcess: [
          'Use Poland official embassy page: https://www.gov.pl/web/pakistan',
          'Book e-Konsulat appointment: https://secure.e-konsulat.gov.pl/',
          'Submit printed e-Konsulat form and biometrics.'
        ], 
        essentialDocuments: ['Passport', 'Insurance policy (€30k)', 'Bank statement (6 months)', 'Hotel booking'], 
        financialRequirements: 'PLN 300 minimum for stay under 4 days.', 
        embassyContact: 'Embassy of the Republic of Poland, Islamabad.' 
      }
    }
  },
  {
    id: 'portugal', name: 'Portugal', code: 'PT', region: 'Europe', flag: '🇵🇹', popular: false,
    description: 'Sunny Atlantic coastline, thriving tech hubs (Web Summit), and welcoming universities.',
    visas: {
      student: { processingTime: '3 - 6 Weeks', visaFee: '€90 (National Study Visa D4)', applyingProcess: ['University enrollment.', 'Submit national visa application at VFS Global.'], essentialDocuments: ['Acceptance Letter', 'Accommodation Proof', 'Bank statement'], financialRequirements: 'National minimum wage equivalent (~€760/month).', embassyContact: 'Embassy of Portugal, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Tourist)', 
        appointmentUrl: 'https://islamabad.embaixadaportugal.mne.gov.pt/en/',
        onlineFormUrl: 'https://islamabad.embaixadaportugal.mne.gov.pt/en/',
        applyingProcess: [
          'Check Portuguese Embassy visa instructions: https://islamabad.embaixadaportugal.mne.gov.pt/en/',
          'Confirm authorized application centre/mission and form.',
          'Lodge short-stay application.'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30,000)', 'Flight & Hotel reservations', 'Bank Statement (6 months)'], 
        financialRequirements: '€75 per entry + €40 per day of stay.', 
        embassyContact: 'Portuguese Embassy Islamabad.' 
      }
    }
  },
  {
    id: 'romania', name: 'Romania', code: 'RO', region: 'Europe', flag: '🇷🇴', popular: false,
    description: 'Carpathian castles, Danube Delta, and fast-growing European IT universities.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://eviza.mae.ro/',
        onlineFormUrl: 'https://eviza.mae.ro/',
        applyingProcess: [
          'Start application on official eVisa portal: https://eviza.mae.ro/',
          'Verify competent mission and submission instructions for Pakistan.',
          'Submit biometrics upon invitation.'
        ],
        essentialDocuments: ['Passport', 'eVisa registration receipt', 'Travel Insurance (€30,000)', '6-Month Bank statement', 'Hotel Voucher'],
        financialRequirements: '€50 per day (minimum €500 total).',
        embassyContact: 'Embassy of Romania, Islamabad.'
      }
    }
  },
  {
    id: 'slovakia', name: 'Slovakia', code: 'SK', region: 'Europe', flag: '🇸🇰', popular: false,
    description: 'Tatra Mountains, medieval castles, and automotive industrial heart of Central Europe.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.mzv.sk/web/en/consular_info/visa',
        onlineFormUrl: 'https://www.mzv.sk/web/en/consular_info/visa',
        applyingProcess: [
          'Confirm mission representing Slovakia for Pakistan: https://www.mzv.sk/web/en/consular_info/visa',
          'Follow appointment procedure and checklist.',
          'Submit short-stay visa file.'
        ],
        essentialDocuments: ['Passport', 'Visa Form', 'Schengen Insurance (€30,000)', 'Flight reservation', '6-Month Bank Statements'],
        financialRequirements: '€56 per day of stay in Slovakia.',
        embassyContact: 'Embassy of the Slovak Republic / Representing Mission.'
      }
    }
  },
  {
    id: 'slovenia', name: 'Slovenia', code: 'SI', region: 'Europe', flag: '🇸🇮', popular: false,
    description: 'Lake Bled, Alpine greenery, and high quality of living in Central Europe.',
    visas: {
      visit: {
        processingTime: '15 - 45 Days',
        visaFee: '€90 (Schengen Visa)',
        appointmentUrl: 'https://www.gov.si/en/topics/entry-and-residence/',
        onlineFormUrl: 'https://www.gov.si/en/topics/entry-and-residence/',
        applyingProcess: [
          'Use Slovenia official entry/visa guidance: https://www.gov.si/en/topics/entry-and-residence/',
          'Identify competent mission and submission channel in Pakistan.',
          'Submit application and biometrics.'
        ],
        essentialDocuments: ['Passport', 'Schengen Form', 'Insurance (€30,000)', 'Accommodation proof', 'Bank statement'],
        financialRequirements: '€70 per day of stay.',
        embassyContact: 'Slovenia Ministry of Foreign Affairs / Representing Embassy.'
      }
    }
  },
  {
    id: 'spain', name: 'Spain', code: 'ES', region: 'Europe', flag: '🇪🇸', popular: true,
    description: 'Top business universities, vibrant Mediterranean culture, and sunny European lifestyle.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: '€80 (Student National Visa)', applyingProcess: ['Get university letter of acceptance.', 'Medical certificate & police clearance.', 'Submit at BLS International.'], essentialDocuments: ['Acceptance Letter', 'Private Health Insurance', 'Police Clearance with Apostille'], financialRequirements: 'IPREM 100% (~€600 per month).', embassyContact: 'Embassy of Spain, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://www.exteriores.gob.es/Embajadas/islamabad/en/ServiciosConsulares/Paginas/Consular/Visados-Schengen.aspx',
        onlineFormUrl: 'https://www.exteriores.gob.es/Embajadas/islamabad/en/ServiciosConsulares/Paginas/Consular/Visados-Schengen.aspx',
        applyingProcess: [
          'Spanish Embassy Islamabad Schengen guidance: https://www.exteriores.gob.es/Embajadas/islamabad/en/ServiciosConsulares/Paginas/Consular/Visados-Schengen.aspx',
          'Follow current instructions for BLS International / Embassy appointment.',
          'Submit biometrics and travel documents.'
        ], 
        essentialDocuments: ['Valid Passport', 'Insurance (€30k coverage)', '6-Month Bank Statement', 'Hotel Bookings & Flight Itinerary'], 
        financialRequirements: '€113 per day minimum (minimum €1,020 per trip).', 
        embassyContact: 'Spanish Embassy Islamabad & BLS International.' 
      }
    }
  },
  {
    id: 'sweden', name: 'Sweden', code: 'SE', region: 'Europe', flag: '🇸🇪', popular: false,
    description: 'Innovation capital, pioneering sustainability, and world-class English-taught degrees.',
    visas: {
      student: { processingTime: '6 - 8 Weeks', visaFee: 'SEK 1,500 (Residence Permit for Studies)', applyingProcess: ['University admission.', 'Apply online via Swedish Migration Agency (Migrationsverket).'], essentialDocuments: ['Letter of Admission', 'Tuition Fee Payment Receipt', 'Comprehensive Health Insurance'], financialRequirements: 'SEK 9,450 per month of stay.', embassyContact: 'Embassy of Sweden, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://visa.vfsglobal.com/pak/en/swe/',
        onlineFormUrl: 'https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/pakistan/going-to-sweden/visiting-sweden/',
        applyingProcess: [
          'Official Sweden Abroad guide: https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/pakistan/going-to-sweden/visiting-sweden/',
          'Apply via VFS Global Islamabad: https://visa.vfsglobal.com/pak/en/swe/',
          'Submit visa dossier and biometrics.'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30,000)', 'Bank Statements (6 months)', 'Hotel booking'], 
        financialRequirements: 'SEK 450 per day of visit.', 
        embassyContact: 'Embassy of Sweden Islamabad / VFS Global Pakistan.' 
      }
    }
  },
  {
    id: 'switzerland', name: 'Switzerland', code: 'CH', region: 'Europe', flag: '🇨🇭', popular: false,
    description: 'Elite hospitality schools, Swiss Alps, banking excellence, and high standard of living.',
    visas: {
      student: { processingTime: '8 - 12 Weeks', visaFee: 'CHF 88 (National Visa D)', applyingProcess: ['University admission.', 'Cantonal migration office approval.', 'Embassy visa collection.'], essentialDocuments: ['Admission Letter', 'Personal Statement & CV', 'Bank Guarantee from Swiss-recognized bank'], financialRequirements: 'CHF 21,000 per academic year.', embassyContact: 'Embassy of Switzerland, Islamabad.' },
      visit: { 
        processingTime: '15 - 45 Days', 
        visaFee: '€90 (Schengen Visa)', 
        appointmentUrl: 'https://www.schweiz-pakistan.eda.admin.ch/en/where-to-apply-for-a-schengen-visa',
        onlineFormUrl: 'https://www.schweiz-pakistan.eda.admin.ch/en/application-schengen-visa-procedure',
        applyingProcess: [
          'Swiss official guidance for tourist/business visas: https://www.schweiz-pakistan.eda.admin.ch/en/application-schengen-visa-procedure',
          'Where to apply centres in Islamabad, Karachi and Lahore: https://www.schweiz-pakistan.eda.admin.ch/en/where-to-apply-for-a-schengen-visa',
          'Submit at Gerrys / VFS Switzerland centres.'
        ], 
        essentialDocuments: ['Passport', 'Travel Insurance (€30,000)', 'Proof of hotel reservations', '6-Month Bank Statements'], 
        financialRequirements: 'CHF 100 per day of stay.', 
        embassyContact: 'Swiss Embassy Islamabad & Gerrys / VFS Pakistan.' 
      }
    }
  }
];

function updateAll() {
  const serverPath = path.resolve(__dirname, 'server.ts');
  let serverCode = fs.readFileSync(serverPath, 'utf-8');

  // Parse existing countries in server.ts
  const match = serverCode.match(/let countries: CountryData\[\] = (\[[\s\S]*?\n\];)/);
  if (!match) {
    console.error('Could not match countries array in server.ts');
    return;
  }

  // Parse array using eval or JSON after formatting
  let existingCountries = [];
  try {
    existingCountries = eval(match[1].replace(/;$/, ''));
  } catch (err) {
    console.error('Eval error:', err);
    return;
  }

  // Map of schengen IDs
  const schengenMap = new Map();
  ALL_29_SCHENGEN.forEach(sc => schengenMap.set(sc.id, sc));

  // Merge: update existing or add new
  const updatedCountries = existingCountries.map(c => {
    if (schengenMap.has(c.id)) {
      const sc = schengenMap.get(c.id);
      schengenMap.delete(c.id); // Mark handled
      return {
        ...c,
        description: sc.description,
        visas: {
          ...c.visas,
          visit: {
            ...(c.visas ? c.visas.visit : {}),
            ...sc.visas.visit
          }
        }
      };
    }
    return c;
  });

  // Add remaining unhandled Schengen countries
  schengenMap.forEach(sc => {
    updatedCountries.push(sc);
  });

  const updatedArrayStr = `let countries: CountryData[] = ` + JSON.stringify(updatedCountries, null, 2) + `;`;
  serverCode = serverCode.replace(/let countries: CountryData\[\] = \[[\s\S]*?\n\];/, updatedArrayStr);
  fs.writeFileSync(serverPath, serverCode, 'utf-8');
  console.log(`Successfully merged ${updatedCountries.length} countries in server.ts!`);

  // Also update initialData.ts
  const initPath = path.resolve(__dirname, 'src', 'data', 'initialData.ts');
  let initCode = fs.readFileSync(initPath, 'utf-8');
  const initArrayStr = `export const INITIAL_COUNTRIES: Country[] = ` + JSON.stringify(updatedCountries, null, 2) + `;`;
  initCode = initCode.replace(/export const INITIAL_COUNTRIES: Country\[\] = \[[\s\S]*?\n\];/, initArrayStr);
  fs.writeFileSync(initPath, initCode, 'utf-8');
  console.log(`Successfully updated INITIAL_COUNTRIES in initialData.ts!`);
}

updateAll();

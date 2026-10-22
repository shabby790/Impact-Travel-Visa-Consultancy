export interface VisaInfo {
  processingTime: string;
  visaFee: string;
  applyingProcess?: string[];
  process?: string[];
  essentialDocuments?: string[];
  documents?: string[];
  financialRequirements: string;
  embassyContact: string;
  appointmentUrl?: string;
  onlineFormUrl?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  region: string;
  flag: string;
  popular: boolean;
  hidden?: boolean;
  description: string;
  visas?: {
    student?: VisaInfo;
    visit?: VisaInfo;
    umrah?: VisaInfo;
    tour?: VisaInfo;
  };
  studentVisa?: VisaInfo;
  visitVisa?: VisaInfo;
  umrahPackage?: VisaInfo;
  tourPackage?: VisaInfo;
}

export const INITIAL_COUNTRIES: Country[] = [
  {
    id: 'canada', name: 'Canada', code: 'CA', region: 'North America', flag: '🇨🇦', popular: true,
    description: 'World-class education institutions, post-graduation work permits, and pristine landscapes.',
    visas: {
      student: { processingTime: '6 - 8 Weeks', visaFee: 'CAD $150 + Biometrics ($85)', applyingProcess: ['Secure acceptance letter (LOA).', 'Prepare proof of financial support ($20,635 CAD).', 'Submit application online via IRCC portal.'], essentialDocuments: ['Valid Passport', 'Letter of Acceptance', 'GIC of $20,635', 'IELTS Score Card'], financialRequirements: 'Tuition fee + CAD $20,635 living expenses.', embassyContact: 'High Commission of Canada, Diplomatic Enclave, Islamabad.' },
      visit: { processingTime: '4 - 6 Weeks', visaFee: 'CAD $100 + Biometrics ($85)', applyingProcess: ['Prepare travel itinerary & hotel booking.', 'Submit 6-month bank statements.'], essentialDocuments: ['Valid Passport', 'Bank Statements', 'Employment Letter'], financialRequirements: 'PKR 600,000 - 1,000,000 liquid funds.', embassyContact: 'VAC Islamabad, Lahore, Karachi.' }
    }
  },
  {
    id: 'uk', name: 'United Kingdom', code: 'GB', region: 'Europe', flag: '🇬🇧', popular: true,
    description: 'Home to historic universities, world financial hubs, and rich cultural heritage.',
    visas: {
      student: { processingTime: '3 - 4 Weeks', visaFee: '£490 + Immigration Health Surcharge', applyingProcess: ['Receive CAS letter.', 'Pass TB test.', 'Submit online application and attend VFS biometrics.'], essentialDocuments: ['Passport & CAS', 'TB Certificate', 'Financial Evidence (28-day rule)'], financialRequirements: 'Tuition + Living £1,334/mo (London) or £1,023/mo (Outside).', embassyContact: 'British High Commission, Islamabad.' },
      visit: { processingTime: '3 Weeks', visaFee: '£115 (Standard 6-Month)', applyingProcess: ['Complete GOV.UK visitor application.', 'Book VFS appointment in Islamabad/Lahore/Karachi.'], essentialDocuments: ['Passport', 'Travel Itinerary', '6-Month Bank Statements'], financialRequirements: 'Sufficient personal savings (PKR 500,000+).', embassyContact: 'VFS Global Pakistan.' }
    }
  },
  {
    id: 'saudi-arabia', name: 'Saudi Arabia', code: 'SA', region: 'Middle East', flag: '🇸🇦', popular: true,
    description: 'Sacred journey of Umrah and Ziyarah, alongside modern tourism and heritage megaprojects.',
    visas: {
      umrah: { processingTime: '24 - 48 Hours', visaFee: 'SAR 300 (E-Visa)', applyingProcess: ['Choose verified Umrah package.', 'Book hotel & flight vouchers in Makkah & Madinah.', 'Apply via Nusuk or authorized agent.'], essentialDocuments: ['Passport (6mo validity)', 'Photograph (White background)', 'Hotel Voucher in Makkah/Madinah'], financialRequirements: 'Pre-booked accommodation and return travel vouchers.', embassyContact: 'Royal Embassy of Saudi Arabia, Islamabad.' },
      visit: { processingTime: '2 - 3 Days', visaFee: 'SAR 440 (Tourist / E-Visa)', applyingProcess: ['Apply via Saudi Visa Portal (KSA Visa).', 'Complete biometrics if required.'], essentialDocuments: ['Valid Passport', 'Confirmed Hotel Booking', 'Return Flight Ticket'], financialRequirements: 'Valid credit card or 3-month bank statement.', embassyContact: 'Saudi Consulate General, Karachi.' }
    }
  },
  {
    id: 'usa', name: 'United States', code: 'US', region: 'North America', flag: '🇺🇸', popular: true,
    description: 'Explore iconic landmarks, world-leading research universities, and global business centers.',
    visas: {
      student: { processingTime: '1 - 2 Weeks (post-interview)', visaFee: '$185 (MRV) + $350 (SEVIS I-901)', applyingProcess: ['Receive Form I-20 from SEVP school.', 'Pay SEVIS fee & complete DS-160.', 'Attend consular interview at US Embassy.'], essentialDocuments: ['Valid Passport', 'Form I-20', 'DS-160 Barcode Confirmation', 'SEVIS Fee Receipt'], financialRequirements: 'Full 1-year tuition and living expenses per Form I-20.', embassyContact: 'US Embassy Islamabad & US Consulate General Karachi.' },
      visit: { processingTime: '2 - 3 Weeks (post-interview)', visaFee: '$185 (B1/B2 Tourist Visa)', applyingProcess: ['Complete DS-160 online application.', 'Pay visa fee and schedule interview appointment.'], essentialDocuments: ['Passport', 'DS-160 Confirmation', 'Proof of ties to home country', 'Bank Statement'], financialRequirements: 'Proof of funds for entire stay (PKR 800,000+).', embassyContact: 'US Embassy Diplomatic Enclave, Islamabad.' }
    }
  },
  {
    id: 'australia', name: 'Australia', code: 'AU', region: 'Oceania', flag: '🇦🇺', popular: true,
    description: 'Top-tier education, post-study work rights, and breathtaking sunny coastlines.',
    visas: {
      student: { processingTime: '4 - 6 Weeks', visaFee: 'AUD $1,600 (Subclass 500)', applyingProcess: ['Obtain Confirmation of Enrolment (CoE).', 'Prepare Genuine Student (GS) statement.', 'Lodge application via ImmiAccount.'], essentialDocuments: ['Passport & CoE', 'English Test (IELTS/PTE)', 'Financial Evidentiary Proof'], financialRequirements: 'AUD $29,710/year living costs + 1st year tuition.', embassyContact: 'Australian High Commission, Islamabad.' },
      visit: { processingTime: '2 - 4 Weeks', visaFee: 'AUD $195 (Subclass 600)', applyingProcess: ['Create ImmiAccount.', 'Lodge Subclass 600 Tourist stream application online.'], essentialDocuments: ['Passport', 'Bank Statements (6 months)', 'Employment/Business Verification'], financialRequirements: 'Sufficient funds (PKR 700,000 - 1,200,000).', embassyContact: 'Australian High Commission, Islamabad.' }
    }
  },
  {
    id: 'germany', name: 'Germany', code: 'DE', region: 'Europe', flag: '🇩🇪', popular: true,
    description: 'Tuition-free public universities, economic powerhouse, and leading engineering hub.',
    visas: {
      student: { processingTime: '8 - 12 Weeks', visaFee: '€75 (National Visa Category D)', applyingProcess: ['Receive university admission.', 'Open Blocked Account (€11,208).', 'Book appointment at German Embassy Islamabad.'], essentialDocuments: ['University Admission Letter', 'Blocked Account Confirmation', 'Language Proficiency (German/English)'], financialRequirements: 'Blocked account balance of €11,208 for 1 year.', embassyContact: 'German Embassy, Diplomatic Enclave, Islamabad.' },
      visit: { 
        processingTime: '3 - 4 Weeks', 
        visaFee: '€80 (Schengen Visa)', 
        appointmentUrl: 'https://service2.diplo.de/rktermin/extern/choose_category.do?locationCode=isla&realmId=108&categoryId=3102&request_locale=en',
        onlineFormUrl: 'https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt',
        applyingProcess: [
          'Book appointment at German Embassy',
          'Fill out Videx online application form',
          'Gather all 19 mandatory documents and submit physically.'
        ], 
        essentialDocuments: [
          'Current passport and all previous passports',
          'Videx visa application form (signed)',
          'Two biometrical Passport Photos',
          'Health insurance policy (€30,000 cover)',
          'Hotel bookings & flight reservation'
        ], 
        financialRequirements: 'Personal bank statements (past 6 months) & salary slips.', 
        embassyContact: 'German Embassy, Diplomatic Enclave, Islamabad.' 
      }
    }
  },
  {
    id: 'turkey', name: 'Turkey', code: 'TR', region: 'Asia', flag: '🇹🇷', popular: true,
    description: 'Bosphorus bridge between East and West, Ottoman heritage, and vibrant tourist bazaars.',
    visas: {
      visit: { processingTime: '3 - 5 Working Days', visaFee: '$60 (Sticker / E-Visa)', applyingProcess: ['Apply via Anatolia Turkish Visa Center or E-Visa portal.'], essentialDocuments: ['Passport', 'Confirmed Hotel & Return Flight Booking', '6-Month Bank Statement'], financialRequirements: 'PKR 400,000+ bank balance with account maintenance letter.', embassyContact: 'Turkish Embassy Islamabad & Consulates.' }
    }
  },
  {
    id: 'uae', name: 'United Arab Emirates', code: 'AE', region: 'Middle East', flag: '🇦🇪', popular: true,
    description: 'Dubai and Abu Dhabi tourism, modern business hubs, and rapid e-visa processing.',
    visas: {
      visit: { processingTime: '24 - 48 Hours', visaFee: 'AED 350 - 700 (30/60 Days)', applyingProcess: ['Apply online via registered travel agency or airline portal.'], essentialDocuments: ['Passport front page scan', 'White background photograph', 'Return ticket'], financialRequirements: 'Credit card or return flight guarantee.', embassyContact: 'UAE Consulate General, Karachi.' }
    }
  }
];

export const INITIAL_FORMS = [
  { id: 'f-1', title: 'Student Visa Application Checklist (Canada & UK)', category: 'Student', description: 'Comprehensive checklist of required financial documents, academic certificates, and biometric steps.', fileName: 'student_visa_checklist.pdf', fileSize: '1.4 MB' },
  { id: 'f-2', title: 'Tourist & Visitor Visa Document Guide', category: 'Visit', description: 'Step-by-step guide on preparing 6-month bank statements, employment letters, and travel itineraries.', fileName: 'visitor_visa_guide.pdf', fileSize: '2.1 MB' },
  { id: 'f-3', title: 'Umrah & Ziyarah Package Booking Form', category: 'Umrah', description: 'Booking application form for luxury and economy Umrah packages with hotel and flight preferences.', fileName: 'umrah_booking_form.pdf', fileSize: '980 KB' },
  { id: 'f-4', title: 'Sponsorship & Financial Undertaking Affidavit', category: 'Financial', description: 'Legal affidavit template for sponsors supporting student or visitor visa applicants.', fileName: 'financial_affidavit.pdf', fileSize: '650 KB' }
];

export const INITIAL_MENUS = [
  { id: 'm-1', label: 'Home', url: '#home', showInHeader: true, showInFooter: true, order: 1 },
  { id: 'm-2', label: 'Destinations & Visas', url: '#destinations', showInHeader: true, showInFooter: true, order: 2 },
  { id: 'm-3', label: 'Document Center', url: '#documents', showInHeader: true, showInFooter: true, order: 3 },
  { id: 'm-4', label: 'Book Consultation', url: '#consultation', showInHeader: true, showInFooter: true, order: 4 },
  { id: 'm-5', label: 'AI Visa Advisor', url: '#ai-advisor', showInHeader: true, showInFooter: false, order: 5 }
];

export const INITIAL_SETTINGS = {
  brandName: 'Impact Travel & Visa Consultancy',
  tagline: 'Your Trusted Gateway to Global Education, Tourism & Sacred Journeys',
  phone: '+92 300 1234567',
  email: 'info@impactvisa.com.pk',
  address: 'Office # 402, Blue Area, Islamabad, Pakistan',
  logoUrl: ''
};

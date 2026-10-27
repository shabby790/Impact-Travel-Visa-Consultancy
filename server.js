// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static(path.resolve(__dirname, "public")));
function sendExistingFile(res, candidatePaths, mimeType) {
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      res.set({
        "Content-Type": mimeType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      return res.sendFile(p);
    }
  }
  return false;
}
app.get(["/logo.jpg", "/logo.jpeg"], (req, res, next) => {
  const candidates = [
    path.resolve(__dirname, "public", "logo.jpg"),
    path.resolve(__dirname, "dist", "logo.jpg"),
    path.resolve(__dirname, "public", "logo.png"),
    path.resolve(__dirname, "dist", "logo.png"),
    path.resolve(__dirname, "logo.jpg"),
    path.resolve(__dirname, "logo.png")
  ];
  if (sendExistingFile(res, candidates, "image/jpeg")) return;
  next();
});
app.get("/logo.png", (req, res, next) => {
  const candidates = [
    path.resolve(__dirname, "public", "logo.png"),
    path.resolve(__dirname, "dist", "logo.png"),
    path.resolve(__dirname, "public", "logo.jpg"),
    path.resolve(__dirname, "dist", "logo.jpg"),
    path.resolve(__dirname, "logo.png"),
    path.resolve(__dirname, "logo.jpg")
  ];
  if (sendExistingFile(res, candidates, "image/png")) return;
  next();
});
app.get(["/footer-logo.jpg", "/footer-logo.jpeg"], (req, res, next) => {
  const candidates = [
    path.resolve(__dirname, "public", "footer-logo.jpg"),
    path.resolve(__dirname, "dist", "footer-logo.jpg"),
    path.resolve(__dirname, "public", "footer-logo.png"),
    path.resolve(__dirname, "dist", "footer-logo.png"),
    path.resolve(__dirname, "public", "logo.jpg"),
    path.resolve(__dirname, "public", "logo.png")
  ];
  if (sendExistingFile(res, candidates, "image/jpeg")) return;
  next();
});
app.get("/footer-logo.png", (req, res, next) => {
  const candidates = [
    path.resolve(__dirname, "public", "footer-logo.png"),
    path.resolve(__dirname, "dist", "footer-logo.png"),
    path.resolve(__dirname, "public", "footer-logo.jpg"),
    path.resolve(__dirname, "dist", "footer-logo.jpg"),
    path.resolve(__dirname, "public", "logo.png"),
    path.resolve(__dirname, "public", "logo.jpg")
  ];
  if (sendExistingFile(res, candidates, "image/png")) return;
  next();
});
app.get("/siteConfig.json", (req, res) => {
  res.set({
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.json(siteSettings);
});
var PORT = Number(process.env.PORT) || 3e3;
var apiKey = process.env.GEMINI_API_KEY || "";
var ai = new GoogleGenAI({ apiKey });
var siteSettings = {
  brandName: "Impact Visas & Immigration",
  tagline: "Consultants (Private) Limited - Gateway to Global Horizons",
  phone: "+92 326500830",
  email: "info@impactvisa.com.pk",
  address: "72 Main Boulevard Gulberg II, Lahore",
  logoUrl: "/logo.jpg",
  footerLogoUrl: "/footer-logo.jpg"
};
var smtpSettings = {
  host: process.env.SMTP_HOST || "mail.impactvisa.com.pk",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  user: process.env.SMTP_USER || "info@impactvisa.com.pk",
  pass: process.env.SMTP_PASS || "",
  fromEmail: process.env.SMTP_FROM || "info@impactvisa.com.pk"
};
function saveBase64Image(dataUrl, prefix) {
  try {
    if (!dataUrl || typeof dataUrl !== "string") return dataUrl;
    if (!dataUrl.startsWith("data:")) return dataUrl;
    const base64Index = dataUrl.indexOf(";base64,");
    if (base64Index === -1) return dataUrl;
    const mime = dataUrl.substring(5, base64Index).toLowerCase();
    const rawData = dataUrl.substring(base64Index + 8).replace(/\s/g, "");
    const buffer = Buffer.from(rawData, "base64");
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("svg") ? "svg" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "png";
    const filenamesToSave = [
      `${prefix}.${ext}`,
      `${prefix}.png`,
      `${prefix}.jpg`
    ];
    const dirsToSync = [
      path.resolve(__dirname, "public"),
      path.resolve(__dirname, "dist"),
      path.resolve(__dirname)
    ];
    for (const dir of dirsToSync) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
        }
      }
      if (fs.existsSync(dir)) {
        for (const fname of filenamesToSave) {
          try {
            fs.writeFileSync(path.resolve(dir, fname), buffer);
          } catch (e) {
            console.warn(`Could not write ${fname} to ${dir}:`, e);
          }
        }
      }
    }
    const primaryFilename = `${prefix}.${ext}`;
    console.log(`Saved static logo to public and dist as ${primaryFilename}`);
    return `/${primaryFilename}?v=${Date.now()}`;
  } catch (err) {
    console.error("Error saving image file:", err);
    return dataUrl;
  }
}
function persistSiteSettings(updated) {
  try {
    const timestamp = Date.now();
    const configWithVersion = {
      ...updated,
      version: timestamp,
      updatedAt: timestamp
    };
    const content = JSON.stringify(configWithVersion, null, 2);
    const locations = [
      path.resolve(__dirname, "src", "data", "siteConfig.json"),
      path.resolve(__dirname, "public", "siteConfig.json"),
      path.resolve(__dirname, "siteConfig.json"),
      path.resolve(__dirname, "dist", "siteConfig.json")
    ];
    for (const loc of locations) {
      try {
        const parent = path.dirname(loc);
        if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
        fs.writeFileSync(loc, content, "utf-8");
      } catch (e) {
        console.warn(`Could not persist config to ${loc}:`, e);
      }
    }
    console.log("Site settings persisted to siteConfig.json across all target directories");
  } catch (err) {
    console.error("Failed to write siteConfig.json:", err);
  }
}
function persistSmtpSettings(updated) {
  try {
    const locations = [
      path.resolve(__dirname, "src", "data", "smtpConfig.json"),
      path.resolve(__dirname, "public", "smtpConfig.json"),
      path.resolve(__dirname, "smtpConfig.json")
    ];
    const content = JSON.stringify(updated, null, 2);
    for (const loc of locations) {
      try {
        const parent = path.dirname(loc);
        if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
        fs.writeFileSync(loc, content, "utf-8");
      } catch (e) {
      }
    }
    console.log("SMTP settings persisted to smtpConfig.json");
  } catch (err) {
    console.error("Failed to write smtpConfig.json:", err);
  }
}
var candidateConfigLocations = [
  path.resolve(__dirname, "src", "data", "siteConfig.json"),
  path.resolve(__dirname, "public", "siteConfig.json"),
  path.resolve(__dirname, "siteConfig.json"),
  path.resolve(__dirname, "dist", "siteConfig.json")
];
for (const loc of candidateConfigLocations) {
  try {
    if (fs.existsSync(loc)) {
      const saved = JSON.parse(fs.readFileSync(loc, "utf-8"));
      if (saved && saved.brandName) {
        siteSettings = { ...siteSettings, ...saved };
        console.log(`Loaded persisted settings from ${loc}`);
        break;
      }
    }
  } catch (e) {
  }
}
var candidateSmtpLocations = [
  path.resolve(__dirname, "src", "data", "smtpConfig.json"),
  path.resolve(__dirname, "public", "smtpConfig.json"),
  path.resolve(__dirname, "smtpConfig.json")
];
for (const loc of candidateSmtpLocations) {
  try {
    if (fs.existsSync(loc)) {
      const savedSmtp = JSON.parse(fs.readFileSync(loc, "utf-8"));
      if (savedSmtp && savedSmtp.host) {
        smtpSettings = { ...smtpSettings, ...savedSmtp };
        console.log(`Loaded persisted SMTP settings from ${loc}`);
        break;
      }
    }
  } catch (e) {
  }
}
var navMenus = [
  { id: "m-1", label: "Home", url: "#home", showInHeader: true, showInFooter: true, order: 1 },
  { id: "m-2", label: "Destinations & Visas", url: "#destinations", showInHeader: true, showInFooter: true, order: 2 },
  { id: "m-3", label: "Document Center", url: "#documents", showInHeader: true, showInFooter: true, order: 3 },
  { id: "m-4", label: "Book Consultation", url: "#consultation", showInHeader: true, showInFooter: true, order: 4 }
];
var countries = [
  {
    id: "canada",
    name: "Canada",
    code: "CA",
    region: "North America",
    flag: "\u{1F1E8}\u{1F1E6}",
    popular: true,
    description: "World-class education institutions, post-graduation work permits, and pristine landscapes.",
    visas: {
      student: { processingTime: "6 - 8 Weeks", visaFee: "CAD $150 + Biometrics ($85)", applyingProcess: ["Secure acceptance letter (LOA).", "Prepare proof of financial support ($20,635 CAD).", "Submit application online via IRCC portal."], essentialDocuments: ["Valid Passport", "Letter of Acceptance", "GIC of $20,635", "IELTS Score Card"], financialRequirements: "Tuition fee + CAD $20,635 living expenses.", embassyContact: "High Commission of Canada, Diplomatic Enclave, Islamabad." },
      visit: { processingTime: "4 - 6 Weeks", visaFee: "CAD $100 + Biometrics ($85)", applyingProcess: ["Prepare travel itinerary & hotel booking.", "Submit 6-month bank statements."], essentialDocuments: ["Valid Passport", "Bank Statements", "Employment Letter"], financialRequirements: "PKR 600,000 - 1,000,000 liquid funds.", embassyContact: "VAC Islamabad, Lahore, Karachi." }
    }
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "GB",
    region: "Europe",
    flag: "\u{1F1EC}\u{1F1E7}",
    popular: true,
    description: "Home to historic universities, world financial hubs, and rich cultural heritage.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "\xA3490 + Immigration Health Surcharge", applyingProcess: ["Receive CAS letter.", "Pass TB test.", "Submit online application and attend VFS biometrics."], essentialDocuments: ["Passport & CAS", "TB Certificate", "Financial Evidence (28-day rule)"], financialRequirements: "Tuition + Living \xA31,334/mo (London) or \xA31,023/mo (Outside).", embassyContact: "British High Commission, Islamabad." },
      visit: { processingTime: "3 Weeks", visaFee: "\xA3115 (Standard 6-Month)", applyingProcess: ["Complete GOV.UK visitor application.", "Book VFS appointment in Islamabad/Lahore/Karachi."], essentialDocuments: ["Passport", "Travel Itinerary", "6-Month Bank Statements"], financialRequirements: "Sufficient personal savings (PKR 500,000+).", embassyContact: "VFS Global Pakistan." }
    }
  },
  {
    id: "saudi-arabia",
    name: "Saudi Arabia",
    code: "SA",
    region: "Middle East",
    flag: "\u{1F1F8}\u{1F1E6}",
    popular: true,
    description: "Sacred journey of Umrah and Ziyarah, alongside modern tourism and heritage megaprojects.",
    visas: {
      umrah: { processingTime: "24 - 48 Hours", visaFee: "SAR 300 (E-Visa)", applyingProcess: ["Choose verified Umrah package.", "Book hotel & flight vouchers in Makkah & Madinah.", "Apply via Nusuk or authorized agent."], essentialDocuments: ["Passport (6mo validity)", "Photograph (White background)", "Hotel Voucher in Makkah/Madinah"], financialRequirements: "Pre-booked accommodation and return travel vouchers.", embassyContact: "Royal Embassy of Saudi Arabia, Islamabad." },
      visit: { processingTime: "2 - 3 Days", visaFee: "SAR 440 (Tourist / E-Visa)", applyingProcess: ["Apply via Saudi Visa Portal (KSA Visa).", "Complete biometrics if required."], essentialDocuments: ["Valid Passport", "Confirmed Hotel Booking", "Return Flight Ticket"], financialRequirements: "Valid credit card or 3-month bank statement.", embassyContact: "Saudi Consulate General, Karachi." }
    }
  },
  {
    id: "usa",
    name: "United States",
    code: "US",
    region: "North America",
    flag: "\u{1F1FA}\u{1F1F8}",
    popular: true,
    description: "Explore iconic landmarks, world-leading research universities, and global business centers.",
    visas: {
      student: { processingTime: "1 - 2 Weeks (post-interview)", visaFee: "$185 (MRV) + $350 (SEVIS I-901)", applyingProcess: ["Receive Form I-20 from SEVP school.", "Pay SEVIS fee & complete DS-160.", "Attend consular interview at US Embassy."], essentialDocuments: ["Valid Passport", "Form I-20", "DS-160 Barcode Confirmation", "SEVIS Fee Receipt"], financialRequirements: "Full 1-year tuition and living expenses per Form I-20.", embassyContact: "US Embassy Islamabad & US Consulate General Karachi." },
      visit: { processingTime: "2 - 3 Weeks (post-interview)", visaFee: "$185 (B1/B2 Tourist Visa)", applyingProcess: ["Complete DS-160 online application.", "Pay visa fee and schedule interview appointment."], essentialDocuments: ["Passport", "DS-160 Confirmation", "Proof of ties to home country", "Bank Statement"], financialRequirements: "Proof of funds for entire stay (PKR 800,000+).", embassyContact: "US Embassy Diplomatic Enclave, Islamabad." }
    }
  },
  {
    id: "australia",
    name: "Australia",
    code: "AU",
    region: "Oceania",
    flag: "\u{1F1E6}\u{1F1FA}",
    popular: true,
    description: "Top-tier education, post-study work rights, and breathtaking sunny coastlines.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "AUD $1,600 (Subclass 500)", applyingProcess: ["Obtain Confirmation of Enrolment (CoE).", "Prepare Genuine Student (GS) statement.", "Lodge application via ImmiAccount."], essentialDocuments: ["Passport & CoE", "English Test (IELTS/PTE)", "Financial Evidentiary Proof"], financialRequirements: "AUD $29,710/year living costs + 1st year tuition.", embassyContact: "Australian High Commission, Islamabad." },
      visit: { processingTime: "2 - 4 Weeks", visaFee: "AUD $195 (Subclass 600)", applyingProcess: ["Create ImmiAccount.", "Lodge Subclass 600 Tourist stream application online."], essentialDocuments: ["Passport", "Bank Statements (6 months)", "Employment/Business Verification"], financialRequirements: "Sufficient funds (PKR 700,000 - 1,200,000).", embassyContact: "Australian High Commission, Islamabad." }
    }
  },
  {
    id: "germany",
    name: "Germany",
    code: "DE",
    region: "Europe",
    flag: "\u{1F1E9}\u{1F1EA}",
    popular: true,
    description: "Tuition-free public universities, economic powerhouse, and leading engineering hub.",
    visas: {
      student: { processingTime: "8 - 12 Weeks", visaFee: "\u20AC75 (National Visa Category D)", applyingProcess: ["Receive university admission.", "Open Blocked Account (\u20AC11,208).", "Book appointment at German Embassy Islamabad."], essentialDocuments: ["University Admission Letter", "Blocked Account Confirmation", "Language Proficiency (German/English)"], financialRequirements: "Blocked account balance of \u20AC11,208 for 1 year.", embassyContact: "German Embassy, Diplomatic Enclave, Islamabad." },
      visit: {
        processingTime: "3 - 4 Weeks",
        visaFee: "\u20AC80 (Schengen Visa)",
        appointmentUrl: "https://service2.diplo.de/rktermin/extern/choose_category.do?locationCode=isla&realmId=108&categoryId=3102&request_locale=en",
        onlineFormUrl: "https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt",
        applyingProcess: [
          "Book appointment at German Embassy: https://service2.diplo.de/rktermin/extern/choose_category.do?locationCode=isla&realmId=108&categoryId=3102&request_locale=en",
          "Fill out Videx online application form: https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt",
          "Gather all 19 mandatory documents and submit physically."
        ],
        essentialDocuments: [
          "1. Your current passport and all previous passports (valid for at least 3 months after end of visa, signed)",
          "2. Videx visa application form (signed original printed from system)",
          "3. Two biometrical Passport Photos (not older than 6 months, white background)",
          "4. Health insurance policy (Schengen compliant, minimum \u20AC30,000 cover)",
          "5. Invitation and supporting documents (Company invitation < 3 months, Handelsregisterauszug, passport copy of signatory)",
          "6. Hotel bookings (for full duration with full address)",
          "7. Flight reservation (confirmed round trip tickets)",
          "8. Business reference letter (issued by company in Pakistan with designation, purpose, dates, expenses coverage)",
          "9. Passport copies (pages 1 and 2 of current passport; police report if previous lost)",
          "10. All previous visa refusals (copies)",
          "11. ID card (CNIC) copy",
          "12. FRC and Marriage / Birth Certificates (NADRA English)",
          "13. List of children template completed",
          "14. List of relatives living abroad template completed",
          "15. Appointment E-Mail printout showing registered email address",
          "16. Visa copies of previously issued visas",
          "17. Personal financial evidence (bank statements last 6 months, salary slips last 3 months)",
          "18. Company financial evidence (company bank statements last 6 months, FBR tax returns last 2 years)",
          "19. Business proof Bill of Lading / recent shipment documents"
        ],
        financialRequirements: "Personal bank statements (past 6 months), salary slips (last 3 months), company bank statements (past 6 months) & FBR tax returns (last 2 years).",
        embassyContact: "German Embassy, Diplomatic Enclave, Islamabad & Consulate General Karachi."
      }
    }
  },
  {
    id: "turkey",
    name: "Turkey",
    code: "TR",
    region: "Asia",
    flag: "\u{1F1F9}\u{1F1F7}",
    popular: true,
    description: "Bosphorus bridge between East and West, Ottoman heritage, and vibrant tourist bazaars.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$60 - $100", applyingProcess: ["Secure admission from Turkish university.", "Apply via Gerrys/Anatolia visa application center."], essentialDocuments: ["Valid Passport", "Admission Letter", "Attested Educational Documents", "Bank Statement"], financialRequirements: "Tuition receipt + ~$500/month living expense proof.", embassyContact: "Embassy of the Republic of Turkey, Islamabad." },
      visit: { processingTime: "3 - 5 Working Days", visaFee: "$60 (Sticker / E-Visa)", applyingProcess: ["Apply via Anatolia Turkish Visa Center or E-Visa portal."], essentialDocuments: ["Passport", "Confirmed Hotel & Return Flight Booking", "6-Month Bank Statement"], financialRequirements: "PKR 400,000+ bank balance with account maintenance letter.", embassyContact: "Turkish Embassy Islamabad & Consulates." }
    }
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    code: "AE",
    region: "Middle East",
    flag: "\u{1F1E6}\u{1F1EA}",
    popular: true,
    description: "Dubai and Abu Dhabi tourism, modern business hubs, and rapid e-visa processing.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "AED 1,500 - 3,000", applyingProcess: ["University admission in Dubai/Abu Dhabi.", "Complete medical fitness exam upon arrival."], essentialDocuments: ["Valid Passport", "Admission Letter", "Academic Transcripts"], financialRequirements: "Tuition fees covered + sponsor undertaking.", embassyContact: "Embassy of UAE, Diplomatic Enclave, Islamabad." },
      visit: { processingTime: "24 - 48 Hours", visaFee: "AED 350 - 700 (30/60 Days)", applyingProcess: ["Apply online via registered travel agency or airline portal."], essentialDocuments: ["Passport front page scan", "White background photograph", "Return ticket"], financialRequirements: "Credit card or return flight guarantee.", embassyContact: "UAE Consulate General, Karachi." }
    }
  },
  {
    id: "france",
    name: "France",
    code: "FR",
    region: "Europe",
    flag: "\u{1F1EB}\u{1F1F7}",
    popular: true,
    description: "Renowned art, business schools, gastronomy, and cultural heritage across Paris and Provence.",
    visas: {
      student: { processingTime: "3 - 5 Weeks", visaFee: "\u20AC50 + Campus France fee", applyingProcess: ["Campus France interview & NOC.", "Submit VFS long-stay student visa application."], essentialDocuments: ["Campus France NOC", "Admission Letter", "Proof of Accommodation"], financialRequirements: "\u20AC615 per month for the academic year.", embassyContact: "Embassy of France, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Book appointment at France-Visas via VFS Global.", "Submit biometrics and itinerary."], essentialDocuments: ["Valid Passport", "Travel Insurance (\u20AC30,000)", "Bank Statements (6 months)"], financialRequirements: "\u20AC65/day if hotel booked, \u20AC120/day without pre-booking.", embassyContact: "French Embassy Islamabad & Gerrys VFS." }
    }
  },
  {
    id: "malaysia",
    name: "Malaysia",
    code: "MY",
    region: "Asia",
    flag: "\u{1F1F2}\u{1F1FE}",
    popular: true,
    description: "Affordable English-medium education, tropical beauty, and welcoming multicultural environment.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "MYR 600 - 1,200 (EMGS)", applyingProcess: ["Apply via EMGS (Education Malaysia Global Services).", "Obtain Visa Approval Letter (VAL).", "Single Entry Visa (SEV) at High Commission."], essentialDocuments: ["VAL Letter", "Offer Letter", "Medical Screening Certificate"], financialRequirements: "Tuition payment proof + MYR 1,500/month living costs.", embassyContact: "High Commission of Malaysia, Islamabad." },
      visit: { processingTime: "3 - 5 Days", visaFee: "MYR 150 (Tourist E-Visa)", applyingProcess: ["Submit online application on Malaysian E-Visa portal."], essentialDocuments: ["Passport Bio-data page", "Confirmed Return Flight Ticket", "Hotel Booking"], financialRequirements: "USD 500 equivalent in personal bank statement.", embassyContact: "Malaysian High Commission, Islamabad." }
    }
  },
  {
    id: "italy",
    name: "Italy",
    code: "IT",
    region: "Europe",
    flag: "\u{1F1EE}\u{1F1F9}",
    popular: true,
    description: "Historic universities, world fashion & design capitals, and generous regional scholarships.",
    visas: {
      student: { processingTime: "4 - 8 Weeks", visaFee: "\u20AC50 (Type D Long-stay)", applyingProcess: ["Universitaly pre-enrollment.", "Declaration of Value (DOV).", "Submit visa dossier at Gerrys / Embassy."], essentialDocuments: ["Universitaly Summary", "Admission Letter", "Bank statements showing solvency"], financialRequirements: "\u20AC467.43 per month (~\u20AC6,000/year minimum).", embassyContact: "Embassy of Italy, Islamabad & Consulate Karachi." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Book Gerrys VFS appointment.", "Submit travel plan and flight reservations."], essentialDocuments: ["Passport", "Schengen Insurance", "6-Month Bank Statements"], financialRequirements: "Italian Ministry of Interior subsistence scale (\u20AC40/day).", embassyContact: "Embassy of Italy, Islamabad." }
    }
  },
  {
    id: "spain",
    name: "Spain",
    code: "ES",
    region: "Europe",
    flag: "\u{1F1EA}\u{1F1F8}",
    popular: true,
    description: "Top business universities, vibrant Mediterranean culture, and sunny European lifestyle.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC80 (Student National Visa)", applyingProcess: ["Get university letter of acceptance.", "Medical certificate & police clearance.", "Submit at BLS International."], essentialDocuments: ["Acceptance Letter", "Private Health Insurance", "Police Clearance with Apostille"], financialRequirements: "IPREM 100% (~\u20AC600 per month).", embassyContact: "Embassy of Spain, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (BLS Schengen)", applyingProcess: ["Book appointment at BLS International Islamabad/Lahore.", "Provide proof of accommodation."], essentialDocuments: ["Valid Passport", "Insurance (\u20AC30k coverage)", "Bank Statement"], financialRequirements: "\u20AC100 per day minimum (minimum \u20AC900 per trip).", embassyContact: "Spanish Embassy, Islamabad." }
    }
  },
  {
    id: "china",
    name: "China",
    code: "CN",
    region: "Asia",
    flag: "\u{1F1E8}\u{1F1F3}",
    popular: true,
    description: "High-tech innovation, extensive Chinese Government Scholarships (CSC), and rapid development.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "PKR 15,000 (X1/X2 Visa)", applyingProcess: ["Receive JW201/JW202 form and admission notice.", "Submit at Chinese Visa Application Service Center."], essentialDocuments: ["JW202 Form", "Admission Notice", "Foreigner Physical Examination Form"], financialRequirements: "Scholarship award letter or $2,500 bank deposit.", embassyContact: "Chinese Embassy, Diplomatic Enclave, Islamabad." },
      visit: { processingTime: "4 - 5 Days", visaFee: "PKR 10,000 (L Tourist Visa)", applyingProcess: ["Book appointment at CVASC in Islamabad or Karachi."], essentialDocuments: ["Passport", "Round-trip flight booking", "Hotel reservation"], financialRequirements: "6-month bank statement with PKR 500,000+.", embassyContact: "Chinese Embassy, Islamabad." }
    }
  },
  {
    id: "japan",
    name: "Japan",
    code: "JP",
    region: "Asia",
    flag: "\u{1F1EF}\u{1F1F5}",
    popular: true,
    description: "Technological pioneer, safe society, prestigious universities, and rich ancient traditions.",
    visas: {
      student: { processingTime: "6 - 8 Weeks", visaFee: "JPY 6,000 (approx PKR 12,000)", applyingProcess: ["University files for Certificate of Eligibility (COE).", "Submit COE at Japanese Embassy."], essentialDocuments: ["Original COE", "Passport", "Admission Confirmation"], financialRequirements: "Sponsor income certificate + bank balance (2M JPY).", embassyContact: "Embassy of Japan, Islamabad & Consulate Karachi." },
      visit: { processingTime: "1 - 2 Weeks", visaFee: "PKR 8,000 (Single Entry)", applyingProcess: ["Apply through designated travel agencies or embassy."], essentialDocuments: ["Valid Passport", "Detailed Daily Travel Itinerary", "Tax returns and Bank Statements"], financialRequirements: "Proof of funds for entire stay in Japan.", embassyContact: "Embassy of Japan, Islamabad." }
    }
  },
  {
    id: "south-korea",
    name: "South Korea",
    code: "KR",
    region: "Asia",
    flag: "\u{1F1F0}\u{1F1F7}",
    popular: true,
    description: "Dynamic economic leader, world-famous K-culture, and top global engineering universities.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$80 (D-2 Study Visa)", applyingProcess: ["Certificate of Admission from Korean university.", "Submit visa application at Korean Embassy."], essentialDocuments: ["Certificate of Admission", "Tuberculosis Test Certificate", "Bank Certificate"], financialRequirements: "$10,000 - $20,000 held in bank account.", embassyContact: "Embassy of the Republic of Korea, Islamabad." },
      visit: { processingTime: "10 - 14 Days", visaFee: "$40 (C-3 Tourist Visa)", applyingProcess: ["Submit visa application with detailed travel schedule."], essentialDocuments: ["Passport", "Travel Schedule", "Tax returns & 6-month bank statement"], financialRequirements: "PKR 600,000+ bank balance.", embassyContact: "Korean Embassy Islamabad & Consulate Karachi." }
    }
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    code: "NZ",
    region: "Oceania",
    flag: "\u{1F1F3}\u{1F1FF}",
    popular: true,
    description: "Pristine natural scenery, world-renowned universities, and high standard of life.",
    visas: {
      student: { processingTime: "6 - 8 Weeks", visaFee: "NZD $430 (Fee Paying Student Visa)", applyingProcess: ["Offer of Place from NZ institution.", "Apply online through Immigration New Zealand (RealMe)."], essentialDocuments: ["Offer of Place", "Payment of Tuition receipt", "Medical and X-ray report"], financialRequirements: "NZD $20,000 per academic year for living expenses.", embassyContact: "New Zealand High Commission / VFS Pakistan." },
      visit: { processingTime: "4 - 5 Weeks", visaFee: "NZD $246 (Visitor Visa)", applyingProcess: ["Lodge visitor visa application online via Immigration NZ."], essentialDocuments: ["Valid Passport", "Proof of sufficient funds", "Travel Itinerary"], financialRequirements: "NZD $1,000 per month of stay.", embassyContact: "New Zealand Visa Application Centre." }
    }
  },
  {
    id: "sweden",
    name: "Sweden",
    code: "SE",
    region: "Europe",
    flag: "\u{1F1F8}\u{1F1EA}",
    popular: false,
    description: "Innovation capital, pioneering sustainability, and world-class English-taught degrees.",
    visas: {
      student: { processingTime: "6 - 8 Weeks", visaFee: "SEK 1,500 (Residence Permit for Studies)", applyingProcess: ["University admission.", "Apply online via Swedish Migration Agency (Migrationsverket)."], essentialDocuments: ["Letter of Admission", "Tuition Fee Payment Receipt", "Comprehensive Health Insurance"], financialRequirements: "SEK 9,450 per month of stay.", embassyContact: "Embassy of Sweden, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Apply through Gerrys VFS for Schengen Tourist Visa."], essentialDocuments: ["Passport", "Travel Insurance (\u20AC30,000)", "Bank Statements"], financialRequirements: "SEK 450 per day of visit.", embassyContact: "Embassy of Sweden, Islamabad." }
    }
  },
  {
    id: "norway",
    name: "Norway",
    code: "NO",
    region: "Europe",
    flag: "\u{1F1F3}\u{1F1F4}",
    popular: false,
    description: "Spectacular fjords, high human development index, and premier academic institutions.",
    visas: {
      student: { processingTime: "8 - 10 Weeks", visaFee: "NOK 5,400 (Student Residence Permit)", applyingProcess: ["Admission confirmation.", "Transfer funds to university deposit account.", "UDI application."], essentialDocuments: ["Admission Letter", "Confirmation of Housing", "Deposit Account Receipt"], financialRequirements: "NOK 137,907 per academic year.", embassyContact: "Royal Norwegian Embassy, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visitor Visa)", applyingProcess: ["Register on UDI Application Portal.", "Submit documents at VFS."], essentialDocuments: ["Passport", "Travel Insurance", "Bank Statements (6 months)"], financialRequirements: "NOK 500 per day of stay.", embassyContact: "Royal Norwegian Embassy Pakistan." }
    }
  },
  {
    id: "netherlands",
    name: "Netherlands",
    code: "NL",
    region: "Europe",
    flag: "\u{1F1F3}\u{1F1F1}",
    popular: false,
    description: "Pioneers in English higher education, cycling culture, and vibrant tech ecosystem.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC210 (MVV / Residence Permit)", applyingProcess: ["University handles IND application on your behalf.", "Collect MVV from Dutch Embassy."], essentialDocuments: ["University Admission", "Proof of Sufficient Means", "Antecedents Certificate"], financialRequirements: "\u20AC950 per month living costs + tuition.", embassyContact: "Embassy of the Kingdom of the Netherlands, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Apply at VFS Global for Netherlands Schengen Visa."], essentialDocuments: ["Passport", "Insurance policy", "Bank statement with healthy balance"], financialRequirements: "\u20AC34 per day minimum.", embassyContact: "Netherlands Embassy Pakistan." }
    }
  },
  {
    id: "switzerland",
    name: "Switzerland",
    code: "CH",
    region: "Europe",
    flag: "\u{1F1E8}\u{1F1ED}",
    popular: false,
    description: "Elite hospitality schools, Swiss Alps, banking excellence, and high standard of living.",
    visas: {
      student: { processingTime: "8 - 12 Weeks", visaFee: "CHF 88 (National Visa D)", applyingProcess: ["University admission.", "Cantonal migration office approval.", "Embassy visa collection."], essentialDocuments: ["Admission Letter", "Personal Statement & CV", "Bank Guarantee from Swiss-recognized bank"], financialRequirements: "CHF 21,000 per academic year.", embassyContact: "Embassy of Switzerland, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Submit visa application via VFS Global."], essentialDocuments: ["Passport", "Travel Insurance (\u20AC30,000)", "Proof of hotel reservations"], financialRequirements: "CHF 100 per day of stay.", embassyContact: "Swiss Embassy Pakistan." }
    }
  },
  {
    id: "ireland",
    name: "Ireland",
    code: "IE",
    region: "Europe",
    flag: "\u{1F1EE}\u{1F1EA}",
    popular: false,
    description: "European tech headquarters, welcoming English-speaking culture, and 2-year post-study work visa.",
    visas: {
      student: { processingTime: "4 - 8 Weeks", visaFee: "\u20AC60 (Single) / \u20AC100 (Multi) Study Visa D", applyingProcess: ["Apply online via AVATS portal.", "Submit passport and financial proof to VFS Global."], essentialDocuments: ["Letter of Acceptance", "Tuition Fee Payment Evidence (\u20AC6,000+)", "Private Medical Insurance"], financialRequirements: "Immediate access to \u20AC7,000 living costs + tuition.", embassyContact: "Embassy of Ireland representation via VFS Global Pakistan." },
      visit: { processingTime: "3 - 4 Weeks", visaFee: "\u20AC60 (Standard Short-Stay C)", applyingProcess: ["Complete AVATS online form.", "Submit biometric documents at VFS."], essentialDocuments: ["Passport", "Detailed Travel Plan", "6-Month Bank Statements"], financialRequirements: "Sufficient funds to cover all trip costs.", embassyContact: "Irish Visa Office via VFS Pakistan." }
    }
  },
  {
    id: "singapore",
    name: "Singapore",
    code: "SG",
    region: "Asia",
    flag: "\u{1F1F8}\u{1F1EC}",
    popular: false,
    description: "Global financial hub, world-ranked universities (NUS, NTU), and high safety standards.",
    visas: {
      student: { processingTime: "2 - 4 Weeks", visaFee: "SGD 30 (Application) + SGD 60 (Issuance)", applyingProcess: ["University registers student on SOLAR system.", "Submit eForm 16 on ICA portal."], essentialDocuments: ["Offer of Admission", "SOLAR Application Number", "Financial Proof"], financialRequirements: "Tuition fees covered + approx SGD 10,000/year living expenses.", embassyContact: "High Commission of the Republic of Singapore." },
      visit: { processingTime: "3 - 5 Days", visaFee: "SGD 30 (E-Visa)", applyingProcess: ["Apply through authorized visa agent or Singapore ICA portal."], essentialDocuments: ["Valid Passport", "Confirmed Flight Ticket", "Hotel Booking"], financialRequirements: "Bank statement with sufficient travel funds.", embassyContact: "Singapore Honorary Consulate General." }
    }
  },
  {
    id: "qatar",
    name: "Qatar",
    code: "QA",
    region: "Middle East",
    flag: "\u{1F1F6}\u{1F1E6}",
    popular: false,
    description: "Modern infrastructure, Education City universities, and luxury tourism.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "QAR 500", applyingProcess: ["Admission in Education City university.", "Sponsorship processing through Ministry of Interior."], essentialDocuments: ["Admission Letter", "Medical Commission Report", "Police Clearance"], financialRequirements: "Tuition and living expense guarantee.", embassyContact: "Embassy of the State of Qatar, Islamabad." },
      visit: { processingTime: "24 - 48 Hours", visaFee: "Free on Arrival / QAR 100 (Hayya E-Visa)", applyingProcess: ["Apply online via Hayya portal with Discover Qatar hotel booking."], essentialDocuments: ["Passport", "Discover Qatar Hotel Booking Voucher", "Return Air Ticket"], financialRequirements: "Valid international credit/debit card.", embassyContact: "Qatar Embassy Islamabad & Consulates." }
    }
  },
  {
    id: "oman",
    name: "Oman",
    code: "OM",
    region: "Middle East",
    flag: "\u{1F1F4}\u{1F1F2}",
    popular: false,
    description: "Historic forts, pristine coastlines, Arabian hospitality, and emerging educational institutes.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "OMR 50", applyingProcess: ["University admission in Oman.", "Royal Oman Police student visa processing."], essentialDocuments: ["Admission Letter", "Medical fitness certificate", "Sponsor undertaking"], financialRequirements: "Full academic year funds.", embassyContact: "Embassy of the Sultanate of Oman, Islamabad." },
      visit: { processingTime: "24 - 48 Hours", visaFee: "OMR 20 (30-Day Tourist E-Visa)", applyingProcess: ["Apply online via Royal Oman Police E-Visa portal."], essentialDocuments: ["Valid Passport", "Return flight confirmation", "Hotel reservation"], financialRequirements: "Sufficient funds for duration of travel.", embassyContact: "Oman Embassy Pakistan." }
    }
  },
  {
    id: "bahrain",
    name: "Bahrain",
    code: "BH",
    region: "Middle East",
    flag: "\u{1F1E7}\u{1F1ED}",
    popular: false,
    description: "Financial hub of the Gulf, friendly culture, and fast e-visa services.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "BHD 30", applyingProcess: ["University enrollment in Manama.", "NPRA student visa processing."], essentialDocuments: ["Admission Letter", "Medical certificate", "Security clearance"], financialRequirements: "Tuition fees settled.", embassyContact: "Embassy of the Kingdom of Bahrain, Islamabad." },
      visit: { processingTime: "24 Hours", visaFee: "BHD 29 (Tourist E-Visa)", applyingProcess: ["Apply via Bahrain eVisa official government portal."], essentialDocuments: ["Passport", "Return ticket", "Hotel booking voucher"], financialRequirements: "Bank statement or credit card proof.", embassyContact: "Embassy of Bahrain, Islamabad." }
    }
  },
  {
    id: "kuwait",
    name: "Kuwait",
    code: "KW",
    region: "Middle East",
    flag: "\u{1F1F0}\u{1F1FC}",
    popular: false,
    description: "Strong economy, vibrant maritime heritage, and growing higher education sector.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "KWD 30", applyingProcess: ["University admission.", "Kuwait Ministry of Interior visa processing."], essentialDocuments: ["Acceptance Letter", "Police clearance certificate", "Medical exam"], financialRequirements: "Financial sponsor proof.", embassyContact: "Embassy of the State of Kuwait, Islamabad." },
      visit: { processingTime: "3 - 5 Days", visaFee: "KWD 3 (Visit Visa)", applyingProcess: ["Application submitted via sponsor or hotel partner."], essentialDocuments: ["Passport", "Sponsor Civil ID copy", "Return flight confirmation"], financialRequirements: "Sponsor salary certificate.", embassyContact: "Kuwait Embassy Pakistan." }
    }
  },
  {
    id: "denmark",
    name: "Denmark",
    code: "DK",
    region: "Europe",
    flag: "\u{1F1E9}\u{1F1F0}",
    popular: false,
    description: "Green technology pioneer, happy society, and highly respected design schools.",
    visas: {
      student: { processingTime: "2 Months", visaFee: "DKK 1,900 (SIRI Case Order ID)", applyingProcess: ["University admission.", "Create Case Order ID and submit on SIRI portal."], essentialDocuments: ["Letter of Acceptance", "Tuition Fee Payment Receipt", "Bank statement"], financialRequirements: "DKK 6,300 per month of stay.", embassyContact: "Royal Danish Embassy, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Book appointment at VFS Global for Denmark Schengen Visa."], essentialDocuments: ["Passport", "Travel Insurance (\u20AC30k)", "Bank Statements"], financialRequirements: "DKK 500 per day in hotel.", embassyContact: "Royal Danish Embassy Pakistan." }
    }
  },
  {
    id: "finland",
    name: "Finland",
    code: "FI",
    region: "Europe",
    flag: "\u{1F1EB}\u{1F1EE}",
    popular: false,
    description: "Top-ranking education system, pristine nature, and leading technological universities.",
    visas: {
      student: { processingTime: "1 - 3 Months", visaFee: "\u20AC350 (EnterFinland Electronic Application)", applyingProcess: ["University admission.", "Submit application on EnterFinland portal."], essentialDocuments: ["Acceptance Letter", "Comprehensive Health Insurance", "Bank statement in applicant name"], financialRequirements: "\u20AC560 per month (\u20AC6,720 per year).", embassyContact: "Embassy of Finland, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist Visa)", applyingProcess: ["Submit application at VFS Global for Finland."], essentialDocuments: ["Passport", "Insurance policy", "Bank Statement (6 months)"], financialRequirements: "\u20AC30 per day of stay.", embassyContact: "Embassy of Finland, Islamabad." }
    }
  },
  {
    id: "austria",
    name: "Austria",
    code: "AT",
    region: "Europe",
    flag: "\u{1F1E6}\u{1F1F9}",
    popular: false,
    description: "Classical music heritage, Alpine splendor, and affordable public universities.",
    visas: {
      student: { processingTime: "3 - 6 Months", visaFee: "\u20AC160 (Student Residence Permit)", applyingProcess: ["University admission letter.", "Submit residence permit application at Austrian Embassy."], essentialDocuments: ["Admission Notice", "Police Clearance with Apostille", "Accommodation Agreement"], financialRequirements: "\u20AC1,033 per month for applicants over 24.", embassyContact: "Austrian Embassy, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Book appointment with VFS Global for Austria."], essentialDocuments: ["Passport", "Travel Health Insurance", "Bank Statements"], financialRequirements: "Sufficient funds per day according to travel plan.", embassyContact: "Austrian Embassy, Islamabad." }
    }
  },
  {
    id: "belgium",
    name: "Belgium",
    code: "BE",
    region: "Europe",
    flag: "\u{1F1E7}\u{1F1EA}",
    popular: false,
    description: "Heart of the European Union, international institutions, and prestigious research universities.",
    visas: {
      student: { processingTime: "4 - 8 Weeks", visaFee: "\u20AC215 (Administrative Fee) + \u20AC180 Visa", applyingProcess: ["University enrollment.", "Submit national visa (Type D) at Gerrys VFS."], essentialDocuments: ["Admission Letter", "Annex 32 sponsorship or blocked account", "Medical Certificate"], financialRequirements: "Solvency of \u20AC666 per month.", embassyContact: "Embassy of Belgium, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Apply through VFS Global for Belgium Schengen Visa."], essentialDocuments: ["Passport", "Travel Insurance (\u20AC30,000)", "6-Month Bank Statements"], financialRequirements: "\u20AC95 per day if staying in hotel.", embassyContact: "Belgian Embassy Pakistan." }
    }
  },
  {
    id: "poland",
    name: "Poland",
    code: "PL",
    region: "Europe",
    flag: "\u{1F1F5}\u{1F1F1}",
    popular: false,
    description: "Fastest-growing European economy, rich historical heritage, and budget-friendly universities.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "PLN 370 (approx \u20AC80)", applyingProcess: ["University acceptance letter.", "Book e-Konsulat appointment for National Visa D."], essentialDocuments: ["Acceptance Letter", "Tuition payment receipt", "Bank statement showing maintenance funds"], financialRequirements: "PLN 701 per month + return travel cost.", embassyContact: "Embassy of the Republic of Poland, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Book e-Konsulat appointment and submit at Embassy/VFS."], essentialDocuments: ["Passport", "Insurance policy", "Bank statement"], financialRequirements: "PLN 300 minimum for stay under 3 days.", embassyContact: "Polish Embassy Pakistan." }
    }
  },
  {
    id: "czech-republic",
    name: "Czech Republic",
    code: "CZ",
    region: "Europe",
    flag: "\u{1F1E8}\u{1F1FF}",
    popular: false,
    description: "Historic Prague, high-ranking technical universities, and central European connectivity.",
    visas: {
      student: { processingTime: "60 - 90 Days", visaFee: "CZK 2,500", applyingProcess: ["University admission.", "Submit long-term visa application at Czech Embassy."], essentialDocuments: ["Admission Letter", "Proof of Accommodation", "Czech translated police clearance"], financialRequirements: "Approx CZK 5,000 per month of stay.", embassyContact: "Embassy of the Czech Republic, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Submit application at VFS Global for Czech Republic."], essentialDocuments: ["Passport", "Insurance", "Hotel Booking & Flight reservation"], financialRequirements: "CZK 1,420 per day of stay.", embassyContact: "Czech Embassy Pakistan." }
    }
  },
  {
    id: "hungary",
    name: "Hungary",
    code: "HU",
    region: "Europe",
    flag: "\u{1F1ED}\u{1F1FA}",
    popular: false,
    description: "Stipendium Hungaricum scholarships, thermal baths, and picturesque Danube river views.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC60 (Residence Permit for Studies)", applyingProcess: ["Admission / Scholarship letter.", "Submit at Hungarian Embassy Islamabad."], essentialDocuments: ["Admission Letter", "Accommodation verification", "Bank statement / Scholarship letter"], financialRequirements: "Proof of living subsistence (\u20AC300 - \u20AC500/mo).", embassyContact: "Embassy of Hungary, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Apply at Gerrys VFS for Hungary Schengen Visa."], essentialDocuments: ["Passport", "Travel Insurance", "Bank statement"], financialRequirements: "HUF 10,000 per entry.", embassyContact: "Hungarian Embassy Pakistan." }
    }
  },
  {
    id: "portugal",
    name: "Portugal",
    code: "PT",
    region: "Europe",
    flag: "\u{1F1F5}\u{1F1F9}",
    popular: false,
    description: "Sunny Atlantic coastline, thriving tech hubs (Web Summit), and welcoming universities.",
    visas: {
      student: { processingTime: "3 - 6 Weeks", visaFee: "\u20AC90 (National Study Visa D4)", applyingProcess: ["University enrollment.", "Submit national visa application at VFS Global."], essentialDocuments: ["Acceptance Letter", "Accommodation Proof", "Bank statement"], financialRequirements: "National minimum wage equivalent (~\u20AC760/month).", embassyContact: "Embassy of Portugal, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist)", applyingProcess: ["Book appointment at VFS Global for Portugal."], essentialDocuments: ["Passport", "Travel Insurance (\u20AC30,000)", "Flight & Hotel reservations"], financialRequirements: "\u20AC40 per day of stay.", embassyContact: "Portuguese Embassy Pakistan." }
    }
  },
  {
    id: "greece",
    name: "Greece",
    code: "GR",
    region: "Europe",
    flag: "\u{1F1EC}\u{1F1F7}",
    popular: false,
    description: "Cradle of Western civilization, picturesque Greek islands, and English-taught classical degrees.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC90 (National D Visa)", applyingProcess: ["University registration.", "Consular interview at Greek Embassy Islamabad."], essentialDocuments: ["Enrollment Certificate", "Health Certificate", "Bank statement showing funds"], financialRequirements: "\u20AC400 per month living costs.", embassyContact: "Embassy of Greece, Islamabad." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Visa)", applyingProcess: ["Apply at VFS Global for Greece Schengen Visa."], essentialDocuments: ["Passport", "Insurance policy", "Bank Statements (6 months)"], financialRequirements: "\u20AC50 per day of visit.", embassyContact: "Greek Embassy Pakistan." }
    }
  },
  {
    id: "thailand",
    name: "Thailand",
    code: "TH",
    region: "Asia",
    flag: "\u{1F1F9}\u{1F1ED}",
    popular: false,
    description: "Tropical paradise, world-famous cuisine, hospitality management colleges, and tourism.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "THB 2,000 (Non-Immigrant ED)", applyingProcess: ["Acceptance from accredited Thai institute.", "Submit at Royal Thai Embassy."], essentialDocuments: ["Letter of Admission", "Academic Transcripts", "Bank statement"], financialRequirements: "THB 20,000 equivalent in personal/sponsor account.", embassyContact: "Royal Thai Embassy, Islamabad & Consulate Karachi." },
      visit: { processingTime: "3 - 5 Days", visaFee: "THB 1,000 (Tourist Visa TR)", applyingProcess: ["Submit through designated Royal Thai Visa drop-box center."], essentialDocuments: ["Passport", "Confirmed Return Flight", "Hotel Booking", "Bank Statement"], financialRequirements: "PKR 300,000+ bank balance.", embassyContact: "Royal Thai Embassy Pakistan." }
    }
  },
  {
    id: "vietnam",
    name: "Vietnam",
    code: "VN",
    region: "Asia",
    flag: "\u{1F1FB}\u{1F1F3}",
    popular: false,
    description: "Emerging tech hub, breathtaking Ha Long Bay, and cost-effective higher education.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$25 - $50 (DH Student Visa)", applyingProcess: ["University admission in Hanoi or Ho Chi Minh City.", "Immigration Department pre-approval."], essentialDocuments: ["Admission Letter", "Passport copy", "Financial guarantee"], financialRequirements: "Tuition and living expense proof.", embassyContact: "Embassy of the Socialist Republic of Vietnam, Islamabad." },
      visit: { processingTime: "3 Days", visaFee: "$25 (Electronic Visa - E-Visa)", applyingProcess: ["Apply online on Vietnam National E-Visa portal."], essentialDocuments: ["Passport scan", "Portrait photograph (4x6cm)"], financialRequirements: "Sufficient funds for trip duration.", embassyContact: "Vietnamese Embassy Pakistan." }
    }
  },
  {
    id: "indonesia",
    name: "Indonesia",
    code: "ID",
    region: "Asia",
    flag: "\u{1F1EE}\u{1F1E9}",
    popular: false,
    description: "Bali island tourism, vibrant ASEAN market, and diverse university programs.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "USD 50 + Telex Fee (Study Visa C316)", applyingProcess: ["University admission.", "Directorate General of Immigration telex issuance."], essentialDocuments: ["Admission Letter", "Health certificate", "Bank statement"], financialRequirements: "USD 1,500 equivalent in bank account.", embassyContact: "Embassy of the Republic of Indonesia, Islamabad." },
      visit: { processingTime: "3 - 5 Days", visaFee: "USD 35 (E-Visa 211A / VOA)", applyingProcess: ["Apply online on Indonesian Immigration Molina portal."], essentialDocuments: ["Passport", "Return Flight Ticket", "Hotel Booking"], financialRequirements: "USD 2,000 equivalent bank proof.", embassyContact: "Indonesian Embassy Pakistan." }
    }
  },
  {
    id: "philippines",
    name: "Philippines",
    code: "PH",
    region: "Asia",
    flag: "\u{1F1F5}\u{1F1ED}",
    popular: false,
    description: "Premier medical (MD) and nursing education in English, and 7,000+ tropical islands.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "$250 (9F Student Visa)", applyingProcess: ["CHED-recognized college acceptance.", "Bureau of Immigration student conversion."], essentialDocuments: ["Notice of Acceptance (NOA)", "Police Clearance", "Bank statement"], financialRequirements: "Sufficient funds for tuition and accommodation.", embassyContact: "Embassy of the Philippines, Islamabad." },
      visit: { processingTime: "3 - 5 Days", visaFee: "$40 (9A Tourist Visa)", applyingProcess: ["Submit tourist visa application at Embassy of the Philippines."], essentialDocuments: ["Passport", "Flight reservation", "Employment proof & Bank statement"], financialRequirements: "PKR 300,000+ bank balance.", embassyContact: "Philippine Embassy Pakistan." }
    }
  },
  {
    id: "brazil",
    name: "Brazil",
    code: "BR",
    region: "South America",
    flag: "\u{1F1E7}\u{1F1F7}",
    popular: false,
    description: "Largest South American economy, Amazon biodiversity, and major federal universities.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "$100 (VITEM IV Student Visa)", applyingProcess: ["MEC-registered university acceptance.", "Consular appointment at Brazilian Embassy."], essentialDocuments: ["Acceptance Letter", "Police Clearance", "Financial Solvency Proof"], financialRequirements: "Proof of scholarship or maintenance funds ($600/month).", embassyContact: "Embassy of Brazil, Islamabad." },
      visit: { processingTime: "10 - 15 Days", visaFee: "$80 (VIVIS Visitor Visa)", applyingProcess: ["Fill online RVR form and submit documents at Embassy."], essentialDocuments: ["Passport", "Travel itinerary", "Bank Statements (3 months)"], financialRequirements: "Sufficient travel funds.", embassyContact: "Brazilian Embassy Pakistan." }
    }
  },
  {
    id: "argentina",
    name: "Argentina",
    code: "AR",
    region: "South America",
    flag: "\u{1F1E6}\u{1F1F7}",
    popular: false,
    description: "Tango culture, Patagonia natural wonders, and tuition-free public universities.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "$150 (Transitory Student Visa)", applyingProcess: ["Enrollment in RENURE-registered university.", "Embassy visa interview."], essentialDocuments: ["Admission Certificate", "Apostilled Police Record", "Financial Proof"], financialRequirements: "Proof of economic means for stay.", embassyContact: "Embassy of the Argentine Republic, Islamabad." },
      visit: { processingTime: "2 - 3 Weeks", visaFee: "$150 (Tourist Visa)", applyingProcess: ["Submit visa application and attend in-person consular interview."], essentialDocuments: ["Passport", "Confirmed Hotel Bookings", "Bank Statements"], financialRequirements: "Round-trip travel funds.", embassyContact: "Argentine Embassy Pakistan." }
    }
  },
  {
    id: "mexico",
    name: "Mexico",
    code: "MX",
    region: "North America",
    flag: "\u{1F1F2}\u{1F1FD}",
    popular: false,
    description: "Ancient Maya and Aztec history, dynamic manufacturing economy, and prominent universities.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$53 (Temporary Resident Student Visa)", applyingProcess: ["Official institution acceptance.", "Consular interview at Mexican Embassy."], essentialDocuments: ["Acceptance Letter", "Bank statements (past 3 months)", "Valid Passport"], financialRequirements: "Monthly solvency of approx $400 or scholarship letter.", embassyContact: "Embassy of Mexico, Islamabad." },
      visit: { processingTime: "2 - 3 Weeks", visaFee: "$53 (Visitor Visa Without Permission)", applyingProcess: ["Book appointment via MiConsulado portal and attend interview."], essentialDocuments: ["Passport", "Employment verification letter", "Bank statements"], financialRequirements: "PKR 600,000+ stable bank balance.", embassyContact: "Mexican Embassy Pakistan." }
    }
  },
  {
    id: "south-africa",
    name: "South Africa",
    code: "ZA",
    region: "Africa",
    flag: "\u{1F1FF}\u{1F1E6}",
    popular: false,
    description: "Wildlife safaris, Cape Town beauty, and leading African universities (UCT, Wits).",
    visas: {
      student: { processingTime: "6 - 8 Weeks", visaFee: "ZAR 1,750 (Study Visa)", applyingProcess: ["Provisional university acceptance.", "Radiological & medical clearance.", "Submit at VFS."], essentialDocuments: ["Admission Letter", "Medical & Radiological Report", "Police Clearance"], financialRequirements: "ZAR 3,000 per month living costs + tuition.", embassyContact: "High Commission of South Africa, Islamabad." },
      visit: { processingTime: "5 - 7 Days", visaFee: "ZAR 425 (Visitor Visa)", applyingProcess: ["Submit application at VFS South Africa Visa Centre."], essentialDocuments: ["Passport", "Return Flight Ticket", "3-Month Bank Statements"], financialRequirements: "Sufficient funds for trip duration.", embassyContact: "South African High Commission, Islamabad." }
    }
  },
  {
    id: "egypt",
    name: "Egypt",
    code: "EG",
    region: "Africa",
    flag: "\u{1F1EA}\u{1F1EC}",
    popular: false,
    description: "Pyramids of Giza, Nile cruises, and world-renowned historic Al-Azhar University.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$100 (Student Visa)", applyingProcess: ["University admission in Cairo/Alexandria.", "Embassy visa endorsement."], essentialDocuments: ["Admission Letter", "Medical exam report", "Educational Certificates"], financialRequirements: "Proof of tuition payment and living support.", embassyContact: "Embassy of the Arab Republic of Egypt, Islamabad." },
      visit: { processingTime: "5 - 7 Days", visaFee: "$25 (Tourist E-Visa)", applyingProcess: ["Apply on Egyptian E-Visa portal or via Egyptian Embassy."], essentialDocuments: ["Passport", "Hotel Booking confirmation", "Flight details"], financialRequirements: "Sufficient travel funds.", embassyContact: "Egyptian Embassy Pakistan." }
    }
  },
  {
    id: "morocco",
    name: "Morocco",
    code: "MA",
    region: "Africa",
    flag: "\u{1F1F2}\u{1F1E6}",
    popular: false,
    description: "Marrakech bazaars, Sahara desert adventures, and Arabic/French multilingual universities.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "MAD 500 (approx $50)", applyingProcess: ["Higher education admission.", "Ministry of Foreign Affairs approval."], essentialDocuments: ["Admission Certificate", "Scholarship / Bank guarantee", "Police Certificate"], financialRequirements: "Sufficient monthly funds ($400/month).", embassyContact: "Embassy of the Kingdom of Morocco, Islamabad." },
      visit: { processingTime: "5 - 10 Days", visaFee: "MAD 330 (approx $35 E-Visa)", applyingProcess: ["Apply via Access Maroc portal or Moroccan Embassy."], essentialDocuments: ["Passport", "Confirmed Hotel and Flight Booking", "Bank Statement"], financialRequirements: "PKR 400,000+ bank funds.", embassyContact: "Moroccan Embassy Pakistan." }
    }
  },
  {
    id: "azerbaijan",
    name: "Azerbaijan",
    code: "AZ",
    region: "Asia",
    flag: "\u{1F1E6}\u{1F1FF}",
    popular: false,
    description: "Baku architecture, Caspian Sea coastline, affordable medical degrees, and instant e-visas.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "$50 (Student Temporary Residence)", applyingProcess: ["University admission.", "State Migration Service student card."], essentialDocuments: ["Admission Letter", "Health certificate (HIV/Hep test)", "Passport"], financialRequirements: "Tuition paid + $200/month living cost.", embassyContact: "Embassy of the Republic of Azerbaijan, Islamabad." },
      visit: { processingTime: "3 Working Days", visaFee: "$26 (ASAN E-Visa)", applyingProcess: ["Apply online on ASAN Visa official government portal."], essentialDocuments: ["Passport bio-data scan", "Hotel details"], financialRequirements: "Valid payment card.", embassyContact: "Azerbaijani Embassy Pakistan." }
    }
  },
  {
    id: "uzbekistan",
    name: "Uzbekistan",
    code: "UZ",
    region: "Asia",
    flag: "\u{1F1FA}\u{1F1FF}",
    popular: false,
    description: "Silk Road cities of Samarkand and Bukhara, Islamic heritage, and accredited medical schools.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$60 (Student Visa A-2)", applyingProcess: ["Ministry of Higher Education visa invitation.", "Embassy visa issuance."], essentialDocuments: ["Official Invitation Letter", "Admission Notice", "Medical Report"], financialRequirements: "Tuition settlement proof.", embassyContact: "Embassy of the Republic of Uzbekistan, Islamabad." },
      visit: { processingTime: "2 - 3 Days", visaFee: "$20 (Official E-Visa)", applyingProcess: ["Apply via Uzbekistan Electronic Visa Portal."], essentialDocuments: ["Passport scan", "Digital photo"], financialRequirements: "Proof of trip funding.", embassyContact: "Uzbek Embassy Pakistan." }
    }
  },
  {
    id: "georgia",
    name: "Georgia",
    code: "GE",
    region: "Europe",
    flag: "\u{1F1EC}\u{1F1EA}",
    popular: false,
    description: "Caucasus mountain vistas, European medical universities, and vibrant Tbilisi cafes.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "$50 (Immigration Visa D3)", applyingProcess: ["National Centre for Educational Quality recognition.", "E-visa / Consular application."], essentialDocuments: ["Admission Letter", "Ministry Recognition Order", "Bank statement"], financialRequirements: "$3,000 equivalent bank proof.", embassyContact: "Embassy of Georgia / E-Visa portal." },
      visit: { processingTime: "5 - 7 Days", visaFee: "$20 (E-Visa)", applyingProcess: ["Apply on Georgia official E-Visa portal."], essentialDocuments: ["Passport", "Travel health insurance", "Hotel booking voucher"], financialRequirements: "Bank statement for duration of stay.", embassyContact: "Georgian Embassy / Consular Portal." }
    }
  },
  {
    id: "sri-lanka",
    name: "Sri Lanka",
    code: "LK",
    region: "Asia",
    flag: "\u{1F1F1}\u{1F1F0}",
    popular: false,
    description: "Tea plantations, golden beaches, rich Buddhist heritage, and rapid tourist ETA processing.",
    visas: {
      student: { processingTime: "3 - 4 Weeks", visaFee: "$100 (Entry Visa for Studies)", applyingProcess: ["University admission and Ministry of Higher Education approval.", "Embassy visa."], essentialDocuments: ["Admission Letter", "Ministry approval letter", "Police report"], financialRequirements: "Tuition and living expense funds.", embassyContact: "High Commission of Sri Lanka, Islamabad." },
      visit: { processingTime: "24 - 48 Hours", visaFee: "$50 (Electronic Travel Authorization - ETA)", applyingProcess: ["Submit application online on official Sri Lanka ETA portal."], essentialDocuments: ["Passport (6mo validity)", "Confirmed return ticket", "Hotel booking"], financialRequirements: "Sufficient funds for stay.", embassyContact: "Sri Lankan High Commission." }
    }
  },
  {
    id: "maldives",
    name: "Maldives",
    code: "MV",
    region: "Asia",
    flag: "\u{1F1F2}\u{1F1FB}",
    popular: false,
    description: "Overwater luxury villas, crystal-clear turquoise atolls, and world-class diving resorts.",
    visas: {
      student: { processingTime: "2 - 3 Weeks", visaFee: "MVR 1,000 (Student Visa)", applyingProcess: ["Admission in Maldives National University.", "Maldives Immigration student visa permit."], essentialDocuments: ["Admission Letter", "Medical fitness form", "Bank proof"], financialRequirements: "Tuition settled + living proof.", embassyContact: "Maldives High Commission, Islamabad." },
      visit: { processingTime: "Immediate (On-Arrival)", visaFee: "Free (30-Day Tourist Visa on Arrival)", applyingProcess: ["Submit IMUGA digital traveler declaration within 96 hours of departure."], essentialDocuments: ["Valid Passport", "Confirmed Resort / Hotel Booking", "Return Flight Ticket"], financialRequirements: "Minimum $100 per day of stay or prepaid resort voucher.", embassyContact: "Maldives High Commission Pakistan." }
    }
  },
  {
    id: "kenya",
    name: "Kenya",
    code: "KE",
    region: "Africa",
    flag: "\u{1F1F0}\u{1F1EA}",
    popular: false,
    description: "Maasai Mara Great Migration, Nairobi tech hub (Silicon Savannah), and safari adventures.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "$100 (Student Pass Class M)", applyingProcess: ["University admission.", "Department of Immigration Services student pass."], essentialDocuments: ["Admission Letter", "Police clearance", "Passport"], financialRequirements: "Financial sponsorship undertaking.", embassyContact: "High Commission of the Republic of Kenya, Islamabad." },
      visit: { processingTime: "24 - 72 Hours", visaFee: "$34 (Electronic Travel Authorisation - eTA)", applyingProcess: ["Apply on official Kenya eTA portal (etakenya.go.ke)."], essentialDocuments: ["Passport copy", "Flight itinerary", "Hotel booking"], financialRequirements: "Sufficient funds for trip.", embassyContact: "Kenyan High Commission Pakistan." }
    }
  },
  {
    id: "cyprus",
    name: "Cyprus",
    code: "CY",
    region: "Europe",
    flag: "\u{1F1E8}\u{1F1FE}",
    popular: false,
    description: "Sunny Mediterranean island, European degrees, and friendly international student campuses.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC85 (Entry Permit / Student Visa)", applyingProcess: ["College acceptance letter.", "Submit attested academic papers to Migration Department."], essentialDocuments: ["Acceptance Letter", "Bank guarantee letter", "Police clearance certificate"], financialRequirements: "\u20AC7,000 - \u20AC9,000 bank balance guarantee.", embassyContact: "High Commission / Consulate of Cyprus." },
      visit: { processingTime: "10 Days", visaFee: "\u20AC20 - \u20AC80 (National Tourist Visa)", applyingProcess: ["Submit visitor visa application at Cyprus Consulate."], essentialDocuments: ["Passport", "Hotel booking", "6-Month Bank Statement"], financialRequirements: "Sufficient funds (\u20AC50/day).", embassyContact: "Cyprus Consulate Pakistan." }
    }
  },
  {
    id: "malta",
    name: "Malta",
    code: "MT",
    region: "Europe",
    flag: "\u{1F1F2}\u{1F1F9}",
    popular: false,
    description: "English language learning capital of the Mediterranean, fortified history, and Schengen member.",
    visas: {
      student: { processingTime: "4 - 6 Weeks", visaFee: "\u20AC100 (National Student Visa D)", applyingProcess: ["Acceptance at University of Malta or English academy.", "Identity Malta application via VFS."], essentialDocuments: ["Acceptance Letter", "Proof of Accommodation", "Bank statement showing maintenance"], financialRequirements: "\u20AC18 per day of course duration + tuition.", embassyContact: "Consulate of Malta, Pakistan." },
      visit: { processingTime: "15 Days", visaFee: "\u20AC80 (Schengen Tourist Visa)", applyingProcess: ["Submit visa application at VFS Global for Malta."], essentialDocuments: ["Passport", "Travel Health Insurance (\u20AC30,000)", "Bank statement"], financialRequirements: "\u20AC48 per day of stay.", embassyContact: "Malta Visa Application Centre." }
    }
  }
];
var downloadForms = [
  {
    id: "form-1",
    title: "Student Visa Application Form",
    category: "Student",
    description: "Official comprehensive student visa questionnaire, checklist, and declaration form for international admissions.",
    fileName: "Student_Visa_Application_Form.txt",
    fileSize: "2.4 MB",
    downloads: 1420
  },
  {
    id: "form-2",
    title: "Financial Undertaking Form",
    category: "Student",
    description: "Sponsorship and financial guarantee declaration form for tuition and living expenses verification.",
    fileName: "Financial_Undertaking_Declaration_Form.txt",
    fileSize: "1.1 MB",
    downloads: 980
  },
  {
    id: "form-3",
    title: "Tourist & Visit Visa Checklist",
    category: "Visit",
    description: "Complete verified document checklist for visitor, tourist, and family visit visa submissions.",
    fileName: "Tourist_Visit_Visa_Checklist.txt",
    fileSize: "1.8 MB",
    downloads: 2150
  },
  {
    id: "form-4",
    title: "Umrah Package Registration Form",
    category: "Umrah",
    description: "Official Umrah booking registration, hotel voucher, and group travel undertaking form (Saudi Arabia only).",
    fileName: "Umrah_Package_Registration_Form.txt",
    fileSize: "1.5 MB",
    downloads: 3200
  },
  {
    id: "form-5",
    title: "Schengen Visa Cover Letter Template",
    category: "Visit",
    description: "Standard approved cover letter draft explaining travel itinerary, purpose of visit, and ties to home country.",
    fileName: "Schengen_Visa_Cover_Letter_Draft.txt",
    fileSize: "850 KB",
    downloads: 1870
  },
  {
    id: "form-6",
    title: "Letter of Explanation (SOP) Template",
    category: "Student",
    description: "Statement of Purpose (SOP) structure and template for Canadian, UK, and Australian study permit applications.",
    fileName: "Statement_of_Purpose_SOP_Template.txt",
    fileSize: "1.3 MB",
    downloads: 2490
  }
];
var bookings = [
  {
    id: "bk-101",
    fullName: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    phone: "+92 300 1234567",
    visaType: "Student Visa",
    destination: "Canada",
    preferredDate: "2026-10-15",
    status: "Confirmed",
    createdAt: "2026-10-10"
  },
  {
    id: "bk-102",
    fullName: "Fatima Noor",
    email: "fatima.noor@example.com",
    phone: "+92 321 9876543",
    visaType: "Umrah Package",
    destination: "Saudi Arabia",
    preferredDate: "2026-10-18",
    status: "Pending",
    createdAt: "2026-10-11"
  }
];
app.get("/api/settings", (req, res) => {
  res.json(siteSettings);
});
app.put("/api/settings", (req, res) => {
  const incoming = { ...req.body };
  if (incoming.logoUrl && incoming.logoUrl.startsWith("data:image/")) {
    incoming.logoUrl = saveBase64Image(incoming.logoUrl, "logo");
  }
  if (incoming.footerLogoUrl && incoming.footerLogoUrl.startsWith("data:image/")) {
    incoming.footerLogoUrl = saveBase64Image(incoming.footerLogoUrl, "footer-logo");
  }
  siteSettings = {
    ...siteSettings,
    ...incoming
  };
  persistSiteSettings(siteSettings);
  res.json({ success: true, siteSettings });
});
app.get("/api/settings/smtp", (req, res) => {
  res.set("Cache-Control", "no-cache, must-revalidate");
  res.json({
    ...smtpSettings,
    hasPass: !!smtpSettings.pass,
    pass: smtpSettings.pass ? "********" : ""
  });
});
app.put("/api/settings/smtp", (req, res) => {
  const { host, port, user, pass, fromEmail } = req.body;
  if (host !== void 0) smtpSettings.host = host;
  if (port !== void 0) smtpSettings.port = Number(port);
  if (user !== void 0) smtpSettings.user = user;
  if (pass && pass !== "********") smtpSettings.pass = pass;
  if (fromEmail !== void 0) smtpSettings.fromEmail = fromEmail;
  persistSmtpSettings(smtpSettings);
  res.json({ success: true, message: "SMTP settings updated and saved to disk successfully" });
});
app.post("/api/settings/smtp/test", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"${siteSettings.brandName}" <${smtpSettings.fromEmail || smtpSettings.user}>`,
      to: siteSettings.email || smtpSettings.user,
      subject: `Test Email from ${siteSettings.brandName} (SMTP Configured Successfully!)`,
      text: `Congratulations! Your Namecheap cPanel email (${smtpSettings.user}) is successfully configured with your website. Inquiries from your website will now arrive directly in this inbox.`
    });
    res.json({ success: true, message: "SMTP test email sent successfully!", messageId: info.messageId });
  } catch (error) {
    console.error("SMTP Test Error:", error);
    res.status(400).json({ success: false, error: error.message || "Failed to connect or send test email using provided SMTP settings." });
  }
});
app.get("/api/menus", (req, res) => {
  res.json(navMenus);
});
app.post("/api/menus", (req, res) => {
  const newMenu = {
    id: `m-${Date.now()}`,
    ...req.body
  };
  navMenus.push(newMenu);
  res.json({ success: true, menu: newMenu });
});
app.patch("/api/menus/:id", (req, res) => {
  const { id } = req.params;
  const index = navMenus.findIndex((m) => m.id === id);
  if (index >= 0) {
    navMenus[index] = { ...navMenus[index], ...req.body };
    res.json({ success: true, menu: navMenus[index] });
  } else {
    res.status(404).json({ error: "Menu not found" });
  }
});
app.delete("/api/menus/:id", (req, res) => {
  const { id } = req.params;
  navMenus = navMenus.filter((m) => m.id !== id);
  res.json({ success: true });
});
function formatCountryForClient(c) {
  const studentVisa = c.visas?.student ? {
    processingTime: c.visas.student.processingTime,
    fees: c.visas.student.visaFee,
    visaFee: c.visas.student.visaFee,
    process: c.visas.student.applyingProcess,
    applyingProcess: c.visas.student.applyingProcess,
    documents: c.visas.student.essentialDocuments,
    essentialDocuments: c.visas.student.essentialDocuments,
    financialRequirements: c.visas.student.financialRequirements,
    embassyContact: c.visas.student.embassyContact
  } : void 0;
  const visitVisa = c.visas?.visit ? {
    processingTime: c.visas.visit.processingTime,
    fees: c.visas.visit.visaFee,
    visaFee: c.visas.visit.visaFee,
    process: c.visas.visit.applyingProcess,
    applyingProcess: c.visas.visit.applyingProcess,
    documents: c.visas.visit.essentialDocuments,
    essentialDocuments: c.visas.visit.essentialDocuments,
    financialRequirements: c.visas.visit.financialRequirements,
    embassyContact: c.visas.visit.embassyContact,
    appointmentUrl: c.visas.visit.appointmentUrl,
    onlineFormUrl: c.visas.visit.onlineFormUrl
  } : void 0;
  const umrahVisa = c.id === "saudi-arabia" && c.visas?.umrah ? {
    processingTime: c.visas.umrah.processingTime,
    fees: c.visas.umrah.visaFee,
    visaFee: c.visas.umrah.visaFee,
    process: c.visas.umrah.applyingProcess,
    applyingProcess: c.visas.umrah.applyingProcess,
    documents: c.visas.umrah.essentialDocuments,
    essentialDocuments: c.visas.umrah.essentialDocuments,
    financialRequirements: c.visas.umrah.financialRequirements,
    embassyContact: c.visas.umrah.embassyContact,
    appointmentUrl: c.visas.umrah.appointmentUrl,
    onlineFormUrl: c.visas.umrah.onlineFormUrl
  } : void 0;
  return {
    ...c,
    studentVisa,
    visitVisa,
    umrahVisa
  };
}
app.get("/api/countries", (req, res) => {
  const result = countries.map(formatCountryForClient);
  res.json(result);
});
app.post("/api/countries", (req, res) => {
  const incoming = req.body;
  if (!incoming.id || !incoming.name) {
    return res.status(400).json({ error: "Country ID and name are required" });
  }
  const existingIndex = countries.findIndex((c) => c.id === incoming.id);
  const existing = existingIndex >= 0 ? countries[existingIndex] : null;
  const updatedVisas = existing?.visas || {};
  if (incoming.studentVisa) {
    updatedVisas.student = {
      processingTime: incoming.studentVisa.processingTime || updatedVisas.student?.processingTime || "4 - 6 Weeks",
      visaFee: incoming.studentVisa.visaFee || incoming.studentVisa.fees || updatedVisas.student?.visaFee || "Standard Fee",
      applyingProcess: incoming.studentVisa.applyingProcess || incoming.studentVisa.process || updatedVisas.student?.applyingProcess || [],
      essentialDocuments: incoming.studentVisa.essentialDocuments || incoming.studentVisa.documents || updatedVisas.student?.essentialDocuments || [],
      financialRequirements: incoming.studentVisa.financialRequirements || updatedVisas.student?.financialRequirements || "",
      embassyContact: incoming.studentVisa.embassyContact || updatedVisas.student?.embassyContact || "",
      appointmentUrl: incoming.studentVisa.appointmentUrl || updatedVisas.student?.appointmentUrl || "",
      onlineFormUrl: incoming.studentVisa.onlineFormUrl || updatedVisas.student?.onlineFormUrl || ""
    };
  }
  if (incoming.visitVisa) {
    updatedVisas.visit = {
      processingTime: incoming.visitVisa.processingTime || updatedVisas.visit?.processingTime || "2 - 3 Weeks",
      visaFee: incoming.visitVisa.visaFee || incoming.visitVisa.fees || updatedVisas.visit?.visaFee || "Standard Fee",
      applyingProcess: incoming.visitVisa.applyingProcess || incoming.visitVisa.process || updatedVisas.visit?.applyingProcess || [],
      essentialDocuments: incoming.visitVisa.essentialDocuments || incoming.visitVisa.documents || updatedVisas.visit?.essentialDocuments || [],
      financialRequirements: incoming.visitVisa.financialRequirements || updatedVisas.visit?.financialRequirements || "",
      embassyContact: incoming.visitVisa.embassyContact || updatedVisas.visit?.embassyContact || "",
      appointmentUrl: incoming.visitVisa.appointmentUrl || updatedVisas.visit?.appointmentUrl || "",
      onlineFormUrl: incoming.visitVisa.onlineFormUrl || updatedVisas.visit?.onlineFormUrl || ""
    };
  }
  if (incoming.umrahVisa && incoming.id === "saudi-arabia") {
    updatedVisas.umrah = {
      processingTime: incoming.umrahVisa.processingTime || updatedVisas.umrah?.processingTime || "24 - 48 Hours",
      visaFee: incoming.umrahVisa.visaFee || incoming.umrahVisa.fees || updatedVisas.umrah?.visaFee || "SAR 300",
      applyingProcess: incoming.umrahVisa.applyingProcess || incoming.umrahVisa.process || updatedVisas.umrah?.applyingProcess || [],
      essentialDocuments: incoming.umrahVisa.essentialDocuments || incoming.umrahVisa.documents || updatedVisas.umrah?.essentialDocuments || [],
      financialRequirements: incoming.umrahVisa.financialRequirements || updatedVisas.umrah?.financialRequirements || "",
      embassyContact: incoming.umrahVisa.embassyContact || updatedVisas.umrah?.embassyContact || ""
    };
  }
  const updatedCountry = {
    id: incoming.id,
    name: incoming.name,
    code: incoming.code || existing?.code || "XX",
    region: incoming.region || existing?.region || "Global",
    flag: incoming.flag || existing?.flag || "\u{1F310}",
    popular: incoming.popular ?? existing?.popular ?? false,
    hidden: incoming.hidden ?? existing?.hidden ?? false,
    description: incoming.description || existing?.description || "",
    visas: incoming.visas || updatedVisas
  };
  if (existingIndex >= 0) {
    countries[existingIndex] = updatedCountry;
  } else {
    countries.unshift(updatedCountry);
  }
  res.json({ success: true, country: formatCountryForClient(updatedCountry) });
});
app.patch("/api/countries/:id", (req, res) => {
  const { id } = req.params;
  const index = countries.findIndex((c) => c.id === id);
  if (index >= 0) {
    countries[index] = { ...countries[index], ...req.body };
    res.json({ success: true, country: formatCountryForClient(countries[index]) });
  } else {
    res.status(404).json({ error: "Country not found" });
  }
});
app.delete("/api/countries/:id", (req, res) => {
  const { id } = req.params;
  countries = countries.filter((c) => c.id !== id);
  res.json({ success: true });
});
app.get("/api/forms", (req, res) => {
  res.json(downloadForms);
});
app.post("/api/forms", (req, res) => {
  const newForm = {
    id: `form-${Date.now()}`,
    downloads: 0,
    ...req.body
  };
  downloadForms.push(newForm);
  res.json({ success: true, form: newForm });
});
app.delete("/api/forms/:id", (req, res) => {
  const { id } = req.params;
  downloadForms = downloadForms.filter((f) => f.id !== id);
  res.json({ success: true });
});
app.get("/api/forms/:id/download", (req, res) => {
  const { id } = req.params;
  const form = downloadForms.find((f) => f.id === id);
  if (form) {
    form.downloads += 1;
    res.setHeader("Content-Disposition", `attachment; filename="${form.fileName}"`);
    res.setHeader("Content-Type", "text/plain");
    const content = `=====================================================
${siteSettings.brandName.toUpperCase()} - OFFICIAL DOCUMENT
=====================================================
Document Name: ${form.title}
Category: ${form.category}
Verified By: ${siteSettings.brandName} Head Office
Contact Phone: ${siteSettings.phone}
Email: ${siteSettings.email}
Address: ${siteSettings.address}
Date Issued: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
=====================================================

INSTRUCTIONS & IMPORTANT GUIDELINES:
1. Complete all sections of this form in block letters.
2. Ensure passport validity is at least 6 months from travel date.
3. Attach scanned copies of CNIC, passport, and recent photographs.
4. Submit this form along with financial undertakings to our office or upload via consultation portal.

[ OFFICIAL STAMP & VERIFIED BY ${siteSettings.brandName.toUpperCase()} ]
`;
    res.send(content);
  } else {
    res.status(404).json({ error: "Form not found" });
  }
});
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});
app.post("/api/bookings", async (req, res) => {
  const { smtpPass, ...bookingData } = req.body || {};
  const newBooking = {
    id: `bk-${Date.now()}`,
    status: "Pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    ...bookingData
  };
  bookings.unshift(newBooking);
  res.json({ success: true, booking: newBooking });
  const passToUse = smtpPass && smtpPass !== "********" ? smtpPass : smtpSettings.pass && smtpSettings.pass !== "********" ? smtpSettings.pass : process.env.SMTP_PASS || "";
  if (smtpSettings.host && smtpSettings.user && passToUse) {
    setTimeout(async () => {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpSettings.host,
          port: smtpSettings.port,
          secure: smtpSettings.port === 465,
          auth: {
            user: smtpSettings.user,
            pass: passToUse
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 5e3,
          greetingTimeout: 5e3,
          socketTimeout: 5e3
        });
        const mailOptions = {
          from: `"${siteSettings.brandName}" <${smtpSettings.fromEmail || smtpSettings.user}>`,
          to: siteSettings.email || "info@impactvisa.com.pk",
          subject: `New Visa Consultation Inquiry: ${newBooking.fullName} (${newBooking.visaType} - ${newBooking.destination})`,
          text: `
New consultation request received on ${siteSettings.brandName}:

Full Name: ${newBooking.fullName}
Email: ${newBooking.email}
Phone: ${newBooking.phone}
Visa Type: ${newBooking.visaType}
Destination: ${newBooking.destination}
Preferred Date: ${newBooking.preferredDate || "Not specified"}
Date Submitted: ${newBooking.createdAt}

Please log in to the admin panel or reply directly to the client at ${newBooking.email}.
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #047857; margin-top: 0;">New Consultation Inquiry</h2>
              <p>You have received a new visa consultation request from your website <strong>${siteSettings.brandName}</strong>:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold; width: 140px;">Full Name:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newBooking.fullName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><a href="mailto:${newBooking.email}">${newBooking.email}</a></td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><a href="tel:${newBooking.phone}">${newBooking.phone}</a></td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Visa Type:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newBooking.visaType}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Destination:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newBooking.destination}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Preferred Date:</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${newBooking.preferredDate || "As soon as possible"}</td></tr>
              </table>
              <p style="margin-top: 20px; font-size: 13px; color: #718096;">Sent via ${siteSettings.brandName} SMTP Mailer (${siteSettings.email})</p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log("Consultation notification email sent successfully to:", siteSettings.email);
      } catch (mailErr) {
        console.error("Failed to send SMTP email notification:", mailErr);
      }
    }, 10);
  }
});
app.patch("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const b = bookings.find((item) => item.id === id);
  if (b) {
    if (status) b.status = status;
    res.json({ success: true, booking: b });
  } else {
    res.status(404).json({ error: "Booking not found" });
  }
});
app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter((b) => b.id !== id);
  res.json({ success: true });
});
app.get("/api/analytics", (req, res) => {
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const totalFormsDownloaded = downloadForms.reduce((sum, f) => sum + f.downloads, 0);
  const activeCountriesCount = countries.filter((c) => !c.hidden).length;
  res.json({
    totalBookings,
    pendingBookings,
    totalFormsDownloaded,
    activeCountriesCount
  });
});
app.post("/api/ai-chat", async (req, res) => {
  const { message } = req.body;
  try {
    if (!apiKey) {
      return res.json({
        reply: `Hello! As your ${siteSettings.brandName} Visa Advisor, I recommend preparing your passport, financial bank statements, and admission or hotel letters. (Note: GEMINI_API_KEY is not configured, so this is a standard advisory reply).`
      });
    }
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError = null;
    let replyText = "";
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: {
            systemInstruction: `You are an expert, professional senior Visa and Travel Consultant for ${siteSettings.brandName}. You help users with student visas, visit visas, Umrah packages, financial undertakings, bank statement requirements, and embassy submission steps. Be accurate, polite, and helpful.`
          }
        });
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} call failed, trying fallback if available:`, err?.message || err);
      }
    }
    if (replyText) {
      return res.json({ reply: replyText });
    }
    console.error("All AI Chat candidate models failed:", lastError);
    res.json({ reply: "I apologize, but I am currently unable to reach the AI service due to high demand. Please feel free to book a consultation session directly with our senior visa advisors." });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.json({ reply: "I apologize, but I am currently unable to reach the AI service. Please feel free to book a consultation session directly with our senior visa advisors." });
  }
});
async function startServer() {
  const distPath = path.resolve(__dirname, "dist");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(distPath);
  if (isProduction) {
    console.log("Serving production static files from dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    console.log("Starting Vite development middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, "index.html");
        if (fs.existsSync(indexHtmlPath)) {
          let template = fs.readFileSync(indexHtmlPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  server_default as default
};

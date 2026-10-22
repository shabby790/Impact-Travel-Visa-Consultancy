import React, { useState, useEffect } from 'react';
import { INITIAL_COUNTRIES, INITIAL_FORMS, INITIAL_MENUS, INITIAL_SETTINGS } from './data/initialData';
import { 
  Globe, Plane, GraduationCap, Building2, FileText, Download, Calendar, 
  User, Lock, CheckCircle2, Search, ArrowRight, ShieldCheck, Phone, 
  Mail, MapPin, Clock, DollarSign, Sparkles, RefreshCw, X, Check,
  ChevronRight, ChevronLeft, BarChart3, Plus, Trash2, Edit, Eye, EyeOff, Settings, Menu, ShieldAlert,
  Home, ExternalLink
} from 'lucide-react';

interface VisaTypeDetails {
  process: string[];
  documents: string[];
  financialRequirements: string;
  embassyContact: string;
  fees: string;
  processingTime: string;
  appointmentUrl?: string;
  onlineFormUrl?: string;
  availableForms?: {
    title: string;
    formId: string;
    description: string;
  }[];
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  description?: string;
  popular: boolean;
  hidden?: boolean;
  studentVisa?: VisaTypeDetails;
  visitVisa?: VisaTypeDetails;
  umrahVisa?: VisaTypeDetails;
  tourVisa?: VisaTypeDetails;
}

interface DownloadableForm {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  downloadsCount: number;
  description: string;
}

interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  visaType: string;
  destination: string;
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  showInHeader: boolean;
  showInFooter: boolean;
  order: number;
}

interface SiteSettings {
  brandName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
}

interface Analytics {
  totalBookings: number;
  pendingBookings: number;
  totalFormsDownloaded: number;
  activeCountriesCount: number;
}

// Helper to render text with clickable links
const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          let cleanUrl = part;
          let trailing = '';
          if (/[.,;:)\]]$/.test(cleanUrl)) {
            trailing = cleanUrl.slice(-1);
            cleanUrl = cleanUrl.slice(0, -1);
          }
          return (
            <React.Fragment key={i}>
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline break-all inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 rounded-md text-xs transition border border-emerald-200/60 shadow-2xs"
              >
                <span>{cleanUrl.length > 55 ? cleanUrl.substring(0, 52) + '...' : cleanUrl}</span>
                <ExternalLink className="w-3 h-3 inline-block shrink-0" />
              </a>
              {trailing}
            </React.Fragment>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'home' | 'destinations' | 'documents' | 'consultation' | 'ai-advisor' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'student' | 'visit' | 'umrah' | 'tour'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State (20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Data State
  const [countries, setCountries] = useState<Country[]>([]);
  const [forms, setForms] = useState<DownloadableForm[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menus, setMenus] = useState<NavMenuItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [analytics, setAnalytics] = useState<Analytics>({ totalBookings: 0, pendingBookings: 0, totalFormsDownloaded: 0, activeCountriesCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Modal State
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [activeVisaModalTab, setActiveVisaModalTab] = useState<'visit' | 'umrah'>('visit');

  // Consultation Booking Form State
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    visaType: 'Student Visa',
    destination: 'Canada',
    preferredDate: ''
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Welcome to Impact Travel & Visa Consultancy! I am your AI Visa Advisor. Ask me anything about student visas, visit visas, Umrah packages, financial proof, or embassy requirements.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Admin Auth & State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'bookings' | 'countries' | 'forms' | 'menus' | 'settings'>('overview');

  // Admin Editors State
  const [newFormModal, setNewFormModal] = useState(false);
  const [formEditorData, setFormEditorData] = useState({ title: '', category: 'Student', description: '', fileName: 'document.pdf', fileSize: '1.2 MB' });
  const [newMenuModal, setNewMenuModal] = useState(false);
  const [menuEditorData, setMenuEditorData] = useState({ label: '', url: '#', showInHeader: true, showInFooter: true, order: 10 });
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countriesRes, formsRes, bookingsRes, menusRes, settingsRes, analyticsRes] = await Promise.all([
        fetch('/api/countries').then(res => res.json()).catch(() => []),
        fetch('/api/forms').then(res => res.json()).catch(() => []),
        fetch('/api/bookings').then(res => res.json()).catch(() => []),
        fetch('/api/menus').then(res => res.json()).catch(() => []),
        fetch('/api/settings').then(res => res.json()).catch(() => null),
        fetch('/api/analytics').then(res => res.json()).catch(() => null),
      ]);
      const rawCountries = (countriesRes && countriesRes.length > 0) ? countriesRes : INITIAL_COUNTRIES;
      const normalizedCountries = rawCountries.map((c: any) => ({
        ...c,
        studentVisa: c.studentVisa || c.visas?.student || {
          processingTime: '6 - 8 Weeks',
          visaFee: 'Standard Student Visa Fee',
          process: ['Secure admission letter', 'Prepare financial proofs', 'Submit application'],
          documents: ['Valid Passport', 'Admission Letter', 'Bank Statement'],
          financialRequirements: 'Proof of Funds Required',
          embassyContact: 'Official Embassy'
        },
        visitVisa: c.visitVisa || c.visas?.visit || {
          processingTime: '3 - 4 Weeks',
          visaFee: 'Standard Visitor Visa Fee',
          process: ['Prepare travel itinerary', 'Gather bank statements', 'Submit application'],
          documents: ['Valid Passport', 'Hotel Booking', 'Bank Statement'],
          financialRequirements: 'Sufficient funds for stay',
          embassyContact: 'Visa Application Center',
          appointmentUrl: c.visitVisa?.appointmentUrl || c.visas?.visit?.appointmentUrl,
          onlineFormUrl: c.visitVisa?.onlineFormUrl || c.visas?.visit?.onlineFormUrl
        },
        umrahVisa: c.umrahVisa || c.visas?.umrah,
        tourVisa: c.tourVisa || c.visas?.tour
      }));
      setCountries(normalizedCountries);
      setForms((formsRes && formsRes.length > 0) ? formsRes : INITIAL_FORMS);
      setBookings(bookingsRes || []);
      setMenus((menusRes && menusRes.length > 0) ? menusRes : INITIAL_MENUS);
      const localSettings = (() => {
        try {
          const saved = localStorage.getItem('site_settings');
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })();
      setSettings(localSettings || settingsRes || INITIAL_SETTINGS);
      setAnalytics(analyticsRes || { totalBookings: 0, pendingBookings: 0, totalFormsDownloaded: 0, activeCountriesCount: normalizedCountries.length });
    } catch (err) {
      console.error('Failed to fetch data, falling back to initial data', err);
      setCountries(INITIAL_COUNTRIES);
      setForms(INITIAL_FORMS);
      setMenus(INITIAL_MENUS);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadForm = async (formId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      fetchData();
    } catch (err) {
      alert('Error downloading form. Please try again.');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      if (!res.ok) throw new Error('Failed to submit booking');
      setBookingSubmitted(true);
      fetchData();
    } catch (err: any) {
      setBookingError(err.message || 'Submission failed');
    }
  };

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply || 'I am here to help with your visa and travel queries.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error connecting to the AI Visa Assistant. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === 'geminiak123' || adminPinInput === '1234') {
      setIsAdminLoggedIn(true);
      setAdminAuthError('');
    } else {
      setAdminAuthError('Invalid Admin PIN (Try: geminiak123)');
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Delete this form?')) return;
    await fetch(`/api/forms/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEditorData)
    });
    setNewFormModal(false);
    setFormEditorData({ title: '', category: 'Student', description: '', fileName: 'document.pdf', fileSize: '1.2 MB' });
    fetchData();
  };

  const toggleCountryPopular = async (id: string, popular: boolean) => {
    await fetch(`/api/countries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ popular: !popular })
    });
    fetchData();
  };

  const toggleCountryHidden = async (id: string, hidden: boolean) => {
    await fetch(`/api/countries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: !hidden })
    });
    fetchData();
  };

  const deleteCountry = async (id: string) => {
    if (!confirm('Delete this country guide?')) return;
    await fetch(`/api/countries/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveCountryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    try {
      await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCountry)
      });
      setEditingCountry(null);
      fetchData();
      alert('Country visa details updated successfully!');
    } catch (err) {
      alert('Failed to update country');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('site_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      // Ignore API errors on static hosting
    }
    alert('Site settings and logo updated successfully!');
    fetchData();
  };

  const createMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuEditorData)
    });
    setNewMenuModal(false);
    setMenuEditorData({ label: '', url: '#', showInHeader: true, showInFooter: true, order: 10 });
    fetchData();
  };

  const deleteMenu = async (id: string) => {
    if (!confirm('Delete this menu link?')) return;
    await fetch(`/api/menus/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleMenuVisibility = async (id: string, field: 'showInHeader' | 'showInFooter', currentValue: boolean) => {
    await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !currentValue })
    });
    fetchData();
  };

  const REGION_FILTERS = [
    { id: 'all', label: '🌍 All Regions' },
    { id: 'Asia', label: '🌏 Asia' },
    { id: 'Europe', label: '🏰 Europe' },
    { id: 'Africa', label: '🦁 Africa' },
    { id: 'America', label: '🗽 America' },
    { id: 'Australia & New Zealand', label: '🦘 Australia & New Zealand' },
    { id: 'Middle East', label: '🕌 Middle East' }
  ];

  const filteredCountries = countries.filter(c => {
    if (c.hidden && !isAdminLoggedIn) return false;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' 
      ? true 
      : selectedRegion === 'America' 
        ? c.region.toLowerCase().includes('america') 
        : (selectedRegion === 'Australia & New Zealand' || selectedRegion === 'Oceania')
          ? (c.region === 'Oceania' || c.name.includes('Australia') || c.name.includes('New Zealand'))
          : c.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchesLetter = selectedLetter === 'all' || c.name.toUpperCase().startsWith(selectedLetter.toUpperCase());
    return matchesSearch && matchesRegion && matchesLetter;
  });

  // Pagination calculation (20 items per page)
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage) || 1;
  const paginatedCountries = filteredCountries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const headerMenus = menus.filter(m => m.showInHeader).sort((a, b) => a.order - b.order);
  const footerMenus = menus.filter(m => m.showInFooter).sort((a, b) => a.order - b.order);

  const renderCountryCard = (country: Country) => {
    const primaryVisa = country.id === 'saudi-arabia'
      ? (country.umrahVisa || country.visitVisa)
      : (country.visitVisa || country.studentVisa);

    const processingTime = primaryVisa?.processingTime || '2 - 3 Weeks';
    const visaFee = (primaryVisa as any)?.visaFee || primaryVisa?.fees || 'Standard Fee';
    const financialReq = primaryVisa?.financialRequirements || 'Proof of Funds Required';

    return (
      <div 
        key={country.id}
        onClick={() => {
          setSelectedCountry(country);
          setActiveVisaModalTab(country.id === 'saudi-arabia' ? 'umrah' : 'visit');
        }}
        className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-2xl border border-slate-200/90 hover:border-emerald-500 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none"></div>

        <div>
          {/* Header: Flag, Name, Region, ISO & Popular */}
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex items-center space-x-3">
              <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm shrink-0">{country.flag}</span>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition leading-snug">{country.name}</h3>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{country.code}</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">{country.region}</span>
              </div>
            </div>
            {country.popular && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm shrink-0">
                ⭐ Popular
              </span>
            )}
          </div>

          {/* Visa Categories Available */}
          <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
            {country.visitVisa && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✈️ Visit / Tourist Visa
              </span>
            )}
            {country.id === 'saudi-arabia' && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                🕋 Umrah Package
              </span>
            )}
          </div>

          <p className="text-slate-600 text-xs line-clamp-2 mb-3.5 leading-relaxed font-medium">{country.description}</p>

          {/* 2-Column Metrics Box: Real Processing Time & Fee */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center mb-0.5">
                <Clock className="w-3 h-3 text-emerald-600 mr-1" /> Process Time:
              </span>
              <span className="font-extrabold text-slate-900 truncate block text-[11px]">{processingTime}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center mb-0.5">
                <DollarSign className="w-3 h-3 text-emerald-600 mr-0.5" /> Visa Fee:
              </span>
              <span className="font-extrabold text-emerald-700 truncate block text-[11px]">{visaFee}</span>
            </div>
          </div>

          {/* Financial Requirement Highlight */}
          <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/50 rounded-2xl p-3 border border-emerald-100 shadow-inner">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">💰 Bank / Funds Proof:</span>
            </div>
            <p className="text-[11px] font-bold text-emerald-900 line-clamp-1">{financialReq}</p>
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between relative z-10 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[130px]">
            🏛️ {primaryVisa?.embassyContact?.split(',')[0] || 'Official Embassy'}
          </span>
          <span className="text-emerald-600 font-bold flex items-center group-hover:translate-x-1 transition text-xs shrink-0">
            Full Guide <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-3 sm:px-8 flex justify-between items-center border-b border-slate-800/80">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Visa Desk Live</span>
          </div>
          <a href={`tel:${settings.phone}`} className="flex items-center hover:text-emerald-400 font-medium transition text-[11px] sm:text-xs">
            <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
            <span>{settings.phone}</span>
          </a>
          <a href={`mailto:${settings.email}`} className="hidden md:flex items-center hover:text-emerald-400 font-medium transition text-[11px] sm:text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[160px]">{settings.email}</span>
          </a>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-emerald-300/90 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md">
            🌍 53 Destinations
          </span>
          <span className="hidden lg:inline text-slate-400 text-[11px] truncate max-w-xs">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> {settings.address}
          </span>
          <button 
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} 
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center transition bg-slate-900 hover:bg-slate-800 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]"
          >
            <Lock className="w-3 h-3 mr-1" /> Admin Portal
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none shrink-0" 
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          >
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 group-hover:shadow-emerald-600/35 transition-all duration-300 ring-2 ring-emerald-500/20 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                <Plane className="w-3 h-3 text-emerald-600 -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition leading-none">
                  {settings.brandName}
                </h1>
                <span className="hidden xl:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[200px] sm:max-w-xs md:max-w-md hidden xs:block">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('destinations')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'destinations'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Destinations</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                53
              </span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'documents'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Forms & Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'ai-advisor'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>AI Advisor</span>
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                24/7
              </span>
            </button>

            <button
              onClick={() => setActiveTab('consultation')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'consultation'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Consultation</span>
            </button>
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Quick Call Button */}
            <a
              href={`tel:${settings.phone}`}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200/80"
              title="Call Visa Advisory Desk"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Desk</span>
            </a>

            {/* Primary CTA Book Consultation */}
            <button 
              onClick={() => setActiveTab('consultation')}
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200/90 active:scale-95 border border-slate-200 text-slate-800 flex items-center justify-center transition shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-emerald-600" />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
                  <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
                  <span className="w-3.5 self-start ml-0.5 h-0.5 bg-emerald-600 rounded-full"></span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            <div className="p-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-tight">{settings.brandName}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold">Official Visa Consultancy</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">Navigation Menu</p>
                
                <button
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'home'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'home' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div>Home Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Main overview & highlighted visas</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('destinations'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'destinations'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'destinations' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>Destinations & Visas</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          53 Countries
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Browse all 53 countries with processing times</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('documents'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'documents'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'documents' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div>Document Center</div>
                      <div className="text-[10px] text-slate-400 font-normal">Download official embassy checklists & forms</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('consultation'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'consultation'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'consultation' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div>Book Consultation</div>
                      <div className="text-[10px] text-slate-400 font-normal">1-on-1 Visa advisor appointment</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('ai-advisor'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'ai-advisor'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'ai-advisor' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span>AI Visa Advisor</span>
                        <span className="bg-teal-100 text-teal-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">24/7 Live</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Instant eligibility, requirements & Q&A</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-sm transition ${
                    activeTab === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Admin Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Manage rates, processing times & bookings</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Direct Assistance Card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Direct Assistance</p>
                <a 
                  href={`tel:${settings.phone}`}
                  className="flex items-center space-x-2 text-xs font-bold text-slate-800 hover:text-emerald-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span>{settings.phone}</span>
                </a>
                <a 
                  href={`mailto:${settings.email}`}
                  className="flex items-center space-x-2 text-xs font-bold text-slate-800 hover:text-emerald-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{settings.email}</span>
                </a>
              </div>
            </div>

            {/* Drawer Bottom CTA */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80">
              <button
                onClick={() => { setActiveTab('consultation'); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-95 transition text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero / Main Body */}
      <main className="flex-grow pb-20 lg:pb-0">
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Global Visa & Travel Consultancy Portal</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    Your Pathway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Global Horizons</span>
                  </h1>
                  <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                    Expert consultancy for 50+ Global Destinations, Student Visas, Tourist Visas, Umrah packages, and Private Tours. Get accurate financial proofs, processing timelines, and official downloadable forms instantly.
                  </p>
                  
                  {/* Search Bar */}
                  <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center max-w-xl border border-slate-200">
                    <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search country (e.g. Canada, UK, Saudi Arabia, France)..." 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full py-2.5 px-2 text-slate-800 focus:outline-none text-sm font-medium"
                    />
                    <button 
                      onClick={() => setActiveTab('destinations')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shrink-0 shadow-md shadow-emerald-600/30"
                    >
                      Explore Visas
                    </button>
                  </div>

                  {/* Quick Categories */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <span className="text-xs text-slate-400 self-center font-medium">Popular Categories:</span>
                    <button onClick={() => { setSelectedCategory('visit'); setActiveTab('destinations'); }} className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition">
                      ✈️ Visit / Tourist Visas
                    </button>
                    <button onClick={() => { setSelectedRegion('Europe'); setActiveTab('destinations'); }} className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition">
                      🇪🇺 Schengen Visas
                    </button>
                    <button onClick={() => { setSelectedCategory('umrah'); setActiveTab('destinations'); }} className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition">
                      🕋 Umrah Packages
                    </button>
                    <button onClick={() => { setSelectedCategory('tour'); setActiveTab('destinations'); }} className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 transition">
                      🌴 Holiday & Tours
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Consultation
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Book Expert Advice</h3>
                    <p className="text-slate-400 text-xs mb-6">Schedule a 1-on-1 session with our certified visa consultants.</p>

                    {bookingSubmitted ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                        <h4 className="text-white font-bold text-lg">Booking Confirmed!</h4>
                        <p className="text-slate-300 text-xs">We have received your request. Our consultant will contact you shortly.</p>
                        <button onClick={() => setBookingSubmitted(false)} className="text-xs text-emerald-400 underline font-semibold mt-2">Book Another Session</button>
                      </div>
                    ) : (
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            required 
                            value={bookingForm.fullName}
                            onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                            placeholder="Muhammad Ali" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                            <input 
                              type="email" 
                              required 
                              value={bookingForm.email}
                              onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                              placeholder="ali@example.com" 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / WhatsApp</label>
                            <input 
                              type="text" 
                              required 
                              value={bookingForm.phone}
                              onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                              placeholder="+92 300..." 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Visa Category</label>
                            <select 
                              value={bookingForm.visaType}
                              onChange={(e) => setBookingForm({...bookingForm, visaType: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                            >
                              <option>Student Visa</option>
                              <option>Visit / Tourist Visa</option>
                              <option>Umrah Package</option>
                              <option>Private Tour</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Destination</label>
                            <select 
                              value={bookingForm.destination}
                              onChange={(e) => setBookingForm({...bookingForm, destination: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                            >
                              {countries.map(c => <option key={c.id} value={c.name}>{c.flag} {c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Date</label>
                          <input 
                            type="date" 
                            required 
                            value={bookingForm.preferredDate}
                            onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        {bookingError && <p className="text-red-400 text-xs">{bookingError}</p>}
                        <button 
                          type="submit" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30"
                        >
                          Confirm Consultation Booking
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Impressive Country Cards Grid (Paginated 20 per page) */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Global Destinations</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Explore 50+ Worldwide Visa Guides</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('destinations')}
                  className="hidden sm:flex items-center text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition"
                >
                  View All Destinations <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>

              {/* Region Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {REGION_FILTERS.map(rf => (
                  <button
                    key={rf.id}
                    onClick={() => { setSelectedRegion(rf.id); setCurrentPage(1); }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      selectedRegion === rf.id 
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>

              {/* Alphabetical A-Z Filter Bar */}
              <div className="flex flex-wrap gap-1.5 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm items-center">
                <span className="text-xs font-bold text-slate-500 mr-2 flex items-center">
                  <Search className="w-3.5 h-3.5 mr-1 text-emerald-600" /> A-Z Filter:
                </span>
                <button
                  onClick={() => { setSelectedLetter('all'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedLetter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(letter => (
                  <button
                    key={letter}
                    onClick={() => { setSelectedLetter(letter); setCurrentPage(1); }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      selectedLetter === letter 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium">Loading destination guides...</div>
              ) : paginatedCountries.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
                  <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
                  <p className="text-slate-500 text-xs mt-1 mb-4">No countries matched your selected filters or search query.</p>
                  <button
                    onClick={() => { setSelectedRegion('all'); setSelectedLetter('all'); setSearchQuery(''); setCurrentPage(1); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedCountries.map(renderCountryCard)}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center font-bold text-xs shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-extrabold text-xs transition shadow-sm ${
                          currentPage === pageNum 
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center font-bold text-xs shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </section>

            {/* AI Advisor Banner */}
            <section className="bg-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8 my-8 max-w-7xl mx-auto rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-emerald-800 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Visa Assistant</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold">Have questions about visa documents or eligibility?</h3>
                <p className="text-emerald-200 text-sm">Ask our trained AI Assistant right now for immediate answers on financial statements, embassy submission steps, and required undertakings.</p>
              </div>
              <button 
                onClick={() => setActiveTab('ai-advisor')}
                className="bg-white hover:bg-emerald-50 text-emerald-900 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg transition shrink-0 flex items-center space-x-2"
              >
                <span>Chat with AI Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">All Destinations & Visa Guides (50+ Countries)</h2>
                <p className="text-slate-500 text-sm mt-1">Select any country to view official visit, tourist, and embassy requirements.</p>
              </div>
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center w-full md:w-80 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search country..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {REGION_FILTERS.map(rf => (
                <button
                  key={rf.id}
                  onClick={() => { setSelectedRegion(rf.id); setCurrentPage(1); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    selectedRegion === rf.id 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Alphabetical A-Z Filter Bar */}
            <div className="flex flex-wrap gap-1.5 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm items-center">
              <span className="text-xs font-bold text-slate-500 mr-2 flex items-center">
                <Search className="w-3.5 h-3.5 mr-1 text-emerald-600" /> A-Z Filter:
              </span>
              <button
                onClick={() => { setSelectedLetter('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedLetter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(letter => (
                <button
                  key={letter}
                  onClick={() => { setSelectedLetter(letter); setCurrentPage(1); }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    selectedLetter === letter 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading countries...</div>
            ) : paginatedCountries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
                <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
                <p className="text-slate-500 text-xs mt-1 mb-4">No countries matched your selected filters or search query.</p>
                <button
                  onClick={() => { setSelectedRegion('all'); setSelectedLetter('all'); setSearchQuery(''); setCurrentPage(1); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedCountries.map(renderCountryCard)}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center font-bold text-xs shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-extrabold text-xs transition shadow-sm ${
                        currentPage === pageNum 
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center font-bold text-xs shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900">Official Visa & Undertaking Forms</h2>
              <p className="text-slate-500 text-sm mt-2">Download official application forms, financial undertakings, visitor entry forms, and visa guides instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map(form => (
                <div key={form.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="bg-slate-100 text-slate-600 font-semibold text-xs px-2.5 py-1 rounded-full">
                        {form.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{form.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">{form.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Format: PDF ({form.fileSize})</span>
                    <button 
                      onClick={() => handleDownloadForm(form.id, form.fileName)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm shadow-emerald-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'consultation' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900">Book a Consultation Session</h2>
                <p className="text-slate-500 text-sm mt-2">Get personalized guidance from expert visa consultants for your student, visit, Umrah, or tour application.</p>
              </div>

              {bookingSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                  <h3 className="text-2xl font-bold text-slate-900">Booking Confirmed Successfully!</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">Thank you. Our senior consultancy team will review your preferred date and contact you via phone or email.</p>
                  <button 
                    onClick={() => setBookingSubmitted(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                  >
                    Book Another Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={bookingForm.fullName}
                        onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                        placeholder="Muhammad Ali"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        placeholder="ali@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone / WhatsApp No.</label>
                      <input 
                        type="text" 
                        required
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                        placeholder="+92 300 1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Visa Category</label>
                      <select 
                        value={bookingForm.visaType}
                        onChange={(e) => setBookingForm({...bookingForm, visaType: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option>Student Visa</option>
                        <option>Visit / Tourist Visa</option>
                        <option>Umrah Package</option>
                        <option>Private Tour</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Destination Country</label>
                      <select 
                        value={bookingForm.destination}
                        onChange={(e) => setBookingForm({...bookingForm, destination: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        {countries.map(c => <option key={c.id} value={c.name}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preferred Consultation Date</label>
                      <input 
                        type="date" 
                        required
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {bookingError && <p className="text-red-500 text-xs">{bookingError}</p>}

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-base shadow-lg shadow-emerald-600/20 transition"
                  >
                    Submit Booking Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-advisor' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-emerald-900 text-white rounded-t-3xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Visa Advisor</h3>
                    <p className="text-xs text-emerald-200">Powered by Gemini AI - Ask any visa or travel question</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl px-5 py-3 text-sm shadow-sm animate-pulse">
                      AI Advisor is typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiChatSubmit} className="p-4 bg-white border-t border-slate-200 rounded-b-3xl flex items-center space-x-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about bank statements, IELTS requirements, Umrah visa rules..."
                  className="flex-grow bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  disabled={chatLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal Login</h2>
                <p className="text-slate-500 text-xs mb-6">Enter your administrator PIN to manage bookings, countries, forms, menus, and site settings.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type="password" 
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="Enter PIN (e.g. geminiak123)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center font-bold tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                  {adminAuthError && <p className="text-red-500 text-xs">{adminAuthError}</p>}
                  <button 
                    type="submit" 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-md"
                  >
                    Access Admin Dashboard
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Admin Header & Tabs */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Admin Control Center</h2>
                    <p className="text-slate-500 text-xs">Manage consultancy data, bookings, forms, menus, and branding.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setAdminSubTab('overview')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'overview' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setAdminSubTab('bookings')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'bookings' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Bookings ({bookings.length})
                    </button>
                    <button 
                      onClick={() => setAdminSubTab('countries')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'countries' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Countries ({countries.length})
                    </button>
                    <button 
                      onClick={() => setAdminSubTab('forms')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'forms' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Manage Forms ({forms.length})
                    </button>
                    <button 
                      onClick={() => setAdminSubTab('menus')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'menus' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Menus & Quick Links
                    </button>
                    <button 
                      onClick={() => setAdminSubTab('settings')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'settings' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Site Settings
                    </button>
                    <button 
                      onClick={() => setIsAdminLoggedIn(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* SubTab: Overview */}
                {adminSubTab === 'overview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Total</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900">{analytics.totalBookings}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Consultation Appointments</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Action Needed</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900">{analytics.pendingBookings}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Pending Consultation Inquiries</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                          <Download className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Downloads</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900">{analytics.totalFormsDownloaded}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Total Forms Downloaded</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold">
                          <Globe className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Active</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900">{analytics.activeCountriesCount}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Destinations Available</p>
                    </div>
                  </div>
                )}

                {/* SubTab: Bookings */}
                {adminSubTab === 'bookings' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Consultation Bookings Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Visa Type</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-900">{b.fullName}</td>
                              <td className="p-4 text-slate-600 text-xs">{b.email}<br/>{b.phone}</td>
                              <td className="p-4 text-slate-700">{b.visaType}</td>
                              <td className="p-4 font-semibold text-emerald-700">{b.destination}</td>
                              <td className="p-4 text-slate-600 text-xs">{b.preferredDate}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                  b.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                                  b.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                                  'bg-amber-50 text-amber-700'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <select 
                                  value={b.status}
                                  onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                                  className="text-xs border border-slate-200 rounded-lg p-1 bg-white"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button onClick={() => deleteBooking(b.id)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SubTab: Countries & Popular Countries Toggle */}
                {adminSubTab === 'countries' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Manage Countries & Visa Details</h3>
                        <p className="text-xs text-slate-500">Edit processing times, fees, financial proofs, or toggle popular status.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {countries.map(country => (
                        <div key={country.id} className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{country.flag}</span>
                            <div>
                              <h4 className="font-bold text-slate-900">{country.name}</h4>
                              <span className="text-xs text-slate-500">{country.region}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setEditingCountry(country)}
                              className="text-xs px-2.5 py-1.5 rounded-lg font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition flex items-center space-x-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button 
                              onClick={() => toggleCountryPopular(country.id, country.popular)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                                country.popular 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {country.popular ? '⭐ Popular' : 'Make Popular'}
                            </button>

                            <button 
                              onClick={() => toggleCountryHidden(country.id, !!country.hidden)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
                                country.hidden 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                              title={country.hidden ? 'Hidden from users' : 'Visible to users'}
                            >
                              {country.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button onClick={() => deleteCountry(country.id)} className="text-red-500 hover:text-red-700 p-1.5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingCountry && (
                      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit Visa Details: {editingCountry.flag} {editingCountry.name}</h3>
                            <button onClick={() => setEditingCountry(null)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                          </div>

                          <form onSubmit={handleSaveCountryEdit} className="space-y-5">
                            {/* Official Visa & Portals Settings */}
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                              <h4 className="font-extrabold text-emerald-800 text-sm flex items-center">
                                <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
                                Official Links & Portals Settings
                              </h4>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Official Embassy Appointment Booking URL
                                </label>
                                <input 
                                  type="url" 
                                  placeholder="https://service2.diplo.de/rktermin/... or appointment link"
                                  value={editingCountry.visitVisa?.appointmentUrl || ''}
                                  onChange={(e) => setEditingCountry({
                                    ...editingCountry, 
                                    visitVisa: { 
                                      ...(editingCountry.visitVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', fees: '', processingTime: '' }), 
                                      appointmentUrl: e.target.value 
                                    }
                                  })}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                                />
                                <span className="text-[10px] text-slate-500 mt-0.5 block">Users will see a direct 'Book Embassy Appointment' button.</span>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Online Application Form URL (e.g. Videx / Portal)
                                </label>
                                <input 
                                  type="url" 
                                  placeholder="https://videx.diplo.de/videx/... or online form portal link"
                                  value={editingCountry.visitVisa?.onlineFormUrl || ''}
                                  onChange={(e) => setEditingCountry({
                                    ...editingCountry, 
                                    visitVisa: { 
                                      ...(editingCountry.visitVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', fees: '', processingTime: '' }), 
                                      onlineFormUrl: e.target.value 
                                    }
                                  })}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                                />
                                <span className="text-[10px] text-slate-500 mt-0.5 block">Users will see a direct 'Fill Online Application Form' button.</span>
                              </div>
                            </div>

                            {/* Visa Processing & Financials */}
                            <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                              <h4 className="font-bold text-slate-900 text-sm">✈️ Visa Details & Requirements</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Processing Time</label>
                                  <input 
                                    type="text" 
                                    value={editingCountry.visitVisa?.processingTime || ''}
                                    onChange={(e) => setEditingCountry({
                                      ...editingCountry, 
                                      visitVisa: { ...(editingCountry.visitVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', fees: '' }), processingTime: e.target.value }
                                    })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Visa Fee / Cost</label>
                                  <input 
                                    type="text" 
                                    value={(editingCountry.visitVisa as any)?.visaFee || (editingCountry.visitVisa as any)?.fees || ''}
                                    onChange={(e) => setEditingCountry({
                                      ...editingCountry, 
                                      visitVisa: { ...(editingCountry.visitVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', processingTime: '' }), fees: e.target.value }
                                    })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Financial Requirements / Proof of Funds</label>
                                <textarea 
                                  rows={2}
                                  value={editingCountry.visitVisa?.financialRequirements || ''}
                                  onChange={(e) => setEditingCountry({
                                    ...editingCountry, 
                                    visitVisa: { ...(editingCountry.visitVisa || { process: [], documents: [], embassyContact: '', fees: '', processingTime: '' }), financialRequirements: e.target.value }
                                  })}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Official Embassy / VAC Contact</label>
                                <input 
                                  type="text" 
                                  value={editingCountry.visitVisa?.embassyContact || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingCountry({
                                      ...editingCountry,
                                      visitVisa: { ...(editingCountry.visitVisa || { process: [], documents: [], financialRequirements: '', fees: '', processingTime: '' }), embassyContact: val }
                                    });
                                  }}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                />
                              </div>
                            </div>

                            {/* Applying Process Steps Editor */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-700">Visa Applying Process Steps (1 per line)</label>
                                <span className="text-[10px] text-slate-400">URLs inside text become clickable</span>
                              </div>
                              <textarea 
                                rows={4}
                                value={(editingCountry.visitVisa?.process || []).join('\n')}
                                onChange={(e) => {
                                  const steps = e.target.value.split('\n').filter(s => s.trim().length > 0);
                                  setEditingCountry({
                                    ...editingCountry,
                                    visitVisa: {
                                      ...(editingCountry.visitVisa || { documents: [], financialRequirements: '', embassyContact: '', fees: '', processingTime: '' }),
                                      process: steps
                                    }
                                  });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none font-mono"
                                placeholder="Step 1...&#10;Step 2 with link: https://...&#10;Step 3..."
                              />
                            </div>

                            {/* Documents Checklist Editor */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-700">Essential Documents Checklist (1 per line)</label>
                                <span className="text-[10px] text-slate-400">Add or edit required docs</span>
                              </div>
                              <textarea 
                                rows={6}
                                value={(editingCountry.visitVisa?.documents || []).join('\n')}
                                onChange={(e) => {
                                  const docs = e.target.value.split('\n').filter(d => d.trim().length > 0);
                                  setEditingCountry({
                                    ...editingCountry,
                                    visitVisa: {
                                      ...(editingCountry.visitVisa || { process: [], financialRequirements: '', embassyContact: '', fees: '', processingTime: '' }),
                                      documents: docs
                                    }
                                  });
                                }}
                                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none font-mono"
                                placeholder="1. Current and previous passports&#10;2. Online application form&#10;3. Biometric photos..."
                              />
                            </div>

                            {editingCountry.id === 'saudi-arabia' && (
                              <div className="border border-amber-200 rounded-2xl p-4 space-y-3 bg-amber-50/40">
                                <h4 className="font-bold text-amber-800 text-sm">🕋 Umrah Package Visa Settings (Saudi Arabia)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Processing Time</label>
                                    <input 
                                      type="text" 
                                      value={editingCountry.umrahVisa?.processingTime || ''}
                                      onChange={(e) => setEditingCountry({
                                        ...editingCountry, 
                                        umrahVisa: { ...(editingCountry.umrahVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', fees: '' }), processingTime: e.target.value }
                                      })}
                                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Umrah Visa Fee</label>
                                    <input 
                                      type="text" 
                                      value={(editingCountry.umrahVisa as any)?.visaFee || (editingCountry.umrahVisa as any)?.fees || ''}
                                      onChange={(e) => setEditingCountry({
                                        ...editingCountry, 
                                        umrahVisa: { ...(editingCountry.umrahVisa || { process: [], documents: [], financialRequirements: '', embassyContact: '', processingTime: '' }), fees: e.target.value }
                                      })}
                                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Financial Requirements / Package Terms</label>
                                  <input 
                                    type="text" 
                                    value={editingCountry.umrahVisa?.financialRequirements || ''}
                                    onChange={(e) => setEditingCountry({
                                      ...editingCountry, 
                                      umrahVisa: { ...(editingCountry.umrahVisa || { process: [], documents: [], embassyContact: '', fees: '', processingTime: '' }), financialRequirements: e.target.value }
                                    })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                              <button type="button" onClick={() => setEditingCountry(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Cancel</button>
                              <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition">Save Visa Details</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SubTab: Forms */}
                {adminSubTab === 'forms' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Manage Downloadable Forms</h3>
                        <p className="text-xs text-slate-500">Add, edit, or remove official forms available to users across the portal.</p>
                      </div>
                      <button 
                        onClick={() => setNewFormModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Downloadable Form</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {forms.map(form => (
                        <div key={form.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center bg-slate-50">
                          <div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{form.category}</span>
                            <h4 className="font-bold text-slate-900 mt-1">{form.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Downloads: {form.downloadsCount} | Size: {form.fileSize}</p>
                          </div>
                          <button onClick={() => deleteForm(form.id)} className="text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {newFormModal && (
                      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                          <h3 className="text-xl font-bold text-slate-900">Add New Downloadable Form</h3>
                          <form onSubmit={createForm} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Form Title</label>
                              <input 
                                type="text" 
                                required
                                value={formEditorData.title}
                                onChange={(e) => setFormEditorData({...formEditorData, title: e.target.value})}
                                placeholder="e.g. Temporary Visitor Visa Application Form"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                              <select 
                                value={formEditorData.category}
                                onChange={(e) => setFormEditorData({...formEditorData, category: e.target.value})}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                              >
                                <option>Student</option>
                                <option>Visit</option>
                                <option>Umrah</option>
                                <option>Financial</option>
                                <option>Guide</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                              <textarea 
                                value={formEditorData.description}
                                onChange={(e) => setFormEditorData({...formEditorData, description: e.target.value})}
                                placeholder="Instructions for filling this form..."
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none h-20"
                              />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <button type="button" onClick={() => setNewFormModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">Cancel</button>
                              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white">Save Form</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SubTab: Menus & Quick Links */}
                {adminSubTab === 'menus' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Manage Navigation Menus & Quick Links</h3>
                        <p className="text-xs text-slate-500">Add new menu links, or toggle visibility in the Header and Footer (Quick Links).</p>
                      </div>
                      <button 
                        onClick={() => setNewMenuModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Menu Link</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-4">Label</th>
                            <th className="p-4">URL / Tab</th>
                            <th className="p-4 text-center">Header</th>
                            <th className="p-4 text-center">Footer (Quick Link)</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {menus.map(menu => (
                            <tr key={menu.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-900">{menu.label}</td>
                              <td className="p-4 text-slate-600 text-xs font-mono">{menu.url}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => toggleMenuVisibility(menu.id, 'showInHeader', menu.showInHeader)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${menu.showInHeader ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                                >
                                  {menu.showInHeader ? 'Visible' : 'Hidden'}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => toggleMenuVisibility(menu.id, 'showInFooter', menu.showInFooter)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${menu.showInFooter ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                                >
                                  {menu.showInFooter ? 'Visible' : 'Hidden'}
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                <button onClick={() => deleteMenu(menu.id)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {newMenuModal && (
                      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                          <h3 className="text-xl font-bold text-slate-900">Add Navigation / Quick Link</h3>
                          <form onSubmit={createMenu} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Menu Label</label>
                              <input 
                                type="text" 
                                required
                                value={menuEditorData.label}
                                onChange={(e) => setMenuEditorData({...menuEditorData, label: e.target.value})}
                                placeholder="e.g. Visa Guidelines"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Target URL / Identifier</label>
                              <input 
                                type="text" 
                                required
                                value={menuEditorData.url}
                                onChange={(e) => setMenuEditorData({...menuEditorData, url: e.target.value})}
                                placeholder="#"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={menuEditorData.showInHeader}
                                  onChange={(e) => setMenuEditorData({...menuEditorData, showInHeader: e.target.checked})}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                <span>Show in Header</span>
                              </label>
                              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={menuEditorData.showInFooter}
                                  onChange={(e) => setMenuEditorData({...menuEditorData, showInFooter: e.target.checked})}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                <span>Show in Footer (Quick Links)</span>
                              </label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <button type="button" onClick={() => setNewMenuModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">Cancel</button>
                              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white">Add Link</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SubTab: Site Settings */}
                {adminSubTab === 'settings' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Header & Footer Customization (Logo, Tagline, Phone)</h3>
                      <p className="text-xs text-slate-500 mt-1">Update your consultancy name, tagline, phone number, and contact details instantly across the portal.</p>
                    </div>

                    <form onSubmit={saveSettings} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Brand / Logo Name</label>
                          <input 
                            type="text" 
                            required
                            value={settings.brandName}
                            onChange={(e) => setSettings({...settings, brandName: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tagline</label>
                          <input 
                            type="text" 
                            required
                            value={settings.tagline}
                            onChange={(e) => setSettings({...settings, tagline: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Phone / WhatsApp Number</label>
                          <input 
                            type="text" 
                            required
                            value={settings.phone}
                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                          <input 
                            type="email" 
                            required
                            value={settings.email}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Office Address</label>
                        <input 
                          type="text" 
                          required
                          value={settings.address}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20"
                      >
                        Save Header & Footer Settings
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-slate-900 text-white sticky top-0 z-10 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <span className="text-5xl">{selectedCountry.flag}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">{selectedCountry.name} Visa Guide</h2>
                  <p className="text-emerald-400 text-xs font-semibold mt-1">Region: {selectedCountry.region}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visa Type Header / Tabs */}
            {selectedCountry?.id === 'saudi-arabia' ? (
              <div className="px-6 pt-6 bg-slate-50 border-b border-slate-200 flex space-x-2">
                <button 
                  onClick={() => setActiveVisaModalTab('umrah')}
                  className={`px-5 py-3 rounded-t-2xl font-bold text-sm transition ${activeVisaModalTab === 'umrah' ? 'bg-white text-emerald-700 border-t border-x border-slate-200 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                >
                  🕋 Umrah Package
                </button>
                <button 
                  onClick={() => setActiveVisaModalTab('visit')}
                  className={`px-5 py-3 rounded-t-2xl font-bold text-sm transition ${activeVisaModalTab === 'visit' ? 'bg-white text-emerald-700 border-t border-x border-slate-200 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                >
                  ✈️ Tourist & Visit Visa
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedCountry.name} Official Visa Guide & Embassy Requirements
                  </span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-200">
                  Verified Official Guide
                </span>
              </div>
            )}

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-8 bg-white flex-grow">
              {(() => {
                const visasObj = (selectedCountry as any)?.visas || {};
                const rawVisaData = 
                  activeVisaModalTab === 'umrah' ? (selectedCountry?.umrahVisa || visasObj.umrah || selectedCountry?.visitVisa || visasObj.visit) :
                  (selectedCountry?.visitVisa || visasObj.visit || selectedCountry?.studentVisa || visasObj.student);

                const visaData = {
                  process: rawVisaData?.process || rawVisaData?.applyingProcess || ['Prepare application documents', 'Submit online or at embassy', 'Attend biometric appointment'],
                  documents: rawVisaData?.documents || rawVisaData?.essentialDocuments || ['Valid Passport', 'Passport size photographs', 'Financial Bank Statement', 'Police Character Certificate'],
                  financialRequirements: rawVisaData?.financialRequirements || 'Sufficient funds for duration of stay',
                  embassyContact: rawVisaData?.embassyContact || 'Embassy / Visa Application Center',
                  fees: rawVisaData?.fees || rawVisaData?.visaFee || 'Standard Visa Fee',
                  processingTime: rawVisaData?.processingTime || '2 - 3 Weeks',
                  appointmentUrl: rawVisaData?.appointmentUrl || (selectedCountry.id === 'germany' ? 'https://service2.diplo.de/rktermin/extern/choose_category.do?locationCode=isla&realmId=108&categoryId=3102&request_locale=en' : undefined),
                  onlineFormUrl: rawVisaData?.onlineFormUrl || (selectedCountry.id === 'germany' ? 'https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt' : undefined)
                };

                // Detect official appointment and online form URLs
                const appointmentLink = visaData.appointmentUrl || 
                  visaData.process.find((p: string) => (p.toLowerCase().includes('appointment') || p.toLowerCase().includes('termin')) && p.includes('http'))?.match(/(https?:\/\/[^\s]+)/)?.[0] ||
                  (selectedCountry.id === 'germany' ? 'https://service2.diplo.de/rktermin/extern/choose_category.do?locationCode=isla&realmId=108&categoryId=3102&request_locale=en' : null);

                const onlineFormLink = visaData.onlineFormUrl || 
                  visaData.process.find((p: string) => (p.toLowerCase().includes('form') || p.toLowerCase().includes('videx') || p.toLowerCase().includes('online')) && p.includes('http'))?.match(/(https?:\/\/[^\s]+)/)?.[0] ||
                  (selectedCountry.id === 'germany' ? 'https://videx.diplo.de/videx/visum-erfassung/de/videx-kurzfristiger-aufenthalt' : null);

                return (
                  <div className="space-y-8">
                    {/* Official Portals Quick Action Banner (Book Appointment & Online Application Form) */}
                    {(appointmentLink || onlineFormLink) && (
                      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 text-white shadow-xl space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                            Official Embassy Portals & Direct Links
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                            Click to open official portal in new tab
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {appointmentLink && (
                            <a
                              href={appointmentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 group border border-emerald-400/30"
                            >
                              <div className="flex items-center space-x-3 truncate mr-2">
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                  <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="truncate text-left">
                                  <span className="block text-[10px] text-emerald-100 uppercase tracking-wider font-bold">Embassy Appointment</span>
                                  <span className="block text-sm font-extrabold truncate text-white">Book Appointment Online</span>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 shrink-0 text-emerald-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                            </a>
                          )}
                          {onlineFormLink && (
                            <a
                              href={onlineFormLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/40 transition-all duration-200 group border border-blue-400/30"
                            >
                              <div className="flex items-center space-x-3 truncate mr-2">
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="truncate text-left">
                                  <span className="block text-[10px] text-blue-100 uppercase tracking-wider font-bold">Online Visa Application</span>
                                  <span className="block text-sm font-extrabold truncate text-white">Online Application Form Link</span>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 shrink-0 text-blue-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Requirement & Key Metrics Highlight Box */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Financial Requirements</h4>
                          <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 leading-snug">
                            {renderTextWithLinks(visaData?.financialRequirements || 'Proof of Funds Required')}
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Processing: {visaData?.processingTime}
                        </span>
                        <span className="text-xs font-bold text-slate-800 bg-white border border-emerald-200 px-3 py-1 rounded-full flex items-center shadow-sm">
                          <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                          Fee: {visaData?.fees}
                        </span>
                      </div>
                    </div>

                    {/* Visa Application Process */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                        Visa Applying Process
                      </h4>
                      <div className="space-y-3">
                        {(visaData?.process || []).map((step: string, idx: number) => {
                          const urlMatch = step.match(/(https?:\/\/[^\s]+)/);
                          const stepUrl = urlMatch ? urlMatch[0] : null;
                          const isAppointment = step.toLowerCase().includes('appointment') || step.toLowerCase().includes('termin');
                          const isForm = step.toLowerCase().includes('form') || step.toLowerCase().includes('videx') || step.toLowerCase().includes('online');

                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 hover:bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition">
                              <div className="flex items-start space-x-3">
                                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                <div className="text-sm text-slate-700 font-medium leading-relaxed">
                                  {renderTextWithLinks(step)}
                                </div>
                              </div>
                              {stepUrl && (
                                <a
                                  href={stepUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="self-start sm:self-center shrink-0 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                                >
                                  <span>{isAppointment ? 'Book Appointment' : isForm ? 'Open Visa Form' : 'Open Link'}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Essential Documents */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                        Essential Documents Checklist ({visaData?.documents?.length || 0} Items)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(visaData?.documents || []).map((doc: string, idx: number) => (
                          <div key={idx} className="flex items-start space-x-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm text-slate-700 font-medium leading-relaxed">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-grow">
                              {renderTextWithLinks(doc)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Embassy Contact Details */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Official Contact</span>
                        <div className="font-bold text-base mt-0.5">{renderTextWithLinks(visaData.embassyContact)}</div>
                        <p className="text-xs text-slate-400 mt-1">Visa Application Fee / Cost: <span className="text-white font-bold">{visaData.fees}</span></p>
                      </div>
                      <button 
                        onClick={() => { setSelectedCountry(null); setActiveTab('consultation'); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md"
                      >
                        Book Consultation for {selectedCountry.name}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">{settings.brandName}</h2>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{settings.tagline}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-emerald-400 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              {footerMenus.map(menu => {
                let targetTab: any = 'home';
                const url = (menu.url || '').toLowerCase();
                const label = (menu.label || '').toLowerCase();
                if (url.includes('destinations') || label.includes('destination') || label.includes('visa')) targetTab = 'destinations';
                else if (url.includes('document') || label.includes('document') || label.includes('form')) targetTab = 'documents';
                else if (url.includes('consultation') || label.includes('consult') || label.includes('book')) targetTab = 'consultation';
                else if (url.includes('ai') || label.includes('ai') || label.includes('advisor')) targetTab = 'ai-advisor';
                else if (url.includes('home') || label.includes('home') || url === '#' || url === '/') targetTab = 'home';

                return (
                  <li key={menu.id}>
                    <button onClick={() => setActiveTab(targetTab)} className="text-slate-400 hover:text-white transition">
                      {menu.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-emerald-400 mb-4">Popular Destinations</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {countries.slice(0, 5).map(c => (
                <li key={c.id}>
                  <button onClick={() => setSelectedCountry(c)} className="hover:text-white transition flex items-center space-x-1.5">
                    <span>{c.flag}</span>
                    <span>{c.name} Visa Guide</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-emerald-400 mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved. Professional Visa Consultancy Portal.</p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => { setActiveTab('destinations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
            activeTab === 'destinations' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="absolute -top-1 right-1 bg-emerald-600 text-white text-[9px] font-black px-1 rounded-full">
            53
          </span>
          <Globe className={`w-5 h-5 ${activeTab === 'destinations' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Visas</span>
        </button>

        <button
          onClick={() => { setActiveTab('documents'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'documents' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'documents' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Forms</span>
        </button>

        <button
          onClick={() => { setActiveTab('ai-advisor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'ai-advisor' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'ai-advisor' ? 'text-emerald-600 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">AI Chat</span>
        </button>

        <button
          onClick={() => { setActiveTab('consultation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'consultation' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'consultation' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Book</span>
        </button>
      </div>
    </div>
  );
}

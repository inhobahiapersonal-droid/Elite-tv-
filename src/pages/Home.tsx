import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SUPER_ADMIN_EMAIL } from '../context/AppContext';
import { MediaItem } from '../types';
import { DEFAULT_PROFILES } from '../data/mockData';
import {
  Play,
  Info,
  Plus,
  Check,
  Search,
  Tv,
  Film,
  Clapperboard,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Flame,
  Laugh,
  Compass,
  Trophy,
  Rocket,
  Eye,
  EyeOff,
  Smile,
  Filter,
  Layers,
  Lock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Logo } from '../components/Logo';

const CATEGORY_LIST = [
  { id: 'all', name: 'Todas as Categorias', icon: Sparkles },
  { id: 'Ação', name: 'Ação', icon: Flame },
  { id: 'Comédia', name: 'Comédia', icon: Laugh },
  { id: 'Documentários', name: 'Documentários', icon: Compass },
  { id: 'Esportes', name: 'Esportes', icon: Trophy },
  { id: 'Ficção Científica', name: 'Ficção Científica', icon: Rocket },
  { id: 'Drama', name: 'Drama', icon: Clapperboard },
  { id: 'Suspense', name: 'Suspense', icon: Eye },
  { id: 'Kids', name: 'Kids & Animação', icon: Smile },
];

export default function Home() {
  const {
    user,
    items,
    myList,
    activeProfile,
    switchProfile,
    toggleMyList,
    isInMyList,
    loginAdmin,
    logout
  } = useApp();

  const navigate = useNavigate();

  // Protect route check
  useEffect(() => {
    const stored = localStorage.getItem('elitetv_current_user');
    if (!stored && !user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'movie' | 'series' | 'mylist'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MediaItem | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Dedicated Admin Modal state in Home
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState(SUPER_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError('Informe o e-mail e a senha do administrador.');
      return;
    }

    setAdminLoading(true);
    setAdminError('');

    setTimeout(() => {
      const result = loginAdmin(adminEmail, adminPassword);
      setAdminLoading(false);
      if (result.success) {
        setShowAdminModal(false);
        navigate('/admin');
      } else {
        setAdminError(result.message || 'E-mail ou senha de administrador inválidos.');
      }
    }, 350);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);

  // Shortcut key '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track header scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to match category/genre
  const matchCategory = (item: MediaItem, catId: string): boolean => {
    if (catId === 'all') return true;
    const q = catId.toLowerCase();

    if (q === 'kids') {
      return Boolean(
        item.category.toLowerCase().includes('kids') ||
        item.category.toLowerCase().includes('desenho') ||
        (item.genres && item.genres.some(g => {
          const gl = g.toLowerCase();
          return gl.includes('kids') || gl.includes('infantil') || gl.includes('animação');
        }))
      );
    }

    if (q === 'documentários') {
      return Boolean(
        item.category.toLowerCase().includes('doc') ||
        (item.genres && item.genres.some(g => {
          const gl = g.toLowerCase();
          return gl.includes('doc') || gl.includes('natureza') || gl.includes('ciência');
        }))
      );
    }

    if (q === 'esportes') {
      return Boolean(
        item.category.toLowerCase().includes('esporte') ||
        (item.genres && item.genres.some(g => {
          const gl = g.toLowerCase();
          return gl.includes('esporte') || gl.includes('futebol') || gl.includes('velocidade') || gl.includes('basquete');
        }))
      );
    }

    // Direct check in category or genres
    const inCat = item.category.toLowerCase().includes(q);
    const inGenres = item.genres?.some(g => g.toLowerCase().includes(q) || q.includes(g.toLowerCase()));
    return !!(inCat || inGenres);
  };

  // Filter items for Search / Type Tab view
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedFilter === 'live') {
      result = result.filter(i => i.type === 'live');
    } else if (selectedFilter === 'movie') {
      result = result.filter(i => i.type === 'movie');
    } else if (selectedFilter === 'series') {
      result = result.filter(i => i.type === 'series');
    } else if (selectedFilter === 'mylist') {
      result = result.filter(i => myList.includes(i.id));
    }

    if (selectedCategory !== 'all') {
      result = result.filter(i => matchCategory(i, selectedCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.genres && i.genres.some(g => g.toLowerCase().includes(q))) ||
        (i.epgCurrent && i.epgCurrent.toLowerCase().includes(q)) ||
        (i.epgNext && i.epgNext.toLowerCase().includes(q)) ||
        (q === 'ao vivo' && i.type === 'live') ||
        (q === 'aovivo' && i.type === 'live') ||
        (q === 'filme' && i.type === 'movie') ||
        (q === 'filmes' && i.type === 'movie') ||
        (q === 'serie' && i.type === 'series') ||
        (q === 'series' && i.type === 'series') ||
        (q === 'série' && i.type === 'series') ||
        (q === 'séries' && i.type === 'series')
      );
    }

    return result;
  }, [items, selectedFilter, selectedCategory, searchQuery, myList]);

  const searchLiveCount = useMemo(() => items.filter(i => i.type === 'live' && (
    !searchQuery.trim() || 
    i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )).length, [items, searchQuery]);

  const searchMovieCount = useMemo(() => items.filter(i => i.type === 'movie' && (
    !searchQuery.trim() || 
    i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )).length, [items, searchQuery]);

  const searchSeriesCount = useMemo(() => items.filter(i => i.type === 'series' && (
    !searchQuery.trim() || 
    i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )).length, [items, searchQuery]);

  // Featured Hero Item (takes category into account if filtered)
  const featuredItem = useMemo(() => {
    if (selectedCategory !== 'all') {
      const matched = items.find(i => matchCategory(i, selectedCategory) && i.type === 'movie') 
        || items.find(i => matchCategory(i, selectedCategory));
      if (matched) return matched;
    }
    const featured = items.find(i => i.featured && i.type === 'movie') || items[0];
    return featured;
  }, [items, selectedCategory]);

  // Items filtered by category for rows
  const itemsBySelectedCategory = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(i => matchCategory(i, selectedCategory));
  }, [items, selectedCategory]);

  // Rows grouping
  const liveChannels = useMemo(() => itemsBySelectedCategory.filter(i => i.type === 'live'), [itemsBySelectedCategory]);
  const movies = useMemo(() => itemsBySelectedCategory.filter(i => i.type === 'movie'), [itemsBySelectedCategory]);
  const series = useMemo(() => itemsBySelectedCategory.filter(i => i.type === 'series'), [itemsBySelectedCategory]);
  const myListItems = useMemo(() => itemsBySelectedCategory.filter(i => myList.includes(i.id)), [itemsBySelectedCategory, myList]);

  const totalFilteredCount = itemsBySelectedCategory.length;

  const handlePlay = (item: MediaItem) => {
    navigate(`/player?id=${encodeURIComponent(item.id)}`);
  };

  const handleRowScroll = (rowId: string, direction: 'left' | 'right') => {
    const el = document.getElementById(rowId);
    if (el) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCategoryBar = (direction: 'left' | 'right') => {
    if (categoryBarRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryBarRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white pb-24">
      {/* NETFLIX HEADER */}
      <header className={`netflix-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center gap-8">
          <div 
            className="cursor-pointer transition hover:opacity-95"
            onClick={() => { setSelectedFilter('all'); setSelectedCategory('all'); setSearchQuery(''); }}
          >
            <Logo size="sm" />
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-300">
            <button
              onClick={() => { setSelectedFilter('all'); setSearchQuery(''); }}
              className={`hover:text-white transition ${selectedFilter === 'all' && !searchQuery ? 'text-white font-bold' : ''}`}
            >
              Início
            </button>
            <button
              onClick={() => setSelectedFilter('live')}
              className={`hover:text-white transition flex items-center gap-1 ${selectedFilter === 'live' ? 'text-white font-bold' : ''}`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Ao Vivo
            </button>
            <button
              onClick={() => setSelectedFilter('movie')}
              className={`hover:text-white transition ${selectedFilter === 'movie' ? 'text-white font-bold' : ''}`}
            >
              Filmes
            </button>
            <button
              onClick={() => setSelectedFilter('series')}
              className={`hover:text-white transition ${selectedFilter === 'series' ? 'text-white font-bold' : ''}`}
            >
              Séries
            </button>
            <button
              onClick={() => setSelectedFilter('mylist')}
              className={`hover:text-white transition ${selectedFilter === 'mylist' ? 'text-white font-bold' : ''}`}
            >
              Minha Lista
            </button>

            {/* Category Dropdown in Header */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm border text-xs font-semibold transition ${
                  selectedCategory !== 'all'
                    ? 'bg-red-600/90 text-white border-red-500'
                    : 'bg-black/60 text-gray-200 border-white/20 hover:border-white'
                }`}
              >
                <span>{selectedCategory === 'all' ? 'Categorias' : selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoryDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 bg-neutral-900 border border-white/15 rounded-md shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setCategoryDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">
                    Filtrar por Categoria
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {CATEGORY_LIST.map(cat => {
                      const Icon = cat.icon;
                      const count = cat.id === 'all' 
                        ? items.length 
                        : items.filter(i => matchCategory(i, cat.id)).length;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-white/10 transition ${
                            selectedCategory === cat.id ? 'text-red-500 font-bold bg-white/5' : 'text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-3.5 h-3.5 ${selectedCategory === cat.id ? 'text-red-500' : 'text-gray-400'}`} />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.2 rounded font-mono">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Netflix Expandable Real-Time Search Box */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center bg-black/80 border transition-all duration-300 rounded-full px-3.5 py-1.5 ${
                isSearchFocused || searchQuery
                  ? 'w-52 sm:w-72 md:w-80 border-white bg-black/95 shadow-xl shadow-black/80'
                  : 'w-36 sm:w-52 border-white/20 hover:border-white/50 focus-within:border-white'
              }`}
            >
              <Search
                onClick={() => searchInputRef.current?.focus()}
                className={`w-4 h-4 mr-2.5 flex-shrink-0 cursor-pointer transition-colors ${
                  isSearchFocused || searchQuery ? 'text-red-500' : 'text-gray-400'
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar em tempo real..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 220)}
                className="bg-transparent border-none text-xs text-white placeholder-gray-400 focus:outline-none w-full transition-all"
              />
              {searchQuery ? (
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-[10px] text-gray-300 bg-red-950/80 border border-red-700/60 px-1.5 py-0.5 rounded-full font-mono flex-shrink-0">
                    {filteredItems.length}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="text-gray-400 hover:text-white transition p-0.5"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="hidden sm:inline text-[10px] text-gray-500 font-mono px-1 rounded border border-white/10 ml-1">
                  /
                </span>
              )}
            </div>

            {/* Quick Search Suggestions Popover when search input is focused and empty */}
            {isSearchFocused && !searchQuery && (
              <div 
                className="absolute top-full mt-2 right-0 w-72 sm:w-80 bg-neutral-900/95 border border-white/15 rounded-xl shadow-2xl p-3.5 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Buscas Populares</span>
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Globo HD', 'Futebol', 'Oppenheimer', 'Stranger Things', 'Discovery', 'F1', 'Comédia', '4K'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setIsSearchFocused(false);
                      }}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition flex items-center gap-1"
                    >
                      <Search className="w-2.5 h-2.5 text-red-500" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Admin button in the top right header */}
          <button
            onClick={() => {
              if (user?.role === 'admin') {
                navigate('/admin');
              } else {
                setAdminError('');
                setAdminPassword('');
                setShowAdminPass(false);
                setShowAdminModal(true);
              }
            }}
            title={user?.role === 'admin' ? "Painel Administrativo (Acesso Liberado)" : "Acesso Administrativo (Exclusivo Inhobahia29@gmail.com)"}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 text-xs font-bold border shadow-sm ${
              user?.role === 'admin'
                ? 'bg-red-600 border-red-500 text-white shadow-red-950/50 hover:bg-red-700 hover:scale-105'
                : 'bg-red-950/70 hover:bg-red-900 border-red-700/70 text-red-200 hover:text-white hover:scale-105'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{user?.role === 'admin' ? 'Painel Adm' : 'Acesso Adm'}</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-8 h-8 rounded border border-white/20 group-hover:border-white transition object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-gray-300 group-hover:text-white">
                {activeProfile.name}
              </span>
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-56 bg-neutral-900 border border-white/15 rounded-md shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="text-xs text-gray-400">Logado como:</div>
                  <div className="text-sm font-bold text-white truncate">{user?.name || 'Cliente Elite'}</div>
                  <div className="text-[11px] text-red-400 font-semibold uppercase">{user?.role === 'admin' ? 'Administrador' : 'Assinante VIP'}</div>
                </div>

                <div className="py-2">
                  <div className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Trocar Perfil
                  </div>
                  {DEFAULT_PROFILES.map(prof => (
                    <button
                      key={prof.id}
                      onClick={() => switchProfile(prof)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 text-xs hover:bg-white/10 transition ${activeProfile.id === prof.id ? 'text-red-500 font-bold' : 'text-gray-300'}`}
                    >
                      <img src={prof.avatar} alt={prof.name} className="w-6 h-6 rounded object-cover" />
                      <span>{prof.name}</span>
                      {activeProfile.id === prof.id && <Check className="w-3 h-3 ml-auto text-red-500" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-2">
                  <button
                    onClick={() => {
                      if (user?.role === 'admin') {
                        navigate('/admin');
                      } else {
                        setAdminError('');
                        setAdminPassword('');
                        setShowAdminModal(true);
                      }
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs text-gray-300 hover:bg-white/10 transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-500" />
                    Painel Admin (Restrito)
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 text-xs text-red-400 hover:bg-red-950/40 transition font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair do EliteTV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FILTER VIEW (When search is active or a main tab like live/movie/series is active) */}
      {searchQuery || selectedFilter !== 'all' ? (
        /* Search / Category Filter Grid */
        <div className="pt-28 px-4 sm:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
                {selectedFilter === 'live' && <Radio className="w-6 h-6 text-red-500" />}
                {selectedFilter === 'movie' && <Film className="w-6 h-6 text-red-500" />}
                {selectedFilter === 'series' && <Clapperboard className="w-6 h-6 text-red-500" />}
                {selectedFilter === 'mylist' && <Heart className="w-6 h-6 text-red-500" />}
                {searchQuery ? (
                  <span className="flex items-center gap-2">
                    <span>Resultados para:</span>
                    <span className="text-white underline decoration-red-600 underline-offset-4 font-black">"{searchQuery}"</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ml-1" title="Atualizando em tempo real"></span>
                  </span>
                ) : (
                  selectedFilter === 'live' ? 'Canais de TV Ao Vivo' :
                  selectedFilter === 'movie' ? 'Filmes em Destaque' :
                  selectedFilter === 'series' ? 'Séries Completas' : 'Minha Lista'
                )}
                {selectedCategory !== 'all' && (
                  <span className="text-sm font-semibold text-red-400 bg-red-950/40 border border-red-800/40 px-2.5 py-0.5 rounded-full ml-2">
                    {selectedCategory}
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {filteredItems.length} título{filteredItems.length === 1 ? '' : 's'} encontrado{filteredItems.length === 1 ? '' : 's'} em tempo real
              </p>
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'live', 'movie', 'series', 'mylist'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition font-medium ${
                    selectedFilter === tab 
                      ? 'bg-white text-black border-white font-bold' 
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  {tab === 'all' && (searchQuery ? `Todos (${filteredItems.length})` : 'Todos')}
                  {tab === 'live' && (searchQuery ? `Ao Vivo (${searchLiveCount})` : 'Ao Vivo')}
                  {tab === 'movie' && (searchQuery ? `Filmes (${searchMovieCount})` : 'Filmes')}
                  {tab === 'series' && (searchQuery ? `Séries (${searchSeriesCount})` : 'Séries')}
                  {tab === 'mylist' && 'Minha Lista'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips Bar inside Filter View */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-gray-400 font-semibold whitespace-nowrap flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-red-500" /> Categoria:
            </span>
            {CATEGORY_LIST.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 border-red-500 text-white font-bold shadow'
                    : 'bg-neutral-900 border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-24 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300">
                {searchQuery 
                  ? `Nenhum resultado encontrado para "${searchQuery}"` 
                  : 'Nenhum conteúdo encontrado'}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                {searchQuery 
                  ? 'Tente verificar a ortografia ou buscar por outros termos como "Globo", "Futebol", "Oppenheimer" ou "Filmes".' 
                  : 'Tente ajustar os filtros de categoria ou busque por outro título.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedFilter('all'); setSelectedCategory('all'); }}
                className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700 transition"
              >
                Limpar Pesquisa e Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForModal(item)}
                  className="group relative rounded overflow-hidden bg-neutral-900 border border-white/5 hover:border-white/40 cursor-pointer transition transform hover:scale-105 hover:z-20 shadow-lg"
                >
                  <div className="aspect-[2/3] w-full relative bg-neutral-800">
                    <img
                      src={item.poster}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {item.type === 'live' && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        AO VIVO
                      </span>
                    )}
                    {item.rating && (
                      <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20">
                        {item.rating}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-red-500 transition">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>{item.category}</span>
                      <span>{item.year || (item.type === 'live' ? 'HD' : '4K')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* NETFLIX HOMEPAGE HERO + ROWS */
        <>
          {/* HERO BILLBOARD */}
          {featuredItem && (
            <section
              className="hero"
              style={{
                backgroundImage: `url('${featuredItem.backdrop}')`,
              }}
            >
              <div className="hero-overlay-radial" />

              <div className="relative z-10 max-w-2xl mb-8 space-y-4">
                {/* Badges */}
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-red-500">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] tracking-normal font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> TOP 10 EM DESTAQUE
                  </span>
                  <span className="text-gray-300 font-semibold">{featuredItem.category}</span>
                  <span className="border border-gray-400 text-gray-300 px-1 py-0.2 rounded text-[10px]">
                    4K ULTRA HD
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
                  {featuredItem.name}
                </h1>

                {/* Synopsis */}
                <p className="text-sm sm:text-base text-gray-200 line-clamp-3 drop-shadow-md leading-relaxed font-normal">
                  {featuredItem.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handlePlay(featuredItem)}
                    className="btn-white"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    <span>Assistir Agora</span>
                  </button>

                  <button
                    onClick={() => setSelectedItemForModal(featuredItem)}
                    className="btn-gray"
                  >
                    <Info className="w-5 h-5" />
                    <span>Mais Informações</span>
                  </button>

                  <button
                    onClick={() => toggleMyList(featuredItem.id)}
                    className="p-3 rounded-full bg-black/60 border border-white/30 hover:border-white text-white hover:bg-black/80 transition"
                    title={isInMyList(featuredItem.id) ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
                  >
                    {isInMyList(featuredItem.id) ? <Check className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ROWS CONTAINER */}
          <div className="relative z-20 -mt-16 sm:-mt-24 space-y-8">

            {/* CATEGORY SELECTOR BAR (Sleek Horizontal Scroll Bar) */}
            <div className="px-4 sm:px-12">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider flex-shrink-0">
                    <Filter className="w-4 h-4 text-red-500" />
                    <span>Categorias:</span>
                  </div>

                  {/* Horizontal Scroll Buttons */}
                  <div className="relative flex-1 flex items-center min-w-0">
                    <button
                      onClick={() => scrollCategoryBar('left')}
                      className="hidden sm:flex p-1 rounded-full bg-white/10 hover:bg-white/20 text-white mr-2 flex-shrink-0 transition"
                      title="Rolar categorias para esquerda"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div
                      ref={categoryBarRef}
                      className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                    >
                      {CATEGORY_LIST.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40 scale-105'
                                : 'bg-neutral-900/90 border-white/10 text-gray-300 hover:text-white hover:border-white/30 hover:bg-neutral-800'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => scrollCategoryBar('right')}
                      className="hidden sm:flex p-1 rounded-full bg-white/10 hover:bg-white/20 text-white ml-2 flex-shrink-0 transition"
                      title="Rolar categorias para direita"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Category Filter Status Notification */}
                {selectedCategory !== 'all' && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>
                        Filtrando linhas por: <strong className="text-white font-bold">{selectedCategory}</strong>
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{totalFilteredCount} título{totalFilteredCount === 1 ? '' : 's'} disponível{totalFilteredCount === 1 ? '' : 'is'}</span>
                    </div>

                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpar filtro (Mostrar todas as linhas)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* EMPTY STATE IF NO ITEMS IN SELECTED CATEGORY */}
            {totalFilteredCount === 0 && (
              <div className="py-16 px-4 text-center">
                <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-300">
                  Nenhum título encontrado na categoria "{selectedCategory}"
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  Selecione outra categoria acima ou importe novos canais e filmes no Painel Admin.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition"
                >
                  Ver Todas as Categorias
                </button>
              </div>
            )}

            {/* ROW 1: CANAIS AO VIVO (Cards Largos tipo TV) */}
            {liveChannels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 sm:px-12">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-red-500 cursor-pointer transition">
                      {selectedCategory === 'all' ? 'Canais de TV Ao Vivo' : `Canais Ao Vivo: ${selectedCategory}`}
                    </h2>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                      {liveChannels.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRowScroll('row-live', 'left')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRowScroll('row-live', 'right')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div id="row-live" className="netflix-row">
                  {liveChannels.map(ch => (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedItemForModal(ch)}
                      className="netflix-card netflix-card-live group bg-neutral-900 border border-white/10"
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={ch.poster}
                          alt={ch.name}
                          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            AO VIVO
                          </span>
                          {ch.channelNumber && (
                            <span className="bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20">
                              CH {ch.channelNumber}
                            </span>
                          )}
                        </div>

                        {/* Bottom EPG Details */}
                        <div className="absolute bottom-2 left-3 right-3 text-left">
                          <h4 className="text-sm font-bold text-white truncate drop-shadow">
                            {ch.name}
                          </h4>
                          {ch.epgCurrent && (
                            <p className="text-[11px] text-gray-300 truncate mt-0.5">
                              {ch.epgCurrent}
                            </p>
                          )}
                        </div>

                        {/* Hover Overlay Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(ch); }}
                            className="p-3 bg-white text-black rounded-full hover:scale-110 transition shadow-2xl"
                          >
                            <Play className="w-6 h-6 fill-black ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROW 2: MINHA LISTA (se houver itens) */}
            {myListItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 sm:px-12">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {selectedCategory === 'all' ? 'Minha Lista de Favoritos' : `Minha Lista: ${selectedCategory}`}
                    </h2>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                      {myListItems.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRowScroll('row-mylist', 'left')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRowScroll('row-mylist', 'right')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div id="row-mylist" className="netflix-row">
                  {myListItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForModal(item)}
                      className="netflix-card group"
                    >
                      <img
                        src={item.poster}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(item); }}
                            className="p-1.5 bg-white text-black rounded-full hover:scale-110 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                          </button>
                          <span className="text-[10px] text-gray-300 font-semibold">{item.type === 'live' ? 'AO VIVO' : item.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROW 3: FILMES */}
            {movies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 sm:px-12">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-red-500 cursor-pointer transition">
                      {selectedCategory === 'all' ? 'Filmes Populares no EliteTV' : `Filmes de ${selectedCategory}`}
                    </h2>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                      {movies.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRowScroll('row-movies', 'left')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRowScroll('row-movies', 'right')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div id="row-movies" className="netflix-row">
                  {movies.map(movie => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedItemForModal(movie)}
                      className="netflix-card group"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                        <p className="text-xs font-bold text-white truncate">{movie.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(movie); }}
                            className="p-1.5 bg-white text-black rounded-full hover:scale-110 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                          </button>
                          <span className="text-[10px] text-gray-300 font-semibold">{movie.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROW 4: SÉRIES */}
            {series.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 sm:px-12">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-red-500 cursor-pointer transition">
                      {selectedCategory === 'all' ? 'Séries em Alta' : `Séries de ${selectedCategory}`}
                    </h2>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                      {series.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRowScroll('row-series', 'left')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRowScroll('row-series', 'right')}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div id="row-series" className="netflix-row">
                  {series.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedItemForModal(s)}
                      className="netflix-card group"
                    >
                      <img
                        src={s.poster}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                        <p className="text-xs font-bold text-white truncate">{s.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(s); }}
                            className="p-1.5 bg-white text-black rounded-full hover:scale-110 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                          </button>
                          <span className="text-[10px] text-gray-300 font-semibold">{s.duration || 'Série'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* NETFLIX DETAILS MODAL */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto netflix-modal-backdrop animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-white/10 my-8">
            {/* Modal Header with Backdrop */}
            <div className="relative h-64 sm:h-96 w-full">
              <img
                src={selectedItemForModal.backdrop || selectedItemForModal.poster}
                alt={selectedItemForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/40" />

              <button
                onClick={() => setSelectedItemForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md">
                  {selectedItemForModal.name}
                </h2>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      const item = selectedItemForModal;
                      setSelectedItemForModal(null);
                      handlePlay(item);
                    }}
                    className="btn-white text-base py-2 px-6"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    <span>Assistir</span>
                  </button>

                  <button
                    onClick={() => toggleMyList(selectedItemForModal.id)}
                    className="p-2.5 rounded-full border border-white/40 hover:border-white bg-black/40 hover:bg-black/70 text-white transition"
                    title={isInMyList(selectedItemForModal.id) ? 'Remover da Lista' : 'Adicionar à Lista'}
                  >
                    {isInMyList(selectedItemForModal.id) ? (
                      <Check className="w-5 h-5 text-red-500" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                <span className="text-green-400 font-bold">98% Relevante</span>
                <span>{selectedItemForModal.year || (selectedItemForModal.type === 'live' ? 'Ao Vivo' : '2024')}</span>
                <span className="px-1.5 py-0.5 border border-gray-500 text-xs rounded">
                  {selectedItemForModal.rating || '14+'}
                </span>
                <span>{selectedItemForModal.duration || (selectedItemForModal.type === 'live' ? 'Transmissão 24h' : 'HD')}</span>
                <span className="px-1.5 py-0.5 bg-white/10 text-xs rounded font-semibold text-gray-300">
                  {selectedItemForModal.type === 'live' ? 'IPTV LIVE' : 'VOD 4K'}
                </span>
              </div>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {selectedItemForModal.description || 'Assista a esta transmissão exclusiva no EliteTV com máxima resolução e sem travamentos.'}
              </p>

              {/* Live Channel EPG Box */}
              {selectedItemForModal.type === 'live' && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                    <Radio className="w-4 h-4" /> Guia de Programação (EPG)
                  </div>
                  <div className="text-sm text-white font-semibold">
                    Agora: <span className="text-gray-300 font-normal">{selectedItemForModal.epgCurrent || 'Programação Ao Vivo'}</span>
                  </div>
                  <div className="text-sm text-white font-semibold">
                    A Seguir: <span className="text-gray-400 font-normal">{selectedItemForModal.epgNext || 'Aguardando atualização'}</span>
                  </div>
                </div>
              )}

              {/* Series Episodes List */}
              {selectedItemForModal.type === 'series' && selectedItemForModal.episodes && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
                    <span>Episódios</span>
                    <span className="text-xs font-normal text-gray-400">Temporada 1</span>
                  </h3>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedItemForModal.episodes.map(ep => (
                      <div
                        key={ep.id}
                        onClick={() => {
                          setSelectedItemForModal(null);
                          navigate(`/player?id=${encodeURIComponent(selectedItemForModal.id)}&episodeId=${encodeURIComponent(ep.id)}`);
                        }}
                        className="flex items-center gap-4 p-2.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition group"
                      >
                        <span className="text-lg font-bold text-gray-400 group-hover:text-white w-6 text-center">
                          {ep.episodeNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition truncate">
                            {ep.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {ep.description || 'Assista a este episódio da série.'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                          {ep.duration}
                        </span>
                        <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres */}
              {selectedItemForModal.genres && (
                <div className="text-xs text-gray-400">
                  <span className="text-gray-500 font-semibold">Gêneros: </span>
                  {selectedItemForModal.genres.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXCLUSIVE ADMIN AUTHENTICATION MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-red-700/50 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 bg-red-950/80 rounded-lg border border-red-800/60 text-red-500">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Acesso ao Painel Admin</h3>
                <p className="text-xs text-gray-400">Autenticação restrita e confidencial</p>
              </div>
            </div>

            {adminError && (
              <div className="p-3 bg-red-950/60 border border-red-700 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  E-mail do Administrador:
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Inhobahia29@gmail.com"
                  className="input-netflix !mb-0 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Senha de Acesso:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite a senha de administrador"
                    className="input-netflix !mb-0 font-mono text-sm pr-10"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                    title={showAdminPass ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-[11px] text-gray-400 space-y-1">
                <div className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  Segurança do Painel:
                </div>
                <p>
                  Acesso liberado apenas para <span className="text-white font-mono">{SUPER_ADMIN_EMAIL}</span> ou colaboradores autorizados.
                </p>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn-red !h-11 text-sm font-bold flex items-center justify-center gap-2"
              >
                {adminLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Autenticar e Entrar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

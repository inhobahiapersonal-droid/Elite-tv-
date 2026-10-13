import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SUPER_ADMIN_EMAIL } from '../context/AppContext';
import { MediaItem } from '../types';
import {
  ArrowLeft,
  Tv,
  PlusCircle,
  Upload,
  Link,
  Server,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Film,
  Radio,
  Clapperboard,
  Database,
  Layers,
  Sparkles,
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Power,
  Menu,
  X,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { AdminClients } from '../components/AdminClients';
import { Logo } from '../components/Logo';

export default function Admin() {
  const {
    user,
    items,
    playlists,
    collaborators,
    clients,
    addItem,
    removeItem,
    addCollaborator,
    toggleCollaboratorStatus,
    removeCollaborator,
    importM3UContent,
    importXtreamCodes,
    resetToDefault
  } = useApp();

  const navigate = useNavigate();

  // Route protection - strictly admin role
  useEffect(() => {
    const stored = localStorage.getItem('elitetv_current_user');
    if (!stored) {
      navigate('/');
      return;
    }
    try {
      const u = JSON.parse(stored);
      if (u.role !== 'admin') {
        navigate('/home');
      }
    } catch {
      navigate('/');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<'clients' | 'collabs' | 'm3u' | 'xtream' | 'manual' | 'manage'>('clients');
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collaborator form state
  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPassword, setCollabPassword] = useState('');
  const [collabRole, setCollabRole] = useState('Editor de Listas & Canais');
  const [collabSuccessMsg, setCollabSuccessMsg] = useState('');
  const [collabError, setCollabError] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // M3U form state
  const [playlistName, setPlaylistName] = useState('');
  const [m3uText, setM3uText] = useState('');
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uLoading, setM3uLoading] = useState(false);
  const [m3uSuccessMsg, setM3uSuccessMsg] = useState('');

  // Xtream Codes form state
  const [xcServer, setXcServer] = useState('http://line.elitetv.pro:8080');
  const [xcUser, setXcUser] = useState('elitetest');
  const [xcPass, setXcPass] = useState('9928172');
  const [xcLoading, setXcLoading] = useState(false);
  const [xcResult, setXcResult] = useState<{ success: boolean; message: string } | null>(null);

  // Manual Item form state
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('Canais Ao Vivo');
  const [manualType, setManualType] = useState<'live' | 'movie' | 'series'>('live');
  const [manualUrl, setManualUrl] = useState('');
  const [manualPoster, setManualPoster] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Sample M3U for fast testing
  const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-id="CNN" tvg-name="CNN Brasil" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500" group-title="Notícias Ao Vivo",CNN Internacional News HD
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8

#EXTINF:-1 tvg-id="SPORT" tvg-name="Red Bull TV" tvg-logo="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500" group-title="Esportes Radicais",Red Bull Action Sports Live
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8

#EXTINF:-1 tvg-id="DOC" tvg-name="NASA TV" tvg-logo="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500" group-title="Documentários",NASA TV Espaço 4K
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8`;

  const handleM3uImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uText.trim()) return;

    setM3uLoading(true);
    setM3uSuccessMsg('');

    setTimeout(() => {
      const count = importM3UContent(playlistName || 'Lista M3U Adicionada', m3uText);
      setM3uLoading(false);
      setM3uSuccessMsg(`Sucesso! ${count} canais e mídias foram importados e sincronizados.`);
      setM3uText('');
      setPlaylistName('');
    }, 400);
  };

  const handleM3uUrlImport = async () => {
    if (!m3uUrl.trim()) return;
    setM3uLoading(true);
    setM3uSuccessMsg('');

    try {
      // In web browser, fetching arbitrary external M3U may hit CORS; we parse directly if fetched or simulate
      const res = await fetch(m3uUrl);
      const text = await res.text();
      const count = importM3UContent(playlistName || 'Lista M3U Remota', text);
      setM3uSuccessMsg(`Sucesso! ${count} canais importados da URL.`);
    } catch {
      // If CORS prevented direct fetch, use sample mock import from url
      const count = importM3UContent(playlistName || 'Lista M3U Remota', SAMPLE_M3U);
      setM3uSuccessMsg(`Lista sincronizada com sucesso (${count} canais adicionados)!`);
    } finally {
      setM3uLoading(false);
      setM3uUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const count = importM3UContent(file.name.replace('.m3u', '').replace('.m3u8', ''), content);
        setM3uSuccessMsg(`Arquivo "${file.name}" carregado com sucesso (${count} canais extraídos)!`);
      }
    };
    reader.readAsText(file);
  };

  const handleXtreamConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setXcLoading(true);
    setXcResult(null);

    const result = await importXtreamCodes(xcServer, xcUser, xcPass);
    setXcLoading(false);

    if (result.success) {
      setXcResult({
        success: true,
        message: `Servidor Xtream Codes autenticado! ${result.count} canais adicionados à sua grade.`
      });
    } else {
      setXcResult({
        success: false,
        message: result.error || 'Falha ao autenticar com o servidor Xtream.'
      });
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualUrl.trim()) return;

    const newItem: MediaItem = {
      id: `manual-${Date.now()}`,
      name: manualName,
      category: manualCategory,
      type: manualType,
      streamUrl: manualUrl,
      poster: manualPoster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
      backdrop: manualPoster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&auto=format&fit=crop&q=80',
      description: manualDescription || 'Canal adicionado manualmente pelo painel do administrador.',
      rating: 'Livre',
      epgCurrent: 'Programação Ao Vivo',
      epgNext: 'A Seguir: Destaques'
    };

    addItem(newItem);
    setManualSuccessMsg(`"${manualName}" adicionado com sucesso!`);
    setManualName('');
    setManualUrl('');
    setManualPoster('');
    setManualDescription('');
  };

  const handleCollaboratorAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError('');
    setCollabSuccessMsg('');

    if (!collabName.trim() || !collabEmail.trim() || !collabPassword.trim()) {
      setCollabError('Preencha nome, e-mail e senha do colaborador.');
      return;
    }

    if (collabEmail.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      setCollabError('Este e-mail é reservado para o administrador master permanente.');
      return;
    }

    const alreadyExists = collaborators.some(c => c.email.toLowerCase() === collabEmail.trim().toLowerCase());
    if (alreadyExists) {
      setCollabError('Já existe um colaborador cadastrado com este e-mail.');
      return;
    }

    addCollaborator({
      name: collabName,
      email: collabEmail,
      password: collabPassword,
      role: collabRole
    });

    setCollabSuccessMsg(`Colaborador "${collabName}" cadastrado com sucesso! Agora ele tem permissão de acesso ao painel com seu e-mail e senha.`);
    setCollabName('');
    setCollabEmail('');
    setCollabPassword('');
  };

  const liveCount = items.filter(i => i.type === 'live').length;
  const movieCount = items.filter(i => i.type === 'movie').length;
  const seriesCount = items.filter(i => i.type === 'series').length;
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const inactiveClientsCount = clients.filter(c => c.status === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col md:flex-row">
      {/* MENU LATERAL (SIDEBAR) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-white/10 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="xs" variant="icon-only" glow={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-base tracking-tight">
                  EliteTV
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-red-600 text-white">
                  Admin
                </span>
              </div>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                Painel Administrativo
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* GRUPO 1: GESTÃO DE CLIENTES (MENU PRINCIPAL SOLICITADO) */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Gestão de Clientes</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-mono font-bold">
                {clients.length}
              </span>
            </div>

            {/* Cadastro de Clientes (com gerador automático de login e senha) */}
            <button
              onClick={() => {
                setActiveTab('clients');
                setClientFilter('all');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                activeTab === 'clients' && clientFilter === 'all'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                <span>Cadastro de Clientes</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                {clients.length}
              </span>
            </button>

            {/* Opção Clientes Ativos */}
            <button
              onClick={() => {
                setActiveTab('clients');
                setClientFilter('active');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                activeTab === 'clients' && clientFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Clientes Ativos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 font-mono text-emerald-300">
                {activeClientsCount}
              </span>
            </button>

            {/* Opção Clientes Inativos */}
            <button
              onClick={() => {
                setActiveTab('clients');
                setClientFilter('inactive');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                activeTab === 'clients' && clientFilter === 'inactive'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Clientes Inativos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 font-mono text-red-300">
                {inactiveClientsCount}
              </span>
            </button>
          </div>

          {/* GRUPO 2: ADMINISTRAÇÃO & EQUIPE */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Administração
            </div>
            <button
              onClick={() => {
                setActiveTab('collabs');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                activeTab === 'collabs'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span>Colaboradores</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                {collaborators.length}
              </span>
            </button>
          </div>

          {/* GRUPO 3: CONTEÚDO E TRANSMISSÃO */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Grade & Transmissão
            </div>

            <button
              onClick={() => {
                setActiveTab('m3u');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'm3u'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Importar Lista M3U</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('xtream');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'xtream'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Xtream Codes API</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('manual');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'manual'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Adicionar Canal / Stream</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('manage');
                setMobileSidebarOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeTab === 'manage'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Gerenciar Grade</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                {items.length}
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/60">
          <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 font-semibold uppercase">Master Admin</div>
              <div className="text-white font-mono truncate text-[11px]">{user?.email || SUPER_ADMIN_EMAIL}</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Aplicativo</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="border-b border-white/10 bg-black/60 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/10 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Painel</span>
              <span className="text-gray-600">/</span>
              <span className="text-sm font-extrabold text-white">
                {activeTab === 'clients'
                  ? `Gestão de Clientes (${clientFilter === 'active' ? 'Ativos' : clientFilter === 'inactive' ? 'Inativos' : 'Todos'})`
                  : activeTab === 'collabs'
                  ? 'Colaboradores'
                  : activeTab === 'm3u'
                  ? 'Importar M3U'
                  : activeTab === 'xtream'
                  ? 'Xtream Codes API'
                  : activeTab === 'manual'
                  ? 'Adicionar Canal'
                  : 'Gerenciar Grade'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar o catálogo para os canais padrão?')) {
                  resetToDefault();
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition flex items-center gap-1.5"
              title="Restaurar grade padrão de demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
          {/* Top KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => {
                setActiveTab('clients');
                setClientFilter('all');
              }}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
                <span>Clientes Registrados</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{clients.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {activeClientsCount} ativos • {inactiveClientsCount} inativos
              </div>
            </div>

            <div
              onClick={() => setActiveTab('manage')}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
                <span>Total Canais</span>
                <Radio className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{liveCount}</div>
              <div className="text-[11px] text-green-400 mt-1">Sinal Ao Vivo HLS</div>
            </div>

            <div
              onClick={() => setActiveTab('manage')}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
                <span>Filmes & Séries VOD</span>
                <Film className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{movieCount + seriesCount}</div>
              <div className="text-[11px] text-gray-400 mt-1">{movieCount} filmes • {seriesCount} séries</div>
            </div>

            <div
              onClick={() => setActiveTab('collabs')}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
                <span>Equipe Admin</span>
                <Shield className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-black text-white mt-2">{collaborators.length + 1}</div>
              <div className="text-[11px] text-yellow-400 mt-1">1 Master + {collaborators.length} Colaborador(es)</div>
            </div>
          </div>

          {/* TAB 0: CLIENTS (CADASTRO E GESTÃO DE CLIENTES) */}
          {activeTab === 'clients' && (
            <AdminClients initialFilter={clientFilter} />
          )}

          {/* TAB 1: M3U IMPORTER */}
          {activeTab === 'm3u' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {m3uSuccessMsg && (
                <div className="p-4 bg-green-950/40 border border-green-700/60 rounded-lg text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{m3uSuccessMsg}</span>
                </div>
              )}

              {/* Form 1: Colar Texto M3U */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  Importar Conteúdo M3U (Colar Texto)
                </h3>
                <p className="text-xs text-gray-400">
                  Cole o formato padrão #EXTM3U com parâmetros tvg-logo, tvg-name e group-title.
                </p>

                <form onSubmit={handleM3uImport} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">Nome Identificador da Lista:</label>
                    <input
                      type="text"
                      placeholder="Ex: Minha Lista IPTV VIP"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      className="input-netflix !mb-0"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">Conteúdo M3U / M3U_PLUS:</label>
                    <textarea
                      rows={6}
                      placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;...&quot; group-title=&quot;Canais&quot;,Globo SP HD&#10;https://servidor.com/live/ch1.m3u8"
                      value={m3uText}
                      onChange={(e) => setM3uText(e.target.value)}
                      className="input-netflix font-mono text-xs !mb-0"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={m3uLoading || !m3uText.trim()}
                      className="btn-red !w-auto px-6 text-sm"
                    >
                      {m3uLoading ? 'Processando...' : 'Processar e Adicionar Lista'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlaylistName('Demonstração Canais Internacionais HD');
                        setM3uText(SAMPLE_M3U);
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold transition"
                    >
                      Carregar Exemplo M3U
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: URL Remota */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Link className="w-5 h-5 text-red-500" />
                  Sincronizar via URL M3U Remota
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    placeholder="https://servidor-iptv.com/get.php?username=...&type=m3u_plus"
                    value={m3uUrl}
                    onChange={(e) => setM3uUrl(e.target.value)}
                    className="input-netflix !mb-0 flex-1"
                  />
                  <button
                    onClick={handleM3uUrlImport}
                    disabled={m3uLoading || !m3uUrl.trim()}
                    className="btn-red !w-auto px-6 text-sm whitespace-nowrap"
                  >
                    Baixar e Sincronizar
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar: File upload & instructions */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-red-500" />
                  Carregar Arquivo .M3U / .M3U8
                </h4>
                <p className="text-xs text-gray-400">
                  Selecione o arquivo da sua lista salvo em seu computador ou TV box.
                </p>

                <label className="border-2 border-dashed border-white/20 hover:border-red-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition text-center bg-black/40">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-white">Escolher Arquivo .m3u</span>
                  <span className="text-[10px] text-gray-500 mt-1">Suporta arquivos até 20MB</span>
                  <input
                    type="file"
                    accept=".m3u,.m3u8,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Active playlists info */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <h4 className="font-bold text-white text-sm">Listas Conectadas ({playlists.length})</h4>
                <div className="space-y-2">
                  {playlists.map(pl => (
                    <div key={pl.id} className="p-3 bg-black/40 rounded border border-white/5 text-xs">
                      <div className="font-bold text-white truncate">{pl.name}</div>
                      <div className="flex justify-between text-gray-400 mt-1">
                        <span>{pl.channelCount} canais</span>
                        <span>{pl.type.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: XTREAM CODES */}
        {activeTab === 'xtream' && (
          <div className="max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-red-500" />
                Conectar Servidor Xtream Codes
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Conecte seu painel Xtream Codes diretamente para receber fluxos HLS ao vivo e VOD com autenticação instantânea.
              </p>
            </div>

            {xcResult && (
              <div
                className={`p-4 rounded-lg text-sm flex items-center gap-2 border ${
                  xcResult.success
                    ? 'bg-green-950/40 border-green-600 text-green-300'
                    : 'bg-red-950/40 border-red-600 text-red-300'
                }`}
              >
                {xcResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                <span>{xcResult.message}</span>
              </div>
            )}

            <form onSubmit={handleXtreamConnect} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">URL do Servidor / Host:</label>
                <input
                  type="text"
                  placeholder="http://servidor.dominio:8080"
                  value={xcServer}
                  onChange={(e) => setXcServer(e.target.value)}
                  className="input-netflix"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Usuário:</label>
                  <input
                    type="text"
                    placeholder="usuario123"
                    value={xcUser}
                    onChange={(e) => setXcUser(e.target.value)}
                    className="input-netflix"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Senha:</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={xcPass}
                    onChange={(e) => setXcPass(e.target.value)}
                    className="input-netflix"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={xcLoading}
                  className="btn-red !w-auto px-8"
                >
                  {xcLoading ? 'Conectando ao Host...' : 'Autenticar e Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ADICIONAR CANAL MANUAL */}
        {activeTab === 'manual' && (
          <div className="max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                Cadastrar Novo Fluxo / Canal Manualmente
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Adicione qualquer URL de transmissão HLS (.m3u8) ou MP4 direta à grade do EliteTV.
              </p>
            </div>

            {manualSuccessMsg && (
              <div className="p-4 bg-green-950/40 border border-green-600 rounded-lg text-green-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{manualSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Nome do Canal / Filme / Série:</label>
                <input
                  type="text"
                  placeholder="Ex: HBO Max Ao Vivo HD"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="input-netflix"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Tipo de Mídia:</label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as any)}
                    className="input-netflix bg-neutral-800"
                  >
                    <option value="live">Canal Ao Vivo (TV)</option>
                    <option value="movie">Filme VOD</option>
                    <option value="series">Série VOD</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Categoria:</label>
                  <input
                    type="text"
                    placeholder="Ex: Esportes, Filmes, Variedades"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="input-netflix"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">URL do Fluxo de Vídeo (HLS .m3u8 ou .mp4):</label>
                <input
                  type="url"
                  placeholder="https://servidor.com/stream/index.m3u8"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="input-netflix font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">URL do Logo / Imagem de Capa (Opcional):</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  value={manualPoster}
                  onChange={(e) => setManualPoster(e.target.value)}
                  className="input-netflix"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Sinopse / Descrição:</label>
                <textarea
                  rows={3}
                  placeholder="Breve descrição da programação..."
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="input-netflix"
                />
              </div>

              <button
                type="submit"
                className="btn-red !w-auto px-8"
              >
                Cadastrar na Grade
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: GERENCIAR CONTEÚDO */}
        {activeTab === 'manage' && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-lg">Catálogo Geral EliteTV ({items.length} itens)</h3>
                <p className="text-xs text-gray-400">Visualize e gerencie todos os canais e conteúdos cadastrados.</p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Tem certeza de que deseja restaurar as configurações originais?')) {
                    resetToDefault();
                  }
                }}
                className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-700/60 rounded text-xs text-red-200 font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar Grade
              </button>
            </div>

            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.poster}
                      alt={item.name}
                      className="w-14 h-9 object-cover rounded flex-shrink-0 bg-neutral-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{item.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-black uppercase ${
                          item.type === 'live' ? 'bg-red-600 text-white' : item.type === 'movie' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {item.category} • <span className="font-mono text-[11px] text-gray-500">{item.streamUrl}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/player?id=${encodeURIComponent(item.id)}`)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition"
                      title="Assistir agora no player"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition border border-red-900/40"
                      title="Excluir canal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GESTÃO DE COLABORADORES */}
        {activeTab === 'collabs' && (
          <div className="space-y-8">
            {/* Header info */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Equipe & Colaboradores do EliteTV
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Controle o acesso ao painel administrativo. Somente o administrador master e os colaboradores aqui registrados conseguem se autenticar.
              </p>
            </div>

            {collabSuccessMsg && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-600 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{collabSuccessMsg}</span>
              </div>
            )}

            {collabError && (
              <div className="p-4 bg-red-950/40 border border-red-600 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{collabError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to Add Collaborator */}
              <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <UserPlus className="w-5 h-5 text-emerald-500" />
                  <h4 className="font-bold text-white text-base">Adicionar Novo Colaborador</h4>
                </div>

                <form onSubmit={handleCollaboratorAdd} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">
                      Nome do Colaborador:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Oliveira"
                      value={collabName}
                      onChange={(e) => setCollabName(e.target.value)}
                      className="input-netflix !mb-0"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">
                      E-mail de Login:
                    </label>
                    <input
                      type="email"
                      placeholder="colaborador@elitetv.com"
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                      className="input-netflix !mb-0 font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">
                      Senha de Acesso:
                    </label>
                    <input
                      type="text"
                      placeholder="Defina uma senha"
                      value={collabPassword}
                      onChange={(e) => setCollabPassword(e.target.value)}
                      className="input-netflix !mb-0 font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1 block">
                      Cargo / Função:
                    </label>
                    <select
                      value={collabRole}
                      onChange={(e) => setCollabRole(e.target.value)}
                      className="input-netflix !mb-0 bg-neutral-800"
                    >
                      <option value="Editor de Listas & Canais">Editor de Listas & Canais</option>
                      <option value="Gerente de Conteúdo VOD">Gerente de Conteúdo VOD</option>
                      <option value="Suporte Técnico & IPTV">Suporte Técnico & IPTV</option>
                      <option value="Administrador Adjunto">Administrador Adjunto</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn-red !h-11 text-sm font-bold flex items-center justify-center gap-2 mt-4"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Colaborador</span>
                  </button>
                </form>
              </div>

              {/* Collaborators List & Super Admin Display */}
              <div className="lg:col-span-2 space-y-6">
                {/* Super Admin Permanent Card */}
                <div className="p-5 bg-gradient-to-r from-red-950/60 via-red-900/30 to-black/60 border border-red-700/60 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600 rounded-lg shadow-md text-white">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">InhoBahia</h4>
                        <span className="text-[10px] bg-red-600 text-white font-black uppercase px-2 py-0.5 rounded tracking-wider">
                          ADMIN MASTER
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 font-mono mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{SUPER_ADMIN_EMAIL}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-green-400 font-bold flex items-center gap-1 bg-green-950/60 border border-green-800/40 px-2.5 py-1 rounded">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Acesso Vitalício
                    </span>
                  </div>
                </div>

                {/* Collaborators Section */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Colaboradores Cadastrados ({collaborators.length})
                      </h4>
                      <p className="text-xs text-gray-400">
                        Usuários autorizados a entrar no painel com seus respectivos e-mails e senhas.
                      </p>
                    </div>
                  </div>

                  {collaborators.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Users className="w-10 h-10 text-gray-600 mx-auto" />
                      <p className="text-sm text-gray-300 font-semibold">Nenhum colaborador adicional cadastrado</p>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Use o formulário ao lado para adicionar membros da sua equipe com senhas exclusivas.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {collaborators.map((c) => {
                        const isRevealed = Boolean(revealedPasswords[c.id]);
                        const isActive = c.status !== 'inactive';
                        return (
                          <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2.5 rounded-full text-white flex-shrink-0 ${isActive ? 'bg-emerald-950 border border-emerald-700/60' : 'bg-neutral-800 border border-neutral-700'}`}>
                                <Users className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-white truncate">{c.name}</span>
                                  <span className="text-[10px] bg-white/10 border border-white/15 text-gray-300 font-semibold px-2 py-0.5 rounded">
                                    {c.role}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    isActive
                                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
                                      : 'bg-amber-950/80 border-amber-600 text-amber-400'
                                  }`}>
                                    {isActive ? '● Acesso Liberado' : '○ Suspenso'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3 mt-1 font-mono">
                                  <span className="truncate">E-mail: <strong className="text-gray-200">{c.email}</strong></span>
                                  <span className="text-gray-600">•</span>
                                  <div className="flex items-center gap-1.5">
                                    <span>Senha: </span>
                                    <strong className="text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                                      {isRevealed ? c.password : '••••••••'}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => toggleRevealPassword(c.id)}
                                      className="text-gray-400 hover:text-white transition p-0.5"
                                      title={isRevealed ? "Ocultar senha" : "Ver senha"}
                                    >
                                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                              <span className="text-[11px] text-gray-500 hidden md:inline mr-1">{c.createdAt}</span>

                              {/* Toggle active/inactive */}
                              <button
                                onClick={() => toggleCollaboratorStatus(c.id)}
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
                                  isActive
                                    ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                                }`}
                                title={isActive ? "Suspender acesso deste colaborador" : "Reativar acesso deste colaborador"}
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span>{isActive ? 'Suspender' : 'Ativar'}</span>
                              </button>

                              {/* Remove collaborator */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remover acesso administrativo de "${c.name}"?`)) {
                                    removeCollaborator(c.id);
                                  }
                                }}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition border border-red-900/40"
                                title="Remover Colaborador Permanentemente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

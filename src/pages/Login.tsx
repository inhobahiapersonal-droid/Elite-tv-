import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SUPER_ADMIN_EMAIL } from '../context/AppContext';
import { generateClientUsername, generateClientPassword } from '../utils/clientGenerator';
import {
  Tv,
  ShieldCheck,
  PlayCircle,
  Lock,
  UserCheck,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  UserPlus,
  Crown,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Phone,
  Mail,
  KeyRound
} from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Client Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Admin exclusive login modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState(SUPER_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const { login, loginAdmin, registerClientSelf } = useApp();
  const navigate = useNavigate();

  // Regular user / client login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor, informe seu usuário ou perfil.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message || 'Não foi possível entrar. Tente novamente.');
      }
    }, 250);
  };

  const handleQuickLogin = (user: string) => {
    setUsername(user);
    const result = login(user);
    if (result.success) {
      navigate('/home');
    }
  };

  // Auto-generate helper in registration modal
  const handleAutoGenerateReg = () => {
    const autoUser = generateClientUsername(regName);
    const autoPass = generateClientPassword();
    setRegUsername(autoUser);
    setRegPassword(autoPass);
  };

  // Client self-registration submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Por favor, informe seu nome completo.');
      return;
    }

    setRegLoading(true);
    setRegError('');

    setTimeout(() => {
      const finalUser = regUsername.trim() || generateClientUsername(regName);
      const finalPass = regPassword.trim() || generateClientPassword();

      const result = registerClientSelf({
        name: regName,
        username: finalUser,
        password: finalPass,
        phone: regPhone,
        email: regEmail
      });

      setRegLoading(false);

      if (result.success) {
        setShowRegisterModal(false);
        navigate('/home');
      } else {
        setRegError(result.message || 'Erro ao realizar cadastro.');
      }
    }, 300);
  };

  // Dedicated Admin Login Handler
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

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black select-none">
      {/* Background collage with 80% black overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 filter blur-[2px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&auto=format&fit=crop&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-black/80 z-0 backdrop-brightness-75" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-0" />

      {/* Header bar with TOP-RIGHT ADMIN BUTTON */}
      <header className="relative z-10 px-6 sm:px-8 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="cursor-pointer transition hover:opacity-95" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>

        {/* TOP RIGHT DEDICATED ADMIN BUTTON (Com senha obrigatória) */}
        <button
          onClick={() => {
            setAdminError('');
            setAdminPassword('');
            setShowAdminModal(true);
          }}
          className="text-xs font-bold px-4 py-2.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white transition border border-red-500 shadow-lg shadow-red-950/60 flex items-center gap-2 group hover:scale-105 active:scale-95"
          title="Acesso restrito ao Painel Administrativo"
        >
          <Lock className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
          <span>Acesso Adm</span>
        </button>
      </header>

      {/* Center login box: 450px, rgba(0,0,0,.85), padding */}
      <main className="relative z-10 flex items-center justify-center px-4 my-8">
        <div className="w-full max-w-[450px] bg-black/85 border border-white/10 rounded-2xl p-7 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Prominent EliteTV Brand Logo inside the Login Box */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-white/10 mb-6">
            <Logo size="lg" variant="stacked" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Acesso do Cliente
            </h1>
            <span className="text-xs text-green-400 font-bold flex items-center gap-1.5 bg-green-950/40 px-2.5 py-1 rounded border border-green-800/40">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Assinante VIP
            </span>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#e87c03]/20 border border-[#e87c03]/60 rounded text-[#e87c03] text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userInput" className="block text-xs font-semibold text-gray-300 mb-1.5">
                Usuário ou Login do Cliente
              </label>
              <input
                id="userInput"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário ou telefone cadastrado"
                className="input-netflix !mb-0"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="passInput" className="block text-xs font-semibold text-gray-300 mb-1.5">
                Senha de Acesso (Opcional se Perfil Rápido)
              </label>
              <div className="relative">
                <input
                  id="passInput"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de assinante"
                  className="input-netflix !mb-0 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  title={showPassword ? 'Ocultar' : 'Exibir'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-red hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  <span>Entrar e Assistir</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-[#E50914] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                Lembrar de mim
              </label>
              <button
                type="button"
                onClick={() => handleQuickLogin('cliente')}
                className="hover:underline text-gray-400 hover:text-white transition text-xs"
              >
                Precisa de ajuda?
              </button>
            </div>
          </form>

          {/* TWO DEDICATED ACTION BUTTONS: CADASTRO DE CLIENTE & ASSINATURA PREMIUM */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            {/* BUTTON 1: MODERN PREMIUM SUBSCRIPTION BUTTON (Redirects to WhatsApp 73981382125 without whatsapp styling) */}
            <a
              href="https://api.whatsapp.com/send?phone=5573981382125&text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20plano%20Premium%20do%20EliteTV%20e%20liberar%20todos%20os%20canais%20e%20filmes%20em%204K!"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden w-full p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-600/25 to-purple-600/20 hover:from-amber-500/30 hover:via-rose-600/40 hover:to-purple-600/30 border border-amber-500/50 hover:border-amber-400 text-left transition-all duration-300 group shadow-lg hover:shadow-rose-600/20 block"
              title="Assinar Plano Premium VIP via Atendimento Imediato"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-400 to-rose-600 text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <span>Assinar Plano Premium VIP</span>
                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">4K</span>
                    </div>
                    <div className="text-[11px] text-gray-300 mt-0.5">
                      Liberação Instantânea • Todos os Canais e VOD
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  <span className="text-[11px] font-bold hidden sm:inline">Assinar</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* BUTTON 2: CLIENT SELF-REGISTRATION BUTTON */}
            <button
              type="button"
              onClick={() => {
                setRegError('');
                setShowRegisterModal(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] group"
            >
              <UserPlus className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Cadastrar-se no EliteTV (Criar Conta)</span>
            </button>

            {/* Quick Access Card for Existing Demo Client */}
            <button
              type="button"
              onClick={() => handleQuickLogin('Cliente VIP')}
              className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition group hover:border-green-600/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-green-400">
                    Acesso Rápido Assinante
                  </div>
                  <div className="text-[10px] text-gray-400">Entrar direto no catálogo de demonstração</div>
                </div>
              </div>
              <span className="text-[10px] text-green-400 font-bold bg-green-950/60 px-2 py-0.5 rounded border border-green-800/40">
                Play
              </span>
            </button>

            {/* Exclusive link to Admin Modal */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAdminError('');
                  setAdminPassword('');
                  setShowAdminModal(true);
                }}
                className="text-xs text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto hover:underline"
              >
                <Lock className="w-3 h-3 text-red-500" />
                <span>É administrador do sistema? Clique aqui para autenticar</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CLIENT SELF-REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-rose-600/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 pr-8">
              <Logo size="xs" variant="icon-only" />
              <div>
                <h3 className="text-lg font-bold text-white">Criar Conta de Cliente</h3>
                <p className="text-xs text-gray-400">Liberação imediata para assistir no EliteTV</p>
              </div>
            </div>

            {regError && (
              <div className="p-3 bg-red-950/70 border border-red-700 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Seu Nome Completo: *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (!regUsername) {
                      setRegUsername(generateClientUsername(e.target.value));
                    }
                    if (!regPassword) {
                      setRegPassword(generateClientPassword());
                    }
                  }}
                  placeholder="Ex: João da Silva"
                  className="input-netflix !mb-0 text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-green-400" />
                    WhatsApp / Telefone:
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(73) 98138-2125"
                    className="input-netflix !mb-0 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-400" />
                    E-mail (opcional):
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="input-netflix !mb-0 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Login / Usuário Desejado: *
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegUsername(generateClientUsername(regName))}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Gerar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ex: joao_7741"
                  className="input-netflix !mb-0 font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Senha de Acesso: *
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegPassword(generateClientPassword())}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <KeyRound className="w-3 h-3" />
                    Auto-Gerar
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ex: tv8492"
                    className="input-netflix !mb-0 font-mono text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Conta criada com acesso VIP ativado automaticamente para você começar a assistir!</span>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn-red !h-11 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 hover:scale-[1.01] active:scale-[0.99] transition"
              >
                {regLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Cadastro & Entrar Agora</span>
                  </>
                )}
              </button>
            </form>
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

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 pr-8">
              <Logo size="xs" variant="icon-only" />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Acesso ao Painel Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-bold">VIP</span>
                </h3>
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
                  Senha de Acesso do Administrador:
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
                  Proteção de Segurança:
                </div>
                <p>
                  Somente o e-mail autorizado (<span className="text-white font-mono">{SUPER_ADMIN_EMAIL}</span>) ou colaboradores registrados na área administrativa têm permissão de acesso.
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
                    <span>Autenticar e Entrar no Painel</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 text-gray-500 text-xs max-w-7xl mx-auto w-full">
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EliteTV Streaming & IPTV Player - Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Termos de Uso</span>
            <span className="hover:underline cursor-pointer">Privacidade</span>
            <span className="hover:underline cursor-pointer">Segurança Administrativa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

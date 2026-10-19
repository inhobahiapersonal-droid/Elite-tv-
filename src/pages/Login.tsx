import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS } from '../context/AppContext';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Login() {
  const [mode, setMode] = useState<'client' | 'admin'>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState(SUPER_ADMIN_EMAIL);
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginAdmin } = useApp();
  const navigate = useNavigate();

  // Handle Client Login
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('Por favor, digite seu usuário ou e-mail.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(cleanUser, password);
      setLoading(false);

      if (result.success) {
        // If logged in as admin, redirect to /admin; otherwise /home
        const currentStored = localStorage.getItem('elitetv_current_user');
        if (currentStored) {
          try {
            const parsed = JSON.parse(currentStored);
            if (parsed.role === 'admin') {
              navigate('/admin');
              return;
            }
          } catch {}
        }
        navigate('/home');
      } else {
        setError(result.message || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Falha na autenticação.');
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim();
    const cleanPass = adminPass.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Informe o e-mail e a senha de administrador.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = loginAdmin(cleanEmail, cleanPass);
      setLoading(false);

      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message || 'E-mail ou senha de administrador inválidos.');
      }
    }, 250);
  };

  const handlePreFillMasterAdmin = () => {
    setAdminEmail(SUPER_ADMIN_EMAIL);
    setAdminPass(SUPER_ADMIN_PASS);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-black text-white select-none">
      {/* Background with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 filter blur-[3px] opacity-40"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&auto=format&fit=crop&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60 z-0" />

      {/* Header bar */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="cursor-pointer transition hover:opacity-95" onClick={() => navigate('/')}>
          <Logo size="md" />
        </div>

        {/* Quick Mode Toggle in Header */}
        <button
          onClick={() => {
            setMode(mode === 'client' ? 'admin' : 'client');
            setError('');
          }}
          className={`text-xs font-bold px-4 py-2 rounded-full border transition flex items-center gap-2 ${
            mode === 'admin'
              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/60'
              : 'bg-white/10 hover:bg-white/15 border-white/15 text-gray-300 hover:text-white'
          }`}
        >
          {mode === 'admin' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Modo Administrador</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <span>Acesso Adm</span>
            </>
          )}
        </button>
      </header>

      {/* Central Clean Card */}
      <main className="relative z-10 flex items-center justify-center px-4 my-auto py-6">
        <div className="w-full max-w-[420px] bg-neutral-950/90 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('client');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'client'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'admin'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Administrador</span>
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === 'client' ? 'Entrar' : 'Acesso Admin'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'client'
                ? 'Acesse seus canais ao vivo, filmes e séries.'
                : 'Painel administrativo da Elite TV.'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3 bg-red-950/70 border border-red-700/80 rounded-xl text-red-200 text-xs font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form Cliente */}
          {mode === 'client' ? (
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Usuário ou E-mail
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário ou telefone"
                  className="input-netflix !mb-0 text-sm"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="input-netflix !mb-0 text-sm pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-red !h-11 mt-2 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  Lembrar de mim
                </label>
                <a
                  href="https://api.whatsapp.com/send?phone=5573981382125&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20acessar%20minha%20conta%20EliteTV."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-gray-400 hover:text-white transition"
                >
                  Ajuda?
                </a>
              </div>

              {/* Clean subscription link */}
              <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400">
                Novo por aqui?{' '}
                <a
                  href="https://api.whatsapp.com/send?phone=5573981382125&text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20EliteTV%20Premium!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Assine agora</span>
                  <ExternalLink className="w-3 h-3 text-red-500" />
                </a>
              </div>
            </form>
          ) : (
            /* Form Administrador */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="inhobahia29@gmail.com"
                  className="input-netflix !mb-0 font-mono text-sm"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Senha do Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Digite a senha (040608)"
                    className="input-netflix !mb-0 font-mono text-sm pr-10"
                    autoComplete="current-password"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Fast fill Master credentials button */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                <span className="font-mono text-gray-400">Master: inhobahia29@gmail.com</span>
                <button
                  type="button"
                  onClick={handlePreFillMasterAdmin}
                  className="text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                >
                  Preencher dados
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-red !h-11 mt-2 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Painel Admin</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('client');
                    setError('');
                  }}
                  className="text-xs text-gray-400 hover:text-white transition hover:underline"
                >
                  ← Voltar para acesso do cliente
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-12 py-5 text-gray-500 text-xs max-w-7xl mx-auto w-full text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
        <p>© 2026 EliteTV Streaming • Todos os direitos reservados.</p>
        <div className="flex gap-5 text-gray-400">
          <span className="hover:text-white cursor-pointer">Privacidade</span>
          <span className="hover:text-white cursor-pointer">Termos de Uso</span>
          <span className="hover:text-white cursor-pointer">Suporte</span>
        </div>
      </footer>
    </div>
  );
}

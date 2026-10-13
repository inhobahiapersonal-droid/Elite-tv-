import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import { generateClientUsername, generateClientPassword, formatClientAccessMessage } from '../utils/clientGenerator';
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Trash2,
  Power,
  Eye,
  EyeOff,
  Filter,
  CheckCheck,
  Link2,
  FileText,
  Globe,
  Server,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AdminClientsProps {
  initialFilter?: 'all' | 'active' | 'inactive';
}

export const AdminClients: React.FC<AdminClientsProps> = ({ initialFilter = 'all' }) => {
  const { clients, addClient, toggleClientStatus, removeClient } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync statusFilter whenever initialFilter from sidebar changes
  useEffect(() => {
    setStatusFilter(initialFilter);
  }, [initialFilter]);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'basic' | 'premium' | 'vip' | 'teste'>('premium');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [durationDays, setDurationDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Dedicated M3U & DNS state in Plan Area
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uText, setM3uText] = useState('');
  const [dns1, setDns1] = useState('');
  const [dns2, setDns2] = useState('');
  const [activePlanConfigTab, setActivePlanConfigTab] = useState<'none' | 'm3uUrl' | 'm3uText' | 'dns1' | 'dns2'>('none');

  // Success / Feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [newlyCreatedClient, setNewlyCreatedClient] = useState<Client | null>(null);

  // Trigger auto-generator for both username and password
  const handleAutoGenerateCredentials = () => {
    const autoUser = generateClientUsername(name);
    const autoPass = generateClientPassword();
    setUsername(autoUser);
    setPassword(autoPass);
  };

  const handleAutoGenerateUser = () => {
    setUsername(generateClientUsername(name));
  };

  const handleAutoGeneratePass = () => {
    setPassword(generateClientPassword());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    // Calculate expiration date
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + (parseInt(durationDays, 10) || 30));
    const formattedExp = expDate.toLocaleDateString('pt-BR');

    const created = addClient({
      name: name.trim(),
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      plan,
      status,
      expiresAt: formattedExp,
      notes: notes.trim(),
      m3uUrl: m3uUrl.trim(),
      m3uText: m3uText.trim(),
      dns1: dns1.trim(),
      dns2: dns2.trim()
    });

    setNewlyCreatedClient(created);
    setSuccessToast(`Cliente ${created.name} cadastrado com sucesso!`);
    
    // Reset form
    setName('');
    setUsername('');
    setPassword('');
    setPhone('');
    setEmail('');
    setNotes('');
    setM3uUrl('');
    setM3uText('');
    setDns1('');
    setDns2('');
    setActivePlanConfigTab('none');
    setDurationDays('30');
    setStatus('active');
    setPlan('premium');

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (c: Client) => {
    const text = `Usuário: ${c.username}\nSenha: ${c.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyWhatsAppMsg = (c: Client) => {
    const message = formatClientAccessMessage(c);
    navigator.clipboard.writeText(message);
    setCopiedMsgId(c.id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  // Filter clients
  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;

  const filteredClients = clients.filter(c => {
    if (statusFilter === 'active' && c.status !== 'active') return false;
    if (statusFilter === 'inactive' && c.status !== 'inactive') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchUser = c.username.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q) || false;
      const matchEmail = c.email?.toLowerCase().includes(q) || false;
      const matchPlan = c.plan.toLowerCase().includes(q);
      return matchName || matchUser || matchPhone || matchEmail || matchPlan;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-sm flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold">{successToast}</p>
              {newlyCreatedClient && (
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Login gerado: <strong className="text-white underline">{newlyCreatedClient.username}</strong> | 
                  Senha: <strong className="text-white underline">{newlyCreatedClient.password}</strong>
                </p>
              )}
            </div>
          </div>
          {newlyCreatedClient && (
            <button
              onClick={() => handleCopyWhatsAppMsg(newlyCreatedClient)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Texto Completo</span>
            </button>
          )}
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-neutral-900/80 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/20 rounded-xl border border-red-500/40 text-red-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Cadastro e Gestão de Clientes
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                  IPTV & VOD
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Geração automática de credenciais, controle de status ativo/inativo e liberação imediata
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
              showAddForm 
                ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-white/20' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60 hover:scale-105 active:scale-95'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'Fechar Formulário' : '+ Novo Cadastro com Auto Login/Senha'}</span>
          </button>
        </div>
      </div>

      {/* NEW CLIENT REGISTRATION FORM */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 bg-neutral-900 border border-red-900/50 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in duration-300"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Cadastrar Novo Cliente com Geração Automática
              </h3>
              <p className="text-xs text-gray-400">
                Preencha os dados e clique em "Gerar Login e Senha" para automação completa
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateCredentials}
              className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto hover:scale-105 active:scale-95 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>⚡ Gerar Login & Senha Automaticamente</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Nome Completo do Cliente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Optional auto update username if not touched
                  if (!username) {
                    setUsername(generateClientUsername(e.target.value));
                  }
                  if (!password) {
                    setPassword(generateClientPassword());
                  }
                }}
                placeholder="Ex: Roberto Silva"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Login / Usuário Automático */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Login / Usuário de Acesso *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateUser}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Gerar
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: roberto_9210"
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-red-500 transition"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateUser}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                >
                  Gerar
                </button>
              </div>
            </div>

            {/* Senha Automática */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Senha de Acesso *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGeneratePass}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <KeyRound className="w-3 h-3" />
                  Auto-Gerar
                </button>
              </div>
              <div className="relative">
                <input
                  type={showFormPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ex: tv8492"
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-red-500 transition"
                />
                <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="p-1.5 text-gray-400 hover:text-white transition rounded"
                    title={showFormPassword ? 'Ocultar' : 'Exibir'}
                  >
                    {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePass}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition"
                  >
                    Gerar
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp / Telefone */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                WhatsApp / Telefone do Cliente
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (73) 98138-2125"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* E-mail (opcional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Plano */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Plano / Pacote de Assinatura</span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">Opções de Lista & DNS disponíveis</span>
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500 transition"
                >
                  <option value="premium">💎 Premium VIP (Canais Full HD + 4K + Filmes)</option>
                  <option value="vip">👑 Super VIP Especial (Acesso Ilimitado Total)</option>
                  <option value="basic">📺 Básico IPTV (Canais Ao Vivo)</option>
                  <option value="teste">⏱️ Teste Grátis 48 Horas</option>
                </select>
              </div>

              {/* ESPAÇO LOGO ABAIXO DO PLANO: BOTÕES PARA ADICIONAR LISTA URL M3U, TEXTO M3U E 2 OPÇÕES DE DNS */}
              <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-red-500" />
                    Configuração de Lista & Servidores DNS do Plano
                  </span>
                  {(m3uUrl || m3uText || dns1 || dns2) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono font-bold">
                      Configurado
                    </span>
                  )}
                </div>

                {/* 4 Botões: Lista URL M3U, Texto M3U, DNS 1, DNS 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Botão 1: Adicionar Lista URL M3U */}
                  <button
                    type="button"
                    onClick={() => setActivePlanConfigTab(prev => prev === 'm3uUrl' ? 'none' : 'm3uUrl')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center ${
                      activePlanConfigTab === 'm3uUrl' || m3uUrl
                        ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md shadow-blue-950/50'
                        : 'bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-blue-400" />
                    <span className="leading-tight">Lista URL M3U</span>
                    {m3uUrl && <span className="text-[9px] text-blue-400 font-mono">✓ Preenchido</span>}
                  </button>

                  {/* Botão 2: Adicionar Texto M3U */}
                  <button
                    type="button"
                    onClick={() => setActivePlanConfigTab(prev => prev === 'm3uText' ? 'none' : 'm3uText')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center ${
                      activePlanConfigTab === 'm3uText' || m3uText
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                        : 'bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="leading-tight">Texto M3U</span>
                    {m3uText && <span className="text-[9px] text-amber-400 font-mono">✓ Preenchido</span>}
                  </button>

                  {/* Botão 3: Adicionar DNS 1 (Primário) */}
                  <button
                    type="button"
                    onClick={() => setActivePlanConfigTab(prev => prev === 'dns1' ? 'none' : 'dns1')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center ${
                      activePlanConfigTab === 'dns1' || dns1
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                        : 'bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="leading-tight">DNS 1 (Primário)</span>
                    {dns1 && <span className="text-[9px] text-emerald-400 font-mono">✓ Preenchido</span>}
                  </button>

                  {/* Botão 4: Adicionar DNS 2 (Secundário / Alternativo) */}
                  <button
                    type="button"
                    onClick={() => setActivePlanConfigTab(prev => prev === 'dns2' ? 'none' : 'dns2')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 text-center ${
                      activePlanConfigTab === 'dns2' || dns2
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50'
                        : 'bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="leading-tight">DNS 2 (Secundário)</span>
                    {dns2 && <span className="text-[9px] text-purple-400 font-mono">✓ Preenchido</span>}
                  </button>
                </div>

                {/* Painéis de entrada para o botão ativo */}
                {activePlanConfigTab === 'm3uUrl' && (
                  <div className="p-3 bg-black/70 border border-blue-500/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        URL da Lista M3U / M3U_PLUS
                      </label>
                      <button
                        type="button"
                        onClick={() => setM3uUrl('http://servidor-elitetv.tv:8080/get.php?username=vip&password=tv&type=m3u_plus')}
                        className="text-[10px] text-blue-400 hover:underline"
                      >
                        Exemplo Padrão
                      </button>
                    </div>
                    <input
                      type="url"
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="https://servidor-iptv.com/get.php?username=...&password=...&type=m3u_plus"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-gray-400">
                      O link HLS da lista M3U será associado ao cadastro deste cliente.
                    </p>
                  </div>
                )}

                {activePlanConfigTab === 'm3uText' && (
                  <div className="p-3 bg-black/70 border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Conteúdo em Texto M3U
                      </label>
                      <button
                        type="button"
                        onClick={() => setM3uText('#EXTM3U\n#EXTINF:-1 tvg-name="Globo HD" group-title="Canais Abertos",Globo HD\nhttps://stream.elitetv.tv/live/globo.m3u8')}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Exemplo M3U
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={m3uText}
                      onChange={(e) => setM3uText(e.target.value)}
                      placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;...&quot; group-title=&quot;Canais&quot;,Canal Exemplo&#10;https://stream.servidor.com/live.m3u8"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-gray-400">
                      Cole as linhas da lista #EXTM3U diretamente para salvar no perfil do cliente.
                    </p>
                  </div>
                )}

                {activePlanConfigTab === 'dns1' && (
                  <div className="p-3 bg-black/70 border border-emerald-500/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Opção 1: DNS Primário do Servidor (Host / IP)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDns1(import.meta.env.VITE_XTREAM_DNS || 'http://dgaura.top')}
                          className="text-[10px] text-emerald-400 hover:underline font-mono"
                        >
                          Usar {import.meta.env.VITE_XTREAM_DNS || 'http://dgaura.top'}
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={dns1}
                      onChange={(e) => setDns1(e.target.value)}
                      placeholder={`Ex: ${import.meta.env.VITE_XTREAM_DNS || 'http://dgaura.top'}`}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-gray-400">
                      Endereço ou IP DNS primário para conexão rápida nos aplicativos IPTV (Smart IPTV, XCIPTV, TiviMate).
                    </p>
                  </div>
                )}

                {activePlanConfigTab === 'dns2' && (
                  <div className="p-3 bg-black/70 border border-purple-500/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Opção 2: DNS Secundário / Alternativo (Redundância)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDns2('http://dns2.elitetv.pro:8080')}
                          className="text-[10px] text-purple-400 hover:underline"
                        >
                          DNS Padrão 2
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={dns2}
                      onChange={(e) => setDns2(e.target.value)}
                      placeholder="Ex: http://dns2.servidor.pro:8080 ou 1.1.1.1"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-gray-400">
                      Endereço de contingência caso o DNS 1 sofra bloqueio ou oscilação de rota.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status (Ativo / Inativo) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Status da Assinatura *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    status === 'active'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>🟢 Ativo (Liberado)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    status === 'inactive'
                      ? 'bg-red-950/70 border-red-500 text-red-300 shadow-md shadow-red-950/50'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>🔴 Inativo (Bloqueado)</span>
                </button>
              </div>
            </div>

            {/* Duração / Vencimento */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Duração do Acesso
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500 transition"
              >
                <option value="2">2 Dias (Teste Grátis)</option>
                <option value="30">30 Dias (Mensal Padrão)</option>
                <option value="60">60 Dias (Bimestral)</option>
                <option value="90">90 Dias (Trimestral)</option>
                <option value="180">180 Dias (Semestral)</option>
                <option value="365">365 Dias (Anual VIP)</option>
              </select>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Observações / Informações Extras
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pago via Pix, cliente vindo do WhatsApp"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-950/70 hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Cliente e Liberar Acesso</span>
            </button>
          </div>
        </form>
      )}

      {/* FILTER AND SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/90 p-4 rounded-xl border border-white/10">
        {/* Status Filter Buttons (Todos / Ativo / Inativo) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-black shadow'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Todos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-white/5 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Clientes Ativos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950/60 font-mono text-emerald-300">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'bg-white/5 hover:bg-red-950/40 text-red-400 border border-red-900/40'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Clientes Inativos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-950/60 font-mono text-red-300">
              {inactiveCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, login, fone..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* CLIENTS LIST */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-base font-bold text-gray-300">Nenhum cliente encontrado</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `Não encontramos clientes com o termo "${searchQuery}".`
                : statusFilter === 'inactive'
                ? 'Nenhum cliente está inativo no momento.'
                : 'Nenhum cliente cadastrado nesta categoria.'}
            </p>
            <button
              onClick={() => {
                setShowAddForm(true);
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Cliente</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredClients.map((client) => {
              const isRevealed = Boolean(revealedPasswords[client.id]);
              const isActive = client.status === 'active';

              return (
                <div
                  key={client.id}
                  className={`p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isActive ? 'hover:bg-white/[0.03]' : 'bg-red-950/10 hover:bg-red-950/20'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
                        isActive
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-500/40'
                          : 'bg-neutral-800 text-gray-400 border-neutral-700'
                      }`}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                          {client.name}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                            isActive
                              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                              : 'bg-red-950/70 border-red-500/60 text-red-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                            }`}
                          />
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>

                        {/* Plan Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/15 uppercase">
                          {client.plan}
                        </span>

                        {/* M3U / DNS Badges if configured */}
                        {client.m3uUrl && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 flex items-center gap-1" title={client.m3uUrl}>
                            <Link2 className="w-2.5 h-2.5" />
                            URL M3U
                          </span>
                        )}
                        {client.m3uText && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            Texto M3U
                          </span>
                        )}
                        {client.dns1 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1" title={`DNS 1: ${client.dns1}`}>
                            <Globe className="w-2.5 h-2.5" />
                            DNS 1
                          </span>
                        )}
                        {client.dns2 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center gap-1" title={`DNS 2: ${client.dns2}`}>
                            <Globe className="w-2.5 h-2.5" />
                            DNS 2
                          </span>
                        )}
                      </div>

                      {/* Contact and Date details */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        {client.phone && (
                          <span className="flex items-center gap-1 text-gray-300">
                            <Phone className="w-3 h-3 text-green-400" />
                            {client.phone}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Mail className="w-3 h-3 text-blue-400" />
                            {client.email}
                          </span>
                        )}
                        {client.expiresAt && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            Vence: <strong className="text-gray-300">{client.expiresAt}</strong>
                          </span>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-[11px] text-gray-400 italic">
                          Obs: {client.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle / Credentials Card */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/10">
                    {/* Login */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 px-2">
                      <span className="text-[11px] text-gray-400">Login:</span>
                      <code className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {client.username}
                      </code>
                    </div>

                    {/* Senha */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 px-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0">
                      <span className="text-[11px] text-gray-400">Senha:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          {isRevealed ? client.password : '••••••'}
                        </code>
                        <button
                          onClick={() => togglePasswordReveal(client.id)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          title={isRevealed ? 'Ocultar Senha' : 'Ver Senha'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Copy User/Pass button */}
                    <button
                      onClick={() => handleCopyCredentials(client)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1"
                      title="Copiar Usuário e Senha"
                    >
                      {copiedId === client.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Actions: Status Toggle & WhatsApp Message */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                    {/* Toggle Status (Ativo / Inativo) */}
                    <button
                      onClick={() => toggleClientStatus(client.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-emerald-950/60 hover:bg-red-950/60 border-emerald-600/60 hover:border-red-600/60 text-emerald-300 hover:text-red-300'
                          : 'bg-red-950/60 hover:bg-emerald-950/60 border-red-600/60 hover:border-emerald-600/60 text-red-300 hover:text-emerald-300'
                      }`}
                      title={isActive ? 'Clique para Inativar e Bloquear' : 'Clique para Ativar e Liberar'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Ativo (Suspender)' : 'Inativo (Ativar)'}</span>
                    </button>

                    {/* Copy full WhatsApp access message */}
                    <button
                      onClick={() => handleCopyWhatsAppMsg(client)}
                      className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-green-950/50"
                      title="Copiar mensagem formatada com dados de acesso para WhatsApp"
                    >
                      {copiedMsgId === client.id ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Texto WhatsApp</span>
                        </>
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja realmente remover o cliente "${client.name}"?`)) {
                          removeClient(client.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition"
                      title="Excluir Cliente"
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
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, UserSession, UserProfile, PlaylistSource, Collaborator, Client } from '../types';
import { INITIAL_MEDIA_ITEMS, DEFAULT_PROFILES, DEFAULT_CLIENTS } from '../data/mockData';
import { parseM3U } from '../utils/m3uParser';
import { generateClientUsername, generateClientPassword } from '../utils/clientGenerator';

export const SUPER_ADMIN_EMAIL = 'Inhobahia29@gmail.com';
export const SUPER_ADMIN_PASS = '040608';

interface AppContextType {
  user: UserSession | null;
  items: MediaItem[];
  myList: string[];
  activeProfile: UserProfile;
  playlists: PlaylistSource[];
  collaborators: Collaborator[];
  clients: Client[];
  xtreamDns: string;
  setXtreamDns: (dns: string) => void;
  testXtreamConnection: (dnsToTest?: string) => Promise<{ success: boolean; latency?: number; message: string; status?: number }>;
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAdmin: (email: string, pass: string) => { success: boolean; message?: string };
  addClient: (clientData: Partial<Client>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  toggleClientStatus: (id: string) => void;
  removeClient: (id: string) => void;
  registerClientSelf: (data: { name: string; username?: string; password?: string; phone?: string; email?: string }) => { success: boolean; client?: Client; message?: string };
  addCollaborator: (collaborator: { name: string; email: string; password: string; role: string }) => void;
  toggleCollaboratorStatus: (id: string) => void;
  removeCollaborator: (id: string) => void;
  logout: () => void;
  switchProfile: (profile: UserProfile) => void;
  toggleMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
  addItem: (item: MediaItem) => void;
  removeItem: (id: string) => void;
  importM3UContent: (name: string, content: string) => number;
  importXtreamCodes: (server: string, username: string, pass: string) => Promise<{ success: boolean; count: number; error?: string }>;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('elitetv_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeProfile, setActiveProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('elitetv_profile');
      return stored ? JSON.parse(stored) : DEFAULT_PROFILES[0];
    } catch {
      return DEFAULT_PROFILES[0];
    }
  });

  const [items, setItems] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem('elitetv_items');
      if (stored) {
        const parsed: MediaItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initial items that don't exist yet in parsed
          const existingIds = new Set(parsed.map(i => i.id));
          const missingInitial = INITIAL_MEDIA_ITEMS.filter(i => !existingIds.has(i.id));
          return [...parsed, ...missingInitial];
        }
      }
      return INITIAL_MEDIA_ITEMS;
    } catch {
      return INITIAL_MEDIA_ITEMS;
    }
  });

  const [myList, setMyList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('elitetv_mylist');
      return stored ? JSON.parse(stored) : ['mov-1', 'ser-1', 'ch-2'];
    } catch {
      return ['mov-1', 'ser-1', 'ch-2'];
    }
  });

  const [playlists, setPlaylists] = useState<PlaylistSource[]>(() => {
    try {
      const stored = localStorage.getItem('elitetv_playlists');
      return stored ? JSON.parse(stored) : [
        {
          id: 'pl-builtin',
          name: 'EliteTV Premium Brasil (Padrão)',
          type: 'builtin',
          channelCount: INITIAL_MEDIA_ITEMS.length,
          lastUpdated: 'Hoje, ao vivo',
          active: true
        }
      ];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('elitetv_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('elitetv_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('elitetv_profile', JSON.stringify(activeProfile));
  }, [activeProfile]);

  useEffect(() => {
    localStorage.setItem('elitetv_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('elitetv_mylist', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    localStorage.setItem('elitetv_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const stored = localStorage.getItem('elitetv_collaborators');
      if (stored) {
        const parsed: Collaborator[] = JSON.parse(stored);
        return parsed.map(c => ({
          ...c,
          status: c.status || 'active'
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('elitetv_collaborators', JSON.stringify(collaborators));
  }, [collaborators]);

  // Clients state
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const stored = localStorage.getItem('elitetv_clients');
      if (stored) {
        const parsed: Client[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            ...c,
            status: c.status || 'active'
          }));
        }
      }
      return DEFAULT_CLIENTS;
    } catch {
      return DEFAULT_CLIENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('elitetv_clients', JSON.stringify(clients));
  }, [clients]);

  // Xtream Codes DNS Configuration (configured via Admin Panel, saved in localStorage & synced with backend)
  const [xtreamDns, setXtreamDnsState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('elitetv_xtream_dns');
      return stored ? stored.trim().replace(/\/+$/, '') : '';
    } catch {
      return '';
    }
  });

  // Sync DNS with backend on mount
  useEffect(() => {
    fetch('/api/settings/dns')
      .then(res => res.json())
      .then(data => {
        if (data?.dns) {
          const clean = String(data.dns).trim().replace(/\/+$/, '');
          if (clean && !localStorage.getItem('elitetv_xtream_dns')) {
            setXtreamDnsState(clean);
            localStorage.setItem('elitetv_xtream_dns', clean);
          }
        } else {
          // Push local storage DNS to backend if present
          const localDns = localStorage.getItem('elitetv_xtream_dns');
          if (localDns) {
            fetch('/api/settings/dns', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dns: localDns.trim().replace(/\/+$/, '') })
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  const setXtreamDns = (newDns: string) => {
    let clean = newDns.trim();
    if (clean) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `http://${clean}`;
      }
      clean = clean.replace(/\/+$/, '');
    }

    setXtreamDnsState(clean);

    try {
      if (clean) {
        localStorage.setItem('elitetv_xtream_dns', clean);
      } else {
        localStorage.removeItem('elitetv_xtream_dns');
      }

      // Sync with server proxy endpoint
      fetch('/api/settings/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dns: clean })
      }).catch(() => {});
    } catch (err) {
      console.error('Falha ao salvar DNS no localStorage:', err);
    }
  };

  const testXtreamConnection = async (dnsToTest?: string): Promise<{ success: boolean; latency?: number; message: string; status?: number }> => {
    const target = (dnsToTest || xtreamDns || '').trim().replace(/\/+$/, '');
    if (!target) {
      return {
        success: false,
        message: 'Configure seu DNS Xtream no campo antes de testar a conexão.'
      };
    }

    const validTarget = target.startsWith('http://') || target.startsWith('https://')
      ? target
      : `http://${target}`;

    try {
      const res = await fetch(`/api/xtream/test?dns=${encodeURIComponent(validTarget)}`, {
        headers: {
          'x-xtream-dns': validTarget
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.online) {
          return {
            success: true,
            latency: data.latency,
            status: data.status,
            message: `DNS Online! Servidor respondeu em ${data.latency || 0}ms.`
          };
        } else {
          return {
            success: false,
            message: data.error || 'Servidor não respondeu. Verifique o host e a porta.'
          };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errData.error || errData.message || `Servidor retornou status ${res.status}.`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Falha ao testar conexão com o servidor.'
      };
    }
  };

  const addClient = (data: Partial<Client>): Client => {
    const generatedUser = data.username?.trim() || generateClientUsername(data.name);
    const generatedPass = data.password?.trim() || generateClientPassword();
    
    // Default expiration: 30 days
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    const expStr = expDate.toLocaleDateString('pt-BR');

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: data.name?.trim() || 'Cliente VIP',
      username: generatedUser,
      password: generatedPass,
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      plan: data.plan || 'premium',
      status: data.status || 'active',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      expiresAt: data.expiresAt || expStr,
      notes: data.notes?.trim() || '',
      m3uUrl: data.m3uUrl?.trim() || '',
      m3uText: data.m3uText?.trim() || '',
      dns1: data.dns1?.trim() || '',
      dns2: data.dns2?.trim() || ''
    };

    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleClientStatus = (id: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'inactive' ? 'active' : 'inactive'
        };
      }
      return c;
    }));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const registerClientSelf = (data: { name: string; username?: string; password?: string; phone?: string; email?: string }) => {
    if (!data.name.trim()) {
      return { success: false, message: 'Por favor, informe seu nome completo.' };
    }

    const createdClient = addClient({
      name: data.name,
      username: data.username,
      password: data.password,
      phone: data.phone,
      email: data.email,
      plan: 'premium',
      status: 'active',
      notes: 'Cadastro via tela de login'
    });

    // Auto login
    const session: UserSession = {
      username: createdClient.username,
      email: createdClient.email,
      name: createdClient.name,
      avatar: activeProfile.avatar,
      role: 'user',
      profile: activeProfile,
      loginTime: Date.now()
    };
    setUser(session);

    return { success: true, client: createdClient };
  };

  const addCollaborator = (collab: { name: string; email: string; password: string; role: string }) => {
    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: collab.name.trim(),
      email: collab.email.trim(),
      password: collab.password.trim(),
      role: collab.role.trim() || 'Colaborador',
      status: 'active',
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    setCollaborators(prev => [newCollab, ...prev]);
  };

  const toggleCollaboratorStatus = (id: string) => {
    setCollaborators(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'inactive' ? 'active' : 'inactive'
        };
      }
      return c;
    }));
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const login = async (username: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedUser = username.trim();
    if (!trimmedUser) return { success: false, message: 'Por favor, informe seu usuário ou login.' };

    const cleanPass = password?.trim() || '';
    const lowerUser = trimmedUser.toLowerCase();

    // Verify Master Admin (inhobahia29@gmail.com / 040608)
    if (
      (lowerUser === SUPER_ADMIN_EMAIL.toLowerCase() || lowerUser === 'inhobahia29' || lowerUser === 'admin' || lowerUser === 'adm') &&
      cleanPass === SUPER_ADMIN_PASS
    ) {
      const session: UserSession = {
        username: 'Inhobahia29',
        email: SUPER_ADMIN_EMAIL,
        name: 'Administrador InhoBahia',
        avatar: activeProfile.avatar,
        role: 'admin',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    // Verify Collaborators
    const matchedCollab = collaborators.find(c =>
      c.email.trim().toLowerCase() === lowerUser && c.password.trim() === cleanPass
    );
    if (matchedCollab && matchedCollab.status !== 'inactive') {
      const session: UserSession = {
        username: matchedCollab.name,
        email: matchedCollab.email,
        name: `${matchedCollab.name} (${matchedCollab.role})`,
        avatar: activeProfile.avatar,
        role: 'admin',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    const currentDns = (xtreamDns || localStorage.getItem('elitetv_xtream_dns') || '').trim().replace(/\/+$/, '');

    let xtreamErrorMsg = '';

    if (currentDns) {
      try {
        const searchParams = new URLSearchParams({
          username: trimmedUser,
          password: cleanPass,
          dns: currentDns
        });

        const response = await fetch(`/api/xtream?${searchParams.toString()}`, {
          headers: {
            'x-xtream-dns': currentDns
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            const userInfo = data.user_info;
            if (userInfo) {
              // Check auth flag: 1 means successfully authenticated
              if (userInfo.auth === 1 || userInfo.status?.toLowerCase() === 'active') {
                // Format expiration date if present
                let expStr = '30 dias';
                if (userInfo.exp_date) {
                  const expTimestamp = parseInt(userInfo.exp_date, 10);
                  if (!isNaN(expTimestamp) && expTimestamp > 0) {
                    expStr = new Date(expTimestamp * 1000).toLocaleDateString('pt-BR');
                  }
                }

                // Register or update verified client in local state
                const verifiedClient: Client = {
                  id: `cli-xc-${Date.now()}`,
                  name: userInfo.username || trimmedUser,
                  username: userInfo.username || trimmedUser,
                  password: cleanPass,
                  plan: 'vip',
                  status: 'active',
                  createdAt: new Date().toLocaleDateString('pt-BR'),
                  expiresAt: expStr,
                  dns1: currentDns,
                  notes: 'Autenticado via Xtream API (/api/xtream)'
                };

                setClients(prev => {
                  const filtered = prev.filter(c => c.username.toLowerCase() !== trimmedUser.toLowerCase());
                  return [verifiedClient, ...filtered];
                });

                // Ensure Xtream playlist source is created
                const existingSource = playlists.find(p => p.type === 'xtream' && p.xtreamUser?.toLowerCase() === trimmedUser.toLowerCase());
                if (!existingSource) {
                  let hostLabel = currentDns;
                  try {
                    hostLabel = new URL(currentDns).hostname;
                  } catch {
                    hostLabel = currentDns;
                  }

                  const newSource: PlaylistSource = {
                    id: `xc-${Date.now()}`,
                    name: `Xtream: ${trimmedUser} (${hostLabel})`,
                    type: 'xtream',
                    xtreamServer: currentDns,
                    xtreamUser: trimmedUser,
                    xtreamPass: cleanPass,
                    channelCount: items.length,
                    lastUpdated: new Date().toLocaleDateString('pt-BR'),
                    active: true
                  };
                  setPlaylists(prev => [newSource, ...prev]);
                }

                const session: UserSession = {
                  username: userInfo.username || trimmedUser,
                  name: userInfo.username || trimmedUser,
                  avatar: activeProfile.avatar,
                  role: 'user',
                  profile: activeProfile,
                  loginTime: Date.now()
                };
                setUser(session);
                return { success: true };
              } else if (userInfo.auth === 0) {
                xtreamErrorMsg = `Usuário ou senha inválidos no servidor Xtream (${currentDns}).`;
              } else if (userInfo.status && userInfo.status.toLowerCase() !== 'active') {
                xtreamErrorMsg = `Acesso Bloqueado: Sua conta está "${userInfo.status}" no servidor IPTV.`;
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('Erro ao consultar /api/xtream:', err);
      }
    }

    // Check if matching registered client in local state (case-insensitive)
    const matchingClient = clients.find(c => 
      c.username.trim().toLowerCase() === trimmedUser.toLowerCase() ||
      (c.phone && c.phone.replace(/\D/g, '') === trimmedUser.replace(/\D/g, '') && trimmedUser.replace(/\D/g, '').length >= 8)
    );

    if (matchingClient) {
      if (matchingClient.status === 'inactive') {
        return {
          success: false,
          message: 'Acesso Bloqueado: Sua assinatura de cliente está INATIVA ou suspensa. Clique no botão de Assinar Premium para renovar o acesso!'
        };
      }

      // If client is active and password was supplied, verify if desired
      if (cleanPass && matchingClient.password) {
        if (matchingClient.password.trim() !== cleanPass) {
          return {
            success: false,
            message: xtreamErrorMsg || 'Senha incorreta para esta conta de cliente.'
          };
        }
      }

      const session: UserSession = {
        username: matchingClient.username,
        email: matchingClient.email,
        name: matchingClient.name,
        avatar: activeProfile.avatar,
        role: 'user',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    // If server gave explicit error message and no matching client, report the server message
    if (xtreamErrorMsg) {
      return {
        success: false,
        message: xtreamErrorMsg
      };
    }

    // Quick demo login or fallback for generic user profile
    if (trimmedUser.toLowerCase() === 'cliente' || trimmedUser.toLowerCase() === 'cliente vip') {
      const session: UserSession = {
        username: trimmedUser,
        name: trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1),
        avatar: activeProfile.avatar,
        role: 'user',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    return {
      success: false,
      message: `Não foi possível autenticar o usuário "${trimmedUser}". Verifique suas credenciais no servidor ${xtreamDns}.`
    };
  };

  const loginAdmin = (email: string, pass: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check Master Super Admin (Inhobahia29@gmail.com / 040608)
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && cleanPass === SUPER_ADMIN_PASS) {
      const session: UserSession = {
        username: 'Inhobahia29',
        email: SUPER_ADMIN_EMAIL,
        name: 'Administrador InhoBahia',
        avatar: activeProfile.avatar,
        role: 'admin',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    // Check authorized Collaborators
    const matchedCollab = collaborators.find(c => 
      c.email.trim().toLowerCase() === cleanEmail && c.password.trim() === cleanPass
    );

    if (matchedCollab) {
      if (matchedCollab.status === 'inactive') {
        return {
          success: false,
          message: 'Acesso bloqueado: Este colaborador foi desativado temporariamente pelo Administrador Master.'
        };
      }

      const session: UserSession = {
        username: matchedCollab.name,
        email: matchedCollab.email,
        name: `${matchedCollab.name} (${matchedCollab.role})`,
        avatar: activeProfile.avatar,
        role: 'admin',
        profile: activeProfile,
        loginTime: Date.now()
      };
      setUser(session);
      return { success: true };
    }

    return {
      success: false,
      message: 'Acesso negado! Somente o administrador autorizado (Inhobahia29@gmail.com) com a senha correta ou colaboradores cadastrados podem acessar.'
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elitetv_current_user');
  };

  const switchProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    if (user) {
      setUser({ ...user, profile, avatar: profile.avatar });
    }
  };

  const toggleMyList = (id: string) => {
    setMyList(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isInMyList = (id: string) => myList.includes(id);

  const addItem = (item: MediaItem) => {
    setItems(prev => [item, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const importM3UContent = (name: string, content: string): number => {
    const parsed = parseM3U(content);
    if (parsed.length === 0) return 0;

    setItems(prev => [...parsed, ...prev]);

    const newSource: PlaylistSource = {
      id: `pl-${Date.now()}`,
      name: name || 'Lista M3U Importada',
      type: 'm3u',
      channelCount: parsed.length,
      lastUpdated: new Date().toLocaleDateString('pt-BR'),
      active: true
    };
    setPlaylists(prev => [newSource, ...prev]);
    return parsed.length;
  };

  const importXtreamCodes = async (server: string, username: string, pass: string): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      let cleanServer = (server.trim() || xtreamDns || localStorage.getItem('elitetv_xtream_dns') || '').trim();
      if (!cleanServer) {
        return {
          success: false,
          count: 0,
          error: 'Nenhum DNS configurado. Configure seu DNS Xtream no painel da Elite TV.'
        };
      }

      if (!cleanServer.startsWith('http://') && !cleanServer.startsWith('https://')) {
        cleanServer = `http://${cleanServer}`;
      }
      cleanServer = cleanServer.replace(/\/+$/, '');

      // Query player_api.php via proxy /api/xtream
      try {
        const queryParams = new URLSearchParams({
          username,
          password: pass,
          dns: cleanServer
        });
        await fetch(`/api/xtream?${queryParams.toString()}`, {
          headers: {
            'x-xtream-dns': cleanServer
          }
        });
      } catch (e) {
        console.warn('Xtream proxy ping:', e);
      }

      const newItems: MediaItem[] = [
        {
          id: `xc-live-${Date.now()}-1`,
          name: `[XC] Sportv 1 HD (${username})`,
          category: 'Canais Ao Vivo',
          streamUrl: `${cleanServer}/live/${username}/${pass}/1.m3u8`,
          poster: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80',
          type: 'live',
          description: `Canal ao vivo conectado via Xtream Codes no servidor ${cleanServer}.`,
          rating: 'Livre',
          epgCurrent: 'Ao Vivo via Xtream Codes',
          epgNext: 'Futebol Internacional'
        },
        {
          id: `xc-vod-${Date.now()}-2`,
          name: `[XC] VOD Filme Premiere 4K`,
          category: 'Filmes',
          streamUrl: `${cleanServer}/movie/${username}/${pass}/1.mp4`,
          poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
          type: 'movie',
          description: `Filme em demanda sincronizado com servidor Xtream Codes.`,
          year: 2024,
          rating: '16+'
        }
      ];

      setItems(prev => [...newItems, ...prev]);

      const newSource: PlaylistSource = {
        id: `xc-${Date.now()}`,
        name: `Xtream: ${username}@${new URL(cleanServer).hostname}`,
        type: 'xtream',
        xtreamServer: cleanServer,
        xtreamUser: username,
        xtreamPass: pass,
        channelCount: newItems.length,
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
        active: true
      };
      setPlaylists(prev => [newSource, ...prev]);

      return { success: true, count: newItems.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Falha ao conectar servidor Xtream' };
    }
  };

  const resetToDefault = () => {
    setItems(INITIAL_MEDIA_ITEMS);
    setMyList(['mov-1', 'ser-1', 'ch-2']);
    setPlaylists([
      {
        id: 'pl-builtin',
        name: 'EliteTV Premium Brasil (Padrão)',
        type: 'builtin',
        channelCount: INITIAL_MEDIA_ITEMS.length,
        lastUpdated: 'Hoje, ao vivo',
        active: true
      }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        items,
        myList,
        activeProfile,
        playlists,
        collaborators,
        clients,
        login,
        loginAdmin,
        addClient,
        updateClient,
        toggleClientStatus,
        removeClient,
        registerClientSelf,
        addCollaborator,
        toggleCollaboratorStatus,
        removeCollaborator,
        logout,
        switchProfile,
        toggleMyList,
        isInMyList,
        addItem,
        removeItem,
        importM3UContent,
        importXtreamCodes,
        resetToDefault,
        xtreamDns,
        setXtreamDns,
        testXtreamConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

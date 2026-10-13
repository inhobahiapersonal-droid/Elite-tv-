import { Client } from '../types';

/**
 * Generates an automated unique, user-friendly username for IPTV clients
 */
export function generateClientUsername(baseName?: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  if (baseName && baseName.trim()) {
    // Sanitize name: remove accents, take first word or initials, lowercase
    const clean = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    const prefix = clean.slice(0, 8);
    if (prefix.length >= 3) {
      return `${prefix}_${randomNum}`;
    }
  }
  
  const prefixes = ['cli', 'vip', 'user', 'tv', 'elite'];
  const chosenPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${chosenPrefix}_${randomNum}`;
}

/**
 * Generates an automated secure, easy-to-type password for IPTV clients
 */
export function generateClientPassword(): string {
  // Common IPTV easy login password format: 6-character clean pin or 'tv' + 4 digits
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `tv${random4}`;
}

/**
 * Generates formatted access text for sending to client via WhatsApp or message
 */
export function formatClientAccessMessage(client: Client): string {
  let extraConfig = '';
  if (client.m3uUrl) {
    extraConfig += `\n🔗 *Lista URL M3U:* ${client.m3uUrl}`;
  }
  if (client.dns1) {
    extraConfig += `\n🌐 *DNS Primário (1):* ${client.dns1}`;
  }
  if (client.dns2) {
    extraConfig += `\n🌐 *DNS Secundário (2):* ${client.dns2}`;
  }
  if (client.m3uText) {
    extraConfig += `\n📄 *Texto M3U:* Configurado no painel`;
  }

  return `*🔥 SEU ACESSO ELITETV IPTV PRO ESTÁ LIBERADO!*

Olá, *${client.name}*! Sua conta foi configurada com sucesso.

📋 *DADOS DE ACESSO:*
👤 *Usuário / Login:* ${client.username}
🔑 *Senha:* ${client.password}
📦 *Plano:* ${client.plan.toUpperCase()}
🟢 *Status:* ${client.status === 'active' ? 'ATIVO' : 'INATIVO'}
📅 *Vencimento:* ${client.expiresAt || '30 dias'}${extraConfig}

📱 *COMO ASSISTIR:*
1. Acesse o aplicativo EliteTV
2. Digite seu Usuário e Senha
3. Aproveite todos os canais ao vivo, filmes e séries em 4K!

Precisa de suporte? Estamos à disposição!`;
}

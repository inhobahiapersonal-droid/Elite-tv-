import { MediaItem } from '../types';

export function parseM3U(content: string): MediaItem[] {
  const lines = content.split('\n');
  const items: MediaItem[] = [];

  let currentTitle = '';
  let currentLogo = '';
  let currentGroup = 'Canais Gerais';
  let currentEpg = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      currentLogo = logoMatch ? logoMatch[1] : '';

      // Parse group-title
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      currentGroup = groupMatch ? groupMatch[1] : 'Canais Gerais';

      // Parse tvg-name or title after last comma
      const nameMatch = line.match(/tvg-name="([^"]+)"/i);
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1 && commaIndex < line.length - 1) {
        currentTitle = line.substring(commaIndex + 1).trim();
      } else if (nameMatch) {
        currentTitle = nameMatch[1];
      } else {
        currentTitle = `Canal ${items.length + 1}`;
      }
    } else if (line.length > 0 && !line.startsWith('#')) {
      // It's a stream URL
      const streamUrl = line;
      const id = `iptv-${Date.now()}-${items.length}-${Math.random().toString(36).substring(2, 6)}`;
      
      const isMovie = currentGroup.toLowerCase().includes('filme') || currentGroup.toLowerCase().includes('vod') || currentGroup.toLowerCase().includes('movie');
      const isSeries = currentGroup.toLowerCase().includes('série') || currentGroup.toLowerCase().includes('serie') || currentGroup.toLowerCase().includes('series');

      const type: 'live' | 'movie' | 'series' = isMovie ? 'movie' : isSeries ? 'series' : 'live';

      const fallbackPoster = type === 'live' 
        ? 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

      items.push({
        id,
        name: currentTitle || `Canal ${items.length + 1}`,
        category: currentGroup || (type === 'live' ? 'Canais Ao Vivo' : 'Filmes'),
        streamUrl,
        poster: currentLogo || fallbackPoster,
        backdrop: currentLogo || fallbackPoster,
        type,
        description: `Transmissão IPTV de alta qualidade para ${currentTitle}.`,
        rating: '12+',
        epgCurrent: 'Programação Ao Vivo',
        epgNext: 'A Seguir: Variedades'
      });

      // Reset temp values
      currentTitle = '';
      currentLogo = '';
      currentGroup = 'Canais Gerais';
      currentEpg = '';
    }
  }

  return items;
}

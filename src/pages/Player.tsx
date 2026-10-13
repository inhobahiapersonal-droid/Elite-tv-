import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { useApp } from '../context/AppContext';
import { MediaItem } from '../types';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Radio,
  Tv,
  List,
  Check,
  Film,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function Player() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, user } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mediaId = searchParams.get('id');
  const episodeId = searchParams.get('episodeId');

  // Verify auth
  useEffect(() => {
    const stored = localStorage.getItem('elitetv_current_user');
    if (!stored && !user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Current item and stream
  const currentItem = items.find(i => i.id === mediaId) || items[0];

  const currentEpisode = currentItem?.episodes?.find(e => e.id === episodeId) 
    || currentItem?.episodes?.[0];

  const currentStreamUrl = currentEpisode?.streamUrl || currentItem?.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [channelDrawerOpen, setChannelDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');

  // Initialize and load stream with HLS.js or native
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStreamUrl) return;

    setIsLoading(true);
    setPlaybackError(null);

    // Destroy existing Hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = currentStreamUrl.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(currentStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPlaybackError('Não foi possível carregar a transmissão. O servidor de origem pode estar temporariamente indisponível.');
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      // Native HLS (Safari/iOS) or standard MP4
      video.src = currentStreamUrl;
      video.load();
      video.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      setPlaybackError('Formato de vídeo não suportado neste navegador.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStreamUrl]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const onError = () => {
      setPlaybackError('Erro na reprodução deste canal/vídeo.');
      setIsLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
    };
  }, []);

  // Controls auto-hide on inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !channelDrawerOpen) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, channelDrawerOpen]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      const video = videoRef.current;
      if (!video) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(-10);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          navigate('/home');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen, resetControlsTimeout, navigate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === 'contain' ? 'cover' : prev === 'cover' ? 'fill' : 'contain');
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration && !isNaN(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      className="relative w-screen h-screen bg-black overflow-hidden select-none cursor-pointer"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        onClick={togglePlay}
        className={`w-full h-full object-${aspectRatio === 'fill' ? 'fill' : aspectRatio} transition-all duration-300`}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none z-30">
          <div className="w-14 h-14 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-300">
            Conectando ao fluxo EliteTV...
          </p>
        </div>
      )}

      {/* Playback Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-40">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Erro no Sinal de Transmissão</h3>
          <p className="text-sm text-gray-400 max-w-md text-center mb-6">
            {playbackError}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(() => {});
                }
                setPlaybackError(null);
                setIsLoading(true);
              }}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reconectar Sinal
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded font-bold text-sm transition"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER CONTROLS (Fade in/out) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition flex items-center gap-2 group text-sm font-semibold pr-4"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            <span>Voltar</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white drop-shadow">
                {currentItem?.name || 'Canal EliteTV'}
              </h2>
              {currentItem?.type === 'live' && (
                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  AO VIVO
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 drop-shadow">
              {currentEpisode ? currentEpisode.title : currentItem?.category}
            </p>
          </div>
        </div>

        {/* Top Right Quick Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChannelDrawerOpen(!channelDrawerOpen)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 border ${
              channelDrawerOpen ? 'bg-red-600 border-red-500 text-white' : 'bg-black/60 border-white/20 text-gray-200 hover:bg-black/80'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{currentItem?.type === 'series' ? 'Episódios' : 'Lista de Canais'}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS BAR (Fade in/out) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 px-6 py-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 space-y-3 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar (scrubber for VOD, live indicator for live) */}
        {currentItem?.type !== 'live' ? (
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono text-gray-300 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleProgressBarClick}
              className="flex-1 h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer relative transition-all group"
            >
              <div
                className="h-full bg-red-600 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>
            <span className="text-xs font-mono text-gray-300 w-12">
              {formatTime(duration)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-bold text-white uppercase tracking-wider">Transmissão Direta Sem Atraso</span>
            </div>
            <div className="text-gray-300">
              {currentItem.epgCurrent && `Agora: ${currentItem.epgCurrent}`}
            </div>
          </div>
        )}

        {/* Buttons Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-red-500 transition"
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white" />}
            </button>

            {currentItem?.type !== 'live' && (
              <>
                <button
                  onClick={() => seek(-10)}
                  className="p-2 text-gray-300 hover:text-white transition"
                  title="Voltar 10 segundos (Seta Esquerda)"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => seek(10)}
                  className="p-2 text-gray-300 hover:text-white transition"
                  title="Avançar 10 segundos (Seta Direita)"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-300 hover:text-white transition"
                title="Mudo (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-500" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 accent-red-600 h-1 bg-white/20 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAspectRatio}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-gray-200 transition"
              title="Ajuste de Tela (Aspect Ratio)"
            >
              {aspectRatio === 'contain' ? 'Ajustar' : aspectRatio === 'cover' ? 'Zoom' : 'Preencher'}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white transition"
              title="Tela Inteira (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK CHANNEL / EPISODES DRAWER (Right sidebar overlay) */}
      {channelDrawerOpen && (
        <div 
          className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-black/95 border-l border-white/10 z-40 flex flex-col backdrop-blur-md animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-sm">
                {currentItem?.type === 'series' ? 'Episódios da Série' : 'Guia de Canais Ao Vivo'}
              </h3>
            </div>
            <button
              onClick={() => setChannelDrawerOpen(false)}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-white/10 rounded"
            >
              Fechar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {currentItem?.type === 'series' && currentItem?.episodes ? (
              // Series episodes
              currentItem.episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => {
                    navigate(`/player?id=${encodeURIComponent(currentItem.id)}&episodeId=${encodeURIComponent(ep.id)}`);
                    setChannelDrawerOpen(false);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer flex items-center gap-3 ${
                    ep.id === currentEpisode?.id
                      ? 'bg-red-950/40 border-red-600 text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="font-bold text-sm w-5">{ep.episodeNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{ep.title}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{ep.duration}</p>
                  </div>
                  {ep.id === currentEpisode?.id ? (
                    <Check className="w-4 h-4 text-red-500" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
              ))
            ) : (
              // Live channels list
              items.filter(i => i.type === 'live').map(ch => (
                <div
                  key={ch.id}
                  onClick={() => {
                    navigate(`/player?id=${encodeURIComponent(ch.id)}`);
                    setChannelDrawerOpen(false);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer flex items-center gap-3 ${
                    ch.id === currentItem?.id
                      ? 'bg-red-950/40 border-red-600 text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <img
                    src={ch.poster}
                    alt={ch.name}
                    className="w-12 h-8 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold truncate">{ch.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {ch.epgCurrent || ch.category}
                    </p>
                  </div>
                  {ch.id === currentItem?.id ? (
                    <Radio className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

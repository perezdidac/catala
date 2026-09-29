/**
 * WeatherSystem: Atmosphere, Day/Night Cycle & Rain Simulation
 * Transforms scenes into Sunny Day, Golden Sunset, Starry Night, or Gentle Rain.
 */

import { gameState } from '../game/GameState';
import { soundFX } from './SoundFX';
import { speechManager } from './SpeechManager';
import { particleSystem } from './ParticleSystem';

export type WeatherType = 'sol' | 'capvespre' | 'nit' | 'pluja';

export interface WeatherInfo {
  id: WeatherType;
  label: string;
  icon: string;
  phrase: string;
}

export const WEATHER_MODES: WeatherInfo[] = [
  { id: 'sol', label: 'Sol Radiant', icon: '☀️', phrase: 'Fa un dia radiant de sol! Els ocells canten.' },
  { id: 'capvespre', label: 'Capvespre Daurat', icon: '🌅', phrase: 'El sol es pon amb un cel daurat preciós.' },
  { id: 'nit', label: 'Nit Estelada', icon: '🌙', phrase: 'La nit és plena d\'estrelles i la lluna il·lumina les vies!' },
  { id: 'pluja', label: 'Pluja Suau', icon: '🌧️', phrase: 'Plou sobre les vies! Sent com cau la pluja: xip, xap!' }
];

export class WeatherSystem {
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private stars: { x: number; y: number; size: number; phase: number }[] = [];
  private fireflies: { x: number; y: number; vx: number; vy: number; phase: number }[] = [];

  constructor() {
    this.initAtmosphericParticles();

    // Subscribe to state changes to handle ambient sound transitions
    gameState.subscribe((state) => {
      if (state.weather === 'pluja') {
        soundFX.setRain(true);
      } else {
        soundFX.setRain(false);
      }
    });
  }

  private initAtmosphericParticles(): void {
    // 60 rain drops
    for (let i = 0; i < 60; i++) {
      this.rainDrops.push({
        x: Math.random() * 640,
        y: Math.random() * 360,
        speed: 280 + Math.random() * 120,
        len: 10 + Math.random() * 8
      });
    }

    // 40 twinkling stars
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * 640,
        y: Math.random() * 160,
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 12 drifting fireflies for night
    for (let i = 0; i < 12; i++) {
      this.fireflies.push({
        x: 100 + Math.random() * 440,
        y: 160 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  public cycle(): WeatherType {
    const current = gameState.get().weather || 'sol';
    const idx = WEATHER_MODES.findIndex((m) => m.id === current);
    const nextIdx = (idx + 1) % WEATHER_MODES.length;
    const next = WEATHER_MODES[nextIdx];

    gameState.setWeather(next.id);

    // Audio acoustic feedback
    soundFX.init();
    if (next.id === 'sol') {
      soundFX.playBirdChirp();
    } else if (next.id === 'capvespre') {
      soundFX.playBell();
    } else if (next.id === 'nit') {
      soundFX.playMagicChime();
    } else if (next.id === 'pluja') {
      soundFX.playWaterDrop();
    }

    speechManager.speak(next.phrase);
    return next.id;
  }

  public update(dt: number): void {
    const weather = gameState.get().weather || 'sol';

    if (weather === 'pluja') {
      for (const d of this.rainDrops) {
        d.y += d.speed * dt;
        d.x -= 40 * dt; // slant wind
        if (d.y > 360) {
          d.y = -10;
          d.x = Math.random() * 680;
          if (Math.random() < 0.1) {
            particleSystem.emitWaterSplash(d.x, 240 + Math.random() * 50, 1);
          }
        }
      }
    } else if (weather === 'nit') {
      for (const f of this.fireflies) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.x < 50 || f.x > 590) f.vx *= -1;
        if (f.y < 120 || f.y > 320) f.vy *= -1;
      }
    }
  }

  public renderOverlay(ctx: CanvasRenderingContext2D, totalTime: number): void {
    const weather = gameState.get().weather || 'sol';

    if (weather === 'capvespre') {
      // Golden Hour amber tint
      ctx.save();
      const grad = ctx.createLinearGradient(0, 0, 0, 360);
      grad.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
      grad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
      grad.addColorStop(1, 'rgba(120, 53, 15, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);
      ctx.restore();
    } else if (weather === 'nit') {
      // Deep starry night overlay
      ctx.save();
      const nightGrad = ctx.createLinearGradient(0, 0, 0, 360);
      nightGrad.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
      nightGrad.addColorStop(0.6, 'rgba(30, 41, 59, 0.55)');
      nightGrad.addColorStop(1, 'rgba(2, 6, 23, 0.7)');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, 640, 360);

      // Glowing Crescent Moon at top right
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(580, 40, 16, 0, Math.PI * 2);
      ctx.fill();

      // Crescent bite
      ctx.fillStyle = '#0f172a';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(573, 36, 14, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling stars
      for (const s of this.stars) {
        const twinkle = 0.4 + 0.6 * Math.sin(totalTime * 3 + s.phase);
        ctx.fillStyle = `rgba(254, 240, 138, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fireflies floating
      for (const f of this.fireflies) {
        const glow = 0.3 + 0.7 * Math.sin(totalTime * 4 + f.phase);
        ctx.fillStyle = `rgba(74, 222, 128, ${glow})`;
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Locomotive Front Lantern Light Cone (warm forward beam from train at x: ~220, y: ~220)
      const headlightGrad = ctx.createRadialGradient(240, 220, 10, 380, 240, 180);
      headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      headlightGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.15)');
      headlightGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = headlightGrad;
      ctx.beginPath();
      ctx.moveTo(220, 215);
      ctx.lineTo(460, 180);
      ctx.lineTo(460, 270);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    } else if (weather === 'pluja') {
      // Cool overcast slate filter
      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.32)';
      ctx.fillRect(0, 0, 640, 360);

      // Rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const d of this.rainDrops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.len);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}

export const weatherSystem = new WeatherSystem();

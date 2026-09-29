/**
 * High-Performance Procedural Particle System for Canvas 2D
 * Simulates steam, fire embers, water splashes, golden sparkles, and celebratory confetti.
 */

export type ParticleType = 'steam' | 'ember' | 'water' | 'sparkle' | 'confetti' | 'ring';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growth: number;
  alpha: number;
  decay: number;
  color: string;
  type: ParticleType;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly maxParticles: number = 250;

  public update(dt: number): void {
    const cappedDt = Math.min(dt, 0.1);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += cappedDt;

      if (p.life >= p.maxLife || p.alpha <= 0.01) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.x += p.vx * cappedDt;
      p.y += p.vy * cappedDt;
      p.size += p.growth * cappedDt;
      p.alpha = Math.max(0, p.alpha - p.decay * cappedDt);
      p.rotation += p.vRot * cappedDt;

      // Type-specific behaviors
      if (p.type === 'steam') {
        p.vx += (Math.random() - 0.45) * 4 * cappedDt;
        p.vy -= 12 * cappedDt; // Natural buoyancy
      } else if (p.type === 'ember') {
        p.vx += Math.sin(p.life * 10) * 8 * cappedDt;
        p.vy -= 18 * cappedDt;
      } else if (p.type === 'water') {
        p.vy += 65 * cappedDt; // Gravity on droplets
      } else if (p.type === 'confetti') {
        p.vx += Math.sin(p.life * 6) * 12 * cappedDt;
        p.vy += 10 * cappedDt; // Gentle flutter
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      if (p.alpha <= 0) continue;
      ctx.globalAlpha = p.alpha;

      if (p.type === 'steam') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'water') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
        ctx.restore();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Spawn billowing steam puff
   */
  public emitSteam(x: number, y: number, count: number = 3, spread: number = 6): void {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: -15 + Math.random() * 8,
        vy: -25 - Math.random() * 20,
        size: 5 + Math.random() * 4,
        growth: 14 + Math.random() * 8,
        alpha: 0.65 + Math.random() * 0.25,
        decay: 0.45 + Math.random() * 0.2,
        color: Math.random() > 0.3 ? 'rgba(248, 250, 252, 0.9)' : 'rgba(226, 232, 240, 0.8)',
        type: 'steam',
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 2.2
      });
    }
  }

  /**
   * Spawn flying fire embers
   */
  public emitEmbers(x: number, y: number, count: number = 4): void {
    if (this.particles.length >= this.maxParticles) return;
    const colors = ['#f59e0b', '#ef4444', '#fef08a', '#fbbf24'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 30,
        vy: -35 - Math.random() * 40,
        size: 1.5 + Math.random() * 2,
        growth: -0.5,
        alpha: 0.95,
        decay: 0.8 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'ember',
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 1.5
      });
    }
  }

  /**
   * Spawn water splash droplets
   */
  public emitWaterSplash(x: number, y: number, count: number = 6): void {
    if (this.particles.length >= this.maxParticles) return;
    const colors = ['#93c5fd', '#60a5fa', '#38bdf8', '#e0f2fe'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y,
        vx: (Math.random() - 0.5) * 45,
        vy: -30 - Math.random() * 35,
        size: 2 + Math.random() * 2,
        growth: -0.4,
        alpha: 0.85,
        decay: 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'water',
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 1.2
      });
    }
  }

  /**
   * Spawn celebratory golden star sparkles (e.g. on phonetic success)
   */
  public emitSparkles(x: number, y: number, count: number = 8): void {
    if (this.particles.length >= this.maxParticles) return;
    const colors = ['#f59e0b', '#fef08a', '#38bdf8', '#4ade80', '#fbbf24'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 25 + Math.random() * 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        growth: -0.6,
        alpha: 1.0,
        decay: 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'sparkle',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 1.4
      });
    }
  }

  /**
   * Spawn festive falling confetti
   */
  public emitConfetti(x: number, y: number, count: number = 16): void {
    if (this.particles.length >= this.maxParticles) return;
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#a855f7', '#fef08a'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 30,
        size: 3 + Math.random() * 3,
        growth: 0,
        alpha: 1.0,
        decay: 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'confetti',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 2.8
      });
    }
  }

  /**
   * Spawn expanding shockwave ring (e.g. ringing bell or whistle blast)
   */
  public emitRing(x: number, y: number, color: string = '#fef08a', maxRadius: number = 30): void {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 4,
      growth: maxRadius * 1.5,
      alpha: 0.85,
      decay: 0.9,
      color,
      type: 'ring',
      rotation: 0,
      vRot: 0,
      life: 0,
      maxLife: 0.9
    });
  }

  public clear(): void {
    this.particles = [];
  }
}

export const particleSystem = new ParticleSystem();

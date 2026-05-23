import {
  PARTICLE_COUNT,
  PARTICLE_SPEED_MIN,
  PARTICLE_SPEED_MAX,
  PARTICLE_GRAVITY,
  PARTICLE_LIFE_MS,
  PARTICLE_RADIUS,
  PARTICLE_COLORS,
  PARTICLE_BURST_X,
  PARTICLE_BURST_Y,
  SHAKE_DURATION_MS,
  SHAKE_INTENSITY,
} from '../constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ageMs: number;
  color: string;
}

export class EffectsManager {
  private particles: Particle[] = [];
  private shakeMs = 0;

  /** Trigger a success burst at the default burst origin. */
  successBurst(): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.3;
      const speed = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length] ?? PARTICLE_COLORS[0]!;
      this.particles.push({
        x: PARTICLE_BURST_X,
        y: PARTICLE_BURST_Y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - PARTICLE_SPEED_MIN * 0.5,
        ageMs: 0,
        color,
      });
    }
  }

  /** Trigger a fail screen shake. */
  failShake(): void {
    this.shakeMs = SHAKE_DURATION_MS;
  }

  tick(dt: number): void {
    const ms = dt * 1000;
    if (this.shakeMs > 0) this.shakeMs = Math.max(0, this.shakeMs - ms);

    if (this.particles.length === 0) return;
    const alive: Particle[] = [];
    for (const p of this.particles) {
      p.ageMs += ms;
      if (p.ageMs >= PARTICLE_LIFE_MS) continue;
      p.vy += PARTICLE_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      alive.push(p);
    }
    this.particles = alive;
  }

  /** Returns current shake offset in virtual coords. */
  shakeOffset(): { x: number; y: number } {
    if (this.shakeMs <= 0) return { x: 0, y: 0 };
    const t = this.shakeMs / SHAKE_DURATION_MS; // 1 at impact → 0 at rest
    const mag = SHAKE_INTENSITY * t;
    return {
      x: (Math.random() * 2 - 1) * mag,
      y: (Math.random() * 2 - 1) * mag,
    };
  }

  drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.ageMs / PARTICLE_LIFE_MS;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

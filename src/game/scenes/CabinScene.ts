/**
 * CabinScene: Drivable Train Cabin Mini-Game
 * Windshield parallax, pull-cord whistle, firebox, throttle lever, and dials.
 */

import { gameState } from '../GameState';
import { PixelPrimitives } from '../art/PixelPrimitives';
import { Sprites } from '../art/Sprites';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';
import { dialogOverlay } from '../ui/DialogOverlay';
import { DIALOGUES } from '../../data/catalanVocabulary';
import { assetManager } from '../../engine/AssetManager';

export class CabinScene {
  private animTime: number = 0;
  private scrollOffset: number = 0;
  private chuffTimer: number = 0;
  private clackTimer: number = 0;

  // Whistle spring physics
  private whistlePull: number = 0; // 0 to 1
  private whistleVelocity: number = 0;
  private isWhistleHeld: boolean = false;

  // Firebox state
  private isFireboxOpen: boolean = false;
  private fireboxSparkTime: number = 0;

  // Throttle (0 to 1)
  private isThrottleHeld: boolean = false;

  // Back button rect
  private backBtnRect = { x: 12, y: 12, w: 100, h: 32 };

  // Whistle handle area
  private whistleRect = { x: 500, y: 30, w: 40, h: 80 };

  // Firebox door area
  private fireboxRect = { x: 250, y: 200, w: 140, h: 90 };

  // Throttle lever area
  private throttleRect = { x: 440, y: 160, w: 60, h: 120 };

  public enter(): void {
    // Show cabin intro dialogue
    setTimeout(() => {
      dialogOverlay.show({
        speaker: DIALOGUES.cabinIntro.speaker,
        title: DIALOGUES.cabinIntro.title,
        text: DIALOGUES.cabinIntro.text,
        voiceText: DIALOGUES.cabinIntro.voiceText,
        avatar: 'driver'
      });
    }, 200);
  }

  public update(dt: number): void {
    this.animTime += dt;
    const state = gameState.get();

    // Whistle spring physics
    if (!this.isWhistleHeld) {
      const spring = -18 * this.whistlePull;
      const damping = -6 * this.whistleVelocity;
      this.whistleVelocity += (spring + damping) * dt;
      this.whistlePull += this.whistleVelocity * dt;
      if (this.whistlePull < 0) {
        this.whistlePull = 0;
        this.whistleVelocity = 0;
      }
    }

    // Engine simulation & physics
    const targetSpeed = (state.throttle / 100) * (state.steamPressure / 100) * 80;
    const currentSpeed = state.speedKmh + (targetSpeed - state.speedKmh) * Math.min(1, dt * 1.5);
    gameState.updateFlags({ speedKmh: currentSpeed });

    if (currentSpeed > 1) {
      // Parallax movement
      this.scrollOffset += currentSpeed * dt * 4;

      // Distance progress (destination at 1000)
      const newDist = state.distanceTraveled + currentSpeed * dt * 2;
      gameState.updateFlags({ distanceTraveled: newDist });

      // Audio chuff loop
      const chuffInterval = Math.max(0.18, 0.9 - (currentSpeed / 80) * 0.7);
      this.chuffTimer += dt;
      if (this.chuffTimer >= chuffInterval) {
        this.chuffTimer = 0;
        soundFX.playChuff(Math.max(0.7, currentSpeed / 40));
      }

      // Rail joint clack
      this.clackTimer += dt;
      if (this.clackTimer >= chuffInterval * 2.8) {
        this.clackTimer = 0;
        soundFX.playWheelClack();
      }

      // Check destination arrival
      if (newDist >= 800 && !state.episodeCompleted) {
        gameState.updateFlags({ episodeCompleted: true, throttle: 0 });
        soundFX.playSuccess();
        dialogOverlay.show({
          title: DIALOGUES.destinationReached.title,
          text: DIALOGUES.destinationReached.text,
          voiceText: DIALOGUES.destinationReached.voiceText,
          avatar: 'driver',
          onDismiss: () => {
            soundFX.playBell();
          }
        });
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = this.animTime;
    const state = gameState.get();
    const modernBg = assetManager.getImage('cabin');

    if (modernBg) {
      // Modern High-Bit Pixel Art Cabin Interior
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(modernBg, 0, 0, 640, 360);
      ctx.restore();

      // Dynamic animated fire inside firebox
      this.renderModernFirebox(ctx, time, state);

      // Dynamic whistle cord with spring pull
      this.renderModernWhistle(ctx, time);

      // Dynamic throttle lever & speed indicator
      this.renderModernControls(ctx, state);

      // Journey Progress Bar at top
      this.renderProgressBar(ctx, state.distanceTraveled);

      // Back to Station Button
      this.renderBackButton(ctx);
    } else {
      // Procedural fallback
      this.renderWindshieldScenery(ctx, time, state.speedKmh);
      this.renderCabinInterior(ctx, time, state);
      this.renderWindowFrame(ctx);
      this.renderWhistleCord(ctx);
      this.renderFirebox(ctx, time, state);
      this.renderThrottleLever(ctx, state.throttle);
      this.renderDials(ctx, state.steamPressure, state.speedKmh);
      this.renderProgressBar(ctx, state.distanceTraveled);
      this.renderBackButton(ctx);
    }
  }

  private renderModernFirebox(ctx: CanvasRenderingContext2D, time: number, state: any): void {
    const fx = 535;
    const fy = 220;
    const fw = 70;
    const fh = 55;

    ctx.save();
    ctx.beginPath();
    ctx.rect(fx, fy, fw, fh);
    ctx.clip();

    // Charcoal bed
    ctx.fillStyle = '#1c0702';
    ctx.fillRect(fx, fy + 35, fw, 20);

    // Dancing fire flames
    const intensity = Math.max(0.4, state.steamPressure / 100);
    const flameColors = ['#f59e0b', '#ef4444', '#fef08a'];
    for (let i = 0; i < 6; i++) {
      const h = 18 + Math.sin(time * 12 + i * 1.5) * 14 * intensity;
      const x = fx + 6 + i * 10;
      ctx.fillStyle = flameColors[i % flameColors.length];
      ctx.beginPath();
      ctx.moveTo(x - 5, fy + 48);
      ctx.quadraticCurveTo(x, fy + 48 - h * 1.2, x + 6, fy + 48);
      ctx.fill();
    }

    // Sparks when stoked
    if (state.branchesInFirebox || this.fireboxSparkTime > 0) {
      for (let s = 0; s < 5; s++) {
        const sx = fx + 10 + ((time * 40 + s * 14) % (fw - 20));
        const sy = fy + 40 - ((time * 50 + s * 22) % 35);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
    ctx.restore();
  }

  private renderModernWhistle(ctx: CanvasRenderingContext2D, time: number): void {
    const pullY = this.whistlePull * 20;
    const cordX = 398;

    // Cord
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cordX, 10);
    ctx.lineTo(cordX, 120 + pullY);
    ctx.stroke();

    // Wood pull handle
    PixelPrimitives.drawBeveledRect(ctx, cordX - 4, 120 + pullY, 9, 28, '#78350f', '#b45309', '#451a03', 1);

    // Whistle steam burst
    if (this.whistlePull > 0.3) {
      ctx.save();
      for (let p = 0; p < 4; p++) {
        const px = cordX - 10 + Math.sin(time * 15 + p) * 12;
        const py = 20 - p * 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, 4 + p * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderModernControls(ctx: CanvasRenderingContext2D, state: any): void {
    // Throttle lever indicator (around x: 295, y: 255)
    const throttleAngle = -0.5 + (state.throttle / 100) * 1.0;
    ctx.save();
    ctx.translate(295, 255);
    ctx.rotate(throttleAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, -28, 6, 28);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -28, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Speed indicator pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(490, 8, 138, 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(490, 8, 138, 24);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${Math.round(state.speedKmh)} km/h`, 559, 24);
  }

  private renderWindshieldScenery(ctx: CanvasRenderingContext2D, time: number, speed: number): void {
    const offset = this.scrollOffset;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 180);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(1, '#fed7aa');
    ctx.fillStyle = sky;
    ctx.fillRect(80, 20, 480, 160);

    // Distant Pyrenees / Montserrat peaks parallax (slow)
    const mountainOffset = (offset * 0.1) % 640;
    ctx.fillStyle = '#6d597a';
    ctx.beginPath();
    ctx.moveTo(80, 140);
    for (let x = 80; x <= 560; x += 30) {
      const my = 100 + Math.sin((x + mountainOffset) * 0.02) * 25 + Math.cos((x + mountainOffset) * 0.05) * 12;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(560, 180);
    ctx.lineTo(80, 180);
    ctx.fill();

    // Midground rolling green hills & olive groves
    const hillOffset = (offset * 0.35) % 640;
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(80, 155);
    for (let x = 80; x <= 560; x += 20) {
      const hy = 135 + Math.sin((x + hillOffset) * 0.03) * 15;
      ctx.lineTo(x, hy);
    }
    ctx.lineTo(560, 180);
    ctx.lineTo(80, 180);
    ctx.fill();

    // Foreground track bed rushing forward (perspective)
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(80, 165);
    ctx.lineTo(560, 165);
    ctx.lineTo(600, 195);
    ctx.lineTo(40, 195);
    ctx.fill();

    // Rails in perspective
    ctx.fillStyle = '#cbd5e1';
    PixelPrimitives.drawLine(ctx, 280, 165, 140, 195, '#e2e8f0', 3);
    PixelPrimitives.drawLine(ctx, 360, 165, 500, 195, '#e2e8f0', 3);

    // Passing wooden ties (cross sleepers rushing towards player)
    const tiePhase = (offset * 1.5) % 30;
    for (let ty = 166 + tiePhase; ty < 195; ty += 12) {
      const spread = (ty - 165) / 30;
      const lx = 280 - spread * 140;
      const rx = 360 + spread * 140;
      PixelPrimitives.drawLine(ctx, lx, ty, rx, ty, '#451a03', 2);
    }

    // Passing Pine Trees & Sunflower Fields on sides
    const treeSpacing = 140;
    const treeX = ((offset * 1.8) % treeSpacing);
    for (let tx = 80 - treeX; tx < 560; tx += treeSpacing) {
      if (tx > 85 && tx < 540) {
        Sprites.drawPineTree(ctx, tx, 165, 0.45);
      }
    }

    // Windshield reflections & glass shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(120, 20);
    ctx.lineTo(240, 20);
    ctx.lineTo(160, 170);
    ctx.lineTo(80, 170);
    ctx.fill();
  }

  private renderCabinInterior(ctx: CanvasRenderingContext2D, time: number, _state: unknown): void {
    // Dark cast-iron / riveted steel cockpit frame
    ctx.fillStyle = '#18181b';
    // Top roof
    ctx.fillRect(0, 0, 640, 30);
    // Left pillar
    ctx.fillRect(0, 0, 90, 300);
    // Right pillar
    ctx.fillRect(550, 0, 90, 300);
    // Bottom dashboard / boiler bulk
    ctx.fillRect(0, 175, 640, 130);

    // Decorative steel rivets along edges
    ctx.fillStyle = '#71717a';
    for (let y = 15; y < 290; y += 22) {
      PixelPrimitives.drawPixelCircle(ctx, 84, y, 2, '#71717a', true);
      PixelPrimitives.drawPixelCircle(ctx, 556, y, 2, '#71717a', true);
    }
  }

  private renderWindowFrame(ctx: CanvasRenderingContext2D): void {
    // 3D Beveled rim around forward windshield
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 4;
    ctx.strokeRect(88, 26, 464, 150);

    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.strokeRect(90, 28, 460, 146);
  }

  private renderWhistleCord(ctx: CanvasRenderingContext2D): void {
    // Brass cord mount on ceiling
    const mountX = 520;
    const mountY = 24;
    PixelPrimitives.drawPixelCircle(ctx, mountX, mountY, 5, Sprites.COLORS.brassGold, true);

    // Spring displaced cord
    const cordLength = 55 + this.whistlePull * 32;
    const handleY = mountY + cordLength;

    // Braided cord
    PixelPrimitives.drawLine(ctx, mountX, mountY, mountX, handleY, '#fef08a', 2);

    // Wooden / Brass pull handle
    PixelPrimitives.drawBeveledRect(
      ctx,
      mountX - 8,
      handleY,
      16,
      24,
      Sprites.COLORS.woodBrown,
      Sprites.COLORS.goldHighlight,
      Sprites.COLORS.woodDark,
      2
    );

    // Whistle Label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('XIULET', mountX, handleY + 15);

    // Floating steam burst if whistle is currently pulled
    if (this.whistlePull > 0.4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      PixelPrimitives.drawPixelCircle(ctx, mountX - 15, mountY - 5, 12, '#ffffff', true);
      PixelPrimitives.drawPixelCircle(ctx, mountX - 25, mountY - 8, 16, '#ffffff', true);

      // Sound label
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('TUUUT!', mountX - 35, mountY - 4);
    }
  }

  private renderFirebox(ctx: CanvasRenderingContext2D, time: number, state: ReturnType<typeof gameState.get>): void {
    const { fireboxRect } = this;

    // Firebox outer furnace frame
    PixelPrimitives.drawBeveledRect(
      ctx,
      fireboxRect.x,
      fireboxRect.y,
      fireboxRect.w,
      fireboxRect.h,
      '#09090b',
      '#3f3f46',
      '#000000',
      3
    );

    if (this.isFireboxOpen) {
      // Roaring fire cavity!
      const fireW = fireboxRect.w - 16;
      const fireH = fireboxRect.h - 16;
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(fireboxRect.x + 8, fireboxRect.y + 8, fireW, fireH);

      // Flickering flame layers
      for (let i = 0; i < 7; i++) {
        const fx = fireboxRect.x + 16 + i * 16;
        const flameHeight = 35 + Math.sin(time * 12 + i * 1.5) * 12;
        const fy = fireboxRect.y + fireboxRect.h - 8 - flameHeight;

        // Orange/Red flame base
        PixelPrimitives.drawPixelCircle(ctx, fx, fy + flameHeight / 2, 10, '#ea580c', true);
        // Bright yellow hot core
        PixelPrimitives.drawPixelCircle(ctx, fx, fy + flameHeight / 2 + 6, 6, '#fef08a', true);
      }

      // Burning pine wood / coal embers
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(fireboxRect.x + 12, fireboxRect.y + fireboxRect.h - 18, fireW - 8, 10);

      // Flying sparks
      for (let s = 0; s < 4; s++) {
        const sparkX = fireboxRect.x + 20 + ((time * 40 + s * 30) % (fireW - 40));
        const sparkY = fireboxRect.y + 14 + ((time * 50 + s * 25) % (fireH - 20));
        PixelPrimitives.drawPixelCircle(ctx, sparkX, sparkY, 1.5, '#fef08a', true);
      }

      // Furnace open door (hinged to the left)
      PixelPrimitives.drawBeveledRect(
        ctx,
        fireboxRect.x - 45,
        fireboxRect.y + 5,
        45,
        fireboxRect.h - 10,
        '#27272a',
        '#52525b',
        '#18181b',
        2
      );
    } else {
      // Closed heavy cast iron door
      PixelPrimitives.drawBeveledRect(
        ctx,
        fireboxRect.x + 8,
        fireboxRect.y + 8,
        fireboxRect.w - 16,
        fireboxRect.h - 16,
        '#27272a',
        '#52525b',
        '#18181b',
        2
      );

      // Hinges and Door Handle
      PixelPrimitives.drawPixelCircle(ctx, fireboxRect.x + fireboxRect.w - 24, fireboxRect.y + fireboxRect.h / 2, 7, Sprites.COLORS.brassGold, true);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(fireboxRect.x + fireboxRect.w - 30, fireboxRect.y + fireboxRect.h / 2 - 2, 12, 4);

      // Fiery glow leaking through peep holes
      const glowAlpha = 0.6 + Math.sin(time * 6) * 0.3;
      ctx.fillStyle = `rgba(249, 115, 22, ${glowAlpha})`;
      PixelPrimitives.drawPixelCircle(ctx, fireboxRect.x + 35, fireboxRect.y + fireboxRect.h / 2, 5, ctx.fillStyle, true);
      PixelPrimitives.drawPixelCircle(ctx, fireboxRect.x + 55, fireboxRect.y + fireboxRect.h / 2, 5, ctx.fillStyle, true);
      PixelPrimitives.drawPixelCircle(ctx, fireboxRect.x + 75, fireboxRect.y + fireboxRect.h / 2, 5, ctx.fillStyle, true);
    }

    // Firebox Label: "CALDERA (EL FOC)"
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LA CALDERA', fireboxRect.x + fireboxRect.w / 2, fireboxRect.y + fireboxRect.h + 9);
  }

  private renderThrottleLever(ctx: CanvasRenderingContext2D, throttle: number): void {
    const { throttleRect } = this;

    // Lever base quadrant / housing
    PixelPrimitives.drawBeveledRect(
      ctx,
      throttleRect.x,
      throttleRect.y,
      throttleRect.w,
      throttleRect.h,
      '#18181b',
      '#3f3f46',
      '#09090b',
      2
    );

    // Notched track for lever
    ctx.fillStyle = '#09090b';
    ctx.fillRect(throttleRect.x + throttleRect.w / 2 - 3, throttleRect.y + 12, 6, throttleRect.h - 24);

    // Throttle position (0 = bottom, 100 = top)
    const normalizedY = 1 - throttle / 100;
    const gripY = throttleRect.y + 16 + normalizedY * (throttleRect.h - 40);
    const gripX = throttleRect.x + throttleRect.w / 2;

    // Heavy iron lever arm
    PixelPrimitives.drawLine(ctx, gripX, throttleRect.y + throttleRect.h - 16, gripX, gripY, '#94a3b8', 5);

    // Red ball grip / handle
    PixelPrimitives.drawPixelCircle(ctx, gripX, gripY, 11, Sprites.COLORS.engineRed, true);
    PixelPrimitives.drawPixelCircle(ctx, gripX - 2, gripY - 2, 3, '#fca5a5', true);

    // Throttle Label: "ACCELERADOR"
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VAPOR', gripX, throttleRect.y + throttleRect.h + 9);
  }

  private renderDials(ctx: CanvasRenderingContext2D, steam: number, speed: number): void {
    // 1. Manòmetre (Steam Pressure) Dial at left
    const pX = 140;
    const pY = 225;
    const pR = 26;

    // Outer brass rim
    PixelPrimitives.drawPixelCircle(ctx, pX, pY, pR + 3, Sprites.COLORS.brassGold, true);
    PixelPrimitives.drawPixelCircle(ctx, pX, pY, pR, '#ffffff', true);

    // Dial markings & red safety zone
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(pX, pY, pR - 3, -Math.PI * 0.2, 0);
    ctx.stroke();

    // Pressure needle
    const pAngle = -Math.PI * 0.75 + (steam / 100) * Math.PI * 1.5;
    PixelPrimitives.drawLine(ctx, pX, pY, pX + Math.cos(pAngle) * (pR - 6), pY + Math.sin(pAngle) * (pR - 6), '#dc2626', 2);
    PixelPrimitives.drawPixelCircle(ctx, pX, pY, 3, '#0f172a', true);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESSIÓ', pX, pY + 12);

    // 2. Velocímetre (Speedometer) Dial
    const sX = 205;
    const sY = 225;
    const sR = 26;

    PixelPrimitives.drawPixelCircle(ctx, sX, sY, sR + 3, Sprites.COLORS.brassGold, true);
    PixelPrimitives.drawPixelCircle(ctx, sX, sY, sR, '#ffffff', true);

    // Speed needle
    const sAngle = -Math.PI * 0.75 + (speed / 80) * Math.PI * 1.5;
    PixelPrimitives.drawLine(ctx, sX, sY, sX + Math.cos(sAngle) * (sR - 6), sY + Math.sin(sAngle) * (sR - 6), '#0f172a', 2);
    PixelPrimitives.drawPixelCircle(ctx, sX, sY, 3, '#dc2626', true);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speed)} km/h`, sX, sY + 12);
  }

  private renderProgressBar(ctx: CanvasRenderingContext2D, distance: number): void {
    const barX = 140;
    const barY = 8;
    const barW = 360;
    const barH = 14;

    // Track line
    PixelPrimitives.drawBeveledRect(ctx, barX, barY, barW, barH, '#0f172a', '#475569', '#020617', 1);

    // Green progress
    const pct = Math.min(1, distance / 800);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(barX + 2, barY + 2, Math.floor((barW - 4) * pct), barH - 4);

    // Moving mini train icon
    const trainX = barX + Math.floor((barW - 12) * pct);
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚂', trainX + 4, barY + 11);

    // Stations labels
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ELS PINS', barX, barY + 23);
    ctx.textAlign = 'right';
    ctx.fillText('VALL VERDA', barX + barW, barY + 23);
  }

  private renderBackButton(ctx: CanvasRenderingContext2D): void {
    PixelPrimitives.drawBeveledRect(
      ctx,
      this.backBtnRect.x,
      this.backBtnRect.y,
      this.backBtnRect.w,
      this.backBtnRect.h,
      '#334155',
      '#64748b',
      '#0f172a',
      2
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("🔙 L'Estació", this.backBtnRect.x + this.backBtnRect.w / 2, this.backBtnRect.y + 19);

    // If destination reached, render next station & replay buttons
    if (gameState.get().episodeCompleted) {
      // Next Station: El Pont del Riu
      PixelPrimitives.drawBeveledRect(ctx, 130, 36, 160, 30, '#0284c7', '#38bdf8', '#0369a1', 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🌉 El Pont del Riu", 210, 55);

      // Replay button
      PixelPrimitives.drawBeveledRect(ctx, 300, 36, 160, 30, '#15803d', '#4ade80', '#052e16', 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔁 Tornar a viatjar', 380, 55);
    }
  }

  public handlePointerMove(vx: number, vy: number): boolean {
    if (this.isWhistleHeld) {
      const pull = Math.max(0, Math.min(1, (vy - 20) / 80));
      this.whistlePull = pull;
      return true;
    }

    if (this.isThrottleHeld) {
      const normalized = Math.max(0, Math.min(1, (300 - vy) / 100));
      gameState.updateFlags({ throttle: Math.round(normalized * 100) });
      return true;
    }

    return false;
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    // 1. Back button
    if (
      vx >= this.backBtnRect.x &&
      vx <= this.backBtnRect.x + this.backBtnRect.w &&
      vy >= this.backBtnRect.y &&
      vy <= this.backBtnRect.y + this.backBtnRect.h
    ) {
      soundFX.playClick();
      gameState.setScene('station');
      return true;
    }

    // Go to next station: El Pont del Riu
    if (gameState.get().episodeCompleted && vx >= 130 && vx <= 290 && vy >= 36 && vy <= 66) {
      soundFX.playWhistle();
      gameState.setScene('bridge');
      return true;
    }

    // Replay journey button
    if (gameState.get().episodeCompleted && vx >= 300 && vx <= 460 && vy >= 36 && vy <= 66) {
      soundFX.playWhistle();
      gameState.updateFlags({
        distanceTraveled: 0,
        episodeCompleted: false,
        throttle: 40
      });
      speechManager.speak("Endavant un altre cop! Tots al tren!");
      return true;
    }

    // 2. Whistle cord pull (support artwork cord at x~398 and original at x~500)
    const isWhistle =
      (vx >= this.whistleRect.x - 25 &&
        vx <= this.whistleRect.x + this.whistleRect.w + 25 &&
        vy >= this.whistleRect.y &&
        vy <= this.whistleRect.y + this.whistleRect.h + 30) ||
      (vx >= 370 && vx <= 430 && vy >= 10 && vy <= 160);

    if (isWhistle) {
      this.isWhistleHeld = true;
      this.whistlePull = 1.0;
      soundFX.playWhistle();
      speechManager.speak("TUUU-TUUUUT! El xiulet fa sonar el vapor!");
      return true;
    }

    // 3. Firebox click (support artwork firebox at x~535 and original at x~250)
    const { fireboxRect } = this;
    const isFirebox =
      (vx >= fireboxRect.x &&
        vx <= fireboxRect.x + fireboxRect.w &&
        vy >= fireboxRect.y &&
        vy <= fireboxRect.y + fireboxRect.h) ||
      (vx >= 490 && vx <= 635 && vy >= 170 && vy <= 320);

    if (isFirebox) {
      if (gameState.hasItem('branques') || gameState.get().selectedItemId === 'branques') {
        this.isFireboxOpen = true;
        this.fireboxSparkTime = 2.0;
        soundFX.playShovel();
        gameState.removeItem('branques');
        gameState.updateFlags({
          branchesInFirebox: true,
          steamPressure: 100
        });
        dialogOverlay.show({
          title: DIALOGUES.fireFed.title,
          text: DIALOGUES.fireFed.text,
          voiceText: DIALOGUES.fireFed.voiceText,
          avatar: 'driver'
        });
        return true;
      }

      if (!this.isFireboxOpen) {
        this.isFireboxOpen = true;
        soundFX.playClick();
        speechManager.speak("La porta del foc és oberta! El foc crema fort.");
      } else {
        this.isFireboxOpen = false;
        soundFX.playClick();
        speechManager.speak("Tanquem la caldera per mantenir la calor.");
      }
      return true;
    }

    // 4. Throttle Lever click / drag (support artwork lever at x~295 and original at x~440)
    const { throttleRect } = this;
    const isThrottle =
      (vx >= throttleRect.x - 15 &&
        vx <= throttleRect.x + throttleRect.w + 15 &&
        vy >= throttleRect.y &&
        vy <= throttleRect.y + throttleRect.h + 20) ||
      (vx >= 240 && vx <= 360 && vy >= 190 && vy <= 300);

    if (isThrottle) {
      this.isThrottleHeld = true;
      soundFX.playLever();
      const current = gameState.get().throttle;
      const nextThrottle = current < 30 ? 75 : Math.min(100, current + 25);
      gameState.updateFlags({ throttle: nextThrottle });
      speechManager.speak(`Accelerem el tren! Potència al ${nextThrottle} per cent!`);
      return true;
    }

    return false;
  }

  public handlePointerUp(): void {
    this.isWhistleHeld = false;
    this.isThrottleHeld = false;
  }
}

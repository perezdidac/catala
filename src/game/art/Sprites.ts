/**
 * Sprites: Procedural Pixel Art Generator for Characters, Locomotives, Stations & Scenery
 * 100% Procedural Pixel Art - Zero external image files needed!
 */

import { PixelPrimitives } from './PixelPrimitives';

export class Sprites {
  // --- PALETTES ---
  public static readonly COLORS = {
    // Sky & Atmosphere
    skyTop: '#3b82f6',
    skyMid: '#60a5fa',
    skyHorizon: '#fed7aa',
    cloudWhite: '#ffffff',
    cloudShadow: '#e2e8f0',

    // Montserrat Mountains
    mountainFar: '#6d597a',
    mountainMid: '#867296',
    mountainNear: '#513b56',

    // Pine Forest & Vegetation
    pineGreenDark: '#14532d',
    pineGreenMid: '#16a34a',
    pineGreenLight: '#4ade80',
    pineTrunkDark: '#451a03',
    pineTrunkLight: '#78350f',
    grassGreen: '#22c55e',
    earthBrown: '#713f12',
    ballastGrey: '#64748b',
    ballastDark: '#334155',

    // Station
    stoneWall: '#e2d9cc',
    stoneShadow: '#b8a99a',
    terracotta: '#c2410c',
    terracottaDark: '#9a3412',
    terracottaLight: '#ea580c',
    woodBrown: '#854d0e',
    woodDark: '#451a03',
    goldBrass: '#eab308',
    goldHighlight: '#fef08a',

    // Train
    engineBlack: '#18181b',
    engineGrey: '#3f3f46',
    engineHighlight: '#71717a',
    engineRed: '#dc2626',
    metalSilver: '#cbd5e1',
    brassGold: '#f59e0b',
    lampGlow: '#fef08a',

    // Stationmaster Pep
    uniformBlue: '#1e3a8a',
    uniformGold: '#facc15',
    skinPeach: '#fed7aa',
    skinShadow: '#fba584',
    capRed: '#b91c1c',
    hairBrown: '#451a03',

    // UI & Action Verbs
    cyanMira: '#00E5FF',
    amberAgafa: '#FFB300',
    greenParla: '#00E676',
    crimsonCondueix: '#FF1744'
  };

  /**
   * Draws the Montserrat Mountain peaks in the far distance
   */
  public static drawMountains(ctx: CanvasRenderingContext2D, time: number): void {
    // Distant jagged serrated silhouette (reminiscent of Montserrat)
    const pointsFar = [
      [0, 140], [50, 115], [90, 130], [130, 95], [170, 120],
      [220, 85], [260, 110], [310, 80], [360, 105], [420, 75],
      [470, 110], [530, 90], [580, 120], [640, 135]
    ];

    ctx.fillStyle = Sprites.COLORS.mountainFar;
    ctx.beginPath();
    ctx.moveTo(0, 160);
    for (const [x, y] of pointsFar) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(640, 180);
    ctx.lineTo(0, 180);
    ctx.fill();

    // Mid mountain ridges with rocky highlights
    const pointsMid = [
      [0, 165], [60, 135], [110, 150], [160, 125], [210, 145],
      [270, 115], [320, 140], [380, 110], [440, 135], [500, 115],
      [560, 140], [640, 150]
    ];

    ctx.fillStyle = Sprites.COLORS.mountainMid;
    ctx.beginPath();
    ctx.moveTo(0, 180);
    for (const [x, y] of pointsMid) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(640, 195);
    ctx.lineTo(0, 195);
    ctx.fill();

    // Subtle sun flare / morning golden glow
    const sunY = 70 + Math.sin(time * 0.5) * 2;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    PixelPrimitives.drawPixelCircle(ctx, 480, sunY, 28, 'rgba(254, 240, 138, 0.4)', true);
    PixelPrimitives.drawPixelCircle(ctx, 480, sunY, 18, '#fef08a', true);
  }

  /**
   * Billowing pixel clouds drifting across the sky
   */
  public static drawDriftingClouds(ctx: CanvasRenderingContext2D, time: number): void {
    const clouds = [
      { x: ((time * 8 + 30) % 720) - 80, y: 25, scale: 1.2 },
      { x: ((time * 5 + 240) % 720) - 80, y: 45, scale: 0.9 },
      { x: ((time * 11 + 480) % 720) - 80, y: 18, scale: 1.5 }
    ];

    for (const cl of clouds) {
      const cx = Math.floor(cl.x);
      const cy = Math.floor(cl.y);
      const r = Math.floor(14 * cl.scale);

      // Shadow underside
      PixelPrimitives.drawPixelCircle(ctx, cx, cy + 3, r + 2, Sprites.COLORS.cloudShadow, true);
      PixelPrimitives.drawPixelCircle(ctx, cx - 12 * cl.scale, cy + 5, r - 2, Sprites.COLORS.cloudShadow, true);
      PixelPrimitives.drawPixelCircle(ctx, cx + 14 * cl.scale, cy + 4, r - 1, Sprites.COLORS.cloudShadow, true);

      // Fluffy white top
      PixelPrimitives.drawPixelCircle(ctx, cx, cy, r, Sprites.COLORS.cloudWhite, true);
      PixelPrimitives.drawPixelCircle(ctx, cx - 12 * cl.scale, cy + 2, r - 3, Sprites.COLORS.cloudWhite, true);
      PixelPrimitives.drawPixelCircle(ctx, cx + 14 * cl.scale, cy + 1, r - 2, Sprites.COLORS.cloudWhite, true);
      PixelPrimitives.drawPixelCircle(ctx, cx - 4 * cl.scale, cy - 6 * cl.scale, r - 4, Sprites.COLORS.cloudWhite, true);
    }
  }

  /**
   * Classic Catalan Stone Pine (Pi Pinyer) with rounded umbrella canopy
   */
  public static drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
    const trunkW = Math.max(4, Math.floor(8 * scale));
    const trunkH = Math.floor(65 * scale);
    const canopyR = Math.floor(32 * scale);

    // Pine trunk with bark texture
    ctx.fillStyle = Sprites.COLORS.pineTrunkDark;
    ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);

    ctx.fillStyle = Sprites.COLORS.pineTrunkLight;
    ctx.fillRect(x - trunkW / 2 + 1, y - trunkH, 2, trunkH);

    // Umbrella pine canopy (layered clusters of needles)
    const canopyY = y - trunkH;

    // Dark base
    PixelPrimitives.drawPixelCircle(ctx, x, canopyY, canopyR, Sprites.COLORS.pineGreenDark, true);
    PixelPrimitives.drawPixelCircle(ctx, x - 18 * scale, canopyY + 4, canopyR * 0.75, Sprites.COLORS.pineGreenDark, true);
    PixelPrimitives.drawPixelCircle(ctx, x + 18 * scale, canopyY + 4, canopyR * 0.75, Sprites.COLORS.pineGreenDark, true);

    // Mid green clusters
    PixelPrimitives.drawPixelCircle(ctx, x, canopyY - 4 * scale, canopyR * 0.85, Sprites.COLORS.pineGreenMid, true);
    PixelPrimitives.drawPixelCircle(ctx, x - 14 * scale, canopyY - 1 * scale, canopyR * 0.65, Sprites.COLORS.pineGreenMid, true);
    PixelPrimitives.drawPixelCircle(ctx, x + 14 * scale, canopyY - 1 * scale, canopyR * 0.65, Sprites.COLORS.pineGreenMid, true);

    // Light sunlit needle tips
    PixelPrimitives.drawPixelCircle(ctx, x - 6 * scale, canopyY - 12 * scale, canopyR * 0.45, Sprites.COLORS.pineGreenLight, true);
    PixelPrimitives.drawPixelCircle(ctx, x + 8 * scale, canopyY - 10 * scale, canopyR * 0.4, Sprites.COLORS.pineGreenLight, true);
  }

  /**
   * Station Building: "L'Estació dels Pins"
   */
  public static drawStationBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    const w = 180;
    const h = 130;

    // Main Sandstone facade
    PixelPrimitives.drawBeveledRect(
      ctx,
      x,
      y - h,
      w,
      h,
      Sprites.COLORS.stoneWall,
      '#ffffff',
      Sprites.COLORS.stoneShadow,
      3
    );

    // Terracotta tiled roof with overhang
    const roofOverhang = 12;
    const roofH = 26;
    ctx.fillStyle = Sprites.COLORS.terracottaDark;
    ctx.fillRect(x - roofOverhang, y - h - roofH, w + roofOverhang * 2, roofH);

    // Roof tile scalloping
    for (let tx = x - roofOverhang; tx < x + w + roofOverhang; tx += 8) {
      ctx.fillStyle = (tx / 8) % 2 === 0 ? Sprites.COLORS.terracotta : Sprites.COLORS.terracottaLight;
      ctx.fillRect(tx, y - h - roofH, 7, roofH - 2);
      ctx.fillStyle = Sprites.COLORS.terracottaDark;
      ctx.fillRect(tx, y - h - 3, 7, 3);
    }

    // Station Name Signboard: "L'ESTACIÓ DELS PINS"
    const signW = 140;
    const signH = 22;
    const signX = x + (w - signW) / 2;
    const signY = y - h + 10;
    PixelPrimitives.drawBeveledRect(
      ctx,
      signX,
      signY,
      signW,
      signH,
      '#1e293b',
      '#d97706',
      '#78350f',
      2
    );

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("L'ESTACIÓ DELS PINS", signX + signW / 2, signY + 15);

    // Working Station Wall Clock
    const clockX = x + w / 2;
    const clockY = y - h + 48;
    const clockR = 12;

    PixelPrimitives.drawPixelCircle(ctx, clockX, clockY, clockR + 2, '#78350f', true);
    PixelPrimitives.drawPixelCircle(ctx, clockX, clockY, clockR, '#ffffff', true);

    // Clock hour markings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(clockX - 1, clockY - clockR + 2, 2, 2);
    ctx.fillRect(clockX - 1, clockY + clockR - 4, 2, 2);
    ctx.fillRect(clockX - clockR + 2, clockY - 1, 2, 2);
    ctx.fillRect(clockX + clockR - 4, clockY - 1, 2, 2);

    // Clock hands ticking
    const secAngle = (time * 1.5) % (Math.PI * 2);
    const minAngle = (time * 0.1) % (Math.PI * 2);
    PixelPrimitives.drawLine(
      ctx,
      clockX,
      clockY,
      clockX + Math.sin(minAngle) * 7,
      clockY - Math.cos(minAngle) * 7,
      '#0f172a',
      1
    );
    PixelPrimitives.drawLine(
      ctx,
      clockX,
      clockY,
      clockX + Math.sin(secAngle) * 9,
      clockY - Math.cos(secAngle) * 9,
      '#dc2626',
      1
    );

    // Arched Station Waiting Door
    const doorW = 34;
    const doorH = 50;
    const doorX = x + 30;
    const doorY = y - doorH;

    ctx.fillStyle = '#451a03';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    PixelPrimitives.drawPixelCircle(ctx, doorX + doorW / 2, doorY, doorW / 2, '#451a03', true);

    ctx.fillStyle = '#854d0e';
    ctx.fillRect(doorX + 3, doorY + 6, doorW - 6, doorH - 6);

    // Brass door handle
    PixelPrimitives.drawPixelCircle(ctx, doorX + 6, doorY + 28, 2, Sprites.COLORS.goldBrass, true);

    // Arched Station Window
    const winW = 34;
    const winH = 40;
    const winX = x + w - 65;
    const winY = y - 55;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(winX, winY, winW, winH);
    PixelPrimitives.drawPixelCircle(ctx, winX + winW / 2, winY, winW / 2, '#1e293b', true);

    // Glowing warm glass panes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(winX + 3, winY + 3, winW / 2 - 4, winH / 2 - 4);
    ctx.fillRect(winX + winW / 2 + 1, winY + 3, winW / 2 - 4, winH / 2 - 4);
    ctx.fillRect(winX + 3, winY + winH / 2 + 1, winW / 2 - 4, winH / 2 - 4);
    ctx.fillRect(winX + winW / 2 + 1, winY + winH / 2 + 1, winW / 2 - 4, winH / 2 - 4);

    // Station Platform Wooden Bench
    const benchX = x + 85;
    const benchY = y - 18;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(benchX, benchY, 38, 4); // seat
    ctx.fillRect(benchX, benchY - 10, 38, 3); // back
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(benchX + 3, benchY + 4, 3, 14); // leg 1
    ctx.fillRect(benchX + 32, benchY + 4, 3, 14); // leg 2

    // Station Hanging Lantern with warm pulsing glow
    const lanternX = x + 16;
    const lanternY = y - h + 42;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lanternX - 1, lanternY - 6, 2, 6);
    PixelPrimitives.drawPixelCircle(ctx, lanternX, lanternY, 4, '#1e293b', true);

    const glowAlpha = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(254, 240, 138, ${glowAlpha})`;
    PixelPrimitives.drawPixelCircle(ctx, lanternX, lanternY, 10, `rgba(254, 240, 138, ${glowAlpha * 0.4})`, true);
    PixelPrimitives.drawPixelCircle(ctx, lanternX, lanternY, 3, '#fef08a', true);
  }

  /**
   * Stationmaster Pep (El Cap d'Estació)
   * With breathing, eye blink, and speaking mouth animation
   */
  public static drawStationmaster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    isSpeaking: boolean = false
  ): void {
    const breathY = Math.floor(Math.sin(time * 2.5) * 1.5);
    const isBlinking = (time * 1.2) % 4 < 0.2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 12, y, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const by = y - 48 + breathY;

    // Legs / Trousers
    ctx.fillStyle = Sprites.COLORS.uniformBlue;
    ctx.fillRect(x + 5, by + 32, 6, 16);
    ctx.fillRect(x + 13, by + 32, 6, 16);

    // Black Shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 3, by + 46, 8, 4);
    ctx.fillRect(x + 13, by + 46, 8, 4);

    // Navy Uniform Tunic / Coat
    PixelPrimitives.drawBeveledRect(
      ctx,
      x + 3,
      by + 16,
      18,
      18,
      Sprites.COLORS.uniformBlue,
      '#3b82f6',
      '#0f172a',
      1
    );

    // Gold Uniform Buttons
    ctx.fillStyle = Sprites.COLORS.uniformGold;
    ctx.fillRect(x + 11, by + 19, 2, 2);
    ctx.fillRect(x + 11, by + 23, 2, 2);
    ctx.fillRect(x + 11, by + 27, 2, 2);

    // Red Necktie
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 10, by + 17, 4, 3);
    ctx.fillRect(x + 11, by + 20, 2, 3);

    // Head
    const headX = x + 6;
    const headY = by + 4;
    ctx.fillStyle = Sprites.COLORS.skinPeach;
    ctx.fillRect(headX, headY, 12, 12);

    // Friendly Eyes
    if (isBlinking) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(headX + 2, headY + 4, 3, 1);
      ctx.fillRect(headX + 7, headY + 4, 3, 1);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(headX + 2, headY + 3, 2, 3);
      ctx.fillRect(headX + 7, headY + 3, 2, 3);
      // Eye sparkle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 2, headY + 3, 1, 1);
      ctx.fillRect(headX + 7, headY + 3, 1, 1);
    }

    // Mustache
    ctx.fillStyle = Sprites.COLORS.hairBrown;
    ctx.fillRect(headX + 2, headY + 7, 8, 2);

    // Mouth (animated if speaking)
    if (isSpeaking) {
      const open = Math.sin(time * 12) > 0;
      ctx.fillStyle = open ? '#7f1d1d' : Sprites.COLORS.skinShadow;
      ctx.fillRect(headX + 4, headY + 9, open ? 4 : 3, open ? 3 : 1);
    }

    // Stationmaster Peaked Cap (Gorra de Cap d'Estació)
    ctx.fillStyle = Sprites.COLORS.capRed;
    ctx.fillRect(headX - 1, headY - 4, 14, 5);
    ctx.fillStyle = Sprites.COLORS.uniformGold;
    ctx.fillRect(headX - 1, headY, 14, 2); // gold band
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(headX + 4, headY + 1, 8, 2); // visor / brim

    // Hand holding the Green Signal Paddle ("La Paleta de Pas")
    const handX = x + 22;
    const handY = by + 20;

    // Paddle stick
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(handX + 2, handY - 14, 2, 22);

    // Green disk
    PixelPrimitives.drawPixelCircle(ctx, handX + 3, handY - 14, 8, '#ffffff', true);
    PixelPrimitives.drawPixelCircle(ctx, handX + 3, handY - 14, 7, '#16a34a', true);
    PixelPrimitives.drawPixelCircle(ctx, handX + 3, handY - 14, 3, '#ffffff', true);

    // Hand
    ctx.fillStyle = Sprites.COLORS.skinPeach;
    ctx.fillRect(handX, handY + 2, 4, 4);
  }

  /**
   * Railway tracks with wooden sleepers and steel rails
   */
  public static drawRailwayTracks(
    ctx: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    y: number
  ): void {
    // Ballast stone bed
    ctx.fillStyle = Sprites.COLORS.ballastDark;
    ctx.fillRect(startX, y - 4, endX - startX, 22);

    for (let bx = startX; bx < endX; bx += 7) {
      ctx.fillStyle = (bx % 14 === 0) ? Sprites.COLORS.ballastGrey : '#475569';
      ctx.fillRect(bx, y - 4 + (bx % 3), 4, 18);
    }

    // Wooden sleepers (cross ties)
    const tieSpacing = 16;
    for (let tx = startX; tx < endX; tx += tieSpacing) {
      ctx.fillStyle = Sprites.COLORS.woodDark;
      ctx.fillRect(tx, y - 2, 8, 16);
      ctx.fillStyle = Sprites.COLORS.woodBrown;
      ctx.fillRect(tx + 1, y - 1, 6, 14);
      // Tie spikes / iron plates
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx + 2, y + 1, 4, 2);
      ctx.fillRect(tx + 2, y + 9, 4, 2);
    }

    // Steel rails (top rail and bottom rail)
    // Rail 1
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX, y + 1, endX - startX, 3);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(startX, y + 1, endX - startX, 1);

    // Rail 2
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX, y + 9, endX - startX, 3);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(startX, y + 9, endX - startX, 1);
  }

  /**
   * Track Switch (Canvi d'Agulla) & Lever mechanism
   */
  public static drawTrackSwitch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isOpen: boolean,
    isHovered: boolean = false
  ): void {
    // Switch junction tie bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 12, y + 1, 24, 2);

    // Movable switch points / blades
    const bladeOffset = isOpen ? 4 : 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 8, y + 2 + bladeOffset, 16, 2);

    // Switch stand box
    const boxX = x + 16;
    const boxY = y + 14;
    PixelPrimitives.drawBeveledRect(ctx, boxX, boxY, 20, 16, '#334155', '#94a3b8', '#0f172a', 1);

    // Lever arm
    const leverBaseX = boxX + 10;
    const leverBaseY = boxY + 8;
    const leverAngle = isOpen ? -0.7 : 0.7; // Leaning right when blocked, left when open
    const leverLen = 22;
    const leverTipX = leverBaseX + Math.sin(leverAngle) * leverLen;
    const leverTipY = leverBaseY - Math.cos(leverAngle) * leverLen;

    // Lever rod
    PixelPrimitives.drawLine(ctx, leverBaseX, leverBaseY, leverTipX, leverTipY, '#0f172a', 3);
    PixelPrimitives.drawLine(ctx, leverBaseX, leverBaseY, leverTipX, leverTipY, '#e2e8f0', 1);

    // Lever handle grip (Red = blocked, Green = open)
    const handleColor = isOpen ? '#22c55e' : '#ef4444';
    PixelPrimitives.drawPixelCircle(ctx, leverTipX, leverTipY, 5, handleColor, true);

    // Signal Lantern on post
    const postX = boxX + 26;
    const postY = y - 10;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(postX - 1, postY, 3, 26);

    // Signal head
    PixelPrimitives.drawBeveledRect(ctx, postX - 6, postY - 14, 13, 14, '#0f172a', '#475569', '#020617', 1);
    const signalColor = isOpen ? '#22c55e' : '#ef4444';
    PixelPrimitives.drawPixelCircle(ctx, postX, postY - 7, 4, signalColor, true);

    // Glow
    ctx.fillStyle = isOpen ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    PixelPrimitives.drawPixelCircle(ctx, postX, postY - 7, 8, ctx.fillStyle, true);

    // Visual hover highlight ring
    if (isHovered) {
      ctx.strokeStyle = Sprites.COLORS.cyanMira;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX - 4, postY - 18, 42, 52);
    }
  }

  /**
   * Fallen Pine Branches blocking the tracks
   */
  public static drawPineBranches(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isHovered: boolean = false
  ): void {
    // Multi-tangled pine wood logs & green needle clusters
    ctx.fillStyle = Sprites.COLORS.pineTrunkDark;
    // Log 1
    PixelPrimitives.drawLine(ctx, x - 18, y + 8, x + 16, y - 4, Sprites.COLORS.pineTrunkDark, 4);
    PixelPrimitives.drawLine(ctx, x - 17, y + 7, x + 15, y - 5, Sprites.COLORS.pineTrunkLight, 2);

    // Log 2
    PixelPrimitives.drawLine(ctx, x - 12, y - 6, x + 14, y + 10, Sprites.COLORS.pineTrunkDark, 3);
    PixelPrimitives.drawLine(ctx, x - 11, y - 5, x + 13, y + 9, Sprites.COLORS.woodBrown, 2);

    // Log 3 (cross piece)
    PixelPrimitives.drawLine(ctx, x - 4, y - 8, x + 2, y + 12, Sprites.COLORS.pineTrunkDark, 3);

    // Green pine needle clusters
    PixelPrimitives.drawPixelCircle(ctx, x - 14, y + 2, 6, Sprites.COLORS.pineGreenDark, true);
    PixelPrimitives.drawPixelCircle(ctx, x - 14, y + 1, 4, Sprites.COLORS.pineGreenMid, true);

    PixelPrimitives.drawPixelCircle(ctx, x + 12, y + 2, 7, Sprites.COLORS.pineGreenDark, true);
    PixelPrimitives.drawPixelCircle(ctx, x + 12, y + 1, 5, Sprites.COLORS.pineGreenMid, true);

    PixelPrimitives.drawPixelCircle(ctx, x - 2, y - 5, 5, Sprites.COLORS.pineGreenLight, true);

    // Small pine cone
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 4, y + 4, 4, 6);

    if (isHovered) {
      ctx.strokeStyle = Sprites.COLORS.amberAgafa;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 24, y - 12, 48, 28);
    }
  }

  /**
   * Steam Locomotive "El Drac" (The Dragon)
   * With boiler, wheels, smokestack, steam puffs, tender, and passenger coach
   */
  public static drawLocomotive(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    isPuffing: boolean = true,
    wheelAngle: number = 0
  ): void {
    // === 1. PASSENGER COACH (COTXE DE PASSATGERS) ===
    const coachX = x - 240;
    const coachY = y - 72;
    const coachW = 110;
    const coachH = 65;

    // Body in polished teak / Catalan maroon
    PixelPrimitives.drawBeveledRect(ctx, coachX, coachY, coachW, coachH, '#7f1d1d', '#b91c1c', '#450a0a', 2);
    // Roof
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(coachX - 2, coachY - 8, coachW + 4, 8);

    // Windows with warm light and silhouette passengers
    const winSpacing = 24;
    for (let wx = coachX + 12; wx < coachX + coachW - 16; wx += winSpacing) {
      PixelPrimitives.drawBeveledRect(ctx, wx, coachY + 12, 16, 20, '#fef08a', '#ffffff', '#ca8a04', 1);
      // Passenger silhouette
      ctx.fillStyle = '#451a03';
      PixelPrimitives.drawPixelCircle(ctx, wx + 8, coachY + 22, 4, '#451a03', true);
      ctx.fillRect(wx + 4, coachY + 26, 8, 6);
    }

    // Coach wheels
    const coachWheelR = 7;
    for (const cwx of [coachX + 20, coachX + 38, coachX + coachW - 38, coachX + coachW - 20]) {
      PixelPrimitives.drawPixelCircle(ctx, cwx, y - 3, coachWheelR, '#0f172a', true);
      PixelPrimitives.drawPixelCircle(ctx, cwx, y - 3, coachWheelR - 2, '#475569', true);
    }

    // Coupler between coach and tender
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(coachX + coachW, y - 18, 16, 6);

    // === 2. COAL TENDER (EL TÈNDER) ===
    const tenderX = x - 115;
    const tenderY = y - 55;
    const tenderW = 75;
    const tenderH = 48;

    PixelPrimitives.drawBeveledRect(ctx, tenderX, tenderY, tenderW, tenderH, '#18181b', '#3f3f46', '#09090b', 2);

    // Heap of black coal lumps
    ctx.fillStyle = '#09090b';
    for (let cx = tenderX + 6; cx < tenderX + tenderW - 6; cx += 8) {
      const lumpH = 6 + Math.sin(cx) * 4;
      PixelPrimitives.drawPixelCircle(ctx, cx, tenderY - lumpH / 2, 7, '#09090b', true);
      PixelPrimitives.drawPixelCircle(ctx, cx + 2, tenderY - lumpH / 2 - 1, 3, '#27272a', true);
    }

    // Tender wheels
    for (const twx of [tenderX + 16, tenderX + 34, tenderX + 58]) {
      PixelPrimitives.drawPixelCircle(ctx, twx, y - 3, 7, '#0f172a', true);
      PixelPrimitives.drawPixelCircle(ctx, twx, y - 3, 5, '#475569', true);
    }

    // Coupler to locomotive
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tenderX + tenderW, y - 18, 12, 6);

    // === 3. STEAM LOCOMOTIVE ENGINE ("EL DRAC") ===
    const engineX = x - 28;
    const boilerY = y - 62;
    const boilerW = 100;
    const boilerH = 46;

    // Locomotive Driver's Cabin (Cabina)
    const cabW = 42;
    const cabH = 68;
    const cabX = engineX;
    const cabY = y - 75;

    PixelPrimitives.drawBeveledRect(ctx, cabX, cabY, cabW, cabH, '#18181b', '#3f3f46', '#09090b', 2);
    // Curved Cab Roof
    ctx.fillStyle = '#09090b';
    ctx.fillRect(cabX - 2, cabY - 6, cabW + 4, 6);

    // Cab Side Window
    PixelPrimitives.drawBeveledRect(ctx, cabX + 10, cabY + 12, 22, 24, '#fef08a', '#ffffff', '#ca8a04', 1);

    // Friendly Train Driver Joan waving in cab window
    const driverX = cabX + 18;
    const driverY = cabY + 22;
    PixelPrimitives.drawPixelCircle(ctx, driverX, driverY, 5, Sprites.COLORS.skinPeach, true);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(driverX - 3, driverY - 7, 7, 3); // blue driver cap
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(driverX - 3, driverY + 5, 7, 5); // red overalls

    // Hand waving
    const waveY = Math.sin(time * 6) * 3;
    ctx.fillStyle = Sprites.COLORS.skinPeach;
    ctx.fillRect(driverX + 8, driverY + waveY, 3, 3);

    // Main Cylindrical Steam Boiler
    PixelPrimitives.drawBeveledRect(ctx, cabX + cabW, boilerY, boilerW, boilerH, '#18181b', '#3f3f46', '#09090b', 2);

    // Polished Brass Bands on Boiler
    ctx.fillStyle = Sprites.COLORS.brassGold;
    ctx.fillRect(cabX + cabW + 20, boilerY, 4, boilerH);
    ctx.fillRect(cabX + cabW + 55, boilerY, 4, boilerH);
    ctx.fillRect(cabX + cabW + 85, boilerY, 4, boilerH);

    // Brass Nameplate: "EL DRAC"
    PixelPrimitives.drawBeveledRect(ctx, cabX + cabW + 30, boilerY + 16, 40, 12, '#b45309', '#fef08a', '#78350f', 1);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EL DRAC', cabX + cabW + 50, boilerY + 25);

    // Front Smokebox & Boiler Door
    const frontX = cabX + cabW + boilerW;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(frontX, boilerY + 2, 12, boilerH - 4);
    PixelPrimitives.drawPixelCircle(ctx, frontX + 12, boilerY + boilerH / 2, 14, '#09090b', true);
    PixelPrimitives.drawPixelCircle(ctx, frontX + 12, boilerY + boilerH / 2, 6, Sprites.COLORS.brassGold, true);

    // Smokestack (Xemeneia)
    const stackX = cabX + cabW + boilerW - 18;
    const stackY = boilerY - 26;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(stackX, stackY, 14, 26);
    // Flared rim
    ctx.fillStyle = Sprites.COLORS.brassGold;
    ctx.fillRect(stackX - 2, stackY, 18, 5);

    // Brass Steam Dome & Whistle (Cúpula i Xiulet)
    const domeX = cabX + cabW + 38;
    const domeY = boilerY - 14;
    PixelPrimitives.drawPixelCircle(ctx, domeX + 6, domeY + 6, 9, Sprites.COLORS.brassGold, true);
    // Whistle chime
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(domeX + 12, domeY - 6, 3, 10);
    PixelPrimitives.drawPixelCircle(ctx, domeX + 13, domeY - 6, 3, '#fef08a', true);

    // Red Cowcatcher / Pilot Grill at front
    const cowX = frontX + 14;
    const cowY = y - 18;
    ctx.fillStyle = Sprites.COLORS.engineRed;
    for (let ci = 0; ci < 5; ci++) {
      PixelPrimitives.drawLine(ctx, cowX, cowY + ci * 3, cowX + 18, cowY + ci * 2 + 6, Sprites.COLORS.engineRed, 2);
    }

    // Golden Headlamp with glowing beam
    const lampX = frontX + 10;
    const lampY = boilerY - 4;
    PixelPrimitives.drawBeveledRect(ctx, lampX, lampY, 12, 14, '#09090b', '#3f3f46', '#020617', 1);
    PixelPrimitives.drawPixelCircle(ctx, lampX + 12, lampY + 7, 5, '#fef08a', true);

    // Volumetric beam of light
    const beamGrad = ctx.createLinearGradient(lampX + 14, lampY + 7, lampX + 120, lampY + 7);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(lampX + 14, lampY + 4);
    ctx.lineTo(lampX + 130, lampY - 18);
    ctx.lineTo(lampX + 130, lampY + 36);
    ctx.lineTo(lampX + 14, lampY + 10);
    ctx.closePath();
    ctx.fill();

    // Large Locomotive Driving Wheels with Crankpins & Connecting Rods
    const wheelY = y - 6;
    const wheelR = 14;
    const wheels = [cabX + 18, cabX + 54, cabX + 90, cabX + 126];

    for (const wx of wheels) {
      // Outer steel rim
      PixelPrimitives.drawPixelCircle(ctx, wx, wheelY, wheelR, '#cbd5e1', true);
      // Red wheel spokes / center
      PixelPrimitives.drawPixelCircle(ctx, wx, wheelY, wheelR - 2, Sprites.COLORS.engineRed, true);
      // Hub
      PixelPrimitives.drawPixelCircle(ctx, wx, wheelY, 4, '#09090b', true);
    }

    // Animated Connecting Rod (Biela)
    const pinOffset = 7;
    const pinX = wheels[1] + Math.cos(wheelAngle) * pinOffset;
    const pinY = wheelY + Math.sin(wheelAngle) * pinOffset;
    const pinEndX = wheels[3] + Math.cos(wheelAngle) * pinOffset;
    const pinEndY = wheelY + Math.sin(wheelAngle) * pinOffset;

    PixelPrimitives.drawLine(ctx, pinX, pinY, pinEndX, pinEndY, '#94a3b8', 4);
    PixelPrimitives.drawLine(ctx, pinX, pinY, pinEndX, pinEndY, '#f1f5f9', 2);

    // Piston Crosshead
    const pistonX = cabX + cabW + boilerW + 6;
    const pistonY = wheelY - 2;
    PixelPrimitives.drawLine(ctx, pinEndX, pinEndY, pistonX, pistonY, '#64748b', 3);

    // Billowing Pixel Steam Puffs from Smokestack
    if (isPuffing) {
      const puffTime = time * 3;
      for (let p = 0; p < 5; p++) {
        const pAge = (puffTime + p * 0.8) % 4;
        const px = stackX + 7 - pAge * 14;
        const py = stackY - 6 - pAge * 18 - Math.sin(pAge) * 4;
        const pr = Math.min(22, 6 + pAge * 4.5);
        const alpha = Math.max(0, 1 - pAge / 4);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
        PixelPrimitives.drawPixelCircle(ctx, px, py, pr, ctx.fillStyle, true);
      }
    }
  }

  /**
   * Cute Singing Pine Bird (L'Ocell)
   */
  public static drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    const hopY = Math.abs(Math.sin(time * 3)) * 2;
    const by = y - hopY;

    // Body
    ctx.fillStyle = '#38bdf8'; // Sky blue feathers
    PixelPrimitives.drawPixelCircle(ctx, x, by, 5, '#38bdf8', true);

    // Breast / Belly
    ctx.fillStyle = '#fb923c'; // Warm robin orange
    PixelPrimitives.drawPixelCircle(ctx, x + 2, by + 1, 3, '#fb923c', true);

    // Head
    PixelPrimitives.drawPixelCircle(ctx, x + 4, by - 4, 3, '#38bdf8', true);

    // Beak
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 7, by - 4, 3, 2);

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 5, by - 5, 1, 1);

    // Tail feathers
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 6, by + 1, 3, 2);

    // Tiny musical notes floating when singing
    const noteY = by - 10 - ((time * 15) % 15);
    if ((time % 2) > 1) {
      ctx.fillStyle = '#ec4899';
      ctx.font = '8px monospace';
      ctx.fillText('♪', x + 6, noteY);
    }
  }

  /**
   * Inventory item pixel art icons
   */
  public static drawItemIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    itemId: string,
    size: number = 32
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    switch (itemId) {
      case 'branques':
        // Pine branches
        PixelPrimitives.drawLine(ctx, cx - 10, cy + 8, cx + 8, cy - 8, Sprites.COLORS.pineTrunkDark, 3);
        PixelPrimitives.drawLine(ctx, cx - 9, cy + 7, cx + 7, cy - 7, Sprites.COLORS.pineTrunkLight, 2);
        PixelPrimitives.drawPixelCircle(ctx, cx + 4, cy - 4, 4, Sprites.COLORS.pineGreenMid, true);
        PixelPrimitives.drawPixelCircle(ctx, cx - 4, cy + 2, 5, Sprites.COLORS.pineGreenDark, true);
        break;

      case 'clau':
        // Track wrench / spanner
        ctx.fillStyle = '#94a3b8';
        PixelPrimitives.drawLine(ctx, cx - 8, cy + 8, cx + 8, cy - 8, '#cbd5e1', 3);
        PixelPrimitives.drawPixelCircle(ctx, cx + 8, cy - 8, 4, '#94a3b8', false);
        break;

      case 'bitllet':
        // Golden train ticket
        PixelPrimitives.drawBeveledRect(ctx, cx - 11, cy - 7, 22, 14, '#fef08a', '#ffffff', '#ca8a04', 1);
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(cx - 7, cy - 2, 14, 2);
        ctx.fillRect(cx - 7, cy + 2, 8, 2);
        break;

      case 'pala':
        // Shovel
        PixelPrimitives.drawLine(ctx, cx - 8, cy - 8, cx + 6, cy + 6, '#78350f', 2);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx + 4, cy + 4, 8, 8);
        break;

      default:
        ctx.fillStyle = Sprites.COLORS.goldBrass;
        PixelPrimitives.drawPixelCircle(ctx, cx, cy, 8, Sprites.COLORS.goldBrass, true);
        break;
    }
  }
}

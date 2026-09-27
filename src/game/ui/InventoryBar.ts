/**
 * InventoryBar: Touch-friendly inventory grid with procedural item icons
 * Lets young children collect and use items with auditory feedback.
 */

import { gameState } from '../GameState';
import { PixelPrimitives } from '../art/PixelPrimitives';
import { Sprites } from '../art/Sprites';
import { soundFX } from '../../engine/SoundFX';
import { speechManager } from '../../engine/SpeechManager';

export class InventoryBar {
  private x = 358;
  private y = 306;
  private w = 274;
  private h = 48;
  private slotSize = 42;
  private slotCount = 5;
  private hoveredIndex: number | null = null;

  public render(ctx: CanvasRenderingContext2D, time: number): void {
    const { inventory, selectedItemId } = gameState.get();

    // Wooden Chest / Luggage Shelf background
    PixelPrimitives.drawBeveledRect(
      ctx,
      this.x,
      this.y,
      this.w,
      this.h,
      '#451a03',
      '#78350f',
      '#1c0a00',
      2
    );

    // Label on the shelf
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MALETA', this.x + 6, this.y + 9);

    // 5 Item Slots
    const startSlotX = this.x + 8;
    const slotY = this.y + 11;
    const spacing = 52;

    for (let i = 0; i < this.slotCount; i++) {
      const sx = startSlotX + i * spacing;
      const item = inventory[i];
      const isSelected = item && item.id === selectedItemId;
      const isHovered = this.hoveredIndex === i;

      // Slot inset well
      PixelPrimitives.drawBeveledRect(
        ctx,
        sx,
        slotY,
        this.slotSize,
        this.slotSize - 8,
        isSelected ? '#78350f' : '#291003',
        '#1c0a00',
        '#78350f',
        1
      );

      // Selected pulsating gold glow
      if (isSelected) {
        const glowW = 1 + Math.sin(time * 8) * 0.5;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2 + glowW;
        ctx.strokeRect(sx - 1, slotY - 1, this.slotSize + 2, this.slotSize - 6);
      } else if (isHovered && item) {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx, slotY, this.slotSize, this.slotSize - 8);
      }

      // Draw item icon if present
      if (item) {
        Sprites.drawItemIcon(ctx, sx + 4, slotY + 1, item.id, 32);

        // Small indicator dot
        PixelPrimitives.drawPixelCircle(ctx, sx + this.slotSize - 6, slotY + 6, 2, '#4ade80', true);
      }
    }

    // If an item is hovered or selected, show its Catalan name above slot
    const activeItem =
      (this.hoveredIndex !== null ? inventory[this.hoveredIndex] : null) ||
      (selectedItemId ? inventory.find((i) => i.id === selectedItemId) : null);

    if (activeItem) {
      const tooltipX = this.x + this.w / 2;
      const tooltipY = this.y - 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(tooltipX - 60, tooltipY - 6, 120, 16);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(tooltipX - 60, tooltipY - 6, 120, 16);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeItem.catalanName, tooltipX, tooltipY + 2);
    }
  }

  public handlePointerMove(vx: number, vy: number): boolean {
    const prev = this.hoveredIndex;
    this.hoveredIndex = null;

    const startSlotX = this.x + 8;
    const slotY = this.y + 11;
    const spacing = 52;

    for (let i = 0; i < this.slotCount; i++) {
      const sx = startSlotX + i * spacing;
      if (vx >= sx && vx <= sx + this.slotSize && vy >= slotY && vy <= slotY + this.slotSize - 8) {
        this.hoveredIndex = i;
        break;
      }
    }

    return this.hoveredIndex !== prev;
  }

  public handlePointerDown(vx: number, vy: number): boolean {
    const startSlotX = this.x + 8;
    const slotY = this.y + 11;
    const spacing = 52;
    const { inventory } = gameState.get();

    for (let i = 0; i < this.slotCount; i++) {
      const sx = startSlotX + i * spacing;
      if (vx >= sx && vx <= sx + this.slotSize && vy >= slotY && vy <= slotY + this.slotSize - 8) {
        const item = inventory[i];
        if (item) {
          soundFX.playClick();
          gameState.selectItem(item.id);
          // Pronounce item in Catalan
          speechManager.speak(item.speechPhrase);
        }
        return true;
      }
    }

    return false;
  }
}

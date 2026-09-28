/**
 * AssetManager: Preloads and caches high-bit modern pixel art scene images
 * Inlines scene artwork via Vite for 100% offline, zero-network, instant rendering.
 */

import stationArt from '../../assets/art/scene_estacio_pins.jpg';
import cabinArt from '../../assets/art/scene_cabina_tren.jpg';
import bridgeArt from '../../assets/art/scene_pont_viaducte.jpg';
import castleArt from '../../assets/art/scene_castell_roca.jpg';
import seasideArt from '../../assets/art/scene_mar_costa.jpg';
import itemsArt from '../../assets/art/items_characters_badges.jpg';

export type SceneArtId = 'station' | 'cabin' | 'bridge' | 'castle' | 'seaside';
export type ArtAssetId = SceneArtId | 'items';

export class AssetManager {
  private images: Map<SceneArtId, HTMLImageElement> = new Map();
  private loaded: Map<SceneArtId, boolean> = new Map();

  private readonly artSources: Record<ArtAssetId, string> = {
    station: stationArt,
    cabin: cabinArt,
    bridge: bridgeArt,
    castle: castleArt,
    seaside: seasideArt,
    items: itemsArt,
  };

  constructor() {
    this.preloadAll();
  }

  public preloadAll(): void {
    if (typeof window === 'undefined' || typeof Image === 'undefined') return;

    for (const key of ['station', 'cabin', 'bridge', 'castle', 'seaside'] as SceneArtId[]) {
      this.loadImage(key, this.artSources[key]);
    }
  }

  private loadImage(id: SceneArtId, src: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      this.images.set(id, img);
      this.loaded.set(id, true);
    };

    img.onerror = (err) => {
      console.warn(`[AssetManager] Error loading bundled art for ${id}:`, err);
    };

    img.src = src;

    // If already complete (e.g. data URL decoded synchronously)
    if (img.complete && img.naturalWidth > 0) {
      this.images.set(id, img);
      this.loaded.set(id, true);
    }
  }

  public getImage(id: SceneArtId): HTMLImageElement | null {
    if (this.loaded.get(id)) {
      return this.images.get(id) || null;
    }
    // Also check if img exists and has completed
    const existing = this.images.get(id);
    if (existing && existing.complete && existing.naturalWidth > 0) {
      this.loaded.set(id, true);
      return existing;
    }
    return null;
  }

  public isLoaded(id: SceneArtId): boolean {
    return !!this.loaded.get(id);
  }

  public getArtSource(id: ArtAssetId): string {
    return this.artSources[id] || '';
  }
}

export const assetManager = new AssetManager();

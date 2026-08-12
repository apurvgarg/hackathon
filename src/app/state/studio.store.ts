import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { hashUnknown } from '../core/hash';
import { prepareSource } from '../core/image';
import { ToastService } from '../core/toast.service';
import { generateClass } from '../domain/builder-class';
import { solveFaceCrop } from '../domain/crop';
import { loadQrFactory } from '../domain/identity';
import {
  BuilderInput,
  CrewSize,
  PhotoAsset,
  SheetSpec,
  Slot,
} from '../domain/models';
import { buildSpec } from '../domain/spec';
import { computeSynergy } from '../domain/synergy';
import { RenderClient } from '../render/render.client';
import { VisionClient } from '../vision/vision.client';

const SLOTS: Slot[] = [0, 1, 2];
const PREVIEW_SCALE = 1;
const EXPORT_SCALE = 2;
const DEBOUNCE = 70;

function emptyInput(slot: Slot): BuilderInput {
  return { slot, name: '', stack: [], vibe: null };
}

function emptyPhoto(slot: Slot): PhotoAsset {
  return {
    slot,
    blob: null,
    url: null,
    width: 0,
    height: 0,
    faces: [],
    allLandmarks: [],
    chosenFace: -1,
    face: null,
    landmarks: null,
    crop: null,
    status: 'empty',
    message: '',
  };
}

@Injectable({ providedIn: 'root' })
export class StudioStore {
  private readonly vision = inject(VisionClient);
  private readonly render = inject(RenderClient);
  private readonly toast = inject(ToastService);

  readonly crew = signal<CrewSize>(1);
  readonly inputs = signal<Record<Slot, BuilderInput>>({
    0: emptyInput(0),
    1: emptyInput(1),
    2: emptyInput(2),
  });
  readonly photos = signal<Record<Slot, PhotoAsset>>({
    0: emptyPhoto(0),
    1: emptyPhoto(1),
    2: emptyPhoto(2),
  });
  readonly salt = signal(0);

  readonly preview = signal<ImageBitmap | null>(null);
  readonly exportBlob = signal<Blob | null>(null);
  readonly rendering = signal(false);
  readonly qrReady = signal(false);

  readonly activeSlots = computed<Slot[]>(() => SLOTS.slice(0, this.crew()) as Slot[]);
  readonly activeInputs = computed(() => this.activeSlots().map((s) => this.inputs()[s]));

  readonly classes = computed(() =>
    this.activeSlots().map((slot) => generateClass(this.inputs()[slot], this.salt())),
  );

  readonly synergy = computed(() => computeSynergy(this.activeInputs(), this.salt()));

  readonly spec = computed<SheetSpec>(() =>
    buildSpec({
      crew: this.crew(),
      inputs: this.inputs(),
      photos: this.photos(),
      synergy: this.synergy(),
      salt: this.salt(),
    }),
  );

  readonly specHash = computed(() => hashUnknown({ ...this.spec(), qrReady: this.qrReady() }));

  readonly detecting = computed(() =>
    this.activeSlots().some((s) => {
      const status = this.photos()[s].status;
      return status === 'decoding' || status === 'detecting';
    }),
  );

  readonly filledCount = computed(
    () => this.activeSlots().filter((s) => !!this.photos()[s].blob).length,
  );

  readonly missing = computed<string[]>(() => {
    const gaps: string[] = [];
    for (const slot of this.activeSlots()) {
      const input = this.inputs()[slot];
      const photo = this.photos()[slot];
      const who = this.crew() === 1 ? '' : ` ${slot + 1}`;
      if (!input.name.trim()) gaps.push(`NAME${who}`);
      if (!photo.blob || photo.status === 'error') gaps.push(`PHOTO${who}`);
      if (!input.stack.length) gaps.push(`ONE TAG${who}`);
    }
    return gaps;
  });

  readonly complete = computed(() => this.missing().length === 0);

  readonly canReroll = computed(() =>
    this.activeSlots().some((slot) => this.inputs()[slot].stack.length > 0),
  );

  readonly readyToShare = computed(
    () => this.complete() && !!this.exportBlob() && !this.rendering(),
  );

  private repaintTimer: ReturnType<typeof setTimeout> | null = null;
  private paintToken = 0;

  constructor() {
    void loadQrFactory().then((factory) => {
      if (factory) this.qrReady.set(true);
    });

    effect(() => {
      const hash = this.specHash();
      untracked(() => this.schedule(hash));
    });
  }

  private schedule(hash: number): void {
    if (this.repaintTimer) clearTimeout(this.repaintTimer);
    this.repaintTimer = setTimeout(() => void this.repaint(hash), DEBOUNCE);
  }

  private async repaint(hash: number): Promise<void> {
    const token = ++this.paintToken;
    const spec = untracked(() => this.spec());
    this.rendering.set(true);

    const outcome = await this.render.paint(spec, PREVIEW_SCALE, false);
    if (token !== this.paintToken) {
      outcome?.preview?.close();
      return;
    }
    if (outcome?.preview) {
      const previous = untracked(() => this.preview());
      previous?.close();
      this.preview.set(outcome.preview);
    }

    const hires = await this.render.paint(spec, EXPORT_SCALE, true);
    if (token !== this.paintToken) {
      hires?.preview?.close();
      return;
    }
    hires?.preview?.close();
    if (hires?.blob) this.exportBlob.set(hires.blob);
    this.rendering.set(false);
    void hash;
  }

  setCrew(crew: CrewSize): void {
    if (this.crew() === crew) return;
    this.crew.set(crew);
    this.vision.warmup();
  }

  patchInput(slot: Slot, patch: Partial<BuilderInput>): void {
    this.inputs.update((all) => ({ ...all, [slot]: { ...all[slot], ...patch } }));
  }

  toggleTech(slot: Slot, id: string): void {
    const current = this.inputs()[slot].stack;
    const has = current.includes(id);
    this.patchInput(slot, {
      stack: has ? current.filter((t) => t !== id) : [...current, id],
    });
  }

  setVibe(slot: Slot, id: string | null): void {
    const current = this.inputs()[slot].vibe;
    this.patchInput(slot, { vibe: current === id ? null : id });
  }

  reroll(): void {
    if (!this.canReroll()) {
      this.toast.push('Tag a stack first, then reroll.', 'warn', 2400);
      return;
    }
    this.salt.update((s) => s + 1);
    this.toast.push('Rerolled. Same stack, new read.', 'ok', 2400);
  }

  private patchPhoto(slot: Slot, patch: Partial<PhotoAsset>): void {
    this.photos.update((all) => ({ ...all, [slot]: { ...all[slot], ...patch } }));
  }

  clearPhoto(slot: Slot): void {
    this.revokeUrl(slot);
    this.patchPhoto(slot, emptyPhoto(slot));
    void this.render.setPhoto(slot, null);
  }

  private revokeUrl(slot: Slot): void {
    const url = this.photos()[slot].url;
    if (url) URL.revokeObjectURL(url);
  }

  chooseFace(slot: Slot, index: number): void {
    const photo = this.photos()[slot];
    const face = photo.faces[index];
    if (!face || index === photo.chosenFace) return;

    const landmarks = photo.allLandmarks[index] ?? null;
    this.patchPhoto(slot, {
      chosenFace: index,
      face,
      landmarks,
      crop: solveFaceCrop(face, landmarks, photo.width, photo.height),
      status: 'ready',
      message: 'face locked',
    });
  }

  async acceptFile(slot: Slot, file: File): Promise<void> {
    this.revokeUrl(slot);
    this.patchPhoto(slot, { status: 'decoding', message: 'reading', blob: null, url: null });

    let source: Awaited<ReturnType<typeof prepareSource>>;
    try {
      source = await prepareSource(file);
    } catch (error) {
      this.patchPhoto(slot, {
        status: 'error',
        message: error instanceof Error ? error.message : 'could not read that file',
      });
      this.toast.push('That image would not open. Try a JPG or PNG.', 'bad');
      return;
    }

    this.patchPhoto(slot, {
      blob: source.blob,
      url: URL.createObjectURL(source.blob),
      width: source.width,
      height: source.height,
      faces: [],
      allLandmarks: [],
      chosenFace: -1,
      face: null,
      landmarks: null,
      crop: null,
      status: 'detecting',
      message: 'finding your face',
    });

    const result = await this.vision.detect(source.blob);
    const face = result.chosen >= 0 ? result.faces[result.chosen] : null;
    const landmarks = result.chosen >= 0 ? (result.landmarks[result.chosen] ?? null) : null;

    await this.render.setPhoto(slot, source.blob);

    this.patchPhoto(slot, {
      faces: result.faces,
      allLandmarks: result.landmarks,
      chosenFace: result.chosen,
      face,
      landmarks,
      crop: solveFaceCrop(face, landmarks, source.width, source.height),
      status: face ? 'ready' : 'no-face',
      message: face
        ? result.faces.length > 1
          ? `${result.faces.length} people here — pick yours`
          : 'face locked'
        : result.degraded
          ? 'detector offline, centred instead'
          : 'no face found, centred instead',
    });
  }

  warmupVision(): void {
    this.vision.warmup();
  }
}

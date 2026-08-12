import { Axis } from './models';

export interface TechTag {
  id: string;
  label: string;
  group: string;
  w: Partial<Record<Axis, number>>;
}

export const AXES: Axis[] = ['metal', 'surface', 'signal', 'chaos', 'flow'];

export const AXIS_LABEL: Record<Axis, string> = {
  metal: 'METAL',
  surface: 'SURFACE',
  signal: 'SIGNAL',
  chaos: 'CHAOS',
  flow: 'FLOW',
};

export const AXIS_GAP_LINE: Record<Axis, string> = {
  metal: 'no one here goes near the metal',
  surface: 'no one here makes it look good',
  signal: 'no one here speaks model',
  chaos: 'no one here duct-tapes it at 3am',
  flow: 'no one here actually ships',
};

export const TECH: TechTag[] = [
  { id: 'rust', label: 'Rust', group: 'systems', w: { metal: 3, flow: 1 } },
  { id: 'go', label: 'Go', group: 'systems', w: { metal: 2, flow: 2 } },
  { id: 'c', label: 'C / C++', group: 'systems', w: { metal: 3, chaos: 1 } },
  { id: 'zig', label: 'Zig', group: 'systems', w: { metal: 3, chaos: 1 } },
  { id: 'wasm', label: 'WASM', group: 'systems', w: { metal: 2, surface: 1 } },
  { id: 'kernel', label: 'Low level', group: 'systems', w: { metal: 3 } },

  { id: 'ts', label: 'TypeScript', group: 'web', w: { surface: 2, flow: 1, metal: 1 } },
  { id: 'angular', label: 'Angular', group: 'web', w: { surface: 2, metal: 2 } },
  { id: 'react', label: 'React', group: 'web', w: { surface: 3, signal: 1 } },
  { id: 'svelte', label: 'Svelte', group: 'web', w: { surface: 3, flow: 1 } },
  { id: 'next', label: 'Next.js', group: 'web', w: { surface: 2, flow: 2 } },
  { id: 'css', label: 'CSS wizardry', group: 'web', w: { surface: 3, chaos: 1 } },
  { id: 'threejs', label: 'Three.js', group: 'web', w: { surface: 3, metal: 1 } },
  { id: 'canvas', label: 'Canvas / WebGL', group: 'web', w: { surface: 2, metal: 2 } },

  { id: 'figma', label: 'Figma', group: 'design', w: { surface: 3, chaos: 1 } },
  { id: 'motion', label: 'Motion design', group: 'design', w: { surface: 3, flow: 1 } },
  { id: 'brand', label: 'Brand', group: 'design', w: { surface: 2, flow: 2 } },
  { id: 'illustration', label: 'Illustration', group: 'design', w: { surface: 3, chaos: 1 } },
  { id: 'blender', label: 'Blender', group: 'design', w: { surface: 2, chaos: 2 } },

  { id: 'pytorch', label: 'PyTorch', group: 'ai', w: { signal: 3, chaos: 1 } },
  { id: 'llm', label: 'LLM apps', group: 'ai', w: { signal: 3, flow: 1 } },
  { id: 'agents', label: 'Agents', group: 'ai', w: { signal: 2, chaos: 2 } },
  { id: 'rag', label: 'RAG', group: 'ai', w: { signal: 2, flow: 2 } },
  { id: 'cv', label: 'Computer vision', group: 'ai', w: { signal: 3, metal: 1 } },
  { id: 'evals', label: 'Evals', group: 'ai', w: { signal: 2, flow: 2 } },
  { id: 'data', label: 'Data eng', group: 'ai', w: { signal: 2, metal: 2 } },
  { id: 'sql', label: 'SQL', group: 'ai', w: { signal: 2, metal: 1, flow: 1 } },

  { id: 'k8s', label: 'Kubernetes', group: 'infra', w: { chaos: 2, metal: 2 } },
  { id: 'docker', label: 'Docker', group: 'infra', w: { chaos: 2, metal: 1, flow: 1 } },
  { id: 'terraform', label: 'Terraform', group: 'infra', w: { chaos: 3, metal: 1 } },
  { id: 'bash', label: 'Bash', group: 'infra', w: { chaos: 3, metal: 1 } },
  { id: 'ci', label: 'CI / CD', group: 'infra', w: { chaos: 2, flow: 2 } },
  { id: 'edge', label: 'Edge / serverless', group: 'infra', w: { chaos: 1, flow: 2, metal: 1 } },
  { id: 'scraping', label: 'Scraping', group: 'infra', w: { chaos: 3, signal: 1 } },
  { id: 'security', label: 'Security', group: 'infra', w: { chaos: 2, metal: 2 } },

  { id: 'mobile', label: 'Mobile', group: 'product', w: { flow: 2, surface: 2 } },
  { id: 'product', label: 'Product', group: 'product', w: { flow: 3, surface: 1 } },
  { id: 'growth', label: 'Growth', group: 'product', w: { flow: 3, signal: 1 } },
  { id: 'gtm', label: 'GTM', group: 'product', w: { flow: 3, chaos: 1 } },
  { id: 'pitching', label: 'Pitching', group: 'product', w: { flow: 2, surface: 2 } },
  { id: 'research', label: 'User research', group: 'product', w: { flow: 2, signal: 2 } },
  { id: 'web3', label: 'Web3', group: 'product', w: { chaos: 2, flow: 1, metal: 1 } },
  { id: 'hardware', label: 'Hardware', group: 'product', w: { metal: 2, chaos: 2 } },
];

export const TECH_BY_ID = new Map(TECH.map((t) => [t.id, t]));

export const TECH_GROUPS: { id: string; label: string; tags: TechTag[] }[] = [
  { id: 'systems', label: 'Systems' },
  { id: 'web', label: 'Web' },
  { id: 'design', label: 'Design' },
  { id: 'ai', label: 'AI / Data' },
  { id: 'infra', label: 'Infra' },
  { id: 'product', label: 'Product' },
].map((g) => ({ ...g, tags: TECH.filter((t) => t.group === g.id) }));

export interface VibeTag {
  id: string;
  label: string;
}

export const VIBES: VibeTag[] = [
  { id: 'coconut', label: 'Coconut water' },
  { id: 'lofi', label: 'Lo-fi beats' },
  { id: 'coldbrew', label: 'Cold brew' },
  { id: 'feni', label: 'One shot of feni' },
  { id: 'sunscreen', label: 'SPF 50' },
  { id: 'clacky', label: 'Clacky keyboard' },
  { id: 'anc', label: 'Noise cancelling' },
  { id: 'vim', label: 'Vim motions' },
  { id: 'duck', label: 'Rubber duck' },
  { id: 'monster', label: 'Energy drink' },
  { id: 'sunset', label: 'Sunset swim' },
  { id: 'chai', label: 'Cutting chai' },
];

export const VIBE_BY_ID = new Map(VIBES.map((v) => [v.id, v]));

export const STACK_PRINT_LIMIT = 7;

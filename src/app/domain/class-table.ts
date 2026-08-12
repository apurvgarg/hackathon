import { Axis } from './models';

export interface ClassVariant {
  title: string;
  subtitle: string;
}

type Table = Record<Axis, Partial<Record<Axis, ClassVariant[]>>>;

export const CLASS_TABLE: Table = {
  metal: {
    surface: [
      { title: 'THE CHROME WELDER', subtitle: 'makes it fast and makes it shine' },
      { title: 'PIXEL BLACKSMITH', subtitle: 'hammers frames until they land' },
      { title: 'THE RENDER MECHANIC', subtitle: 'lives inside the paint loop' },
    ],
    signal: [
      { title: 'THE TENSOR MACHINIST', subtitle: 'files down every millisecond' },
      { title: 'COLD START KILLER', subtitle: 'has opinions about warmup' },
      { title: 'THE LATENCY SURGEON', subtitle: 'operates on the p99' },
    ],
    chaos: [
      { title: 'THE SEGFAULT WHISPERER', subtitle: 'reads core dumps for fun' },
      { title: 'BARE METAL GREMLIN', subtitle: 'closer to the silicon than to people' },
      { title: 'THE KERNEL PANIC ARTIST', subtitle: 'breaks it lower than you can' },
    ],
    flow: [
      { title: 'THE THROUGHPUT MONK', subtitle: 'silent, benchmarked, unbothered' },
      { title: 'SHIPS IT IN RUST', subtitle: 'no runtime, no regrets' },
      { title: 'THE ZERO COPY PURIST', subtitle: 'allocates nothing, delivers everything' },
    ],
  },
  surface: {
    metal: [
      { title: 'THE 60FPS PERFECTIONIST', subtitle: 'will profile your animation' },
      { title: 'SUBPIXEL ZEALOT', subtitle: 'sees the half pixel you shipped' },
      { title: 'THE COMPOSITOR POET', subtitle: 'writes verses in transform3d' },
    ],
    signal: [
      { title: 'THE VIBE INTERPOLATOR', subtitle: 'turns latent space into taste' },
      { title: 'PROMPT STYLIST', subtitle: 'dresses the model before it speaks' },
      { title: 'THE LATENT DIRECTOR', subtitle: 'art directs the machine' },
    ],
    chaos: [
      { title: 'THE CSS ARSONIST', subtitle: 'burns the cascade down beautifully' },
      { title: 'DIV GOBLIN', subtitle: 'nests deeper than anyone should' },
      { title: 'THE Z-INDEX WARLORD', subtitle: 'rules the stacking context' },
    ],
    flow: [
      { title: 'FIGMA TO PROD PIPELINE', subtitle: 'no handoff, just output' },
      { title: 'ONE SHOT LANDER', subtitle: 'first draft is the final draft' },
      { title: 'THE POLISH GREMLIN', subtitle: 'adds the last 5% that sells it' },
    ],
  },
  signal: {
    metal: [
      { title: 'THE GRADIENT MECHANIC', subtitle: 'tunes what others treat as magic' },
      { title: 'QUANTIZED SAINT', subtitle: 'four bits is plenty' },
      { title: 'THE INFERENCE SMUGGLER', subtitle: 'runs it on device, somehow' },
    ],
    surface: [
      { title: 'THE DEMO ILLUSIONIST', subtitle: 'the loss curve is decorative' },
      { title: 'LOSS CURVE AESTHETE', subtitle: 'plots it prettier than it performs' },
      { title: 'THE HALLUCINATION EDITOR', subtitle: 'makes the wrong answer look right' },
    ],
    chaos: [
      { title: 'THE DATASET SCAVENGER', subtitle: 'found it, cleaned it, never asked' },
      { title: 'FERAL SCRAPER', subtitle: 'rate limits are a suggestion' },
      { title: 'THE OVERFIT OUTLAW', subtitle: 'test set? never met her' },
    ],
    flow: [
      { title: 'THE EVAL DISCIPLINARIAN', subtitle: 'no vibes, only numbers' },
      { title: 'RAG PLUMBER', subtitle: 'unclogs the retrieval pipe' },
      { title: 'THE SHIPPING ORACLE', subtitle: 'predicts the demo before it happens' },
    ],
  },
  chaos: {
    metal: [
      { title: 'THE DUCT TAPE ENGINEER', subtitle: 'it holds because they said so' },
      { title: 'YAML EXORCIST', subtitle: 'casts the indentation demons out' },
      { title: 'THE 3AM SYSADMIN', subtitle: 'awake because the cluster is not' },
    ],
    surface: [
      { title: 'THE GLITCH CURATOR', subtitle: 'the bug is the aesthetic' },
      { title: 'CURSED UI SHAMAN', subtitle: 'it should not work, it does' },
      { title: 'THE ANTI DESIGN PROPHET', subtitle: 'ugly on purpose, correct on purpose' },
    ],
    signal: [
      { title: 'THE FEATURE FLAG FERAL', subtitle: 'ships to 3% and prays' },
      { title: 'PIPELINE PYROMANIAC', subtitle: 'rebuilds it hourly, from scratch' },
      { title: 'THE NOTEBOOK NECROMANCER', subtitle: 'cell 47 still runs, do not touch' },
    ],
    flow: [
      { title: 'THE FRIDAY DEPLOYER', subtitle: 'fear is a dependency they removed' },
      { title: 'HOTFIX COWBOY', subtitle: 'straight to main, hat still on' },
      { title: 'THE MIDNIGHT REFACTORER', subtitle: 'rewrote it while you slept' },
    ],
  },
  flow: {
    metal: [
      { title: 'THE ROADMAP BULLDOZER', subtitle: 'scope enters, product leaves' },
      { title: 'SCOPE SNIPER', subtitle: 'cuts the feature you loved' },
      { title: 'THE MERGE CONFLICT DIPLOMAT', subtitle: 'negotiates peace in git' },
    ],
    surface: [
      { title: 'THE STORYBOARDER', subtitle: 'sells the ending before the build' },
      { title: 'LAUNCH DAY HYPEMAN', subtitle: 'the thread is already written' },
      { title: 'THE ONBOARDING WHISPERER', subtitle: 'nobody churns on their watch' },
    ],
    signal: [
      { title: 'THE METRIC HOARDER', subtitle: 'has a dashboard for the dashboards' },
      { title: 'RETENTION ALCHEMIST', subtitle: 'turns week one into week ten' },
      { title: 'THE FUNNEL DOWSER', subtitle: 'finds the drop-off by feel' },
    ],
    chaos: [
      { title: 'THE DEMO GOD', subtitle: 'it only works when they present' },
      { title: 'DEADLINE ILLUSIONIST', subtitle: 'the timeline was never real' },
      { title: 'THE LAST COMMIT HERO', subtitle: 'pushed at 11:59, judged at 12:00' },
    ],
  },
};

export const SOLO_FALLBACK: ClassVariant = {
  title: 'THE UNCLASSIFIED',
  subtitle: 'pick a stack and find out',
};

export const CREW_TITLES: Record<Axis, string[]> = {
  metal: ['FULL METAL MONSOON', 'THE FOUNDRY', 'LOW LEVEL LOW TIDE'],
  surface: ['THE RETINA CARTEL', 'SUNSET GRADIENT CLUB', 'PIXEL MONSOON'],
  signal: ['THE INFERENCE CARTEL', 'LATENT BEACH SOCIETY', 'GRADIENT MONSOON'],
  chaos: ['THE DUCT TAPE DYNASTY', 'FERAL DEPLOY UNION', 'MONSOON OF BROKEN BUILDS'],
  flow: ['THE SHIPPING CARTEL', 'LAUNCH TIDE COLLECTIVE', 'DEADLINE MONSOON'],
};

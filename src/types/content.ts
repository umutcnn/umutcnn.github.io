export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'tr';

/** A value that exists in every supported language. */
export type Localized<T = string> = Record<Locale, T>;

export type TechCategory = 'ai' | 'vision' | 'backend' | 'frontend' | 'infra';

export type TechId =
  // Artificial intelligence
  | 'pytorch'
  | 'tensorflow'
  | 'machine-learning'
  | 'deep-learning'
  | 'federated-learning'
  | 'cnn'
  | 'nlp'
  | 'llm'
  | 'rag'
  // Computer vision
  | 'opencv'
  | 'yolo'
  | 'object-detection'
  | 'image-classification'
  | 'dataset-preparation'
  | 'augmentation'
  | 'tflite'
  // Backend & enterprise
  | 'python'
  | 'cpp'
  | 'csharp'
  | 'nestjs'
  | 'django'
  | 'dotnet'
  | 'rest'
  | 'prisma'
  | 'sql-server'
  // Frontend & desktop
  | 'react'
  | 'typescript'
  | 'material-ui'
  | 'qt'
  | 'tauri'
  | 'kotlin'
  | 'occt'
  // Infrastructure & tools
  | 'git'
  | 'docker'
  | 'ollama'
  | 'n8n'
  | 'ros'
  | 'ray'
  | 'flower'
  | 'hydra'
  | 'lidar-imu';

export interface Tech {
  id: TechId;
  label: string;
  category: TechCategory;
}

export type ProjectCategory = 'research' | 'vision' | 'autonomy' | 'enterprise' | 'cad' | 'genai' | 'web' | 'data';

/** Which bespoke visual a project uses (stage preview + case study hero). */
export type VisualKind =
  'federated' | 'aerial-detection' | 'robotaxi' | 'cad-wireframe' | 'erp-architecture' | 'coil-detection' | 'none';

/** Architecture graphs rendered by <ArchitectureGraph>. */
export type ArchitectureId =
  'federated' | 'maks-erp' | 'maks-cad' | 'erp-workflow' | 'erp-calculation' | 'robotaxi-stack';

export type MediaItem =
  | { kind: 'visual'; visual: Exclude<VisualKind, 'none'>; caption: Localized }
  | { kind: 'architecture'; architecture: ArchitectureId; caption: Localized }
  | { kind: 'image'; src: string; width: number; height: number; alt: Localized; caption: Localized };

export interface Metric {
  value: string;
  label: Localized;
  /** Where the number comes from and its limits — always shown next to the value. */
  context: Localized;
}

export type Visibility = 'public' | 'confidential' | 'internal';

export interface ExternalLink {
  href: string;
  enabled: boolean;
  /** true while the link/value has not been confirmed by the owner. Disabled links are never rendered. */
  needsVerification: boolean;
}

export interface Project {
  id: string;
  slug: string;
  featured: boolean;
  /** true when a full case-study page exists for the project. */
  hasCaseStudy: boolean;
  order: number;
  category: ProjectCategory;
  year: string;
  title: Localized;
  subtitle: Localized;
  role: Localized;
  overview: Localized;
  badge?: Localized;
  problem?: Localized<string[]>;
  approach?: Localized<string[]>;
  techRationale?: Localized<string[]>;
  architecture?: Localized<string[]>;
  implementation?: Localized<string[]>;
  challenges?: Localized<string[]>;
  results?: Localized<string[]>;
  learnings?: Localized<string[]>;
  limitations?: Localized<string[]>;
  metrics: Metric[];
  technologies: TechId[];
  gallery: MediaItem[];
  visual: VisualKind;
  demoUrl?: ExternalLink;
  repositoryUrl?: ExternalLink;
  isPublic: boolean;
  visibility: Visibility;
  relatedProjects: string[];
  /** Note shown on case studies, e.g. confidentiality or "conceptual visual". */
  disclosure?: Localized;
}

export interface Award {
  id: string;
  year: string;
  title: Localized;
  rank: Localized;
  summary: Localized;
  details: Localized<string[]>;
  highlight: boolean;
  evidence?: ExternalLink & { label: Localized };
  projectSlug?: string;
}

export type TimelineKind = 'work' | 'education';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  start: string; // YYYY-MM
  end: string | null; // null → ongoing
  organization: string;
  location: string;
  role: Localized;
  points: Localized<string[]>;
}

export interface Certificate {
  title: Localized;
  issuer: string;
}

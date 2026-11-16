import type { Localized, Tech, TechCategory, TechId } from '../types/content';

/** Every technology shown on the site. Labels are proper nouns, so they are not translated. */
export const TECHS: Record<TechId, Tech> = {
  pytorch: { id: 'pytorch', label: 'PyTorch', category: 'ai' },
  tensorflow: { id: 'tensorflow', label: 'TensorFlow', category: 'ai' },
  'machine-learning': { id: 'machine-learning', label: 'Machine Learning', category: 'ai' },
  'deep-learning': { id: 'deep-learning', label: 'Deep Learning', category: 'ai' },
  'federated-learning': { id: 'federated-learning', label: 'Federated Learning', category: 'ai' },
  cnn: { id: 'cnn', label: 'CNN', category: 'ai' },
  nlp: { id: 'nlp', label: 'NLP', category: 'ai' },
  llm: { id: 'llm', label: 'LLM Applications', category: 'ai' },
  rag: { id: 'rag', label: 'RAG', category: 'ai' },

  opencv: { id: 'opencv', label: 'OpenCV', category: 'vision' },
  yolo: { id: 'yolo', label: 'YOLO', category: 'vision' },
  'object-detection': { id: 'object-detection', label: 'Object Detection', category: 'vision' },
  'image-classification': { id: 'image-classification', label: 'Image Classification', category: 'vision' },
  'dataset-preparation': { id: 'dataset-preparation', label: 'Dataset Preparation', category: 'vision' },
  augmentation: { id: 'augmentation', label: 'Image Augmentation', category: 'vision' },
  tflite: { id: 'tflite', label: 'TensorFlow Lite', category: 'vision' },

  python: { id: 'python', label: 'Python', category: 'backend' },
  cpp: { id: 'cpp', label: 'C++17', category: 'backend' },
  csharp: { id: 'csharp', label: 'C#', category: 'backend' },
  nestjs: { id: 'nestjs', label: 'NestJS', category: 'backend' },
  django: { id: 'django', label: 'Django', category: 'backend' },
  dotnet: { id: 'dotnet', label: '.NET / ASP.NET', category: 'backend' },
  rest: { id: 'rest', label: 'REST APIs', category: 'backend' },
  prisma: { id: 'prisma', label: 'Prisma', category: 'backend' },
  'sql-server': { id: 'sql-server', label: 'SQL Server', category: 'backend' },

  react: { id: 'react', label: 'React', category: 'frontend' },
  typescript: { id: 'typescript', label: 'TypeScript', category: 'frontend' },
  'material-ui': { id: 'material-ui', label: 'Material UI', category: 'frontend' },
  qt: { id: 'qt', label: 'Qt', category: 'frontend' },
  tauri: { id: 'tauri', label: 'Tauri', category: 'frontend' },
  kotlin: { id: 'kotlin', label: 'Kotlin', category: 'frontend' },
  occt: { id: 'occt', label: 'OpenCascade (OCCT)', category: 'frontend' },

  git: { id: 'git', label: 'Git', category: 'infra' },
  docker: { id: 'docker', label: 'Docker', category: 'infra' },
  ollama: { id: 'ollama', label: 'Ollama', category: 'infra' },
  n8n: { id: 'n8n', label: 'n8n', category: 'infra' },
  ros: { id: 'ros', label: 'ROS', category: 'infra' },
  ray: { id: 'ray', label: 'Ray', category: 'infra' },
  flower: { id: 'flower', label: 'Flower', category: 'infra' },
  hydra: { id: 'hydra', label: 'Hydra', category: 'infra' },
  'lidar-imu': { id: 'lidar-imu', label: 'LiDAR · IMU · ZED2', category: 'infra' },
};

export interface SkillCluster {
  id: TechCategory;
  index: string;
  title: Localized;
  blurb: Localized;
  techs: TechId[];
}

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'ai',
    index: '01',
    title: { tr: 'Yapay Zekâ', en: 'Artificial Intelligence' },
    blurb: {
      tr: 'Model tasarımı, eğitim ve değerlendirme; gizlilik odaklı dağıtık öğrenme ve LLM tabanlı uygulamalar.',
      en: 'Model design, training and evaluation; privacy-preserving distributed learning and LLM-based applications.',
    },
    techs: [
      'pytorch',
      'tensorflow',
      'machine-learning',
      'deep-learning',
      'federated-learning',
      'cnn',
      'nlp',
      'llm',
      'rag',
    ],
  },
  {
    id: 'vision',
    index: '02',
    title: { tr: 'Bilgisayarlı Görü', en: 'Computer Vision' },
    blurb: {
      tr: 'Veri setinin hazırlanmasından cihaz üzerinde çalışan algılama modellerine kadar görüntü işleme hattı.',
      en: 'The full imaging pipeline — from dataset preparation to on-device detection models.',
    },
    techs: [
      'opencv',
      'yolo',
      'object-detection',
      'image-classification',
      'dataset-preparation',
      'augmentation',
      'tflite',
    ],
  },
  {
    id: 'backend',
    index: '03',
    title: { tr: 'Backend & Kurumsal', en: 'Backend & Enterprise' },
    blurb: {
      tr: 'Kurumsal iş kurallarını taşıyan servisler, veri modelleri ve API katmanları.',
      en: 'Services, data models and API layers that carry real enterprise business rules.',
    },
    techs: ['python', 'cpp', 'csharp', 'nestjs', 'django', 'dotnet', 'rest', 'prisma', 'sql-server'],
  },
  {
    id: 'frontend',
    index: '04',
    title: { tr: 'Arayüz & Masaüstü', en: 'Frontend & Desktop' },
    blurb: {
      tr: 'Web, masaüstü ve mobil arayüzler; 3D CAD görüntüleme dahil.',
      en: 'Web, desktop and mobile interfaces — including 3D CAD visualisation.',
    },
    techs: ['react', 'typescript', 'material-ui', 'qt', 'tauri', 'kotlin', 'occt'],
  },
  {
    id: 'infra',
    index: '05',
    title: { tr: 'Altyapı & Araçlar', en: 'Infrastructure & Tools' },
    blurb: {
      tr: 'Deney orkestrasyonu, robotik ara katman, yerel LLM çalıştırma ve otomasyon.',
      en: 'Experiment orchestration, robotics middleware, local LLM runtimes and automation.',
    },
    techs: ['git', 'docker', 'ollama', 'n8n', 'ros', 'ray', 'flower', 'hydra', 'lidar-imu'],
  },
];

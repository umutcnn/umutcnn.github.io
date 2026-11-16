import type { ArchitectureId, Localized } from '../types/content';

export type NodeTone = 'client' | 'core' | 'data' | 'ai' | 'ui';

export interface ArchNode {
  id: string;
  /** Position in a 100 × 60 grid; the SVG scales it. */
  x: number;
  y: number;
  label: Localized;
  tone: NodeTone;
  detail: Localized;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: Localized;
}

export interface Architecture {
  id: ArchitectureId;
  title: Localized;
  summary: Localized;
  nodes: ArchNode[];
  edges: ArchEdge[];
}

const L = (tr: string, en: string): Localized => ({ tr, en });

export const ARCHITECTURES: Record<ArchitectureId, Architecture> = {
  federated: {
    id: 'federated',
    title: L('Federe öğrenme akışı', 'Federated learning flow'),
    summary: L(
      'İstemciler → yerel eğitim → model güncellemeleri → birleştirme → global model. Ham veri istemciden çıkmaz.',
      'Clients → local training → model updates → aggregation → global model. Raw data never leaves a client.',
    ),
    nodes: [
      {
        id: 'clients',
        x: 8,
        y: 30,
        tone: 'client',
        label: L('İstemciler A·B·C', 'Clients A·B·C'),
        detail: L(
          'Her istemci (ör. bir klinik) kendi göz görüntülerini tutar; veri merkezîleştirilmez.',
          'Each client (e.g. a clinic) keeps its own eye images; data is never centralised.',
        ),
      },
      {
        id: 'local',
        x: 29,
        y: 30,
        tone: 'ai',
        label: L('Yerel eğitim', 'Local training'),
        detail: L(
          'CNN her istemcide yerel veriyle eğitilir (PyTorch; Flower istemcisi).',
          'The CNN is trained on local data at each client (PyTorch; Flower client).',
        ),
      },
      {
        id: 'updates',
        x: 50,
        y: 30,
        tone: 'data',
        label: L('Model güncellemeleri', 'Model updates'),
        detail: L(
          'Sunucuya yalnızca ağırlık güncellemeleri gönderilir.',
          'Only weight updates are sent to the server.',
        ),
      },
      {
        id: 'aggregate',
        x: 71,
        y: 30,
        tone: 'core',
        label: L('Birleştirme', 'Aggregation'),
        detail: L(
          'Seçilen strateji güncellemeleri birleştirir: FedAvg, FedProx, FedAvgM veya FedAdam (Flower sunucusu; deneyler Ray + Hydra ile).',
          'The chosen strategy combines updates: FedAvg, FedProx, FedAvgM or FedAdam (Flower server; experiments run with Ray + Hydra).',
        ),
      },
      {
        id: 'global',
        x: 92,
        y: 30,
        tone: 'ui',
        label: L('Global model', 'Global model'),
        detail: L(
          'Birleştirilmiş model; bir sonraki tur için istemcilere geri dağıtılır.',
          'The aggregated model, broadcast back to clients for the next round.',
        ),
      },
    ],
    edges: [
      { from: 'clients', to: 'local' },
      { from: 'local', to: 'updates' },
      { from: 'updates', to: 'aggregate' },
      { from: 'aggregate', to: 'global' },
      { from: 'global', to: 'clients', label: L('sonraki tur', 'next round') },
    ],
  },
  'maks-erp': {
    id: 'maks-erp',
    title: L('MAKS ERP · sistem mimarisi', 'MAKS ERP · system architecture'),
    summary: L(
      'React UI → API → iş servisleri → Prisma → SQL Server. Kavramsal; gerçek şema veya ekran değildir.',
      'React UI → API → business services → Prisma → SQL Server. Conceptual; not the real schema or screens.',
    ),
    nodes: [
      {
        id: 'shell',
        x: 8,
        y: 14,
        tone: 'ui',
        label: L('Tauri kabuğu', 'Tauri shell'),
        detail: L(
          'Masaüstü dağıtımı; React arayüzünü yerel uygulama olarak çalıştırır.',
          'Desktop delivery; runs the React UI as a native application.',
        ),
      },
      {
        id: 'ui',
        x: 8,
        y: 42,
        tone: 'ui',
        label: L('React UI', 'React UI'),
        detail: L(
          'React + TypeScript + Material UI; teklif, iş akışı ve doküman ekranları, yetkiye göre şekillenir.',
          'React + TypeScript + Material UI; quote, workflow and document screens shaped by permissions.',
        ),
      },
      {
        id: 'api',
        x: 30,
        y: 42,
        tone: 'core',
        label: L('API (NestJS)', 'API (NestJS)'),
        detail: L(
          'REST uç noktaları; her istek kimlik ve rol tabanlı yetki (RBAC) kontrolünden geçer.',
          'REST endpoints; every request passes authentication and role-based access control (RBAC).',
        ),
      },
      {
        id: 'services',
        x: 52,
        y: 42,
        tone: 'core',
        label: L('İş servisleri', 'Business services'),
        detail: L(
          'Teklif yönetimi, iş akışları, doküman yönetimi, hesaplama ve revizyon geçmişi.',
          'Quote management, workflows, document management, calculations and revision history.',
        ),
      },
      {
        id: 'prisma',
        x: 73,
        y: 42,
        tone: 'data',
        label: L('Prisma', 'Prisma'),
        detail: L('Tip güvenli veri erişimi ve migration yönetimi.', 'Type-safe data access and migrations.'),
      },
      {
        id: 'db',
        x: 93,
        y: 42,
        tone: 'data',
        label: L('SQL Server', 'SQL Server'),
        detail: L('Kurumsal veri; revizyonlar ve denetim izi.', 'Enterprise data; revisions and audit trail.'),
      },
    ],
    edges: [
      { from: 'shell', to: 'ui' },
      { from: 'ui', to: 'api' },
      { from: 'api', to: 'services' },
      { from: 'services', to: 'prisma' },
      { from: 'prisma', to: 'db' },
    ],
  },
  'maks-cad': {
    id: 'maks-cad',
    title: L('MAKS CAD · işleme hattı', 'MAKS CAD · processing pipeline'),
    summary: L(
      'Qt UI → uygulama servisleri → OCCT → STEP işleme → BOM dışa aktarımı.',
      'Qt UI → application services → OCCT → STEP processing → BOM export.',
    ),
    nodes: [
      {
        id: 'qt',
        x: 8,
        y: 30,
        tone: 'ui',
        label: L('Qt UI', 'Qt UI'),
        detail: L(
          'Masaüstü arayüz ve 3D görüntüleyici; mühendis sonuçları burada doğrular.',
          'Desktop UI and 3D viewer; the engineer verifies results here.',
        ),
      },
      {
        id: 'app',
        x: 29,
        y: 30,
        tone: 'core',
        label: L('Uygulama servisleri', 'Application services'),
        detail: L(
          'C++17 iş mantığı: dosya yönetimi, analiz akışı, sonuçların arayüze aktarılması.',
          'C++17 application logic: file handling, analysis flow, passing results to the UI.',
        ),
      },
      {
        id: 'occt',
        x: 50,
        y: 30,
        tone: 'core',
        label: L('OCCT', 'OCCT'),
        detail: L(
          'OpenCascade geometri çekirdeği: şekil ağacı, sınır kutuları, ölçüler.',
          'OpenCascade geometry kernel: shape tree, bounding boxes, dimensions.',
        ),
      },
      {
        id: 'step',
        x: 71,
        y: 30,
        tone: 'data',
        label: L('STEP işleme', 'STEP processing'),
        detail: L(
          'STEP montajlarından parça hiyerarşisi ve ölçülerin çıkarılması.',
          'Extracting part hierarchy and dimensions from STEP assemblies.',
        ),
      },
      {
        id: 'bom',
        x: 92,
        y: 30,
        tone: 'ai',
        label: L('BOM dışa aktarımı', 'BOM export'),
        detail: L(
          'Malzeme listesi; muadil parça eşleştirme ve teklif karşılaştırmasına girdi olur.',
          'Bill of materials; feeds equivalent-part matching and quote comparison.',
        ),
      },
    ],
    edges: [
      { from: 'qt', to: 'app' },
      { from: 'app', to: 'occt' },
      { from: 'occt', to: 'step' },
      { from: 'step', to: 'bom' },
    ],
  },
  'erp-workflow': {
    id: 'erp-workflow',
    title: L('Teklif iş akışı', 'Quote workflow'),
    summary: L('Kavramsal iş akışı.', 'Conceptual workflow.'),
    nodes: [
      {
        id: 'req',
        x: 8,
        y: 30,
        tone: 'client',
        label: L('Talep', 'Request'),
        detail: L(
          'Müşteri talebi ve teknik dosyalar sisteme alınır.',
          'Customer request and technical files are captured.',
        ),
      },
      {
        id: 'eng',
        x: 28,
        y: 30,
        tone: 'core',
        label: L('Mühendislik', 'Engineering'),
        detail: L(
          'BOM ve teknik analiz; CAD modülüyle desteklenir.',
          'BOM and technical analysis, supported by the CAD module.',
        ),
      },
      {
        id: 'cost',
        x: 48,
        y: 30,
        tone: 'core',
        label: L('Maliyet', 'Costing'),
        detail: L('Hesap motoru maliyet kalemlerini üretir.', 'The calculation engine produces cost items.'),
      },
      {
        id: 'approve',
        x: 68,
        y: 30,
        tone: 'core',
        label: L('Onay', 'Approval'),
        detail: L(
          'Yetkili rol onaylar; her onay kayıt altına alınır.',
          'An authorised role approves; every approval is recorded.',
        ),
      },
      {
        id: 'rev',
        x: 68,
        y: 52,
        tone: 'data',
        label: L('Revizyon', 'Revision'),
        detail: L(
          'Değişiklik yeni revizyon olarak saklanır, eski hali korunur.',
          'Changes become a new revision; the old one is preserved.',
        ),
      },
      {
        id: 'send',
        x: 90,
        y: 30,
        tone: 'ui',
        label: L('Teklif', 'Quote'),
        detail: L('Doküman oluşturulur ve müşteriye iletilir.', 'The document is generated and sent to the customer.'),
      },
    ],
    edges: [
      { from: 'req', to: 'eng' },
      { from: 'eng', to: 'cost' },
      { from: 'cost', to: 'approve' },
      { from: 'approve', to: 'send' },
      { from: 'approve', to: 'rev' },
      { from: 'rev', to: 'eng' },
    ],
  },
  'erp-calculation': {
    id: 'erp-calculation',
    title: L('Hesaplama akışı', 'Calculation flow'),
    summary: L('Kavramsal; gerçek formüller paylaşılmaz.', 'Conceptual; real formulas are not shared.'),
    nodes: [
      {
        id: 'in',
        x: 10,
        y: 30,
        tone: 'data',
        label: L('Girdiler', 'Inputs'),
        detail: L('BOM, malzeme ve işçilik parametreleri.', 'BOM, material and labour parameters.'),
      },
      {
        id: 'rules',
        x: 32,
        y: 14,
        tone: 'core',
        label: L('İş kuralları', 'Business rules'),
        detail: L('Versiyonlanmış kural setleri.', 'Versioned rule sets.'),
      },
      {
        id: 'steps',
        x: 54,
        y: 30,
        tone: 'core',
        label: L('Adım adım hesap', 'Step-wise calc'),
        detail: L(
          'Her ara sonuç açıkça hesaplanır ve izlenebilir.',
          'Every intermediate result is explicit and traceable.',
        ),
      },
      {
        id: 'round',
        x: 32,
        y: 46,
        tone: 'core',
        label: L('Yuvarlama', 'Rounding'),
        detail: L('Tanımlı yuvarlama noktaları; ondalık aritmetik.', 'Defined rounding points; decimal arithmetic.'),
      },
      {
        id: 'audit',
        x: 76,
        y: 46,
        tone: 'data',
        label: L('Denetim izi', 'Audit trail'),
        detail: L('Kim, neyi, ne zaman değiştirdi.', 'Who changed what, and when.'),
      },
      {
        id: 'out',
        x: 90,
        y: 22,
        tone: 'ui',
        label: L('Teklif tutarı', 'Quote total'),
        detail: L('Revizyonla birlikte saklanan sonuç.', 'Result stored with its revision.'),
      },
    ],
    edges: [
      { from: 'in', to: 'steps' },
      { from: 'rules', to: 'steps' },
      { from: 'round', to: 'steps' },
      { from: 'steps', to: 'out' },
      { from: 'steps', to: 'audit' },
    ],
  },
  'robotaxi-stack': {
    id: 'robotaxi-stack',
    title: L('Otonomi yığını', 'Autonomy stack'),
    summary: L('ROS düğümleri arasında basitleştirilmiş veri akışı.', 'Simplified data flow between ROS nodes.'),
    nodes: [
      {
        id: 'cam',
        x: 8,
        y: 10,
        tone: 'client',
        label: L('Kamera / ZED2', 'Camera / ZED2'),
        detail: L('Görüntü ve stereo derinlik.', 'Images and stereo depth.'),
      },
      {
        id: 'lidar',
        x: 8,
        y: 30,
        tone: 'client',
        label: L('LiDAR', 'LiDAR'),
        detail: L('3B nokta bulutu; engel geometrisi.', '3D point cloud; obstacle geometry.'),
      },
      {
        id: 'imu',
        x: 8,
        y: 50,
        tone: 'client',
        label: L('IMU', 'IMU'),
        detail: L('İvme ve açısal hız; hareket tahmini.', 'Acceleration and angular rate; motion estimation.'),
      },
      {
        id: 'det',
        x: 34,
        y: 10,
        tone: 'ai',
        label: L('YOLO tespit', 'YOLO detection'),
        detail: L('Yaya, araç ve işaret tespiti.', 'Pedestrian, vehicle and sign detection.'),
      },
      {
        id: 'loc',
        x: 34,
        y: 40,
        tone: 'core',
        label: L('Haritalama & lokalizasyon', 'Mapping & localisation'),
        detail: L('Aracın harita üzerindeki konumu.', 'Vehicle pose on the map.'),
      },
      {
        id: 'fusion',
        x: 60,
        y: 25,
        tone: 'core',
        label: L('Füzyon', 'Fusion'),
        detail: L('Algılama ve konum bilgisinin birleşimi.', 'Combines perception and pose.'),
      },
      {
        id: 'plan',
        x: 82,
        y: 25,
        tone: 'core',
        label: L('Rota & davranış', 'Route & behaviour'),
        detail: L('Rota ve davranış kararları (dur, geç, dön).', 'Route and behaviour decisions (stop, go, turn).'),
      },
      {
        id: 'ctrl',
        x: 92,
        y: 50,
        tone: 'ui',
        label: L('Kontrol', 'Control'),
        detail: L('Direksiyon ve hız komutları.', 'Steering and speed commands.'),
      },
    ],
    edges: [
      { from: 'cam', to: 'det' },
      { from: 'lidar', to: 'loc' },
      { from: 'imu', to: 'loc' },
      { from: 'det', to: 'fusion' },
      { from: 'loc', to: 'fusion' },
      { from: 'fusion', to: 'plan' },
      { from: 'plan', to: 'ctrl' },
    ],
  },
};

/** Architectures offered in the Lab explorer. */
export const EXPLORER_ARCHITECTURES: ArchitectureId[] = ['maks-erp', 'maks-cad', 'federated'];

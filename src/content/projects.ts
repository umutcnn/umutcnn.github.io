import type { Project } from '../types/content';

/**
 * Project content. Rules (see docs/content-verification.md):
 *  - Only facts provided by the owner (CVs + brief). No invented metrics, links or results.
 *  - Every metric carries its context and limits.
 *  - Generated visuals are labelled as conceptual / representative in the UI.
 *  - Confidential (MAKS) work shows concepts only — no screenshots, data or code.
 */
export const PROJECTS: Project[] = [
  {
    id: 'federated-cataract',
    slug: 'federated-cataract-detection',
    featured: true,
    hasCaseStudy: true,
    order: 1,
    category: 'research',
    year: '2024',
    title: { tr: 'Federe Öğrenme ile Katarakt Tespiti', en: 'Federated Learning Cataract Detection' },
    subtitle: {
      tr: 'Hassas tıbbi görüntüleri paylaşmadan işbirlikçi model eğitimi',
      en: 'Collaborative model training without sharing sensitive medical images',
    },
    role: {
      tr: 'Proje yürütücüsü · TÜBİTAK 2209-A · Danışman: Dr. Öğr. Üyesi Ekin Ekinci',
      en: 'Principal investigator · TÜBİTAK 2209-A · Advisor: Asst. Prof. Ekin Ekinci',
    },
    badge: { tr: 'TÜBİTAK 2209-A', en: 'TÜBİTAK 2209-A' },
    overview: {
      tr: 'Dijital göz görüntülerinde katarakt sınıflandırması için, verinin istemcilerde kaldığı ve yalnızca model güncellemelerinin paylaşıldığı bir federe öğrenme düzeni kurdum; farklı birleştirme (aggregation) stratejilerini karşılaştırdım.',
      en: 'I set up a federated learning pipeline for cataract classification on digital eye images, where data stays on each client and only model updates are shared, and compared several aggregation strategies.',
    },
    problem: {
      tr: [
        'Tıbbi görüntüler kişisel ve hassas veridir; farklı kurumlardaki verileri tek bir merkezde toplamak hem yasal hem etik açıdan zordur.',
        'Tek bir kurumun verisi ise genellikle küçük ve dengesizdir; bu da genelleme kabiliyeti düşük modellere yol açar.',
      ],
      en: [
        'Medical images are personal, sensitive data; pooling them from different institutions in one place is hard both legally and ethically.',
        'A single institution’s data, on the other hand, is usually small and imbalanced, which leads to models that generalise poorly.',
      ],
    },
    approach: {
      tr: [
        'Her istemci (ör. bir klinik) modeli kendi verisiyle yerelde eğitir; sunucuya ham görüntü değil, yalnızca model ağırlıkları gönderilir.',
        'Sunucu güncellemeleri birleştirerek yeni global modeli oluşturur ve istemcilere geri dağıtır; süreç tur tur tekrarlanır.',
        'FedAvg, FedProx, FedAvgM ve FedAdam stratejileri aynı CNN sınıflandırıcı üzerinde karşılaştırıldı.',
      ],
      en: [
        'Each client (e.g. a clinic) trains the model locally on its own data; only model weights — never raw images — are sent to the server.',
        'The server aggregates the updates into a new global model and broadcasts it back; the process repeats round by round.',
        'FedAvg, FedProx, FedAvgM and FedAdam were compared on the same CNN classifier.',
      ],
    },
    techRationale: {
      tr: [
        'Flower: istemci/sunucu rollerini ve birleştirme stratejilerini değiştirilebilir biçimde tanımlamak için.',
        'Ray: birden fazla istemciyi tek makinede simülasyon olarak paralel çalıştırmak için.',
        'Hydra: deney yapılandırmalarını (strateji, istemci sayısı, tur sayısı) tekrarlanabilir tutmak için.',
        'PyTorch: CNN modelinin tanımı ve yerel eğitim döngüsü için.',
      ],
      en: [
        'Flower — to define client/server roles and swap aggregation strategies cleanly.',
        'Ray — to run several clients in parallel as a simulation on a single machine.',
        'Hydra — to keep experiment configurations (strategy, client count, rounds) reproducible.',
        'PyTorch — for the CNN definition and the local training loop.',
      ],
    },
    architecture: {
      tr: [
        'İstemci katmanı: yerel veri yükleyici → CNN → yerel eğitim → ağırlık güncellemesi.',
        'Sunucu katmanı: strateji (FedAvg / FedProx / FedAvgM / FedAdam) → birleştirme → global model.',
        'Deney katmanı: Hydra yapılandırması → Ray simülasyonu → tur bazlı değerlendirme kayıtları.',
      ],
      en: [
        'Client layer: local data loader → CNN → local training → weight update.',
        'Server layer: strategy (FedAvg / FedProx / FedAvgM / FedAdam) → aggregation → global model.',
        'Experiment layer: Hydra config → Ray simulation → per-round evaluation logs.',
      ],
    },
    implementation: {
      tr: [
        'Stratejiler aynı model ve aynı veri bölümü üzerinde çalıştırılarak adil bir karşılaştırma ortamı hedeflendi.',
        'FedProx’ta yerel güncellemelerin global modelden fazla uzaklaşmasını sınırlayan proksimal terim kullanıldı.',
      ],
      en: [
        'Strategies were run on the same model and the same data partition to keep the comparison fair.',
        'FedProx adds a proximal term that limits how far local updates drift from the global model.',
      ],
    },
    challenges: {
      tr: [
        'İstemciler arasında veri dağılımının farklı olması (non-IID) yerel modellerin birbirinden uzaklaşmasına neden olur.',
        'Az sayıda istemciyle anlamlı ve tekrarlanabilir karşılaştırma yapabilmek için deney düzeninin sıkı kontrol edilmesi gerekti.',
      ],
      en: [
        'Different data distributions across clients (non-IID) make local models drift apart.',
        'With few clients, the experiment setup had to be tightly controlled to keep comparisons meaningful and reproducible.',
      ],
    },
    results: {
      tr: [
        'Kaydedilmiş deneylerden birinde, üç istemcili FedProx yapılandırması yaklaşık %96,25 sınıflandırma başarımına ulaştı.',
        'Çalışma, TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri programı kapsamında destek almaya hak kazandı.',
      ],
      en: [
        'In one recorded experiment, the three-client FedProx configuration reached about 96.25% classification accuracy.',
        'The work was awarded support under the TÜBİTAK 2209-A university student research programme.',
      ],
    },
    limitations: {
      tr: [
        'Sonuç tek bir kayıtlı deneye aittir; veri bölme stratejisi ve değerlendirme protokolü burada yayımlanmamıştır ve bağımsız olarak doğrulanmamıştır.',
        'Bu bir araştırma prototipidir; klinik olarak doğrulanmış bir teşhis ürünü değildir ve tıbbi karar için kullanılamaz.',
      ],
      en: [
        'The figure comes from a single recorded experiment; the data split and evaluation protocol are not published here and have not been independently validated.',
        'This is a research prototype — not a clinically validated diagnostic product, and not for medical decision-making.',
      ],
    },
    learnings: {
      tr: [
        'Gizlilik bir kısıt değil, mimari bir tasarım girdisidir.',
        'Dağıtık sistemlerde algoritma seçimi kadar deney disiplini de sonucu belirler.',
      ],
      en: [
        'Privacy is not a constraint bolted on later — it is an architectural input.',
        'In distributed learning, experimental discipline matters as much as the choice of algorithm.',
      ],
    },
    metrics: [
      {
        value: { tr: '≈ %96,25', en: '≈96.25%' },
        label: {
          tr: 'Sınıflandırma başarımı · FedProx · 3 istemci',
          en: 'Classification accuracy · FedProx · 3 clients',
        },
        context: {
          tr: 'Tek kayıtlı deney; protokol bağımsız doğrulanmadı; klinik ürün değildir.',
          en: 'Single recorded experiment; protocol not independently validated; not a clinical product.',
        },
      },
    ],
    technologies: [
      'python',
      'pytorch',
      'flower',
      'federated-learning',
      'cnn',
      'ray',
      'hydra',
      'image-classification',
      'deep-learning',
    ],
    gallery: [
      {
        kind: 'visual',
        visual: 'federated',
        caption: {
          tr: 'Federe eğitim turları — kavramsal mimari simülasyonu',
          en: 'Federated training rounds — conceptual architecture simulation',
        },
      },
      {
        kind: 'architecture',
        architecture: 'federated',
        caption: { tr: 'Sistem mimarisi — basitleştirilmiş', en: 'System architecture — simplified' },
      },
    ],
    visual: 'federated',
    isPublic: true,
    visibility: 'public',
    relatedProjects: ['industrial-coil-detection', 'teknofest-2023-transportation-ai'],
    disclosure: {
      tr: 'Bu sayfadaki etkileşimli görseller kavramsal simülasyondur; gerçek eğitim çalıştırmaz ve gerçek deney verisi göstermez.',
      en: 'Interactive visuals on this page are conceptual simulations; they do not run real training or show real experiment data.',
    },
  },
  {
    id: 'teknofest-2023',
    slug: 'teknofest-2023-transportation-ai',
    featured: true,
    hasCaseStudy: true,
    order: 2,
    category: 'vision',
    year: '2023',
    title: { tr: 'TEKNOFEST 2023 · Ulaşımda Yapay Zekâ', en: 'TEKNOFEST 2023 · AI in Transportation' },
    subtitle: {
      tr: 'Uçan araçlar için çevresel algılama ve uygun iniş alanı değerlendirmesi',
      en: 'Environmental perception and landing-area assessment for flying vehicles',
    },
    role: { tr: 'Takım üyesi · Codent · Bilgisayarlı görü', en: 'Team member · Codent · Computer vision' },
    badge: { tr: 'TEKNOFEST 2023 — TÜRKİYE 2.Sİ', en: 'TEKNOFEST 2023 — 2ND PLACE' },
    overview: {
      tr: 'Uçan arabaların çevresel farkındalığını artırmak için taşıtları, insanları ve uygun iniş alanlarını tespit eden bir bilgisayarlı görü sistemi geliştirdik. Sistem gece, gündüz ve zorlu hava koşullarında çalışacak şekilde tasarlandı ve Codent takımı Türkiye ikincisi oldu.',
      en: 'We built a computer vision system that detects vehicles, people and suitable landing areas to improve the environmental awareness of flying cars. It was designed to work by day, at night and in difficult weather — and team Codent placed second in Türkiye.',
    },
    problem: {
      tr: [
        'Havadan alınan görüntülerde nesneler küçük, açılar değişken ve ışık koşulları çok farklıdır.',
        'Bir iniş alanının uygun olup olmadığına karar vermek, yalnızca nesne bulmaktan fazlasını gerektirir: alanın üzerinde engel olup olmadığını da değerlendirmek gerekir.',
      ],
      en: [
        'In aerial imagery objects are small, viewing angles vary and lighting conditions differ dramatically.',
        'Deciding whether a landing area is usable takes more than finding objects — you must also judge whether anything obstructs the area.',
      ],
    },
    approach: {
      tr: [
        'Taşıt, insan ve iniş alanı sınıfları için nesne tespiti modeli eğitildi.',
        'Model; gece, gündüz ve zorlu hava koşullarındaki örneklerle değerlendirilerek farklı çevre koşullarına dayanıklı hale getirilmeye çalışıldı.',
        'Tespit edilen iniş alanları, üzerlerinde bulunan nesnelere göre uygun / uygun değil olarak değerlendirildi.',
      ],
      en: [
        'An object detection model was trained for vehicle, person and landing-area classes.',
        'The model was evaluated on day, night and adverse-weather samples, aiming for robustness across environments.',
        'Detected landing areas were assessed as usable / not usable depending on objects found on them.',
      ],
    },
    results: {
      tr: ['TEKNOFEST 2023 Ulaşımda Yapay Zekâ yarışmasında Türkiye ikinciliği.'],
      en: ['Second place in Türkiye at the TEKNOFEST 2023 AI in Transportation competition.'],
    },
    learnings: {
      tr: [
        'Yarışma koşullarında model kadar veri hazırlığı ve değerlendirme hattı da belirleyicidir.',
        'Takım içinde net görev paylaşımı, sınırlı sürede güvenilir sonuç almanın anahtarıdır.',
      ],
      en: [
        'Under competition conditions, data preparation and the evaluation pipeline matter as much as the model.',
        'Clear ownership inside the team is the key to reliable results under time pressure.',
      ],
    },
    metrics: [
      {
        value: '#2',
        label: { tr: 'Türkiye derecesi', en: 'National rank' },
        context: {
          tr: 'TEKNOFEST 2023 · Ulaşımda Yapay Zekâ · Codent',
          en: 'TEKNOFEST 2023 · AI in Transportation · Codent',
        },
      },
    ],
    technologies: ['python', 'deep-learning', 'object-detection', 'dataset-preparation', 'augmentation'],
    gallery: [
      {
        kind: 'visual',
        visual: 'aerial-detection',
        caption: {
          tr: 'Havadan algılama katmanları — temsili görselleştirme, yarışma görüntüsü değildir',
          en: 'Aerial perception layers — representative visualisation, not competition footage',
        },
      },
    ],
    visual: 'aerial-detection',
    repositoryUrl: undefined,
    isPublic: true,
    visibility: 'public',
    relatedProjects: ['autonomous-robotaxi', 'industrial-coil-detection'],
    disclosure: {
      tr: 'Gösterilen sahne temsilîdir; yarışma veri seti veya gerçek model çıktısı değildir.',
      en: 'The scene shown is representative; it is not the competition dataset or real model output.',
    },
  },
  {
    id: 'robotaxi',
    slug: 'autonomous-robotaxi',
    featured: true,
    hasCaseStudy: true,
    order: 3,
    category: 'autonomy',
    year: '2024',
    title: { tr: 'Otonom Robotaksi Sistemleri', en: 'Autonomous Robotaxi Systems' },
    subtitle: {
      tr: 'Sensör füzyonu, algılama ve rota planlaması — TEKNOFEST 2024 finalisti',
      en: 'Sensor fusion, perception and route planning — TEKNOFEST 2024 finalist',
    },
    role: { tr: 'Finalist takım üyesi · Algılama & otonomi', en: 'Finalist team member · Perception & autonomy' },
    badge: { tr: 'TEKNOFEST 2024 FİNALİST', en: 'TEKNOFEST 2024 FINALIST' },
    overview: {
      tr: 'Robotaksi Binek Otonom Araç kategorisinde finale kalan takımda; ROS üzerinde kamera, LiDAR, IMU ve ZED2 stereo kamera verilerini bir araya getiren algılama, haritalama, lokalizasyon ve davranış planlama bileşenleri üzerinde çalıştım.',
      en: 'In the team that reached the Robotaxi autonomous vehicle finals, I worked on ROS-based perception, mapping, localisation and behaviour-planning components that combine camera, LiDAR, IMU and ZED2 stereo data.',
    },
    problem: {
      tr: [
        'Otonom bir araç; şeritleri, trafik işaretlerini, yayaları ve diğer araçları gerçek zamanlı algılamalı, nerede olduğunu bilmeli ve güvenli bir rota izlemelidir.',
        'Tek bir sensör yeterli değildir: kamera anlam sağlar, LiDAR geometri, IMU hareket bilgisi.',
      ],
      en: [
        'An autonomous vehicle must perceive lanes, signs, pedestrians and other vehicles in real time, know where it is, and follow a safe route.',
        'No single sensor is enough: cameras give semantics, LiDAR gives geometry, the IMU gives motion.',
      ],
    },
    approach: {
      tr: [
        'Görüntü tabanlı nesne tespiti için YOLO modelleri kullanıldı.',
        'LiDAR ve IMU verileriyle haritalama ve lokalizasyon; ZED2 ile derinlik bilgisi elde edildi.',
        'Algılama çıktıları, ROS düğümleri arasında rota ve davranış planlamasına aktarıldı.',
      ],
      en: [
        'YOLO models were used for image-based object detection.',
        'LiDAR and IMU data drove mapping and localisation; the ZED2 provided depth.',
        'Perception outputs were passed between ROS nodes into route and behaviour planning.',
      ],
    },
    architecture: {
      tr: ['Sensörler → algılama düğümleri (tespit, derinlik) → füzyon → lokalizasyon & harita → planlama → kontrol.'],
      en: ['Sensors → perception nodes (detection, depth) → fusion → localisation & map → planning → control.'],
    },
    challenges: {
      tr: [
        'Farklı frekanslarda veri üreten sensörlerin zaman ve koordinat olarak hizalanması.',
        'Yarışma parkurundaki değişken ışık ve sahne koşullarında algılamanın kararlı kalması.',
      ],
      en: [
        'Aligning sensors that publish at different rates, in time and in coordinate frames.',
        'Keeping perception stable under changing light and scene conditions on the competition track.',
      ],
    },
    results: {
      tr: ['TEKNOFEST 2024 Robotaksi Binek Otonom Araç kategorisinde finalistlik.'],
      en: ['Finalist in the TEKNOFEST 2024 Robotaxi autonomous passenger vehicle category.'],
    },
    learnings: {
      tr: ['Otonom sistemlerde güvenilirlik, tek bir modelden değil, bileşenlerin birbirini doğrulamasından gelir.'],
      en: ['Reliability in autonomous systems comes from components cross-checking each other, not from one model.'],
    },
    metrics: [],
    technologies: ['ros', 'yolo', 'lidar-imu', 'object-detection', 'python', 'deep-learning'],
    gallery: [
      {
        kind: 'visual',
        visual: 'robotaxi',
        caption: {
          tr: 'Algılama katmanları — kavramsal sahne, çalışan sistem kaydı değildir',
          en: 'Perception layers — conceptual scene, not a recording of the running system',
        },
      },
      {
        kind: 'architecture',
        architecture: 'robotaxi-stack',
        caption: { tr: 'Otonomi yığını — basitleştirilmiş', en: 'Autonomy stack — simplified' },
      },
    ],
    visual: 'robotaxi',
    isPublic: true,
    visibility: 'public',
    relatedProjects: ['teknofest-2023-transportation-ai', 'industrial-coil-detection'],
    disclosure: {
      tr: 'Etkileşimli sahne kavramsal bir demodur; gerçek araç verisi veya çalışan otonom sistem değildir.',
      en: 'The interactive scene is a conceptual demo — not real vehicle data or a running autonomous system.',
    },
  },
  {
    id: 'maks-cad',
    slug: 'maks-cad-intelligence',
    featured: true,
    hasCaseStudy: true,
    order: 4,
    category: 'cad',
    year: '2025 — 2026',
    title: { tr: 'MAKS CAD Intelligence', en: 'MAKS CAD Intelligence' },
    subtitle: {
      tr: 'STEP modellerinden otomatik parça analizi, ölçülendirme ve BOM çıkarımı',
      en: 'Automated part analysis, dimensioning and BOM extraction from STEP models',
    },
    role: { tr: 'Yapay Zekâ & Yazılım Mühendisi · Canas Yazılım', en: 'AI & Software Engineer · Canas Yazılım' },
    overview: {
      tr: 'C++17, Qt ve OpenCascade (OCCT) ile STEP modellerini görüntüleyen ve analiz eden bir masaüstü CAD aracı. Parçaların sınır kutularını ve ölçülerini hesaplayarak malzeme listesi (BOM) çıkarımını, muadil parça eşleştirmeyi ve teklif karşılaştırmasını otomatikleştiren üretim odaklı bir sistem.',
      en: 'A desktop CAD tool built with C++17, Qt and OpenCascade (OCCT) that displays and analyses STEP models. It computes part bounding boxes and dimensions to automate bill-of-materials (BOM) extraction, equivalent-part matching and quote comparison for manufacturing.',
    },
    problem: {
      tr: [
        'Teklif hazırlama sürecinde mühendisler, STEP dosyalarındaki yüzlerce parçayı tek tek inceleyip ölçü ve malzeme listesi çıkarmak zorunda kalıyordu.',
        'Bu manuel süreç hem yavaş hem de hataya açıktı.',
      ],
      en: [
        'To prepare quotes, engineers had to open STEP files and extract dimensions and material lists part by part.',
        'This manual process was slow and error-prone.',
      ],
    },
    approach: {
      tr: [
        'OCCT ile STEP montajları okunup parça hiyerarşisi çıkarıldı.',
        'Her parça için sınır kutusu ve temel geometrik ölçüler hesaplanarak teknik ölçülendirme otomatikleştirildi.',
        'Parça bilgileri BOM yapısına dönüştürüldü; muadil parça eşleştirme ve teklif karşılaştırma algoritmalarına girdi oldu.',
      ],
      en: [
        'STEP assemblies are read with OCCT and the part hierarchy is extracted.',
        'Bounding boxes and core geometric measurements are computed per part, automating technical dimensioning.',
        'Part data is turned into a BOM structure that feeds equivalent-part matching and quote comparison.',
      ],
    },
    techRationale: {
      tr: [
        'OCCT: STEP gibi endüstriyel formatları doğrudan okuyabilen, olgun ve açık kaynak bir geometri çekirdeği.',
        'Qt: yüksek performanslı 3D görüntüleme ile masaüstü arayüzünü aynı uygulamada birleştirmek için.',
        'C++17: büyük montajlarda geometri hesaplarının performansı için.',
      ],
      en: [
        'OCCT — a mature open-source geometry kernel that reads industrial formats such as STEP natively.',
        'Qt — to combine high-performance 3D viewing and a desktop UI in one application.',
        'C++17 — for geometry performance on large assemblies.',
      ],
    },
    architecture: {
      tr: [
        'STEP içe aktarma → şekil ağacı → geometri analizi (sınır kutusu, ölçüler) → BOM modeli → eşleştirme & teklif → raporlama.',
      ],
      en: [
        'STEP import → shape tree → geometry analysis (bounding box, dimensions) → BOM model → matching & quoting → reporting.',
      ],
    },
    results: {
      tr: [
        'Özgeçmişte belirtilen etki: BOM çıkarımı, muadil ürün eşleştirme ve teklif karşılaştırma otomasyonuyla teklif değerlendirme süresi %45 kısaldı, maliyetler %20 azaldı.',
      ],
      en: [
        'Impact stated in the CV: automating BOM extraction, equivalent-product matching and quote comparison cut quote evaluation time by 45% and costs by 20%.',
      ],
    },
    // Limits restate only what is already disclosed above (source of the figures, confidentiality).
    limitations: {
      tr: [
        '−%45 ve −%20 değerleri tek bir kurumdaki iç ölçümlerdir; bağımsız olarak doğrulanmadı ve başka iş akışlarına genellenemez.',
        'Ticari gizlilik nedeniyle kaynak kod, ekran görüntüleri ve müşteri verileri yayımlanmaz; sayfadaki model ve diyagramlar temsilîdir.',
      ],
      en: [
        'The −45% and −20% figures are internal measurements at a single company; they were not independently verified and do not generalise to other workflows.',
        'Because the project is commercial, source code, screenshots and customer data are not published; the model and diagrams on this page are representative.',
      ],
    },
    learnings: {
      tr: [
        'Endüstriyel yazılımda doğruluk, hızdan önce gelir; her otomasyon adımı mühendisin doğrulayabileceği şekilde görünür olmalıdır.',
      ],
      en: [
        'In industrial software, correctness comes before speed — every automated step must stay visible and verifiable to the engineer.',
      ],
    },
    metrics: [
      {
        value: { tr: '−%45', en: '−45%' },
        label: { tr: 'Teklif değerlendirme süresi', en: 'Quote evaluation time' },
        context: {
          tr: 'Özgeçmişte belirtilen kurum içi ölçüm; BOM çıkarımı + eşleştirme + teklif karşılaştırma otomasyonunun toplam etkisi.',
          en: 'Internal measurement stated in the CV; combined effect of BOM extraction + matching + quote comparison automation.',
        },
      },
      {
        value: { tr: '−%20', en: '−20%' },
        label: { tr: 'Maliyet', en: 'Cost' },
        context: {
          tr: 'Özgeçmişte belirtilen kurum içi ölçüm; aynı otomasyon kapsamı.',
          en: 'Internal measurement stated in the CV; same automation scope.',
        },
      },
    ],
    technologies: ['cpp', 'qt', 'occt', 'python'],
    gallery: [
      {
        kind: 'visual',
        visual: 'cad-wireframe',
        caption: {
          tr: 'Tel kafes parça ve ölçü referansları — temsili model, müşteri verisi değildir',
          en: 'Wireframe part with dimension references — representative model, not customer data',
        },
      },
      {
        kind: 'architecture',
        architecture: 'maks-cad',
        caption: { tr: 'İşleme hattı — basitleştirilmiş', en: 'Processing pipeline — simplified' },
      },
    ],
    visual: 'cad-wireframe',
    isPublic: false,
    visibility: 'confidential',
    relatedProjects: ['cad-part-matching', 'maks-enterprise-erp'],
    disclosure: {
      tr: 'Ticari bir projedir. Kaynak kod, ekran görüntüleri ve müşteri verileri paylaşılmaz; gösterilen model ve diyagramlar temsilîdir.',
      en: 'Commercial project. Source code, screenshots and customer data are not shared; the model and diagrams shown are representative.',
    },
  },
  {
    id: 'maks-erp',
    slug: 'maks-enterprise-erp',
    featured: true,
    hasCaseStudy: true,
    order: 5,
    category: 'enterprise',
    year: '2025 — 2026',
    title: { tr: 'MAKS Enterprise ERP', en: 'MAKS Enterprise ERP' },
    subtitle: {
      tr: 'Karmaşık iş süreçlerinden akıllı kurumsal yazılıma',
      en: 'From complex business processes to intelligent enterprise software',
    },
    role: { tr: 'Yapay Zekâ & Yazılım Mühendisi · Canas Yazılım', en: 'AI & Software Engineer · Canas Yazılım' },
    overview: {
      tr: 'Teklif yönetimi, iş akışları, yetkilendirme, doküman yönetimi ve hesaplama sistemlerini kapsayan; React/TypeScript arayüzü, NestJS + Prisma servisleri ve Microsoft SQL Server veritabanıyla geliştirilen, Tauri ile masaüstüne taşınan kurumsal bir ERP.',
      en: 'An enterprise ERP covering quote management, workflows, authorisation, document management and calculation systems — built with a React/TypeScript UI, NestJS + Prisma services and Microsoft SQL Server, shipped to the desktop with Tauri.',
    },
    problem: {
      tr: [
        'Teklif ve üretim süreçleri çok adımlı, çok rollü ve sık revize edilen iş kurallarına sahipti.',
        'Hesaplamaların, revizyonların ve onayların izlenebilir olması gerekiyordu.',
      ],
      en: [
        'Quoting and production processes were multi-step, multi-role and governed by frequently revised business rules.',
        'Calculations, revisions and approvals had to be traceable.',
      ],
    },
    approach: {
      tr: [
        'Rol tabanlı erişim kontrolü (RBAC) ile her ekran ve işlem yetki matrisine bağlandı.',
        'Teklifler revizyon geçmişiyle saklanarak her değişiklik izlenebilir hale getirildi.',
        'Hesaplama adımları açık ve test edilebilir servisler olarak modellendi.',
        'Yapay zekâ modülleri (ör. CAD tabanlı BOM çıkarımı) mevcut kurumsal sisteme entegre edildi.',
      ],
      en: [
        'Role-based access control (RBAC) ties every screen and action to a permission matrix.',
        'Quotes are stored with revision history so every change is traceable.',
        'Calculation steps are modelled as explicit, testable services.',
        'AI modules (e.g. CAD-based BOM extraction) were integrated into the existing enterprise system.',
      ],
    },
    techRationale: {
      tr: [
        'NestJS + Prisma: modüler servis yapısı ve tip güvenli veri erişimi.',
        'SQL Server: kurumun mevcut veri altyapısıyla uyum.',
        'React + Material UI: yoğun veri içeren ekranlar için tutarlı bileşen kütüphanesi.',
        'Tauri: hafif bir masaüstü kabuğu ile yerel dosya erişimi.',
      ],
      en: [
        'NestJS + Prisma — modular services and type-safe data access.',
        'SQL Server — alignment with the company’s existing data infrastructure.',
        'React + Material UI — a consistent component library for data-dense screens.',
        'Tauri — a lightweight desktop shell with local file access.',
      ],
    },
    architecture: {
      tr: [
        'Tauri masaüstü kabuğu → React arayüz → NestJS API (yetki katmanı) → Prisma → SQL Server; doküman deposu ve AI modülleri yan servisler olarak.',
      ],
      en: [
        'Tauri desktop shell → React UI → NestJS API (authorisation layer) → Prisma → SQL Server; document store and AI modules as side services.',
      ],
    },
    learnings: {
      tr: ['Kurumsal yazılımda en değerli özellik güvenilirliktir: doğru yetki, doğru hesap, geri izlenebilir geçmiş.'],
      en: [
        'In enterprise software the most valuable feature is trust: correct permissions, correct numbers, traceable history.',
      ],
    },
    metrics: [],
    technologies: ['react', 'typescript', 'nestjs', 'prisma', 'sql-server', 'material-ui', 'tauri', 'rest'],
    gallery: [
      {
        kind: 'architecture',
        architecture: 'maks-erp',
        caption: { tr: 'Sistem mimarisi — kavramsal', en: 'System architecture — conceptual' },
      },
      {
        kind: 'architecture',
        architecture: 'erp-workflow',
        caption: { tr: 'Teklif iş akışı — kavramsal', en: 'Quote workflow — conceptual' },
      },
      {
        kind: 'architecture',
        architecture: 'erp-calculation',
        caption: { tr: 'Hesaplama akışı — kavramsal', en: 'Calculation flow — conceptual' },
      },
    ],
    visual: 'erp-architecture',
    isPublic: false,
    visibility: 'confidential',
    relatedProjects: ['maks-cad-intelligence', 'cad-part-matching'],
    disclosure: {
      tr: 'Ticari bir projedir. Ekranlar, müşteri bilgileri ve iş verileri paylaşılmaz; diyagramlar ve yetki matrisi kavramsaldır.',
      en: 'Commercial project. Screens, customer information and business data are not shared; diagrams and the permission matrix are conceptual.',
    },
  },
  {
    id: 'coil-detection',
    slug: 'industrial-coil-detection',
    featured: true,
    hasCaseStudy: true,
    order: 6,
    category: 'vision',
    year: '2025',
    title: { tr: 'Endüstriyel Görü · Bobin Tespiti', en: 'Industrial Vision · Coil Detection' },
    subtitle: {
      tr: 'Mobil cihazda çalışan YOLO tabanlı bobin tespiti ve sayımı',
      en: 'YOLO-based coil detection and counting running on a mobile device',
    },
    role: { tr: 'Mühendislik stajyeri (Yapay Zekâ) · Konfida', en: 'Engineering intern (AI) · Konfida' },
    overview: {
      tr: 'Üretim sahasındaki bobinlerin mobil cihaz kamerasıyla tespit edilip sayılması için Ultralytics YOLO ile model eğittim, TensorFlow Lite’a dönüştürdüm ve Kotlin ile Android uygulamasına entegre ettim. Kısmen görünen ürünlerin tespitini de otomatikleştirdik.',
      en: 'To detect and count coils on the factory floor with a phone camera, I trained a model with Ultralytics YOLO, converted it to TensorFlow Lite and integrated it into a Kotlin Android app — including detection of partially visible items.',
    },
    problem: {
      tr: [
        'Bobin sayımı elle yapılıyordu: yavaş, yorucu ve hataya açık.',
        'Yığın halindeki bobinlerin bir kısmı diğerlerinin arkasında kaldığı için kısmen görünüyordu.',
      ],
      en: [
        'Coils were counted by hand — slow, tiring and error-prone.',
        'In stacks, many coils are partially hidden behind others.',
      ],
    },
    approach: {
      tr: [
        'Saha görüntülerinden veri seti hazırlandı ve etiketlendi; veri artırma (augmentation) uygulandı.',
        'YOLO modelleri eğitilip karşılaştırıldı; kayıtlı YOLOv9 deneyi raporlandı.',
        'Model TensorFlow Lite’a dönüştürülerek cihaz üzerinde (edge-AI) çalıştırıldı.',
      ],
      en: [
        'A dataset was built and labelled from shop-floor images, with augmentation.',
        'YOLO models were trained and compared; a recorded YOLOv9 experiment is reported.',
        'The model was converted to TensorFlow Lite to run on the device (edge-AI).',
      ],
    },
    techRationale: {
      tr: [
        'Ultralytics YOLO: hızlı deney döngüsü ve olgun dışa aktarma araçları.',
        'TensorFlow Lite: ağ bağlantısı olmadan cihaz üzerinde çıkarım.',
        'Kotlin: kamera erişimi ve performanslı Android entegrasyonu.',
      ],
      en: [
        'Ultralytics YOLO — fast experiment loop and mature export tooling.',
        'TensorFlow Lite — on-device inference without a network connection.',
        'Kotlin — camera access and performant Android integration.',
      ],
    },
    results: {
      tr: [
        'Kayıtlı YOLOv9 deneyinde mAP@50 ≈ %98,4 ve mAP@50:95 ≈ %78,0.',
        'Özgeçmişe göre mobil kameradan sayım süresi 2–3 saniyeye indi.',
      ],
      en: [
        'Recorded YOLOv9 experiment: mAP@50 ≈ 98.4% and mAP@50:95 ≈ 78.0%.',
        'According to the CV, counting from the phone camera dropped to 2–3 seconds.',
      ],
    },
    limitations: {
      tr: [
        'Metrikler kurum içi doğrulama setindeki tek bir kayıtlı deneye aittir; farklı saha koşullarında değişebilir.',
      ],
      en: [
        'Metrics come from a single recorded experiment on an internal validation set and may vary under different site conditions.',
      ],
    },
    learnings: {
      tr: [
        'Sahada işe yarayan model, laboratuvardaki en yüksek skoru alan değil; cihazda hızlı ve tutarlı çalışandır.',
      ],
      en: [
        'The model that works on the floor is not the one with the best lab score — it is the one that runs fast and consistently on the device.',
      ],
    },
    metrics: [
      {
        value: { tr: '≈ %98,4', en: '≈98.4%' },
        label: { tr: 'mAP@50 · YOLOv9', en: 'mAP@50 · YOLOv9' },
        context: {
          tr: 'Tek kayıtlı deney, kurum içi doğrulama seti.',
          en: 'Single recorded experiment, internal validation set.',
        },
      },
      {
        value: { tr: '≈ %78,0', en: '≈78.0%' },
        label: { tr: 'mAP@50:95 · YOLOv9', en: 'mAP@50:95 · YOLOv9' },
        context: { tr: 'Aynı deney.', en: 'Same experiment.' },
      },
      {
        value: { tr: '2–3 sn', en: '2–3 s' },
        label: { tr: 'Mobil sayım süresi', en: 'Mobile counting time' },
        context: { tr: 'Özgeçmişte belirtilen değer.', en: 'Value stated in the CV.' },
      },
    ],
    technologies: [
      'python',
      'yolo',
      'opencv',
      'kotlin',
      'tflite',
      'object-detection',
      'dataset-preparation',
      'augmentation',
    ],
    gallery: [
      {
        kind: 'visual',
        visual: 'coil-detection',
        caption: {
          tr: 'Güven eşiği oynatılabilir tespit görselleştirmesi — sentetik sahne, gerçek model çıkarımı yoktur',
          en: 'Detection visualisation with adjustable confidence — synthetic scene, no real model inference',
        },
      },
    ],
    visual: 'coil-detection',
    isPublic: false,
    visibility: 'internal',
    relatedProjects: ['teknofest-2023-transportation-ai', 'federated-cataract-detection'],
    disclosure: {
      tr: 'Saha görüntüleri şirket içidir ve paylaşılmaz; etkileşimli sahne sentetiktir ve gerçek model çıkarımı yapmaz.',
      en: 'Shop-floor images are internal and not shared; the interactive scene is synthetic and runs no real model inference.',
    },
  },

  // ----- Archive -----------------------------------------------------------------------------------------------
  {
    id: 'cad-part-matching',
    slug: 'cad-part-matching',
    featured: false,
    hasCaseStudy: false,
    order: 7,
    category: 'cad',
    year: '2025 — 2026',
    title: { tr: 'CAD Parça Eşleştirme & STEP Otomasyonu', en: 'CAD Part Matching & STEP Automation' },
    subtitle: {
      tr: 'Muadil ürün eşleştirme ve teklif karşılaştırma',
      en: 'Equivalent-product matching and quote comparison',
    },
    role: { tr: 'Canas Yazılım', en: 'Canas Yazılım' },
    overview: {
      tr: 'STEP teknik çizim dosyalarından otomatik BOM çıkarımı, muadil ürün eşleştirme ve teklif karşılaştırma süreçlerini otomatikleştiren algoritmalar.',
      en: 'Algorithms that automate BOM extraction from STEP drawings, equivalent-product matching and quote comparison.',
    },
    metrics: [],
    technologies: ['python', 'cpp', 'occt'],
    gallery: [],
    visual: 'none',
    isPublic: false,
    visibility: 'confidential',
    relatedProjects: ['maks-cad-intelligence'],
  },
  {
    id: 'rag-recommendation',
    slug: 'rag-recommendation-prototypes',
    featured: false,
    hasCaseStudy: false,
    order: 8,
    category: 'genai',
    year: '2025',
    title: { tr: 'RAG & Öneri Sistemi Prototipleri', en: 'RAG & Recommendation Prototypes' },
    subtitle: {
      tr: 'Kişiselleştirilmiş yanıt üreten LLM sistemleri',
      en: 'LLM systems that produce personalised answers',
    },
    role: { tr: 'Konfida', en: 'Konfida' },
    overview: {
      tr: 'ChatGPT API ile kullanıcıya özel yanıt veren RAG prototipleri ve geçmiş verilerden haftalık beslenme önerileri sunan masaüstü menü öneri sistemi.',
      en: 'RAG prototypes that answer per user via the ChatGPT API, and a desktop menu recommender that suggests weekly meals from historical data.',
    },
    metrics: [],
    technologies: ['python', 'llm', 'rag', 'nlp', 'machine-learning'],
    gallery: [],
    visual: 'none',
    isPublic: false,
    visibility: 'internal',
    relatedProjects: [],
  },
  {
    id: 'comment-moderation',
    slug: 'ai-comment-moderation',
    featured: false,
    hasCaseStudy: false,
    order: 9,
    category: 'genai',
    year: '—',
    title: { tr: 'Yapay Zekâ Destekli Yorum Moderasyonu', en: 'AI-Powered Comment Moderation' },
    subtitle: { tr: 'Kullanıcı yorumları için NLP tabanlı moderasyon', en: 'NLP-based moderation for user comments' },
    role: { tr: 'Kişisel proje', en: 'Personal project' },
    overview: {
      tr: 'Kullanıcı yorumlarını doğal dil işleme ile değerlendiren bir moderasyon çalışması. Ayrıntılı vaka çalışması hazırlanıyor.',
      en: 'A moderation project that evaluates user comments with natural language processing. A detailed case study is in preparation.',
    },
    metrics: [],
    technologies: ['python', 'nlp', 'llm'],
    gallery: [],
    visual: 'none',
    isPublic: false,
    visibility: 'internal',
    relatedProjects: [],
  },
  {
    id: 'documentary-ai-studio',
    slug: 'documentary-ai-studio',
    featured: false,
    hasCaseStudy: false,
    order: 10,
    category: 'genai',
    year: '—',
    title: { tr: 'Documentary AI Studio', en: 'Documentary AI Studio' },
    subtitle: { tr: 'Üretken yapay zekâ ile içerik üretim iş akışı', en: 'Generative-AI content production workflow' },
    role: { tr: 'Kişisel proje', en: 'Personal project' },
    overview: {
      tr: 'Belgesel içerik üretimini üretken yapay zekâ araçlarıyla destekleyen bir çalışma alanı. Ayrıntılı vaka çalışması hazırlanıyor.',
      en: 'A workspace that supports documentary content production with generative-AI tools. A detailed case study is in preparation.',
    },
    metrics: [],
    technologies: ['python', 'llm'],
    gallery: [],
    visual: 'none',
    isPublic: false,
    visibility: 'internal',
    relatedProjects: [],
  },
  {
    id: 'local-multi-agent',
    slug: 'local-multi-agent-systems',
    featured: false,
    hasCaseStudy: false,
    order: 11,
    category: 'genai',
    year: '—',
    title: { tr: 'Yerel Çoklu Ajan Sistemleri', en: 'Local Multi-Agent AI Systems' },
    subtitle: { tr: 'Yerelde çalışan LLM ajanları ve otomasyon', en: 'Locally hosted LLM agents and automation' },
    role: { tr: 'Kişisel proje', en: 'Personal project' },
    overview: {
      tr: 'Ollama ile yerelde çalışan dil modellerinin n8n iş akışlarıyla birden fazla ajan olarak koordine edildiği deneysel sistemler.',
      en: 'Experimental systems where locally hosted language models (Ollama) are coordinated as multiple agents through n8n workflows.',
    },
    metrics: [],
    technologies: ['ollama', 'n8n', 'llm', 'docker'],
    gallery: [],
    visual: 'none',
    isPublic: false,
    visibility: 'internal',
    relatedProjects: [],
  },
  {
    id: 'e-okul',
    slug: 'e-okul',
    featured: false,
    hasCaseStudy: false,
    order: 12,
    category: 'web',
    year: '2023',
    title: { tr: 'E-Okul · Not Yönetim Sistemi', en: 'E-School · Grade Management' },
    subtitle: { tr: 'İlişkisel veritabanı tasarımı + ASP.NET Core', en: 'Relational database design + ASP.NET Core' },
    role: { tr: 'Üniversite projesi', en: 'University project' },
    overview: {
      tr: 'Normalize edilmiş SQL Server şeması (öğrenci, bölüm, öğretmen, ders, not, harf notu, sınıf ortalaması) ve öğretmenlerin yalnızca kendi derslerinin notlarını yönetebildiği bir web uygulaması.',
      en: 'A normalised SQL Server schema (students, departments, teachers, courses, grades, letter grades, class averages) and a web app where teachers can only manage grades of their own courses.',
    },
    metrics: [],
    technologies: ['csharp', 'dotnet', 'sql-server'],
    gallery: [],
    visual: 'none',
    repositoryUrl: { href: 'https://github.com/umutcnn/e-okul_asp.net_Core', enabled: true, needsVerification: false },
    isPublic: true,
    visibility: 'public',
    relatedProjects: [],
  },
  {
    id: 'django-jobs',
    slug: 'django-job-board',
    featured: false,
    hasCaseStudy: false,
    order: 13,
    category: 'web',
    year: '2022',
    title: { tr: 'Django İş İlanı Platformu', en: 'Django Job Board' },
    subtitle: { tr: 'Kimlik doğrulama, ilan ve başvuru akışı', en: 'Authentication, postings and applications' },
    role: { tr: 'Üniversite projesi', en: 'University project' },
    overview: {
      tr: 'Django MVT yapısı ve ORM ile kullanıcı kaydı/girişi, iş ilanı oluşturma ve ilanlara başvuru içeren bir web uygulaması.',
      en: 'A web app built on Django’s MVT pattern and ORM with sign-up/sign-in, job posting and applications.',
    },
    metrics: [],
    technologies: ['python', 'django'],
    gallery: [],
    visual: 'none',
    repositoryUrl: { href: 'https://github.com/umutcnn/djangoProject', enabled: true, needsVerification: false },
    isPublic: true,
    visibility: 'public',
    relatedProjects: [],
  },
  {
    id: 'data-science',
    slug: 'data-science-studies',
    featured: false,
    hasCaseStudy: false,
    order: 14,
    category: 'data',
    year: '2023',
    title: { tr: 'Veri Bilimi Çalışmaları', en: 'Data Science Studies' },
    subtitle: { tr: 'Analiz, sınıflandırma ve öneri sistemleri', en: 'Analysis, classification and recommenders' },
    role: { tr: 'Kişisel çalışmalar', en: 'Personal studies' },
    overview: {
      tr: 'Kalp krizi riski, müşteri kaybı (churn), süpermarket satışları, Netflix ve Spotify analizleri, regresyon modelleri ve film öneri sistemi üzerine notebook çalışmaları.',
      en: 'Notebook studies on heart-attack risk, customer churn, supermarket sales, Netflix and Spotify analyses, regression models and a movie recommender.',
    },
    metrics: [],
    technologies: ['python', 'machine-learning'],
    gallery: [],
    visual: 'none',
    repositoryUrl: { href: 'https://github.com/umutcnn', enabled: true, needsVerification: false },
    isPublic: true,
    visibility: 'public',
    relatedProjects: [],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured).sort((a, b) => a.order - b.order);
export const ARCHIVE_PROJECTS = PROJECTS.filter(p => !p.featured).sort((a, b) => a.order - b.order);
export const CASE_STUDIES = PROJECTS.filter(p => p.hasCaseStudy).sort((a, b) => a.order - b.order);

export function findProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug);
}

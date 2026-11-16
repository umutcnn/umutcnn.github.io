import type { Certificate, TimelineEntry } from '../types/content';

/** Career and education, newest first. Dates and wording from the owner's CVs. */
export const TIMELINE: TimelineEntry[] = [
  {
    id: 'msc',
    kind: 'education',
    start: '2025-09',
    end: null,
    organization: 'Sakarya Uygulamalı Bilimler Üniversitesi',
    location: 'Sakarya',
    role: { tr: 'Yüksek Lisans · Bilgisayar Mühendisliği', en: 'MSc · Computer Engineering' },
    points: {
      tr: ['Yapay zekâ ve bilgisayarlı görü odağında lisansüstü eğitim.'],
      en: ['Graduate studies focused on AI and computer vision.'],
    },
  },
  {
    id: 'canas',
    kind: 'work',
    start: '2025-07',
    end: '2026-09',
    organization: 'Canas Yazılım',
    location: 'Bursa',
    role: { tr: 'Yapay Zekâ & Yazılım Mühendisi', en: 'AI & Software Engineer' },
    points: {
      tr: [
        'OpenCV ve YOLO tabanlı bilgisayarlı görü çözümleriyle üretim ve ERP süreçlerinde veri toplama otomasyonu.',
        'STEP dosyalarından otomatik BOM çıkarımı, muadil ürün eşleştirme ve teklif karşılaştırma algoritmaları (teklif değerlendirme süresi %45 kısaldı, maliyetler %20 azaldı).',
        'React/TypeScript, Node.js ve SQL mimarileriyle yapay zekâ modüllerinin kurumsal sistemlere entegrasyonu.',
      ],
      en: [
        'Computer vision solutions with OpenCV and YOLO that automate data collection in manufacturing and ERP processes.',
        'Algorithms for automatic BOM extraction from STEP files, equivalent-product matching and quote comparison (quote evaluation time −45%, costs −20%).',
        'Integration of AI modules into enterprise systems with React/TypeScript, Node.js and SQL architectures.',
      ],
    },
  },
  {
    id: 'bsc',
    kind: 'education',
    start: '2021-09',
    end: '2025-06',
    organization: 'Sakarya Uygulamalı Bilimler Üniversitesi',
    location: 'Sakarya',
    role: { tr: 'Lisans · Bilgisayar Mühendisliği', en: 'BSc · Computer Engineering' },
    points: {
      tr: [
        'Python ve OpenCV ile görüntü işleme; Scikit-learn ve TensorFlow ile metin sınıflandırma, duygu analizi ve öneri sistemleri.',
      ],
      en: [
        'Image processing with Python and OpenCV; text classification, sentiment analysis and recommenders with Scikit-learn and TensorFlow.',
      ],
    },
  },
  {
    id: 'konfida',
    kind: 'work',
    start: '2025-02',
    end: '2025-06',
    organization: 'Konfida',
    location: 'Bursa',
    role: { tr: 'Mühendislik Stajyeri (Yapay Zekâ)', en: 'Engineering Intern (AI)' },
    points: {
      tr: [
        'Görsel kalite kontrol için bilgisayarlı görü ve mobil cihazda çalışan (edge-AI) derin öğrenme modelleri.',
        'Bobin sayımını 2–3 saniyeye indiren, kısmen görünen ürünleri de tespit eden Kotlin uygulaması.',
        'RAG ve öneri sistemi prototipleri.',
      ],
      en: [
        'Computer vision and on-device (edge-AI) deep learning models for visual quality control.',
        'A Kotlin app that cut coil counting to 2–3 seconds, including partially visible items.',
        'RAG and recommendation-system prototypes.',
      ],
    },
  },
  {
    id: 'biletinial',
    kind: 'work',
    start: '2024-08',
    end: '2024-09',
    organization: 'Biletinial',
    location: 'Bursa',
    role: { tr: 'Veri Bilimi Stajyeri', en: 'Data Science Intern' },
    points: {
      tr: ['Kullanıcı verileri üzerinde müşteri segmentasyonu, veri analizi ve öneri sistemi modelleri.'],
      en: ['Customer segmentation, data analysis and recommendation models on user data.'],
    },
  },
  {
    id: 'woc',
    kind: 'work',
    start: '2024-06',
    end: '2024-07',
    organization: 'WOC Yazılım',
    location: 'İstanbul',
    role: { tr: 'Yazılım Mühendisliği Stajyeri', en: 'Software Engineering Intern' },
    points: {
      tr: ['ASP.NET MVC ve Microsoft SQL Server ile ERP modülleri, sorgular ve tablo yapıları.'],
      en: ['ERP modules, queries and table structures with ASP.NET MVC and Microsoft SQL Server.'],
    },
  },
  {
    id: 'mikro',
    kind: 'work',
    start: '2018-07',
    end: '2019-06',
    organization: 'Mikro Yazılımevi',
    location: 'Bursa',
    role: { tr: 'Lise Stajyeri', en: 'High-school Intern' },
    points: {
      tr: ['Yazılım geliştirme süreçlerine giriş; temel veritabanı işlemleri ve masaüstü/web modüllerine destek.'],
      en: ['First steps in software development; basic database work and support for desktop/web modules.'],
    },
  },
];

export const CERTIFICATES: Certificate[] = [
  { title: { tr: 'Yinelemeli Sinir Ağları (RNN)', en: 'Recurrent Neural Networks (RNN)' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Yapay Zekâ ile Görsel Sentez', en: 'Visual Synthesis with AI' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Doğal Dil İşleme', en: 'Natural Language Processing' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Üretken Yapay Zekâya Giriş', en: 'Introduction to Generative AI' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Yapay Zekâ Etiği', en: 'AI Ethics' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Bilgisayarlı Görü Uygulama Alanları', en: 'Computer Vision Applications' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Pekiştirmeli Öğrenme', en: 'Reinforcement Learning' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Transfer Öğrenimi', en: 'Transfer Learning' }, issuer: 'BTK Akademi' },
  { title: { tr: 'Kişiselleştirilmiş GPT’ler', en: 'Custom GPTs' }, issuer: 'BTK Akademi' },
  {
    title: { tr: 'Kotlin ile İleri Seviye Android Geliştirme', en: 'Advanced Android Development with Kotlin' },
    issuer: 'BTK Akademi',
  },
  { title: { tr: 'Sıfırdan İleri Seviye Python', en: 'Python from Zero to Advanced' }, issuer: 'BTK Akademi' },
  {
    title: { tr: 'Uluslararası İş Analizi Metodolojisi', en: 'International Business Analysis Methodology' },
    issuer: 'BTK Akademi',
  },
  { title: { tr: 'OpenCV A-Z', en: 'OpenCV A-Z' }, issuer: 'Udemy' },
  { title: { tr: 'Keras ile Derin Öğrenme', en: 'Deep Learning with Keras' }, issuer: 'Udemy' },
];

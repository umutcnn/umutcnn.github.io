import type { Award } from '../types/content';

export const AWARDS: Award[] = [
  {
    id: 'teknofest-2023',
    year: '2023',
    title: { tr: 'TEKNOFEST · Ulaşımda Yapay Zekâ', en: 'TEKNOFEST · AI in Transportation' },
    rank: { tr: 'Türkiye 2.si', en: '2nd in Türkiye' },
    summary: {
      tr: 'Codent takımıyla, uçan araçlar için taşıt, insan ve uygun iniş alanı tespiti yapan bilgisayarlı görü sistemi.',
      en: 'With team Codent: a computer vision system detecting vehicles, people and suitable landing areas for flying vehicles.',
    },
    details: {
      tr: [
        'Gece, gündüz ve zorlu hava koşullarında algılama hedeflendi.',
        'İniş alanlarının üzerinde engel olup olmadığı değerlendirildi.',
        'Takım: Codent · Sakarya Uygulamalı Bilimler Üniversitesi.',
      ],
      en: [
        'Designed for detection by day, at night and in adverse weather.',
        'Landing areas were assessed for obstructions.',
        'Team: Codent · Sakarya University of Applied Sciences.',
      ],
    },
    highlight: true,
    evidence: {
      href: 'https://teknofest.org/tr/yarismalar/finalist-takimlar/2898',
      enabled: true,
      needsVerification: false,
      label: { tr: 'TEKNOFEST resmî takım sayfası', en: 'Official TEKNOFEST team page' },
    },
    projectSlug: 'teknofest-2023-transportation-ai',
  },
  {
    id: 'tubitak-2209a',
    year: '2024',
    title: { tr: 'TÜBİTAK 2209-A', en: 'TÜBİTAK 2209-A' },
    rank: { tr: 'Proje yürütücüsü · Destek', en: 'Principal investigator · Funded' },
    summary: {
      tr: '“Federe Öğrenme ile Dijital Görüntülerde Katarakt Tespiti” projesi destek almaya hak kazandı.',
      en: '“Cataract Detection in Digital Images with Federated Learning” was awarded support.',
    },
    details: {
      tr: [
        'Danışman: Dr. Öğr. Üyesi Ekin Ekinci.',
        'Dağıtık veri üzerinde gizlilik odaklı görüntü sınıflandırma mimarisi tasarlandı.',
        'FedAvg, FedProx, FedAvgM ve FedAdam stratejileri karşılaştırıldı.',
      ],
      en: [
        'Advisor: Asst. Prof. Ekin Ekinci.',
        'Designed a privacy-preserving image classification architecture over distributed data.',
        'Compared FedAvg, FedProx, FedAvgM and FedAdam strategies.',
      ],
    },
    highlight: false,
    projectSlug: 'federated-cataract-detection',
  },
  {
    id: 'teknofest-2024',
    year: '2024',
    title: { tr: 'TEKNOFEST 2024', en: 'TEKNOFEST 2024' },
    rank: { tr: '3 kategoride finalist', en: 'Finalist in 3 categories' },
    summary: {
      tr: 'Sağlıkta Yapay Zekâ, Ulaşımda Yapay Zekâ ve Robotaksi Binek Otonom Araç kategorilerinin tamamında finalist takım üyesi.',
      en: 'Finalist team member in all three of Health AI, AI in Transportation and Robotaxi autonomous vehicle categories.',
    },
    details: {
      tr: [
        'Sağlıkta Yapay Zekâ — finalist.',
        'Ulaşımda Yapay Zekâ — finalist.',
        'Robotaksi — ROS, LiDAR, IMU, ZED2, haritalama, lokalizasyon, nesne tespiti ve rota planlama.',
      ],
      en: [
        'AI in Healthcare — finalist.',
        'AI in Transportation — finalist.',
        'Robotaxi — ROS, LiDAR, IMU, ZED2, mapping, localisation, object detection and route planning.',
      ],
    },
    highlight: false,
    projectSlug: 'autonomous-robotaxi',
  },
  {
    id: 'graduation',
    year: '2025',
    title: { tr: 'Bilgisayar Mühendisliği Lisans', en: 'BSc Computer Engineering' },
    rank: { tr: 'Mezuniyet · Haziran 2025', en: 'Graduated · June 2025' },
    summary: {
      tr: 'Sakarya Uygulamalı Bilimler Üniversitesi; aynı bölümde yüksek lisansa Eylül 2025’te başladım.',
      en: 'Sakarya University of Applied Sciences; started the MSc in the same department in September 2025.',
    },
    details: {
      tr: ['Görüntü işleme, makine öğrenmesi ve NLP odaklı projeler.', 'Django ve ASP.NET Core ile web uygulamaları.'],
      en: [
        'Projects focused on image processing, machine learning and NLP.',
        'Web applications with Django and ASP.NET Core.',
      ],
    },
    highlight: false,
  },
];

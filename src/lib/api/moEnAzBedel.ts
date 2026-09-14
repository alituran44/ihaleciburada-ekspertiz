/**
 * TMMOB Mimarlar Odası En Az Bedel ve ÇŞB 2026/1 Yapı Yaklaşık Birim Maliyetleri Modülü
 * http://www.mo.org.tr/enazbedel/ ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığı
 * Mimarlık ve Mühendislik Hizmet Bedellerinin Hesabında Kullanılacak Yapı Yaklaşık Birim Maliyetleri Tebliği
 */

import { BuildingCostEstimate } from "@/types";

export interface BuildingClassDef {
  classCode: string;
  className: string;
  description: string;
  unitCostM2TL: number; // 2026/1 ÇŞB Yaklaşık Birim Maliyeti (TL/m²)
  typicalFloors: string;
}

export const CSB_BUILDING_CLASSES_2026: Record<string, BuildingClassDef> = {
  "3A": {
    classCode: "3-A",
    className: "Basit Depo ve Atölye Yapıları",
    description: "Tek katlı basit sanayi, hangar ve zirai depolama yapıları",
    unitCostM2TL: 12400,
    typicalFloors: "1 Kat",
  },
  "3B": {
    classCode: "3-B",
    className: "Standart Konut ve Küçük Apartmanlar",
    description: "3 kata kadar asansörsüz, kaloriferli veya kombili standart konutlar",
    unitCostM2TL: 16800,
    typicalFloors: "1 - 3 Kat",
  },
  "4A": {
    classCode: "4-A",
    className: "Asansörlü & Kaloriferli Standart Siteler",
    description: "5 ila 8 katlı, asansörlü, betonarme karkas apartmanlar ve toplu konutlar",
    unitCostM2TL: 21500,
    typicalFloors: "4 - 8 Kat",
  },
  "4B": {
    classCode: "4-B",
    className: "Yüksek Bloklar ve Nitelikli Siteler",
    description: "9 kat üzeri yüksek konut blokları, rezidanslar ve ticaret alt merkezleri",
    unitCostM2TL: 25800,
    typicalFloors: "9+ Kat",
  },
  "5A": {
    classCode: "5-A",
    className: "Lüks Rezidans ve Nitelikli Müstakil Yapılar",
    description: "Kapalı otoparklı, akıllı altyapılı prestij projeleri ve oteller",
    unitCostM2TL: 32500,
    typicalFloors: "Lüks / Çok Katlı",
  },
  "5B": {
    classCode: "5-B",
    className: "Ultra Lüks Akıllı Villalar ve Prestij Yapıları",
    description: "Özel mimari tasarım, akıllı otomasyon, peyzaj ve enerji tasarruflu villalar",
    unitCostM2TL: 41000,
    typicalFloors: "Villa / Özel",
  },
};

/**
 * İmar Durumu ve Kat Adedine Göre En Uygun Yapı Sınıfını Belirler
 */
export function determineBuildingClass(maxFloors: number, zoningType: string = "konut"): BuildingClassDef {
  if (zoningType === "villa") {
    return CSB_BUILDING_CLASSES_2026["5B"];
  }
  if (zoningType === "sanayi") {
    return CSB_BUILDING_CLASSES_2026["3A"];
  }
  if (maxFloors <= 3) {
    return CSB_BUILDING_CLASSES_2026["3B"];
  }
  if (maxFloors >= 4 && maxFloors <= 8) {
    return CSB_BUILDING_CLASSES_2026["4A"];
  }
  if (maxFloors >= 9 && maxFloors <= 14) {
    return CSB_BUILDING_CLASSES_2026["4B"];
  }
  return CSB_BUILDING_CLASSES_2026["5A"];
}

/**
 * TMMOB Mimarlar Odası En Az Bedel & ÇŞB İnşaat ve Ruhsat Bütçesini Hesapar
 * @param totalConstructionGrossM2 Toplam inşaat alanı (brüt m²)
 * @param maxFloors Kat sayısı
 * @param zoningType İmar türü
 */
export function calculateBuildingAndArchitecturalCost(
  totalConstructionGrossM2: number,
  maxFloors: number = 4,
  zoningType: string = "konut"
): BuildingCostEstimate {
  const buildingClass = determineBuildingClass(maxFloors, zoningType);
  const unitCostTL = buildingClass.unitCostM2TL;

  // ÇŞB Toplam Kaba + İnce İnşaat Yaklaşık Maliyeti
  const totalBuildingCostTL = Math.round(totalConstructionGrossM2 * unitCostTL);

  // TMMOB Mimarlar Odası Asgari Mimari Proje Müelliflik Bedeli
  // Formül: Toplam İnşaat Alanı * Birim Maliyet * Mimari Hizmet Oranı (%2.5 - %3.2)
  // Bölge ve zorluk sınıfı katsayısı ~1.10
  const archFeeRatio = totalConstructionGrossM2 > 5000 ? 0.024 : 0.031;
  const architecturalProjectFeeTL = Math.round(totalBuildingCostTL * archFeeRatio);

  // Mühendislik Projeleri (Statik, Mekanik, Elektrik tesisat) + Zemin Etüdü + Yapı Denetim
  // Yasal yapı denetim bedeli ortalama %1.5, mühendislik projeleri %2.5 -> Toplam %4.0
  const engineeringAndSupervisionFeeTL = Math.round(totalBuildingCostTL * 0.042);

  // Ruhsat harçları ve belediye katılım payları (yaklaşık m² başına ~450 TL)
  const municipalPermitFeeTL = Math.round(totalConstructionGrossM2 * 450);

  const totalPermitAndProjectCostTL = architecturalProjectFeeTL + engineeringAndSupervisionFeeTL + municipalPermitFeeTL;
  const grandTotalDevelopmentCostTL = totalBuildingCostTL + totalPermitAndProjectCostTL;

  return {
    csbBuildingClass: `${buildingClass.classCode} (${buildingClass.className})`,
    unitCostTL,
    totalBuildingCostTL,
    architecturalProjectFeeTL,
    engineeringAndSupervisionFeeTL,
    municipalPermitFeeTL,
    totalPermitAndProjectCostTL,
    grandTotalDevelopmentCostTL,
    source: "ÇŞB 2026/1 Tebliği & TMMOB Mimarlar Odası En Az Bedel",
  };
}

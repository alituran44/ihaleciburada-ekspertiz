import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getNeighborhoodValuation } from "@/lib/realNeighborhoodValuations";
import { getDistrictValuation } from "@/lib/districtValuations";

export const dynamic = "force-dynamic";

function normalizeTurkish(str: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/i̇/g, "i")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let districtId = searchParams.get("districtId");
    const province = searchParams.get("province") || searchParams.get("city") || "";
    const district = searchParams.get("district") || "";

    const dataDir = path.join(process.cwd(), "public", "data");
    const mahalleDir = path.join(dataDir, "mahalle");
    if (!fs.existsSync(mahalleDir)) {
      fs.mkdirSync(mahalleDir, { recursive: true });
    }

    // İlçe ID Çözümleme (Gerekiyorsa districts_mapping.json'dan)
    let resolvedDistrictName = district;
    let resolvedProvinceName = province;

    if (!districtId && district) {
      const mappingPath = path.join(dataDir, "districts_mapping.json");
      if (fs.existsSync(mappingPath)) {
        const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
        const normDist = normalizeTurkish(district);
        const normProv = normalizeTurkish(province);

        // Önce eşleşen ili ve ilçeyi bul
        for (const plate of Object.keys(mapping.byPlate || {})) {
          const provObj = mapping.byPlate[plate];
          const provMatch = !normProv || normalizeTurkish(provObj.provinceName).includes(normProv) || normProv.includes(normalizeTurkish(provObj.provinceName));
          
          if (provMatch) {
            const found = provObj.districts.find((d: any) => {
              const dName = normalizeTurkish(d.name);
              const dAscii = normalizeTurkish(d.nameAscii || "");
              return dName === normDist || dAscii === normDist || dName.includes(normDist) || normDist.includes(dName);
            });
            if (found) {
              districtId = found.id;
              resolvedDistrictName = found.name;
              resolvedProvinceName = provObj.provinceName;
              break;
            }
          }
        }
      }
    }

    // Default Çanakkale Bayramiç (TR-D-17-002) fallback
    if (!districtId) {
      districtId = "TR-D-17-002";
      resolvedDistrictName = "Bayramiç";
      resolvedProvinceName = "Çanakkale";
    }

    const localFile = path.join(mahalleDir, `${districtId}.geojson`);
    let rawGeoJsonText = "";

    if (fs.existsSync(localFile)) {
      rawGeoJsonText = fs.readFileSync(localFile, "utf8");
    } else {
      // Remote fetch from GitHub repository
      const remoteUrl = `https://raw.githubusercontent.com/ttezer/turkiye-harita-verisi/master/dist/geojson/mahalle-geometrileri-by-district-v2/${districtId}.geojson`;
      const res = await fetch(remoteUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: `District mahalle GeoJSON not found for ${districtId}` },
          { status: 404 }
        );
      }
      rawGeoJsonText = await res.text();
      // Cache locally
      try {
        fs.writeFileSync(localFile, rawGeoJsonText, "utf8");
      } catch (err) {
        console.warn("Could not cache mahalle geojson:", err);
      }
    }

    const geoData = JSON.parse(rawGeoJsonText);
    const distVal = getDistrictValuation(resolvedProvinceName, resolvedDistrictName);
    const baseDistrictPrice = distVal.pricePerM2TL || 32000;

    // Her Mahalle / Köy Özelliğini Gerçek Değerleme Verileriyle Zenginleştir
    if (geoData.features && Array.isArray(geoData.features)) {
      geoData.features = geoData.features.map((feature: any) => {
        const neighName = feature.properties?.name || feature.properties?.MAHALLE || "Mahalle";
        const val = getNeighborhoodValuation(resolvedDistrictName, neighName, baseDistrictPrice);

        return {
          ...feature,
          properties: {
            ...feature.properties,
            unitPrice: val.pricePerM2TL,
            tenderStartM2TL: val.tenderStartM2TL,
            yearlyGrowth: val.yearlyGrowth,
            opportunityScore: val.opportunityScore,
            fillColor: val.fillColor,
            fillOpacity: val.fillOpacity,
            strokeColor: val.strokeColor,
            tier: val.tier,
            description: val.description,
            districtName: resolvedDistrictName,
            provinceName: resolvedProvinceName,
          },
        };
      });
    }

    return NextResponse.json(
      {
        success: true,
        districtId,
        districtName: resolvedDistrictName,
        provinceName: resolvedProvinceName,
        basePricePerM2TL: baseDistrictPrice,
        featureCount: geoData.features ? geoData.features.length : 0,
        data: geoData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in /api/location/mahalle:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load mahalle data" },
      { status: 500 }
    );
  }
}

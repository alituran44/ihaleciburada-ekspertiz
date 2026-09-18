import { NextResponse } from "next/server";
import { LeadCaptureData } from "@/components/valuation/types";

// In-memory leads storage for runtime session persistence
const inMemoryLeads: LeadCaptureData[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, userRole, ada, parsel, city, district } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Ad Soyad ve Telefon numarası zorunludur." },
        { status: 400 }
      );
    }

    const newLead: LeadCaptureData = {
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      userRole: userRole || "mulk_sahibi",
      ada: ada ? String(ada).trim() : undefined,
      parsel: parsel ? String(parsel).trim() : undefined,
      city: city ? String(city).trim() : undefined,
      district: district ? String(district).trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    inMemoryLeads.unshift(newLead);
    if (inMemoryLeads.length > 200) {
      inMemoryLeads.pop();
    }

    console.log("[İhaleciBurada Lead Alındı]:", newLead);

    return NextResponse.json({
      success: true,
      message: "Talebiniz başarıyla alındı. Uzmanımız en kısa sürede sizinle iletişime geçecektir.",
      lead: newLead,
    });
  } catch (err: any) {
    console.error("Lead save error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    total: inMemoryLeads.length,
    leads: inMemoryLeads,
  });
}

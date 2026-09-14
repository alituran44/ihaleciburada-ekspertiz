import { NextRequest, NextResponse } from "next/server";
import { fetchTcmbHousingMetrics } from "@/lib/api/tcmbEvds";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Çanakkale";

  try {
    const data = await fetchTcmbHousingMetrics(city);
    return NextResponse.json({
      success: true,
      city,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "TCMB verileri çekilemedi." },
      { status: 500 }
    );
  }
}

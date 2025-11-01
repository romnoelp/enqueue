import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";

type StationAnalytics = {
  total: number;
  successful: number;
  unsuccessful: number;
};

// GET - Get system analytics (queue stats by station)
export const GET = async (req: NextRequest) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole(req, ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing startDate or endDate in query." },
        { status: 400 }
      );
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    // Get queue-history collection references
    const historyCollectionRef = firestoreDb.collection("queue-history");
    const historySnapshot = await historyCollectionRef.listDocuments();

    const analytics: Record<string, StationAnalytics> = {};

    // Process each history document within date range
    for (const docRef of historySnapshot) {
      const docId = docRef.id;
      const docDate = new Date(docId).getTime();

      if (docDate >= start && docDate <= end) {
        const entriesSnapshot = await docRef.collection("entries").get();

        entriesSnapshot.forEach((entryDoc) => {
          const data = entryDoc.data();
          const { stationID, customerStatus } = data;

          if (!analytics[stationID]) {
            analytics[stationID] = {
              total: 0,
              successful: 0,
              unsuccessful: 0,
            };
          }

          analytics[stationID].total++;

          if (customerStatus === "complete") {
            analytics[stationID].successful++;
          } else {
            analytics[stationID].unsuccessful++;
          }
        });
      }
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

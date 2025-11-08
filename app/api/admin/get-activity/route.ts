import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";

// GET - Get activity logs with date filtering
export const GET = async (req: NextRequest) => {
  try {
    const authResult = await verifyAuthAndRole(["admin", "superAdmin"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing startDate or endDate" },
        { status: 400 }
      );
    }

    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    const activitiesSnapshot = await firestoreDb
      .collection("activity-log")
      .where("timestamp", ">=", startTimestamp)
      .where("timestamp", "<=", endTimestamp)
      .orderBy("timestamp", "desc")
      .get();

    const activityLogs = activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ activities: activityLogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};

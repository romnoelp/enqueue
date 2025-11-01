import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";
import { sendEmail } from "@/app/lib/utils/sendEmail";
import { sendNotification } from "@/app/lib/utils/sendNotification";

// POST /api/cashier/notify-customer - Notify customer to proceed to counter
export const POST = async (req: NextRequest) => {
  // Verify auth and check if user has cashier role
  const authResult = await verifyAuthAndRole(req, ["cashier"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { counterNumber, queueID } = body;

    if (!counterNumber || !queueID) {
      return NextResponse.json(
        { message: "Missing Counter Number or QueueID" },
        { status: 400 }
      );
    }

    // Check if queue exists
    const queueDoc = await firestoreDb.collection("queue").doc(queueID).get();

    if (!queueDoc.exists) {
      return NextResponse.json({ message: "Queue not found" }, { status: 404 });
    }

    const customerData = queueDoc.data();

    // Verify customer is currently being served
    if (customerData?.customerStatus !== "ongoing") {
      return NextResponse.json(
        { message: "Customer is not serving yet" },
        { status: 400 }
      );
    }

    // Send push notification via FCM
    const fcmDoc = await firestoreDb
      .collection("fcm-tokens")
      .doc(queueID)
      .get();

    if (fcmDoc.exists) {
      const fcmToken = fcmDoc.data()?.fcmToken;
      if (fcmToken) {
        await sendNotification(
          fcmToken,
          "It's your turn!",
          `Please proceed to the counter ${counterNumber}.`
        );
      }
    }

    // Send email notification
    if (customerData.email) {
      await sendEmail(
        customerData.email,
        "Queue Update: It's Your Turn!",
        `Hello, it is now your turn. Please proceed to the counter ${counterNumber}.`
      );
    }

    return NextResponse.json(
      { message: "Currently serving notification sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error notifying customer:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};

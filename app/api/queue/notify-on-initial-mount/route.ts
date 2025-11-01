import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb, realtimeDb } from "@/app/lib/backend/firebase-admin";

// GET /api/queue/notify-on-initial-mount - Toggle notification after QR scan success
export const GET = async (req: NextRequest) => {
  // Verify queue token with allowed types
  const tokenResult = await verifyQueueToken(req, [
    "permission",
    "queue-form",
    "queue-status",
  ]);
  
  if (!tokenResult.success) {
    return tokenResult.response;
  }

  const { token } = tokenResult;

  try {
    // Check if this token has already triggered notification
    const currentLoadedQueueRef = firestoreDb
      .collection("loaded-token")
      .doc(token);

    // Use Firestore transaction to ensure atomic check-and-set
    try {
      await firestoreDb.runTransaction(async (transaction) => {
        const currentLoadedQueueData = await transaction.get(
          currentLoadedQueueRef
        );

        if (currentLoadedQueueData.exists) {
          throw new Error("This token already notified");
        }

        // Mark token as notified
        transaction.set(currentLoadedQueueRef, { timestamp: Date.now() });
      });
    } catch (error) {
      if ((error as Error).message === "This token already notified") {
        return NextResponse.json(
          { message: "Token already used for notification" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Toggle notification state in Realtime DB
    const notifyOnSuccessRef = realtimeDb.ref("notify-toggle");
    const result = await notifyOnSuccessRef.transaction((currentValue) => {
      return currentValue === 1 ? 0 : 1;
    });

    if (!result.committed) {
      return NextResponse.json(
        { message: "Transaction failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Toggled successfully",
        newValue: result.snapshot.val(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling notification:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};

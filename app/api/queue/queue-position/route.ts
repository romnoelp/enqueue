import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";

// GET - Get customer's position in queue
export const GET = async (req: NextRequest) => {
  // Verify token (accepts queue-status tokens)
  const authResult = await verifyQueueToken(req, ["queue-status"]);
  if (!authResult.success) {
    return authResult.response;
  }

  const { queueID, stationID } = authResult.decodedToken;

  if (!queueID || !stationID) {
    return NextResponse.json(
      { error: "Invalid token: missing queueID or stationID" },
      { status: 401 }
    );
  }

  try {
    // Get customer's queue document
    const queueDocRef = firestoreDb.collection("queue").doc(queueID);
    const queueDoc = await queueDocRef.get();

    if (!queueDoc.exists) {
      return NextResponse.json(
        { error: "You are not in the queue" },
        { status: 404 }
      );
    }

    const customerData = queueDoc.data();
    if (!customerData) {
      return NextResponse.json(
        { error: "Invalid queue data" },
        { status: 404 }
      );
    }

    // Handle different customer statuses
    const statusMessages: Record<string, { position: number; message: string }> = {
      complete: { position: 0, message: "Your transaction is complete" },
      unsuccessful: {
        position: 0,
        message: "Your queue was skipped, either you took too long to respond",
      },
    };

    // If ongoing, return position 0
    if (customerData.customerStatus === "ongoing") {
      return NextResponse.json({
        position: 0,
        message: "Your transaction is ongoing",
      });
    }

    // If complete or unsuccessful, return status message
    if (customerData.customerStatus in statusMessages) {
      return NextResponse.json(
        statusMessages[customerData.customerStatus],
        { status: 401 }
      );
    }

    // Calculate position for pending customers
    const queueSnapshot = await firestoreDb
      .collection("queue")
      .where("stationID", "==", stationID)
      .where("customerStatus", "==", "pending")
      .where("timestamp", "<", customerData.timestamp)
      .get();

    return NextResponse.json({ position: queueSnapshot.size + 1 });
  } catch (error) {
    console.error("Error getting queue position:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

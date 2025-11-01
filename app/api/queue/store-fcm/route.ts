import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";

// POST - Store FCM token for push notifications
export const POST = async (req: NextRequest) => {
  // Verify token (accepts all token types)
  const authResult = await verifyQueueToken(req, [
    "permission",
    "queue-form",
    "queue-status",
  ]);
  if (!authResult.success) {
    return authResult.response;
  }

  const { queueID } = authResult.decodedToken;

  if (!queueID) {
    return NextResponse.json(
      { error: "Invalid token: missing queueID" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fcmToken } = body;

    if (!fcmToken) {
      return NextResponse.json(
        { error: "FCM token is missing!" },
        { status: 400 }
      );
    }

    // Store FCM token in Firestore
    const fcmDoc = firestoreDb.collection("fcm-tokens").doc(queueID);
    await fcmDoc.set({ fcmToken }, { merge: true });

    return NextResponse.json({ message: "FCM token stored successfully" });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

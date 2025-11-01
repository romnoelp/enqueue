import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";
import { sendEmail } from "@/app/lib/utils/sendEmail";
import { sendNotification } from "@/app/lib/utils/sendNotification";

interface Customer {
  email: string;
  customerStatus: string;
  stationID: string;
  timestamp: number;
}

// POST /api/queue/check-and-notify - Check queue position and notify top 4 customers
export const POST = async (req: NextRequest) => {
  // Verify queue token with type "queue-status"
  const tokenResult = await verifyQueueToken(req, ["queue-status"]);
  if (!tokenResult.success) {
    return tokenResult.response;
  }

  const { decodedToken } = tokenResult;
  const { stationID } = decodedToken;

  if (!stationID) {
    return NextResponse.json(
      { message: "Missing stationID in token" },
      { status: 400 }
    );
  }

  try {
    // Fetch top 4 pending customers sorted by timestamp (FIFO)
    const queueSnapshot = await firestoreDb
      .collection("queue")
      .where("stationID", "==", stationID)
      .where("customerStatus", "==", "pending")
      .orderBy("timestamp", "asc")
      .limit(4)
      .get();

    const queueList = queueSnapshot.docs.map((doc) => ({
      queueIDP: doc.id,
      ...doc.data(),
    })) as Array<Customer & { queueIDP: string }>;

    // Fetch previously notified customers for this station
    const notifiedSnapshot = await firestoreDb
      .collection("notifications")
      .doc(stationID)
      .get();

    const previouslyNotified = notifiedSnapshot.exists
      ? (notifiedSnapshot.data()?.notifiedCustomers || [])
      : [];

    // Identify newly added customers to the top 4
    const newNotified = queueList.map((customer) => customer.queueIDP);
    const customersToNotify = newNotified.filter(
      (id) => !previouslyNotified.includes(id)
    );

    // Send notifications only to new customers in top 4
    for (const queueIDP of customersToNotify) {
      const customerDoc = await firestoreDb
        .collection("queue")
        .doc(queueIDP)
        .get();
      const customerData = customerDoc.data();

      if (customerData) {
        // Send push notification via FCM
        const fcmDoc = await firestoreDb
          .collection("fcm-tokens")
          .doc(queueIDP)
          .get();

        if (fcmDoc.exists) {
          const fcmToken = fcmDoc.data()?.fcmToken;
          if (fcmToken) {
            await sendNotification(
              fcmToken,
              "You are in the top 4!",
              "Please be ready for your turn."
            );
          }
        }

        // Send email notification
        if (customerData.email) {
          await sendEmail(
            customerData.email,
            "Queue Update: You're Almost There!",
            "You are now in the top 4! Please be ready for your turn."
          );
        }
      }
    }

    // Update the list of notified customers
    await firestoreDb
      .collection("notifications")
      .doc(stationID)
      .set({ notifiedCustomers: newNotified }, { merge: true });

    return NextResponse.json(
      {
        message: "Notifications sent successfully",
        notifiedCount: customersToNotify.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking and notifying queue:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};

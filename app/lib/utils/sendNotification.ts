import { fcm } from "../config/firebase-admin";

export const sendNotification = async (
  fcmToken: string,
  title: string,
  body: string
) => {
  if (!fcmToken) return;

  try {
    await fcm.send({
      token: fcmToken,
      notification: { title, body },
      android: { priority: "high" },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            alert: { title, body },
          },
        },
      },
    });
    console.log(`Notification sent to ${fcmToken}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

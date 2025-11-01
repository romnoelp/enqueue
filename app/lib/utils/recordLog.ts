import { firestoreDb } from "../backend/firebase-admin";
import { ActionType } from "../../../types";

export const recordLog = async (
  uid: string,
  action: ActionType,
  details?: string
) => {
  await firestoreDb.collection("activity-log").doc().set({
    uid,
    action,
    timestamp: Date.now(),
    details,
  });
};

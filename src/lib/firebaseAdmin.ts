// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  }

  const serviceAccount = JSON.parse(rawServiceAccount);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const messaging = admin.messaging();

export const sendMulticastNotification = async (tokens: string[], title: string, body: string) => {
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log("Successfully sent message:", response);
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) failedTokens.push(tokens[idx]);
      });
      console.log("List of tokens that caused failures:", failedTokens);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

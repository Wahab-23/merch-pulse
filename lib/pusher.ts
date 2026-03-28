import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Ensure keys are present or provide fallback empty strings for build safety
const pusherAppId = process.env.PUSHER_APP_ID || "app-id";
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "key";
const pusherSecret = process.env.PUSHER_SECRET || "secret";
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

export const pusherServer = new PusherServer({
  appId: pusherAppId,
  key: pusherKey,
  secret: pusherSecret,
  cluster: pusherCluster,
  useTLS: true,
});

export const pusherClient = new PusherClient(pusherKey, {
  cluster: pusherCluster,
});

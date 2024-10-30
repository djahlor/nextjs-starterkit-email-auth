"server only";

import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import config from "@/config"; // NOT from tailwind.config

export const isAuthorized = async (
  userId: string
): Promise<{ authorized: boolean; message: string }> => {
  console.log("Checking authorization for userId:", userId);
  
  if (!config?.payments?.enabled) {
    console.log("Payments disabled, allowing access");
    return {
      authorized: true,
      message: "Payments are disabled",
    };
  }

  const result = await (await clerkClient()).users.getUser(userId);

  if (!result) {
    console.log("User not found in Clerk");
    return {
      authorized: false,
      message: "User not found",
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    console.log("Querying subscriptions for userId:", userId);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId);

    console.log("Subscription query result:", { data, error });

    if (error?.code) {
      console.log("Supabase error:", error);
      return {
        authorized: false,
        message: error.message,
      };
    }

    // If no subscription data exists yet
    if (!data || data.length === 0) {
      console.log("No subscription data found");
      return {
        authorized: false,
        message: "No subscription found",
      };
    }

    // Check the most recent subscription status
    const latestSubscription = data[data.length - 1];
    console.log("Latest subscription:", latestSubscription);

    if (latestSubscription.status === "active") {
      console.log("Found active subscription");
      return {
        authorized: true,
        message: "User is subscribed",
      };
    }

    console.log("Subscription not active:", latestSubscription.status);
    return {
      authorized: false,
      message: `Subscription status: ${latestSubscription.status}`,
    };
  } catch (error: any) {
    console.error("Error checking subscription:", error);
    return {
      authorized: false,
      message: error.message,
    };
  }
};

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface SubscriptionRequestBody {
  planId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionRequestBody;
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 }
      );
    }

    // Authenticate user via Supabase session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    const userId = user.id;

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Please set up Razorpay credentials." },
        { status: 503 }
      );
    }

    // USA market pricing in cents (USD)
    const planPrices: Record<string, number> = {
      basic: 999,      // $9.99 in cents
      premium: 2499,   // $24.99 in cents
      collector: 4999,  // $49.99 in cents
    };

    const amount = planPrices[planId];
    if (!amount) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 }
      );
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount,
        currency: "USD",
        receipt: `sanctuary_${userId}_${Date.now()}`,
        notes: {
          userId,
          planId,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorData);
      return NextResponse.json(
        { error: "Failed to create payment order" },
        { status: 500 }
      );
    }

    const order = await orderResponse.json();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}

// Webhook handler for Razorpay payment events
export async function PUT(request: Request) {
  try {
    // Verify Razorpay webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("X-Razorpay-Signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // HMAC-SHA256 signature verification
    const { createHmac, timingSafeEqual } = await import("crypto");
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event as string;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    // Use service role for webhook processing (no user session)
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey);

    if (event === "payment.captured") {
      const payment = body.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }

      const userId = payment.notes?.userId;
      const planId = payment.notes?.planId;

      if (userId && planId) {
        const tierMap: Record<string, string> = {
          basic: "basic",
          premium: "premium",
          collector: "collector",
        };

        const tier = tierMap[planId] ?? "basic";
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabase
          .from("profiles")
          .update({
            tier,
            subscription_status: "active",
            subscription_expires_at: expiresAt.toISOString(),
            razorpay_subscription_id: payment.id,
          })
          .eq("id", userId);
      }
    }

    if (event === "subscription.cancelled") {
      const subscription = body.payload?.subscription?.entity;
      const userId = subscription?.notes?.userId;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
          })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

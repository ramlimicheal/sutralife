import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface SubscriptionRequestBody {
  planId: string;
  period?: "monthly" | "yearly";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionRequestBody;
    const { planId, period = "monthly" } = body;

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

    // USA market pricing in cents (USD) - monthly
    const monthlyPrices: Record<string, number> = {
      basic: 999,      // $9.99 in cents
      premium: 2499,   // $24.99 in cents
      collector: 4999,  // $49.99 in cents
    };

    const monthlyPrice = monthlyPrices[planId];
    // Yearly: 20% discount, billed as 12 months upfront
    const amount = period === "yearly"
      ? Math.round(monthlyPrice * 0.8) * 12
      : monthlyPrice;
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
          period,
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

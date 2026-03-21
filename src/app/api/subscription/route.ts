import { NextResponse } from "next/server";

interface SubscriptionRequestBody {
  planId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionRequestBody;
    const { planId, userId } = body;

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "planId and userId are required" },
        { status: 400 }
      );
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Please set up Razorpay credentials." },
        { status: 503 }
      );
    }

    // Create Razorpay subscription
    const planPrices: Record<string, number> = {
      basic: 29900,    // ₹299 in paise
      premium: 99900,  // ₹999 in paise
      collector: 299900, // ₹2,999 in paise
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
        currency: "INR",
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

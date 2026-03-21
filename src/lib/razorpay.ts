/**
 * Razorpay Integration for Sanctuary
 *
 * Handles subscription payments through Razorpay.
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.
 *
 * Plan IDs map to subscription tiers:
 * - basic: ₹299/mo
 * - premium: ₹999/mo
 * - collector: ₹2,999/mo
 */

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Load the Razorpay checkout script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout with the given order details
 */
export async function openRazorpayCheckout(options: {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  userName: string;
  userEmail: string;
  planName: string;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onFailure: (error: { code: string; description: string }) => void;
}): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure({
      code: "SCRIPT_LOAD_ERROR",
      description: "Failed to load payment gateway",
    });
    return;
  }

  const razorpayWindow = window as typeof window & {
    Razorpay: new (config: Record<string, unknown>) => { open: () => void };
  };

  const razorpay = new razorpayWindow.Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    name: "Sanctuary",
    description: `${options.planName} Subscription`,
    order_id: options.orderId,
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    theme: {
      color: "#A8A8B8",
    },
    handler: (response: RazorpayPaymentResult) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onFailure({
          code: "PAYMENT_CANCELLED",
          description: "Payment was cancelled by user",
        });
      },
    },
  });

  razorpay.open();
}

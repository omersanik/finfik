"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const plans = [
  {
    name: "Free Plan – Starter",
    price: 0,
    period: "Forever",
    features: [
      "Access to free courses",
      "Basic learning paths",
      "Community support",
    ],
    cta: "Current Plan",
    badge: "Free",
    highlight: false,
    id: "free",
    disabled: true,
  },
  {
    name: "Pro Plan – Monthly",
    price: 6.99,
    period: "/month",
    features: [
      "Unlock all premium courses",
      "Exclusive content",
      "Priority support",
      "Cancel anytime",
    ],
    cta: "Subscribe Monthly",
    badge: "Popular",
    highlight: true,
    id: "monthly",
    disabled: false,
  },
  {
    name: "Pro Plan – Yearly",
    price: 69.99,
    period: "/year",
    features: [
      "Unlock all premium courses",
      "Exclusive content",
      "Priority support",
      "2 months free (save 16%)",
    ],
    cta: "Subscribe Yearly",
    badge: "Best Value",
    highlight: false,
    id: "yearly",
    disabled: false,
  },
];

function SubscriptionContent() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showStripeMsg, setShowStripeMsg] = useState<boolean>(false);
  const [stripeMsg, setStripeMsg] = useState<string>("");
  const searchParams = useSearchParams();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);

  // Fetch premium status
  useEffect(() => {
    const fetchPremium = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/users/premium-users");
        const data = await res.json();
        setIsPremium(!!data.is_premium);
        setSubscriptionPlan(data.subscription_plan || null);
      } catch (e) {
        setIsPremium(false);
        setSubscriptionPlan(null);
      }
    };
    fetchPremium();
  }, [user]);

  // Show Stripe message only once after redirect
  useEffect(() => {
    if (searchParams?.get("success") === "1") {
      setStripeMsg("Your payment was successful and your account is now premium! 🎉");
      setShowStripeMsg(true);
      // Remove the query param after showing the message
      setTimeout(() => {
        setShowStripeMsg(false);
        router.replace("/subscription", { scroll: false });
      }, 5000);
    } else if (searchParams?.get("canceled") === "1") {
      setStripeMsg("Your payment was canceled. You have not been charged.");
      setShowStripeMsg(true);
      setTimeout(() => {
        setShowStripeMsg(false);
        router.replace("/subscription", { scroll: false });
      }, 5000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (searchParams?.get("success") === "1" || searchParams?.get("canceled") === "1") {
      window.location.replace("/subscription");
    }
  }, [searchParams]);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoading(plan);
    setError(null);
    try {
      if (!user) throw new Error("You must be signed in to subscribe.");
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout.");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = async () => {
    setDowngradeLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/premium-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_premium: false }),
      });
      if (!res.ok) throw new Error("Failed to downgrade to Free Plan.");
      setIsPremium(false);
      setShowCancelDialog(false);
      window.location.reload(); // Force full page reload after downgrade
    } catch (e: any) {
      setError(e.message || "Failed to downgrade.");
    } finally {
      setDowngradeLoading(false);
    }
  };

  // Plan button logic
  const plansWithStatus = plans.map((plan) => {
    if (plan.id === "free") {
      if (isPremium) {
        return { ...plan, cta: "Switch to Free", disabled: false, onClick: () => setShowCancelDialog(true) };
      } else {
        return { ...plan, cta: "Current Plan", disabled: true, onClick: undefined };
      }
    }
    if (plan.id === "monthly" || plan.id === "yearly") {
      if (isPremium && subscriptionPlan === plan.id) {
        return { ...plan, cta: "Current Plan", disabled: true, onClick: undefined };
      } else {
        return { ...plan, cta: plan.cta, disabled: false, onClick: () => handleSubscribe(plan.id as "monthly" | "yearly") };
      }
    }
    return { ...plan, onClick: undefined };
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your premium subscription and switch to the Free plan? <br />
              <span className="text-destructive font-semibold">You will lose access to all premium features and courses.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={downgradeLoading}>
              Keep Premium
            </Button>
            <Button variant="destructive" onClick={handleDowngrade} disabled={downgradeLoading}>
              {downgradeLoading ? "Cancelling..." : "Yes, Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">👑</div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Unlock all premium courses and exclusive content!
          <br />
          Support your learning journey with <span className="font-semibold">Finfik Premium</span>.
        </p>
      </div>
      {showStripeMsg && stripeMsg && (
        <Alert variant="default" className="mb-4 w-full max-w-lg">
          <AlertTitle>Payment Status</AlertTitle>
          <AlertDescription>{stripeMsg}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4 w-full max-w-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">
        {plansWithStatus.map((plan) => (
          <Card
            key={plan.id}
            className={`flex-1 flex flex-col items-center p-6 rounded-2xl shadow-lg border-2 transition-all duration-200 bg-card border-border ${
              plan.highlight ? "ring-2 ring-primary scale-105" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-foreground">{plan.name}</span>
              {plan.badge && (
                <Badge
                  className={
                    plan.highlight
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {plan.badge}
                </Badge>
              )}
            </div>
            <div className="text-4xl font-extrabold text-primary mb-1">
              {plan.price === 0 ? "Free" : `$${plan.price}`}
              {plan.price !== 0 && (
                <span className="text-base font-medium text-muted-foreground">
                  {plan.period}
                </span>
              )}
            </div>
            <ul className="text-sm text-muted-foreground mb-4 mt-2 space-y-1 text-left w-full max-w-xs mx-auto">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary">✔</span> {feature}
                </li>
              ))}
            </ul>
            <Button
              disabled={plan.disabled || loading === plan.id}
              className={`w-full mt-auto text-base font-semibold rounded-full py-2 ${plan.disabled ? "opacity-80 cursor-default" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
              onClick={plan.onClick}
            >
              {loading === plan.id ? "Processing..." : plan.cta}
            </Button>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-6 text-center max-w-lg">
        All users start on the Free Plan by default. Cancel anytime. Secure payments powered by Stripe.
      </p>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-2">👑</div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Loading subscription options...
          </p>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

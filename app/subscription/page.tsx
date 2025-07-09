import { Button } from "@/components/ui/button";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-yellow-200">
        <div className="text-5xl mb-4">👑</div>
        <h1 className="text-3xl font-bold mb-2 text-yellow-700">Go Premium</h1>
        <p className="text-yellow-800 mb-6">
          Unlock all premium courses and exclusive content!<br />
          Support your learning journey with <span className="font-semibold">Finfik Premium</span>.
        </p>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-8 py-3 text-lg font-semibold shadow">
          Upgrade Now
        </Button>
        <p className="text-xs text-yellow-600 mt-4">No payment required for this demo.</p>
      </div>
    </div>
  );
} 
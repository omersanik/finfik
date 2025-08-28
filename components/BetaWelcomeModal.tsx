"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Sparkles, Star, MessageSquare, Zap, Gift, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";


interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function BetaWelcomeModal({ isOpen, onClose, userName }: BetaWelcomeModalProps) {
  const [hasSeenModal, setHasSeenModal] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const seen = localStorage.getItem("beta-welcome-seen");
    if (seen) {
      setHasSeenModal(true);
    }
  }, []);

  const handleClose = () => {
    // Mark as seen
    localStorage.setItem("beta-welcome-seen", "true");
    setHasSeenModal(true);
    onClose();
  };

  if (hasSeenModal) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-3 -right-3">
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                  <Star className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Finfik Beta! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-lg text-muted-foreground">
                         {userName ? `Hi ${userName}, you&apos;re` : "You&apos;re"} now part of our exclusive beta program!
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent my-6" />

        <div className="space-y-6">
          {/* What You Get */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Gift className="w-6 h-6" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Premium Course Access</p>
                    <p className="text-sm text-green-700">
                      Unlock all premium courses and features without any payment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Early Access to New Features</p>
                    <p className="text-sm text-green-700">
                      Try new features before anyone else
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Exclusive Beta Badge</p>
                    <p className="text-sm text-green-700">
                      Show off your beta status with a special badge
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Expect */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <MessageSquare className="w-6 h-6" />
                What We Expect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800">Regular Feedback</p>
                    <p className="text-sm text-blue-700">
                      Share your thoughts on new features and improvements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800">Bug Reports</p>
                    <p className="text-sm text-blue-700">
                      Help us identify and fix any issues you encounter
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800">Feature Requests</p>
                    <p className="text-sm text-blue-700">
                      Suggest new features that would make Finfik better
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Submit Feedback */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-6 h-6" />
                How to Submit Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800">Use the Feedback Button</p>
                    <p className="text-sm text-yellow-700">
                      Click the "Feedback" button in the navbar anytime
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800">Visit the Feedback Page</p>
                    <p className="text-sm text-yellow-700">
                      Go to /beta/feedback for a dedicated feedback form
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800">Be Specific</p>
                    <p className="text-sm text-yellow-700">
                      Include details about what you liked, disliked, or would change
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent my-6" />

        <div className="flex justify-center">
          <Button 
            onClick={handleClose}
            size="lg"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

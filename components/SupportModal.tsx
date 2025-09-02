"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  Coffee,
  ExternalLink,
  Zap,
  Shield,
  BookOpen,
} from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support Finfik 💙
          </DialogTitle>

          <DialogDescription className="text-lg text-muted-foreground">
            Hey! I&apos;m building Finfik to make finance education interactive
            and fun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main message */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Running Finfik costs money - servers, tools, and legal
              requirements. Your support helps keep the lights on and lets me
              focus on building great content.
            </p>
          </div>

          {/* What support enables */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="font-semibold text-blue-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Your support makes possible:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Keeping Finfik online and stable
                </p>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Adding more interactive courses and lessons
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Staying independent and focused on quality education
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Every coffee helps cover costs (~€2K/year) and keeps me motivated!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  window.open("https://buymeacoffee.com/finfik", "_blank");
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                size="lg"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Buy me a coffee
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>

              <Button onClick={onClose} variant="outline" size="lg">
                Maybe later
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for being part of the journey!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

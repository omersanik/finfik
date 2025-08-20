"use client";

import React, { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import LandingPageCardComponent from "@/components/LandingPageCardComponent";
import finfikwhitelogo from "@/logo/finfikwhitelogo.svg";
import CourseCardSkeleton from "./skeletons/CourseCardSkeleton";

// Course type definition
type Course = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  description: string;
  coming_soon?: boolean;
  is_premium?: boolean;
  course_level?: any;
};

// Beta pricing - honest and low
const betaPlans = [
  {
    name: "Free Plan – Beta",
    price: 0,
    period: "Forever",
    features: [
      "Access to free courses",
      "Basic learning paths",
      "Community support",
      "Early access to new features",
    ],
    cta: "Start Learning Free",
    badge: "Free",
    highlight: false,
    id: "free",
  },
  {
    name: "Pro Plan – Monthly",
    price: 6.99,
    period: "/month",
    features: [
      "Unlock all premium courses",
      "Exclusive beta content",
      "Direct feedback to our team",
      "Cancel anytime",
      "Lock in beta pricing forever",
    ],
    cta: "Join Beta Program",
    badge: "Beta Special",
    highlight: true,
    id: "monthly",
  },
  {
    name: "Pro Plan – Yearly",
    price: 69.99,
    period: "/year",
    features: [
      "Unlock all premium courses",
      "Exclusive beta content",
      "Direct feedback to our team",
      "2 months free (save 16%)",
      "Lock in beta pricing forever",
    ],
    cta: "Join Beta Program",
    badge: "Best Value",
    highlight: false,
    id: "yearly",
  },
];

// Floating particles component - Client only to prevent hydration errors
const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full opacity-30"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient background
const AnimatedGradient = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,187,106,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(102,187,106,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(102,187,106,0.2),transparent_50%)]" />
    </div>
  );
};

const BeautifulLandingPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Use the correct server URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
        console.log("Fetching courses from:", `${baseUrl}/api/courses`);

        const res = await fetch(`${baseUrl}/api/courses`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", res.status);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch courses: ${res.status} ${res.statusText}`
          );
        }

        const coursesData = await res.json();
        console.log("Fetched courses:", coursesData);
        setCourses(coursesData || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Calculate available and upcoming courses
  const availableCourses = courses.filter((course) => !course.coming_soon);
  const upcomingCourses = courses.filter((course) => course.coming_soon);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated gradient background */}
      <AnimatedGradient />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Top navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 w-full max-w-7xl mx-auto flex justify-between items-center pt-8 px-8"
      >
        {/* Logo */}
        <a href="/" className="flex items-center group">
          <div className="w-32 h-12 overflow-hidden flex items-center justify-center">
            <Image
              src={finfikwhitelogo}
              alt="Finfik Logo"
              width={128}
              height={48}
              className="object-contain transition-transform group-hover:scale-110"
            />
          </div>
        </a>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-4">
          <Button
            asChild
            variant="ghost"
            className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
          >
            <a href="/sign-in">Login</a>
          </Button>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-semibold shadow-lg transition-all duration-300"
          >
            <a href="/sign-up">Join Beta</a>
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section className="relative z-30 flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Beta Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Beta Version - Early Access
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block text-foreground">Master your</span>
            <span className="block text-primary">finance</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-medium text-muted-foreground mt-4">
              with{" "}
              <span className="inline-block min-w-[300px]">
                <ReactTyped
                  strings={[
                    "bite-sized lessons",
                    "gamified learning",
                    "personalized progress",
                    "expert insights",
                    "gamified learning",
                    "bite-sized content",
                  ]}
                  typeSpeed={50}
                  backSpeed={30}
                  backDelay={2000}
                  loop
                  cursorChar="|"
                  smartBackspace
                  className="text-primary font-bold"
                />
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your financial future with bite-sized, gamified lessons
            tailored to your goals.
            <span className="text-primary font-semibold">
              {" "}
              Join our beta and help shape the future of financial education.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              <a href="/sign-up" className="flex items-center gap-2">
                Start Learning Free
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              <a href="#courses" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                See What's Available
              </a>
            </Button>
          </div>

          {/* Beta Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 text-center relative z-20"
          >
            <div className="flex items-center gap-2 bg-background/95 px-4 py-2 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                Early Access
              </span>
              <span className="text-muted-foreground">Beta Users</span>
            </div>
            <div className="flex items-center gap-2 bg-background/95 px-4 py-2 rounded-lg shadow-lg">
              <Target className="w-6 h-6 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                {availableCourses.length}
              </span>
              <span className="text-muted-foreground">Courses Available</span>
            </div>
            <div className="flex items-center gap-2 bg-background/95 px-4 py-2 rounded-lg shadow-lg">
              <TrendingUp className="w-6 h-6 text-secondary" />
              <span className="text-2xl font-bold text-foreground">
                {upcomingCourses.length}+ Coming
              </span>
              <span className="text-muted-foreground">Premium Courses</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Featured Courses Section */}
      <motion.section
        id="courses"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-20 px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Available Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with our free course and get early access to premium content
              as we build it
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                No courses available yet
              </p>
              <p className="text-muted-foreground">
                Check back soon for our first courses!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.slug}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <LandingPageCardComponent
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail_url}
                    slug={course.slug}
                    courseId={course.id}
                    isPremium={course.is_premium || false}
                    comingSoon={course.coming_soon || false}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-20 px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Why Join Our Beta?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Be part of building the future of financial education
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Early Access",
                description:
                  "Get first access to new courses and features before anyone else",
                color: "bg-primary",
              },
              {
                icon: Shield,
                title: "Lock in Beta Pricing",
                description:
                  "Join now and keep our special beta pricing even after launch",
                color: "bg-secondary",
              },
              {
                icon: Zap,
                title: "Shape the Product",
                description:
                  "Your feedback directly influences what we build next",
                color: "bg-accent",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-card/50 backdrop-blur-xl border border-border hover:border-primary/50 transition-all duration-300 p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-full ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Beta Pricing Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-20 px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Beta Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Special pricing for our early supporters.{" "}
              <span className="text-primary font-semibold">
                Lock in these prices forever!
              </span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {betaPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  className={`relative h-full bg-card/50 backdrop-blur-xl border-2 transition-all duration-300 overflow-hidden ${
                    plan.highlight
                      ? "border-primary/50 shadow-lg shadow-primary/25 scale-105"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-card-foreground">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <Badge
                          className={`${
                            plan.highlight
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-card-foreground">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price !== 0 && (
                        <span className="text-lg text-muted-foreground ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">
                              ✓
                            </span>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => (window.location.href = "/sign-up")}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                        plan.highlight
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Beta pricing is limited time only. Prices will increase after
              launch. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Beta Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-20 px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Join the Beta?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start learning for free today and be among the first to experience
              the future of financial education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
              >
                <a href="/sign-up" className="flex items-center gap-2">
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                <a href="/sign-in" className="flex items-center gap-2">
                  Already have an account?
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-16 px-8 border-t border-border"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-24 h-8 overflow-hidden flex items-center justify-center">
              <Image
                src={finfikwhitelogo}
                alt="Finfik Logo"
                width={96}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm mb-2">
              © {new Date().getFullYear()} Finfik. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Beta Version - Early Access Program
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Custom styles */}
      <style jsx global>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BeautifulLandingPage;

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Crown,
  LayoutDashboard,
  Play,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/courses";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { sanityFetch } from "@/sanity/lib/live";
import { FEATURED_COURSES_QUERY, STATS_QUERY } from "@/sanity/lib/queries";

export default async function Home() {
  const t = await getTranslations("common.home");
  const pricingT = await getTranslations("common.pricing");
  const tiersT = await getTranslations("common.tiers");
  // Fetch featured courses, stats, and check auth status
  const [{ data: courses }, { data: stats }, user] = await Promise.all([
    sanityFetch({ query: FEATURED_COURSES_QUERY }),
    sanityFetch({ query: STATS_QUERY }),
    getCurrentUser(),
  ]);

  const isSignedIn = !!user;
  const tierCards = [
    {
      tier: tiersT("free"),
      icon: Rocket,
      color: "sky",
      gradient: "from-sky-500 to-blue-600",
      bgGlow: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      description: t("tiers.free.description"),
      features: t.raw("tiers.free.features") as string[],
    },
    {
      tier: tiersT("pro"),
      icon: Crown,
      color: "blue",
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description: t("tiers.pro.description"),
      features: t.raw("tiers.pro.features") as string[],
      popular: true,
    },
    {
      tier: tiersT("ultra"),
      icon: Trophy,
      color: "indigo",
      gradient: "from-cyan-400 to-sky-600",
      bgGlow: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      description: t("tiers.ultra.description"),
      features: t.raw("tiers.ultra.features") as string[],
    },
  ];
  const testimonials = [
    {
      name: t("testimonials.0.name"),
      role: t("testimonials.0.role"),
      content: t("testimonials.0.content"),
      avatar: "SM",
    },
    {
      name: t("testimonials.1.name"),
      role: t("testimonials.1.role"),
      content: t("testimonials.1.content"),
      avatar: "AB",
    },
    {
      name: t("testimonials.2.name"),
      role: t("testimonials.2.role"),
      content: t("testimonials.2.content"),
      avatar: "KM",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
      <Header
        initialUser={
          user
            ? {
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                tier: user.tier,
              }
            : undefined
        }
      />

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                {t("learnRealProjects")}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.95] mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-white">{t("masterCoding")}</span>
              <span className="block bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t("modernWay")}
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              {t("subtitle")}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-sky-600/30 px-8 h-12 text-base font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t("goDashboard")}
                    </Button>
                  </Link>
                  <Link href="/dashboard/courses">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-zinc-700 bg-zinc-900 text-white px-8 h-12 text-base hover:bg-zinc-800 hover:text-white"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t("myCourses")}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-sky-600/30 px-8 h-12 text-base font-semibold"
                    >
                      <Play className="w-4 h-4 mr-2 fill-white" />
                      {t("startLearningFree")}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-zinc-700 bg-zinc-900 text-white px-8 h-12 text-base hover:bg-zinc-800 hover:text-white"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t("browseCourses")}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div
              className="mt-16 grid grid-cols-3 gap-8 md:gap-16 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              {[
                {
                  value: stats?.courseCount ?? 0,
                  label: t("courses"),
                  icon: BookOpen,
                },
                {
                  value: stats?.lessonCount ?? 0,
                  label: t("lessons"),
                  icon: Play,
                },
                { value: "10K+", label: t("students"), icon: Users },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers Preview */}
        <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tierCards.map((plan) => (
              <div
                key={plan.tier}
                className={`relative p-8 rounded-2xl ${plan.bgGlow} border ${plan.borderColor} ${plan.popular ? "ring-2 ring-blue-500/50" : ""} transition-all duration-300 hover:scale-[1.02]`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-xs font-semibold">
                    {t("mostPopular")}
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.tier}</h3>
                <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${plan.color === "sky" ? "text-sky-400" : plan.color === "blue" ? "text-blue-400" : "text-indigo-400"}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section id="courses" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t("coursesBuiltFor")}{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                {t("realResults")}
              </span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t("featuredDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                slug={
                  course.slug ? { current: course.slug.current ?? "" } : null
                }
                title={course.title}
                description={course.description}
                tier={course.tier}
                thumbnail={course.thumbnail}
                moduleCount={course.moduleCount}
                lessonCount={course.lessonCount}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              >
                {t("viewAllCourses")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          className="px-6 lg:px-12 py-20 max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t("studentsLoveIt")}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t("studentsLoveIt")}
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`star-${testimonial.name}-${i}`}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold tracking-wide text-zinc-200">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-sky-600/20 via-blue-600/10 to-indigo-600/20 border border-white/10 p-12 md:p-20 text-center overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 blur-xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/30">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {t("readyToLevelUp")}
              </h2>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
                {t("journeyBegins")}
              </p>
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-sky-600/30 px-10 h-14 text-lg font-semibold"
                >
                  {t("viewPricing")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-12 border-t border-zinc-800 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">{pricingT("brand")}</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-zinc-500">
              <Link href="#" className="hover:text-white transition-colors">
                {pricingT("privacy")}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {pricingT("terms")}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {pricingT("contact")}
              </Link>
            </div>
            <p className="text-sm text-zinc-600">{pricingT("copyright")}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

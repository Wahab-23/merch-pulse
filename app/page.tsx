import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Users,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Logo from "@/public/ishopping.png"

export const metadata: Metadata = {
  title: "MerchPulse — Merchandiser Performance Platform",
  description:
    "Track, manage and optimize your merchandiser team's KPIs in real time. The ultimate internal performance management platform.",
};

const features = [
  {
    icon: BarChart3,
    title: "Real-Time KPI Tracking",
    description:
      "Monitor monthly upload targets and achieved percentages for every merchandiser with live progress indicators.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Add, update, and manage your merchandiser roster from a single admin panel with role-based access control.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description:
      "Communicate directly with your team through the integrated real-time messenger — no third-party tools needed.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Role-Aware",
    description:
      "Admin and Merchandiser roles with protected routes ensure the right people see the right data.",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    description:
      "Visual charts and progress bars make it instantly clear where each team member stands against their goals.",
  },
  {
    icon: Target,
    title: "Monthly Target Setting",
    description:
      "Set granular monthly upload targets per merchandiser and track achievement rates automatically.",
  },
];

const stats = [
  { value: "100%", label: "Real-Time Data" },
  { value: "2", label: "User Roles" },
  { value: "∞", label: "Scalable Team Size" },
  { value: "24/7", label: "Access Anywhere" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-yellow-600 transition-colors duration-200">
              Merch<span className="text-yellow-500">Pulse</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-black text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm shadow-yellow-100"
          >
            Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute -top-20 -left-32 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Internal Performance Platform
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Power your team&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
              performance
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            MerchPulse is a centralized platform for tracking merchandiser
            uploads, setting monthly targets, and communicating with your field
            team — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-black font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-yellow-100 hover:shadow-xl hover:shadow-yellow-200"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-6 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-yellow-600 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to lead
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From daily uploads to executive-level insights, MerchPulse
              covers the full workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:shadow-yellow-50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-5 group-hover:bg-yellow-100 transition-colors duration-200">
                  <f.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights checklist ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Built for high-performance teams
            </h2>
            <p className="text-yellow-100 text-base leading-relaxed mb-8">
              A purpose-built internal tool that grows with your workforce —
              simple for merchandisers, powerful for admins.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-yellow-700 hover:bg-yellow-50 active:scale-95 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md"
            >
              Login to your dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <ul className="space-y-4">
            {[
              "Track individual upload performance daily",
              "Set and adjust monthly targets per user",
              "Real-time messaging with your team",
              "Role-based access for admins and merchandisers",
              "Secure JWT-powered authentication",
              "Fully responsive — works on any device",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-50 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <Image
          src="/merchpulse_logo.png"
          alt="MerchPulse"
          width={130}
          height={40}
          className="object-contain mx-auto mb-4 opacity-70 h-auto w-auto"
        />
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MerchPulse. Internal use only.
        </p>
      </footer>
    </div>
  );
}

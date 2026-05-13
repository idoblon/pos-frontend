import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import posLogo from "@/logo/pos.png";
import {
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Fast Checkout",
      description: "Lightning-fast transaction processing for seamless customer experience",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track sales, inventory, and performance with live dashboards",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Inventory Management",
      description: "Automated stock tracking and low-stock alerts",
      color: "from-emerald-600 to-green-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-user Support",
      description: "Role-based access for cashiers, managers, and admins",
      color: "from-cyan-500 to-teal-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data encryption",
      color: "from-teal-600 to-emerald-700",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Cloud-based",
      description: "Access from anywhere, anytime with cloud sync",
      color: "from-green-600 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <img src={posLogo} alt="POS Pro" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold text-white">POS Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-4">
            ✨ Modern POS Solution
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Modern Point of Sale
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Built for Growth
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Streamline your retail operations with our powerful, intuitive POS system.
            Manage sales, inventory, and customers all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/30">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything You Need to Run Your Store
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful features designed for modern retail businesses
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-12 border border-emerald-500/20 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Choose POS Pro?
              </h2>
              <div className="space-y-4">
                {[
                  "Easy setup in minutes, no technical knowledge required",
                  "24/7 customer support from our expert team",
                  "Regular updates with new features at no extra cost",
                  "Scalable solution that grows with your business",
                  "Offline mode - keep selling even without internet",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-8 text-center shadow-xl shadow-emerald-500/30">
              <div className="text-5xl font-bold mb-2 text-white">30 Days</div>
              <div className="text-xl text-emerald-100 mb-6">Free Trial</div>
              <p className="mb-6 text-white/90">No credit card required. Cancel anytime.</p>
              <Link to="/signup">
                <Button size="lg" className="w-full bg-white hover:bg-gray-100 text-emerald-700 font-semibold">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-12 text-center shadow-2xl shadow-emerald-500/40">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of retailers using POS Pro to grow their business
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-500/20 bg-slate-900/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-lg">
                <img src={posLogo} alt="POS Pro" className="w-6 h-6" />
              </div>
              <span className="font-semibold text-white">POS Pro</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 POS Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

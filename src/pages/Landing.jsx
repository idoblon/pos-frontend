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
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Fast Checkout",
      description: "Lightning-fast transaction processing for seamless customer experience",
      color: "from-neutral-900 to-neutral-700",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track sales, inventory, and performance with live dashboards",
      color: "from-neutral-800 to-neutral-600",
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Inventory Management",
      description: "Automated stock tracking and low-stock alerts",
      color: "from-black to-neutral-700",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-user Support",
      description: "Role-based access for cashiers, managers, and admins",
      color: "from-neutral-700 to-neutral-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with data encryption",
      color: "from-neutral-900 to-neutral-600",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Cloud-based",
      description: "Access from anywhere, anytime with cloud sync",
      color: "from-black to-neutral-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "50M+", label: "Transactions" },
    { value: "24/7", label: "Support" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Store Owner",
      content: "POS Pro transformed our business. Sales tracking is effortless and the interface is incredibly intuitive.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Retail Manager",
      content: "Best investment we've made. The inventory management alone has saved us countless hours.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Cafe Owner",
      content: "Customer support is amazing and the system never lets us down. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md border border-gray-200">
              <img src={posLogo} alt="POS Pro" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold text-neutral-950">POS Pro</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-black transition-colors">Testimonials</a>
            <a href="#support" className="hover:text-black transition-colors">Support</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-neutral-950 hover:bg-gray-100 font-semibold">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-neutral-950 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20 font-semibold">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-neutral-800 text-sm font-semibold shadow-sm">
              <TrendingUp className="w-4 h-4" />
              Trusted by 10,000+ businesses
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-neutral-950">
              The Smartest Way to
              <span className="block text-neutral-950">
                Run Your Store
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              All-in-one POS system that helps you sell more, manage inventory, and grow your business with powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 bg-neutral-950 hover:bg-neutral-800 text-white shadow-xl shadow-neutral-900/20 w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-neutral-900" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-neutral-900" />
                30-day free trial
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="text-sm font-semibold text-gray-600">Today's Sales</div>
                    <div className="text-2xl font-bold text-neutral-950">रू 12,450</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Transactions</div>
                      <div className="text-xl font-bold text-neutral-950">248</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Items Sold</div>
                      <div className="text-xl font-bold text-neutral-950">1,432</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-end justify-around p-4">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div key={i} className="bg-gradient-to-t from-neutral-950 to-neutral-500 rounded-t" style={{ width: '10%', height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-neutral-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-full text-neutral-800 text-sm font-semibold mb-4 shadow-sm">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-950">
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to streamline your operations and boost sales
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-neutral-500 hover:shadow-2xl transition-all group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-950">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-full text-neutral-800 text-sm font-semibold mb-4 shadow-sm">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-950">
              Loved by Store Owners
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-neutral-900 text-neutral-900" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-neutral-950">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-neutral-950 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of retailers using POS Pro to streamline operations and increase revenue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-10 bg-white hover:bg-gray-100 text-neutral-950 font-semibold shadow-xl">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 border-2 border-white text-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-white/80 text-sm mt-6">No credit card required • 30-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600 text-center">
            © 2024 POS Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

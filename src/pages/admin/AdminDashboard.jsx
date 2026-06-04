import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Store, Users, ShoppingCart, DollarSign,
  TrendingUp, Activity, Building2, UserCheck,
  Calendar, Clock, BarChart3, RefreshCw, AlertCircle, CreditCard
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ['#1a1d23', '#4a4d55', '#718096', '#a0aec0', '#cbd5e0'];

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#718096", fontWeight: "500" }}>
            {title}
          </p>
          <p style={{
            margin: "8px 0 4px",
            fontSize: "32px",
            fontWeight: "700",
            color: "#1a202c",
            letterSpacing: "-1px"
          }}>
            {value}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#718096" }}>
            {subtitle}
          </p>
          {trend && (
            <div style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <TrendingUp size={14} color={trend > 0 ? "#48bb78" : "#f56565"} />
              <span style={{
                fontSize: "12px",
                color: trend > 0 ? "#48bb78" : "#f56565",
                fontWeight: "600"
              }}>
                {trend > 0 ? "+" : ""}{trend}% from last month
              </span>
            </div>
          )}
        </div>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={24} color="white" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        e.target.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        e.target.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={20} color="white" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a202c" }}>
            {title}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#718096" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Simulated real-time data with refresh capability
  const [systemMetrics, setSystemMetrics] = useState({
    totalStores: 12,
    totalUsers: 156,
    totalOrders: 2847,
    totalRevenue: 485000,
    activeStores: 11,
    activeUsers: 142
  });

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSystemMetrics(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 10),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 5000),
        activeUsers: Math.min(prev.totalUsers, prev.activeUsers + Math.floor(Math.random() * 2))
      }));
      setLastUpdated(new Date());
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock chart data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000, orders: 234 },
    { month: 'Feb', revenue: 52000, orders: 267 },
    { month: 'Mar', revenue: 48000, orders: 245 },
    { month: 'Apr', revenue: 61000, orders: 312 },
    { month: 'May', revenue: 55000, orders: 287 },
    { month: 'Jun', revenue: 67000, orders: 342 }
  ];

  const storePerformanceData = [
    { name: 'Store A', revenue: 125000, orders: 645 },
    { name: 'Store B', revenue: 98000, orders: 523 },
    { name: 'Store C', revenue: 87000, orders: 467 },
    { name: 'Store D', revenue: 76000, orders: 398 },
    { name: 'Store E', revenue: 65000, orders: 334 }
  ];

  const userDistributionData = [
    { name: 'Store Admins', value: 12, color: '#1a1d29' },
    { name: 'Branch Managers', value: 24, color: '#4a5568' },
    { name: 'Cashiers', value: 89, color: '#718096' },
    { name: 'Other Users', value: 31, color: '#a0aec0' }
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "'DM Sans','Inter',sans-serif"
    }}>
      {/* Header with Refresh */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a202c",
            letterSpacing: "-0.5px"
          }}>
            System Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <p style={{
              margin: 0,
              fontSize: "16px",
              color: "#718096"
            }}>
              Monitor and manage your entire POS network
            </p>
            <span style={{
              fontSize: "12px",
              color: "#a0aec0",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <Clock size={12} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: refreshing ? "#a0aec0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: refreshing ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <RefreshCw size={16} style={{ 
            animation: refreshing ? "spin 1s linear infinite" : "none" 
          }} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
      }}>
        <StatCard
          title="Total Stores"
          value={systemMetrics.totalStores}
          subtitle={`${systemMetrics.activeStores} active stores`}
          icon={Store}
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          trend={8.3}
        />
        <StatCard
          title="Total Users"
          value={systemMetrics.totalUsers}
          subtitle={`${systemMetrics.activeUsers} active users`}
          icon={Users}
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          trend={12.1}
        />
        <StatCard
          title="Total Orders"
          value={systemMetrics.totalOrders.toLocaleString()}
          subtitle="All time orders"
          icon={ShoppingCart}
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          trend={15.7}
        />
        <StatCard
          title="Total Revenue"
          value={`रु ${systemMetrics.totalRevenue.toLocaleString("en-IN")}`}
          subtitle="All time revenue"
          icon={DollarSign}
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          trend={22.4}
        />
      </div>

      {/* Charts Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px"
      }}>
        {/* Monthly Revenue Trend */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
              Monthly Revenue Trend
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#718096" }}>
              Revenue across all stores
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: "#718096" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#718096" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}>
                      <p style={{ margin: "0 0 4px", fontWeight: "600" }}>{label}</p>
                      <p style={{ margin: 0, color: "#667eea" }}>
                        Revenue: रु {payload[0].value?.toLocaleString("en-IN")}
                      </p>
                      <p style={{ margin: 0, color: "#718096", fontSize: "12px" }}>
                        Orders: {payload[0].payload.orders}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "#667eea" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
              User Distribution
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#718096" }}>
              Users by role type
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "16px" }}>
            {userDistributionData.map((entry) => (
              <div key={entry.name} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: entry.color
                  }} />
                  <span style={{ fontSize: "13px", color: "#4a5568" }}>{entry.name}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a202c" }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Performance */}
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
            Top Performing Stores
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#718096" }}>
            Revenue by store location
          </p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={storePerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: "#718096" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "#718096" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600" }}>{label}</p>
                    <p style={{ margin: 0, color: "#1a1d29" }}>
                      Revenue: रु {payload[0].value?.toLocaleString("en-IN")}
                    </p>
                    <p style={{ margin: 0, color: "#718096", fontSize: "12px" }}>
                      Orders: {payload[0].payload.orders}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" fill="#1a1d29" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{
          margin: "0 0 16px",
          fontSize: "18px",
          fontWeight: "600",
          color: "#1a202c"
        }}>
          Quick Actions
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px"
        }}>
          <QuickAction
            title="Subscription Management"
            description="Monitor and manage store subscriptions"
            icon={CreditCard}
            color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            onClick={() => window.location.href = "/admin/subscriptions"}
          />
          <QuickAction
            title="Manage Stores"
            description="Add, edit, or remove store locations"
            icon={Building2}
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            onClick={() => window.location.href = "/admin/stores"}
          />
          <QuickAction
            title="User Management"
            description="Manage user accounts and permissions"
            icon={UserCheck}
            color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            onClick={() => window.location.href = "/admin/users"}
          />
          <QuickAction
            title="System Reports"
            description="View detailed analytics and reports"
            icon={BarChart3}
            color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            onClick={() => window.location.href = "/admin/reports"}
          />
        </div>
      </div>
    </div>
  );
}
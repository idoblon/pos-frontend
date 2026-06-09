import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Download, Calendar, TrendingUp, Users, Store,
  ShoppingCart, BarChart3, FileText
} from "lucide-react";

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffa726'];

export default function SystemReports() {
  const [dateRange, setDateRange] = useState("This Year");
  const [reportType, setReportType] = useState("overview");

  // Mock data
  const systemOverviewData = [
    { month: 'Jan', revenue: 450000, orders: 2340, users: 12, stores: 8 },
    { month: 'Feb', revenue: 520000, orders: 2670, users: 15, stores: 9 },
    { month: 'Mar', revenue: 480000, orders: 2450, users: 18, stores: 10 },
    { month: 'Apr', revenue: 610000, orders: 3120, users: 22, stores: 11 },
    { month: 'May', revenue: 550000, orders: 2870, users: 25, stores: 12 },
    { month: 'Jun', revenue: 670000, orders: 3420, users: 28, stores: 12 }
  ];

  const storeComparisonData = [
    { name: 'Store A', revenue: 1250000, orders: 6450, growth: 15.2 },
    { name: 'Store B', revenue: 980000, orders: 5230, growth: 8.7 },
    { name: 'Store C', revenue: 870000, orders: 4670, growth: 12.1 },
    { name: 'Store D', revenue: 760000, orders: 3980, growth: -2.3 },
    { name: 'Store E', revenue: 650000, orders: 3340, growth: 22.8 }
  ];

  const userActivityData = [
    { name: 'Active Daily', value: 85, color: '#48bb78' },
    { name: 'Active Weekly', value: 12, color: '#ed8936' },
    { name: 'Inactive', value: 3, color: '#f56565' }
  ];

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting system reports...");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a202c",
            letterSpacing: "-0.5px"
          }}>
            System Reports
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#718096"
          }}>
            Comprehensive analytics across all stores and users
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="This Month">This Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="This Year">This Year</option>
          </select>
          
          <button
            onClick={handleExport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#1a1d23",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Download size={16} color="white" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px"
      }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {[
            { key: "overview", label: "System Overview", icon: BarChart3 },
            { key: "stores", label: "Store Performance", icon: Store },
            { key: "users", label: "User Analytics", icon: Users },
            { key: "financial", label: "Financial Summary", icon: () => <span style={{ fontSize: 15, fontWeight: 700 }}>रु</span> }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setReportType(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: reportType === key ? "#1a1d23" : "transparent",
                color: reportType === key ? "white" : "#718096",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={16} color={reportType === key ? "white" : "#1a1d23"} />
              {label}
            </button>
          ))}
        </div>

        {/* System Overview */}
        {reportType === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
                System Growth Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemOverviewData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#718096" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#718096" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#667eea" fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Store Performance */}
        {reportType === "stores" && (
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
              Store Revenue Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#718096" }} />
                <YAxis tick={{ fontSize: 12, fill: "#718096" }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Analytics */}
        {reportType === "users" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
                User Activity Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userActivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
                User Growth
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={systemOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#718096" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#718096" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#f093fb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        {reportType === "financial" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Revenue", value: "रु 32,50,000", trend: "+15.2%", color: "#48bb78" },
                { label: "Total Orders", value: "18,670", trend: "+12.8%", color: "#667eea" },
                { label: "Avg Order Value", value: "रु 1,740", trend: "+8.4%", color: "#f093fb" },
                { label: "Active Stores", value: "12", trend: "+20%", color: "#4facfe" }
              ].map((metric, index) => (
                <div key={index} style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center"
                }}>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>
                    {metric.value}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#718096" }}>
                    {metric.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: metric.color, fontWeight: "600" }}>
                    {metric.trend}
                  </p>
                </div>
              ))}
            </div>
            
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={systemOverviewData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#43e97b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#718096" }} />
                <YAxis tick={{ fontSize: 12, fill: "#718096" }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#43e97b" fill="url(#revenueGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
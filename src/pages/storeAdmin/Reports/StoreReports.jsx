import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShoppingCart, RotateCcw, DollarSign,
  Package, GitBranch, Download, BarChart2, Calendar, Clock,
} from "lucide-react";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import { getAllRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import secureStorage from "@/util/secureStorage";

const RANGES = ["This Month", "Last 3 Months", "Last 6 Months", "This Year"];

// ── Styles ─────────────────────────────────────────────────────────────────
const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 20px" };

function StatCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
          <p style={{ margin: "5px 0 2px", fontSize: 24, fontWeight: 800, color: "#1a1d23", letterSpacing: "-0.5px" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
        </div>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
      <BarChart2 size={48} color="#e2e5e9" style={{ margin: "0 auto 16px", display: "block" }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>No Data Available</p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#8a909c" }}>{message}</p>
    </div>
  );
}

export default function StoreReports() {
  const [range, setRange] = useState("This Year");
  const dispatch = useDispatch();
  
  // Redux selectors
  const { user } = useSelector((s) => s.auth);
  const { userProfile } = useSelector((s) => s.user);
  const userData = secureStorage.getUserData();
  const storeId =
    user?.storeId ||
    userData?.storeId ||
    userProfile?.storeId ||
    localStorage.getItem("storeId");

  const { branches } = useSelector((s) => s.branch);
  const { products } = useSelector((s) => s.product);
  const { employees } = useSelector((s) => s.employee);
  const { categories } = useSelector((s) => s.category);
  const { refunds } = useSelector((s) => s.refund);
  const { orders } = useSelector((s) => s.order);

  // Fetch data
  useEffect(() => {
    if (!storeId) return;
    dispatch(getBranchesByStore(storeId));
    dispatch(getProductsByStore(storeId));
    dispatch(findStoreEmployee({ storeId }));
    dispatch(getCategoriesByStore({ storeId }));
    dispatch(getAllRefund());
  }, [dispatch, storeId]);

  // Fetch orders from all branches
  useEffect(() => {
    if (branches?.length > 0) {
      branches.forEach(branch => {
        if (branch._id || branch.id) {
          dispatch(getOrdersByBranch({ branchId: branch._id || branch.id }));
        }
      });
    }
  }, [dispatch, branches]);

  // Process order data
  const allOrders = useMemo(() => {
    const orderArray = Array.isArray(orders) ? orders : (orders?.orders || []);
    // Ensure we always return a new mutable array
    return [...orderArray];
  }, [orders]);

  // Filter data based on selected range
  const getDateRangeFilter = (range) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "This Month":
        startDate.setDate(1); // First day of current month
        startDate.setHours(0, 0, 0, 0);
        break;
      case "Last 3 Months":
        startDate.setMonth(now.getMonth() - 2, 1); // 3 months ago, first day
        startDate.setHours(0, 0, 0, 0);
        break;
      case "Last 6 Months":
        startDate.setMonth(now.getMonth() - 5, 1); // 6 months ago, first day
        startDate.setHours(0, 0, 0, 0);
        break;
      case "This Year":
      default:
        startDate.setMonth(0, 1); // January 1st of current year
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    return startDate;
  };

  // Filter orders based on selected range
  const filteredOrders = useMemo(() => {
    const startDate = getDateRangeFilter(range);
    return allOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });
  }, [allOrders, range]);

  // Calculate KPI metrics based on filtered orders
  const kpiMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrdersCount = filteredOrders.length;
    const totalRefundsCount = refunds?.length || 0;
    const avgOrder = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    
    return { totalRevenue, totalOrdersCount, totalRefundsCount, avgOrder };
  }, [filteredOrders, refunds]);

  // Monthly sales trend data based on filtered orders
  const monthlySalesData = useMemo(() => {
    const monthsData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        orders: 0
      };
    });

    filteredOrders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const currentDate = new Date();
        const monthsDiff = (currentDate.getFullYear() - orderDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - orderDate.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff < 12) {
          const monthIndex = 11 - monthsDiff;
          if (monthsData[monthIndex]) {
            monthsData[monthIndex].revenue += order.totalAmount || 0;
            monthsData[monthIndex].orders += 1;
          }
        }
      }
    });

    return monthsData;
  }, [filteredOrders]);

  // Payment methods data based on filtered orders
  const paymentMethodsData = useMemo(() => {
    const paymentCounts = { CASH: 0, ESEWA: 0, KHALTI: 0 };
    const paymentColors = { CASH: '#1a1d23', ESEWA: '#4a4d55', KHALTI: '#6b7280' };
    
    filteredOrders.forEach(order => {
      if (order.paymentType && paymentCounts.hasOwnProperty(order.paymentType)) {
        paymentCounts[order.paymentType]++;
      }
    });

    return Object.entries(paymentCounts)
      .filter(([_, count]) => count > 0)
      .map(([method, count]) => ({
        name: method,
        value: count,
        color: paymentColors[method]
      }));
  }, [filteredOrders]);

  // Top products data based on filtered orders
  const topProductsData = useMemo(() => {
    const productSales = {};
    
    filteredOrders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          if (item && (item.product?.name || item.productName)) {
            const productName = item.product?.name || item.productName || 'Unknown Product';
            const quantity = item.quantity || 0;
            
            if (productSales[productName]) {
              productSales[productName] += quantity;
            } else {
              productSales[productName] = quantity;
            }
          }
        });
      }
    });

    return Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [filteredOrders]);

  // Branch performance data based on filtered orders
  const branchPerformanceData = useMemo(() => {
    if (!branches?.length) return [];
    
    try {
      const branchRevenue = {};
      
      filteredOrders.forEach(order => {
        const branchId = order.branchId;
        if (branchId) {
          branchRevenue[branchId] = (branchRevenue[branchId] || 0) + (order.totalAmount || 0);
        }
      });

      return branches
        .map(branch => {
          const branchId = branch._id || branch.id;
          return {
            name: branch.name,
            revenue: branchRevenue[branchId] || 0,
            orders: filteredOrders.filter(o => o.branchId === branchId).length
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    } catch (error) {
      console.error('Error processing branch performance data:', error);
      return [];
    }
  }, [branches, filteredOrders]);

  // Recent transactions based on filtered orders
  const recentTransactions = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    
    try {
      return filteredOrders
        .filter(order => order && order.createdAt) // Filter valid orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(order => {
          const branch = branches?.find(b => (b._id || b.id) === order.branchId);
          return {
            id: order._id || order.id,
            amount: order.totalAmount || 0,
            paymentMethod: order.paymentType || 'CASH',
            branch: branch?.name || 'Unknown Branch',
            time: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown Time',
            items: (order.orderItems && Array.isArray(order.orderItems)) ? order.orderItems.length : 0 // Enhanced null check
          };
        });
    } catch (error) {
      console.error('Error processing recent transactions:', error);
      return [];
    }
  }, [filteredOrders, branches]);

  const { totalRevenue, totalOrdersCount, totalRefundsCount, avgOrder } = kpiMetrics;

  // Export functionality
  const handleExport = () => {
    try {
      const startDate = getDateRangeFilter(range);
      const endDate = new Date();
      
      // Prepare export data
      const exportData = {
        reportType: "Store Analytics Report",
        dateRange: range,
        generatedAt: new Date().toLocaleString(),
        period: {
          from: startDate.toLocaleDateString(),
          to: endDate.toLocaleDateString()
        },
        summary: {
          totalRevenue: filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          totalOrders: filteredOrders.length,
          totalRefunds: refunds?.length || 0,
          avgOrderValue: filteredOrders.length > 0 ? 
            Math.round(filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / filteredOrders.length) : 0
        },
        transactions: filteredOrders.map(order => {
          const branch = branches?.find(b => (b._id || b.id) === order.branchId);
          return {
            orderId: order._id || order.id,
            amount: order.totalAmount || 0,
            paymentMethod: order.paymentType || 'CASH',
            branch: branch?.name || 'Unknown Branch',
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date',
            time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Unknown Time',
            itemCount: order.orderItems?.length || 0
          };
        }),
        branchPerformance: branchPerformanceData,
        topProducts: topProductsData
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `store-report-${range.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      // Also create CSV version for transactions
      const csvHeaders = ['Order ID', 'Amount', 'Payment Method', 'Branch', 'Date', 'Time', 'Items'];
      const csvRows = exportData.transactions.map(t => [
        t.orderId,
        `₹${t.amount}`,
        t.paymentMethod,
        t.branch,
        t.date,
        t.time,
        t.itemCount
      ]);
      
      const csvContent = [csvHeaders, ...csvRows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      const csvUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const csvFileName = `store-transactions-${range.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
      
      const csvLink = document.createElement('a');
      csvLink.setAttribute('href', csvUri);
      csvLink.setAttribute('download', csvFileName);
      csvLink.click();
      
      console.log(`Exported report for ${range}:`, exportData.summary);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Reports</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Store-wide sales analytics and performance</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ border: "1px solid #e2e5e9", borderRadius: 8, padding: "7px 12px", fontSize: 12, background: "white", color: "#1a1d23", outline: "none", cursor: "pointer" }}
          >
            {RANGES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button 
            onClick={handleExport}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard label="Total Revenue" value={`रु ${totalRevenue.toLocaleString("en-IN")}`} sub="across all branches" icon={DollarSign} iconColor="#1a1d23" />
        <StatCard label="Total Orders" value={totalOrdersCount.toLocaleString()} sub="completed orders" icon={ShoppingCart} iconColor="#4a4d55" />
        <StatCard label="Total Refunds" value={totalRefundsCount.toLocaleString()} sub="processed refunds" icon={RotateCcw} iconColor="#e53e3e" />
        <StatCard label="Avg Order Value" value={`रु ${avgOrder.toLocaleString("en-IN")}`} sub="per transaction" icon={TrendingUp} iconColor="#1a1d23" />
      </div>

      {/* Sales Trend + Payment Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

        {/* Monthly Sales Chart */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Monthly Sales Trend</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>Revenue and orders per month</p>
          </div>
          {monthlySalesData.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlySalesData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1d23" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a1d23" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: "#8a909c" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#8a909c" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{
                        background: "white",
                        border: "1px solid #e2e5e9",
                        borderRadius: 8,
                        padding: "8px 12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontSize: 12,
                      }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1d23" }}>{label}</p>
                        <p style={{ margin: 0, color: "#1a5c38", fontWeight: 700 }}>
                          रु {payload[0].value?.toLocaleString("en-IN")}
                        </p>
                        <p style={{ margin: 0, color: "#8a909c", fontSize: 11 }}>
                          {payload[0].payload.orders} orders
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a1d23"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#1a1d23" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sales data will appear here once orders are processed" />
          )}
        </div>

        {/* Payment Methods */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Payment Methods</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Distribution by payment type</p>
          {paymentMethodsData.length > 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          background: "white",
                          border: "1px solid #e2e5e9",
                          borderRadius: 6,
                          padding: "6px 10px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          fontSize: 12,
                        }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>
                            {data.name}: {data.value} orders
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8 }}>
                {paymentMethodsData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: entry.color }}></div>
                      <span style={{ fontSize: 12, color: "#1a1d23" }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="Payment distribution will appear here" />
          )}
        </div>
      </div>

      {/* Top Products + Branch Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Top Products */}
        <div style={{ ...card, padding: "18px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Top Products</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>By units sold</p>
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topProductsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "#8a909c" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#8a909c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{
                        background: "white",
                        border: "1px solid #e2e5e9",
                        borderRadius: 6,
                        padding: "6px 10px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontSize: 12,
                      }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600 }}>{label}</p>
                        <p style={{ margin: 0, color: "#1a5c38" }}>
                          {payload[0].value} units sold
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="quantity" fill="#1a1d23" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Top selling products will appear here" />
          )}
        </div>

        {/* Branch Performance */}
        <div style={card}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Branch Performance</p>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Revenue by branch</p>
          {branchPerformanceData.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {branchPerformanceData.map((branch, index) => {
                const maxRevenue = branchPerformanceData[0]?.revenue || 1;
                const percentage = Math.round((branch.revenue / maxRevenue) * 100);
                return (
                  <div key={branch.name} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: index === 0 ? "linear-gradient(135deg,#1a1d23,#4a4d55)" : "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: index === 0 ? "white" : "#8a909c"
                          }}>
                            {index + 1}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{branch.name}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>
                          रु {branch.revenue.toLocaleString("en-IN")}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: "#8a909c" }}>
                          {branch.orders} orders
                        </p>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: "#e5e7eb" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 4,
                        width: `${percentage}%`,
                        background: index === 0 ? "linear-gradient(90deg,#1a1d23,#4a4d55)" : "#9ca3af",
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="Branch performance data will appear here" />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Recent Transactions</p>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Latest sales across all branches</p>
        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Order ID</th>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Amount</th>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Payment</th>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Branch</th>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Items</th>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={transaction.id} style={{ borderBottom: index < recentTransactions.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                    <td style={{ padding: "10px 0", fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>
                      #{String(transaction.id || 'N/A').slice(-6)}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>
                      रु {transaction.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "10px 0" }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 12,
                        background: transaction.paymentMethod === 'CASH' ? '#f3f4f6' : 
                                   transaction.paymentMethod === 'ESEWA' ? '#fef3c7' : '#e0f2fe',
                        color: transaction.paymentMethod === 'CASH' ? '#374151' : 
                               transaction.paymentMethod === 'ESEWA' ? '#92400e' : '#0369a1'
                      }}>
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 12, color: "#1a1d23" }}>
                      {transaction.branch}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 12, color: "#6b7280" }}>
                      {transaction.items > 0 ? `${transaction.items} items` : 'No items'}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 11, color: "#8a909c" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} />
                        {new Date(transaction.time).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Recent transactions will appear here once orders are placed" />
        )}
      </div>

    </div>
  );
}

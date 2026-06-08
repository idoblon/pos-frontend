import React, { useState, useEffect } from "react";
import { Mail, CreditCard, AlertCircle, Clock, CheckCircle, X } from "lucide-react";

export default function StoreOwnerEmailInbox() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    // Load emails from localStorage
    const loadEmails = () => {
      const storeEmails = JSON.parse(localStorage.getItem('storeOwnerEmails') || '[]');
      setEmails(storeEmails.reverse()); // Show newest first
    };

    loadEmails();
    
    // Refresh emails every 2 seconds to catch new ones
    const interval = setInterval(loadEmails, 2000);
    return () => clearInterval(interval);
  }, []);

  const getEmailIcon = (template) => {
    switch(template) {
      case 'store-approval':
        return <CheckCircle size={16} color="#059669" />;
      case 'store-rejection':
        return <AlertCircle size={16} color="#dc2626" />;
      default:
        return <Mail size={16} color="#3b82f6" />;
    }
  };

  const getEmailBadge = (template) => {
    switch(template) {
      case 'store-approval':
        return { bg: "#d1fae5", color: "#059669", text: "Approval" };
      case 'store-rejection':
        return { bg: "#fee2e2", color: "#dc2626", text: "Rejection" };
      default:
        return { bg: "#dbeafe", color: "#3b82f6", text: "General" };
    }
  };

  const handlePayment = (emailData) => {
    // Simulate payment process
    alert(`Payment of ₹${emailData.content.planPrice} initiated for ${emailData.content.storeName}!\n\nIn production, this would redirect to:\n${emailData.content.paymentLink}`);
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "350px",
      maxHeight: "500px",
      background: "white",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      zIndex: 1000,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: "12px 12px 0 0",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <Mail size={16} color="#1a1d23" />
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
          Store Owner Inbox
        </span>
        <span style={{
          marginLeft: "auto",
          background: "#3b82f6",
          color: "white",
          padding: "2px 8px",
          borderRadius: "10px",
          fontSize: "11px",
          fontWeight: "700"
        }}>
          {emails.length}
        </span>
      </div>

      {/* Email List */}
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {emails.length === 0 ? (
          <div style={{
            padding: "40px 16px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            <Mail size={32} color="#e5e7eb" style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0, fontSize: "12px" }}>No emails received yet</p>
          </div>
        ) : (
          emails.map((email, index) => {
            const badge = getEmailBadge(email.template);
            return (
              <div
                key={index}
                onClick={() => setSelectedEmail(email)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.target.style.background = "white"}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px"
                }}>
                  {getEmailIcon(email.template)}
                  <span style={{
                    fontSize: "11px",
                    background: badge.bg,
                    color: badge.color,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: "600"
                  }}>
                    {badge.text}
                  </span>
                  <span style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    marginLeft: "auto"
                  }}>
                    {new Date(email.receivedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#1a1d23",
                  lineHeight: "1.3"
                }}>
                  {email.subject}
                </p>
                <p style={{
                  margin: "2px 0 0",
                  fontSize: "10px",
                  color: "#6b7280"
                }}>
                  To: {email.to}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <>
          <div
            onClick={() => setSelectedEmail(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1001
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            borderRadius: "12px",
            padding: "0",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 1002,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            {/* Email Header */}
            <div style={{
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#f8fafc"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}>
                <div>
                  <h3 style={{
                    margin: "0 0 4px",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1a1d23"
                  }}>
                    {selectedEmail.subject}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    From: POS Pro System &lt;noreply@pos-pro.com&gt;
                  </p>
                  <p style={{
                    margin: "2px 0 0",
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    To: {selectedEmail.to}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  <X size={16} color="#6b7280" />
                </button>
              </div>
            </div>

            {/* Email Content */}
            <div style={{ padding: "20px" }}>
              {selectedEmail.template === 'store-approval' ? (
                <div>
                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    textAlign: "center"
                  }}>
                    <CheckCircle size={24} color="#059669" style={{ margin: "0 auto 8px" }} />
                    <h2 style={{
                      margin: "0 0 4px",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#059669"
                    }}>
                      Congratulations {selectedEmail.content.ownerName}!
                    </h2>
                    <p style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#166534"
                    }}>
                      Your store registration has been approved
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{
                      margin: "0 0 12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a1d23"
                    }}>
                      Store Details:
                    </h4>
                    <div style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "6px",
                      fontSize: "12px"
                    }}>
                      <p style={{ margin: "0 0 4px" }}>
                        <strong>Store:</strong> {selectedEmail.content.storeName}
                      </p>
                      <p style={{ margin: "0 0 4px" }}>
                        <strong>Plan:</strong> {selectedEmail.content.subscriptionPlan} - ₹{selectedEmail.content.planPrice}/year
                      </p>
                      <p style={{ margin: "0 0 4px" }}>
                        <strong>Features:</strong> {selectedEmail.content.planFeatures.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <div style={{
                    background: "#fef3c7",
                    border: "2px solid #f59e0b",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    marginBottom: "20px"
                  }}>
                    <CreditCard size={24} color="#92400e" style={{ margin: "0 auto 8px" }} />
                    <h4 style={{
                      margin: "0 0 8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#92400e"
                    }}>
                      Complete Your Payment
                    </h4>
                    <p style={{
                      margin: "0 0 12px",
                      fontSize: "12px",
                      color: "#92400e"
                    }}>
                      Pay ₹{selectedEmail.content.planPrice} to activate your POS system
                    </p>
                    <button
                      onClick={() => handlePayment(selectedEmail)}
                      style={{
                        padding: "12px 24px",
                        background: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        margin: "0 auto"
                      }}
                    >
                      <CreditCard size={16} />
                      Pay ₹{selectedEmail.content.planPrice}
                    </button>
                  </div>

                  <div style={{
                    background: "#f1f5f9",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#64748b"
                  }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600" }}>Next Steps:</p>
                    <p style={{ margin: "0 0 2px" }}>1. Complete payment above</p>
                    <p style={{ margin: "0 0 2px" }}>2. Receive login credentials</p>
                    <p style={{ margin: "0 0 2px" }}>3. Access your dashboard</p>
                    <p style={{ margin: 0 }}>4. Start setting up your store</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px"
                  }}>
                    <h4 style={{
                      margin: "0 0 8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#dc2626"
                    }}>
                      Registration Update
                    </h4>
                    <p style={{
                      margin: "0 0 8px",
                      fontSize: "14px",
                      color: "#374151"
                    }}>
                      Thank you for your interest in POS Pro for "{selectedEmail.content.storeName}".
                    </p>
                    <p style={{
                      margin: "0 0 8px",
                      fontSize: "12px",
                      color: "#dc2626",
                      fontWeight: "600"
                    }}>
                      Registration Status: Not Approved
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#374151"
                    }}>
                      <strong>Reason:</strong> {selectedEmail.content.reason}
                    </p>
                  </div>

                  <div style={{
                    background: "#f1f5f9",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#64748b"
                  }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600" }}>What's Next:</p>
                    <p style={{ margin: "0 0 2px" }}>• Review the feedback provided</p>
                    <p style={{ margin: "0 0 2px" }}>• Make necessary corrections</p>
                    <p style={{ margin: 0 }}>• Reapply when ready</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{
        padding: "8px 16px",
        borderTop: "1px solid #e5e7eb",
        background: "#f8fafc",
        borderRadius: "0 0 12px 12px",
        fontSize: "10px",
        color: "#6b7280",
        textAlign: "center"
      }}>
        📧 Store Owner Email Simulation
      </div>
    </div>
  );
}
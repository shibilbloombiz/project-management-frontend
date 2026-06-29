import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { Building, ArrowRight } from "lucide-react";

export default function PlanSelection({
  plans: propPlans = [],
  companyId,
  companyName,
  onPlanSelected
}) {
  const [plans, setPlans] = useState(propPlans);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [seats, setSeats] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setPlans(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch plans inside PlanSelection:", err));
  }, []);

  const currentPlans = useMemo(
    () => (plans || []).filter(Boolean).sort((a, b) => Number(a.price) - Number(b.price)),
    [plans]
  );

  useEffect(() => {
    if (currentPlans.length === 0) {
      setSelectedPlan("");
      return;
    }
    if (!currentPlans.some(p => p.name === selectedPlan)) {
      const firstPlan = currentPlans[0];
      setSelectedPlan(firstPlan.name);
      setSeats(firstPlan.maxUsers === 99999 ? 120 : firstPlan.maxUsers || 1);
    }
  }, [currentPlans, selectedPlan]);

  const handlePlanChange = name => {
    setSelectedPlan(name);
    const selected = currentPlans.find(p => p.name === name);
    if (selected) {
      setSeats(selected.maxUsers === 99999 ? 120 : selected.maxUsers);
    }
    setError("");
  };

  const loadRazorpayScript = src => {
    return new Promise(resolve => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async () => {
    setLoading(true);
    setError("");
    const token = sessionStorage.getItem("syncra_token");
    const selectedDetails = currentPlans.find(p => p.name === selectedPlan);
    const amountVal = selectedDetails ? selectedDetails.price : 0;
    if (!selectedDetails) {
      setError("No subscription plan is available. Please ask the super admin to publish a plan.");
      setLoading(false);
      return;
    }

    if (amountVal === 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            plan: selectedPlan,
            users: seats
          })
        });
        const data = await response.json();
        if (data.success) {
          onPlanSelected(selectedPlan);
        } else {
          setError(data.message || "Failed to select subscription plan.");
        }
      } catch (err) {
        console.error(err);
        setError("Connection to subscription node failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          planName: selectedPlan,
          amount: amountVal
        })
      });
      const orderData = await response.json();
      if (!orderData.success) {
        console.error("Razorpay order creation error details:", orderData);
        const detailedErr = orderData.error?.error?.description || orderData.error?.description || (orderData.error ? JSON.stringify(orderData.error) : "");
        setError((orderData.message || "Failed to initialize Razorpay checkout order.") + (detailedErr ? `: ${detailedErr}` : ""));
        setLoading(false);
        return;
      }

      if (orderData.isMock) {
        const confirmPay = window.confirm(`[DEVELOPER MOCK ORDER]: ${orderData.orderId}\nPlan: ${selectedPlan}\nAmount: ₹${amountVal.toLocaleString()} INR\n\nNo Razorpay credentials found in .env. Click OK to simulate checkout authorization.`);
        if (confirmPay) {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              companyId,
              planName: selectedPlan,
              amount: amountVal,
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
              razorpay_signature: "mock_signature"
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await fetch(`${API_BASE_URL}/api/companies/${companyId}/plan`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                plan: selectedPlan,
                users: seats
              })
            });
            onPlanSelected(selectedPlan);
          } else {
            setError(verifyData.message || "Verification of simulated payment failed.");
          }
        } else {
          setError("Payment checkout cancelled.");
        }
      } else {
        const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!scriptLoaded) {
          setError("Razorpay SDK failed to load. Check internet connectivity.");
          setLoading(false);
          return;
        }
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Syncra SaaS Platform",
          description: `Subscription package: ${selectedPlan}`,
          order_id: orderData.orderId,
          handler: async function (checkoutRes) {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  companyId,
                  planName: selectedPlan,
                  amount: amountVal,
                  razorpay_order_id: checkoutRes.razorpay_order_id,
                  razorpay_payment_id: checkoutRes.razorpay_payment_id,
                  razorpay_signature: checkoutRes.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                await fetch(`${API_BASE_URL}/api/companies/${companyId}/plan`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    plan: selectedPlan,
                    users: seats
                  })
                });
                onPlanSelected(selectedPlan);
              } else {
                setError(verifyData.message || "Payment signature verification failed.");
              }
            } catch (err) {
              console.error(err);
              setError("Failed to reach payment verification server.");
            }
          },
          prefill: {
            email: sessionStorage.getItem("syncra_email") || ""
          },
          theme: {
            color: "#6366f1"
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      setError("Checkout connection failed. Ensure backend API node is online.");
    } finally {
      setLoading(false);
    }
  };

  const currentPlanDetails = currentPlans.find(p => p.name === selectedPlan) || null;
  const calculatedTotal = currentPlanDetails ? Number(currentPlanDetails.price) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-205">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-8 relative z-10 text-left space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/30">
              Subscription Gate
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-2">
              Select Subscription Plan
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Confirm your workspace plan limits for <strong>{companyName || "Wayne Enterprises"}</strong>.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Plans Grid */}
        {currentPlans.length === 0 ? (
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
            No subscription plans are currently published by the super admin.
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentPlans.map(p => {
            const isSelected = selectedPlan === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePlanChange(p.name)}
                className={`border-2 rounded-2xl p-4 flex flex-col justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02] shadow-md shadow-indigo-100 dark:shadow-none scale-105"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 bg-white dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display truncate max-w-[80px]">
                      {p.name.split(" ")[0]}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-2 block">
                    {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()}`}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-tight min-h-[30px]">
                    {p.limit || `${p.maxUsers} Users`} limit
                  </p>
                </div>
                <ul className="space-y-1.5 mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[9px] font-bold text-slate-500">
                  <li className="flex items-start space-x-1">
                    <span className="text-emerald-500">•</span>
                    <span>Max {p.maxUsers === 99999 ? "Unlimited" : p.maxUsers} seats</span>
                  </li>
                  <li className="flex items-start space-x-1">
                    <span className="text-emerald-500">•</span>
                    <span>Max {p.maxProjects === 99999 ? "Unlimited" : p.maxProjects} projects</span>
                  </li>
                </ul>
              </button>
            );
          })}
        </div>
        )}

        {/* Workspace Seats config */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">
              Workspace Seat Count
            </span>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Configure the active employee roster count for this node.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min={1}
              max={currentPlanDetails ? currentPlanDetails.maxUsers || 5 : 5}
              disabled={selectedPlan.toLowerCase().includes("free")}
              value={seats}
              onChange={e => setSeats(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-center text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-105 disabled:text-slate-400 dark:disabled:bg-slate-950 dark:disabled:text-slate-600"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              {selectedPlan.toLowerCase().includes("free") ? "Capped at 5 seats" : "Roster seats"}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6 gap-4">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display block">
              Estimated Total billing
            </span>
            <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1 block">
              {calculatedTotal === 0 ? "Free" : `₹${calculatedTotal.toLocaleString()}`}
              {calculatedTotal > 0 && <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold ml-1">/month</span>}
            </span>
          </div>
          <button
            onClick={handleSelectPlan}
            disabled={loading || currentPlans.length === 0}
            className="w-full md:w-auto px-8 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2"
          >
            <span>{calculatedTotal === 0 ? "Activate Workspace" : "Authorize via Razorpay"}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

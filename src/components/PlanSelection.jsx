import React, { useState } from "react";
import { API_BASE_URL } from "../config";
import { Check, ShieldAlert, Sparkles, Building, Layers, ArrowRight } from "lucide-react";
export default function PlanSelection({
  plans = [],
  companyId,
  companyName,
  onPlanSelected
}) {
  const [selectedPlan, setSelectedPlan] = useState("Starter Package");
  const [seats, setSeats] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const defaultPlans = [{
    name: "Free",
    price: 0,
    limit: "5 Users",
    maxUsers: 5,
    maxProjects: 3,
    features: ["Limited capacity scope", "In-memory fallback store resilience", "Shared client portals"]
  }, {
    name: "Starter Package",
    price: 2500,
    limit: "15 Users",
    maxUsers: 15,
    maxProjects: 10,
    features: ["Starter PM modules", "Daily persistent checkpoints", "SaaS client gateways"]
  }, {
    name: "Scale Package Tier",
    price: 8900,
    limit: "50 Users",
    maxUsers: 50,
    maxProjects: 30,
    features: ["Automated shift attendance logs", "Excel/CSV download reports", "Soft-delete trash bin"]
  }, {
    name: "Enterprise SaaS Tier",
    price: 25000,
    limit: "Unlimited Users",
    maxUsers: 99999,
    maxProjects: 99999,
    features: ["SLA dashboard nodes", "Custom corporate domain config", "Dedicated technical support"]
  }];
  const currentPlans = plans && plans.length > 0 ? [...plans].sort((a, b) => a.price - b.price) : defaultPlans;
  const handlePlanChange = name => {
    setSelectedPlan(name);
    const selected = currentPlans.find(p => p.name === name);
    if (selected) {
      setSeats(selected.maxUsers === 99999 ? 120 : selected.maxUsers);
    }
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
        setError(orderData.message || "Failed to initialize Razorpay checkout order.");
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
  const currentPlanDetails = currentPlans.find(p => p.name === selectedPlan) || defaultPlans[1];
  const calculatedTotal = currentPlanDetails ? currentPlanDetails.price : 2500;
  return <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"> {} <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div> <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div> <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 relative z-10 text-left space-y-6"> {} <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4"> <div> <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100"> Step 2: Choose Plan </span> <h2 className="text-xl font-extrabold text-slate-900 font-display mt-2"> Select Subscription Plan </h2> <p className="text-xs text-slate-400 font-semibold mt-1"> Confirm your workspace plan limits for <strong>{companyName || "Wayne Enterprises"}</strong>. </p> </div> <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shrink-0 text-xs"> <Building size={14} className="text-indigo-600 animate-pulse" /> <span className="font-extrabold text-slate-700">Company ID: {companyId}</span> </div> </div> {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl"> ⚠️ {error} </div>} {} <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {currentPlans.map(p => {
          const isSelected = selectedPlan === p.name;
          return <button key={p.name} type="button" onClick={() => handlePlanChange(p.name)} className={`border-2 rounded-2xl p-4 flex flex-col justify-between text-left transition-all cursor-pointer ${isSelected ? "border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-100 scale-105" : "border-slate-200 hover:border-slate-300 bg-white"}`}> <div> <div className="flex justify-between items-center mb-1"> <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-display truncate max-w-[80px]"> {p.name.split(" ")[0]} </span> {isSelected && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold"> ✓ </span>} </div> <span className="text-lg font-extrabold font-mono text-slate-900 mt-2 block"> {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()}`} </span> <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-tight min-h-[30px]"> {p.limit || `${p.maxUsers} Users`} limit </p> </div> <ul className="space-y-1.5 mt-4 border-t border-slate-100 pt-3 text-[9px] font-bold text-slate-500"> <li className="flex items-start space-x-1"> <span className="text-emerald-500">•</span> <span>Max {p.maxUsers === 99999 ? "Unlimited" : p.maxUsers} seats</span> </li> <li className="flex items-start space-x-1"> <span className="text-emerald-500">•</span> <span>Max {p.maxProjects === 99999 ? "Unlimited" : p.maxProjects} projects</span> </li> </ul> </button>;
        })} </div> {} <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-700"> <div className="space-y-1"> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-display"> Workspace Seat Count </span> <p className="text-slate-500 font-medium"> Configure the active employee roster count for this node. </p> </div> <div className="flex items-center space-x-3"> <input type="number" min={1} max={currentPlanDetails ? currentPlanDetails.maxUsers || 5 : 5} disabled={selectedPlan.toLowerCase().includes("free")} value={seats} onChange={e => setSeats(Math.max(1, Number(e.target.value)))} className="w-16 bg-white border border-slate-300 rounded-xl px-3 py-2 text-center text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" /> <span className="text-[10px] text-slate-400 font-bold"> {selectedPlan.toLowerCase().includes("free") ? "Capped at 5 seats" : "Roster seats"} </span> </div> </div> {} <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-200 pt-6 gap-4"> <div className="text-center md:text-left"> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block"> Estimated Total billing </span> <span className="text-2xl font-extrabold font-display text-slate-900 tracking-tight mt-1 block"> {calculatedTotal === 0 ? "Free" : `₹${calculatedTotal.toLocaleString()}`} {calculatedTotal > 0 && <span className="text-xs text-slate-400 font-semibold ml-1">/month</span>} </span> </div> <button onClick={handleSelectPlan} disabled={loading} className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-100 flex items-center justify-center space-x-2"> <span>{calculatedTotal === 0 ? "Activate Workspace" : "Authorize via Razorpay"}</span> <ArrowRight size={14} /> </button> </div> </div> </div>;
}

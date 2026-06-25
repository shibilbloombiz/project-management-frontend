import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { ArrowLeft, Building2, User, Mail, Sparkles, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, Check, CreditCard, ShieldCheck, Phone, MapPin, Camera, Trash2 } from "lucide-react";
import { REGISTRATION_PLANS } from "./companyRegister/plans";
export default function CompanyRegister({
  defaultPlan,
  onCancel,
  onRegisterSuccess,
  onGoToLogin
}) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan || "Starter Package");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [autopay, setAutopay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  useEffect(() => {
    const handleClassChange = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    const observer = new MutationObserver(handleClassChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  const plans = REGISTRATION_PLANS;
  const currentPlanDetails = plans.find(p => p.name === selectedPlan) || plans[1];
  const calculatedTotal = currentPlanDetails.price;
  const seats = currentPlanDetails.maxUsers;
  useEffect(() => {
    if (step === 2) {
      if (!billingName) setBillingName(name);
      if (!billingEmail) setBillingEmail(adminEmail);
    }
  }, [step]);
  const handlePlanChange = name => {
    setSelectedPlan(name);
  };
  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo image must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const removeLogo = () => {
    setLogo("");
    setLogoPreview(null);
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
  const validateForm = () => {
    if (!name.trim()) return "Company name is required.";
    if (name.trim().length < 2) return "Company name must be at least 2 characters.";
    if (!adminName.trim()) return "Administrator full name is required.";
    if (!adminEmail.trim()) return "Administrator email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) return "Please enter a valid email address.";
    if (!billingName.trim()) return "Billing/Invoiced name is required.";
    if (!billingEmail.trim()) return "Billing notification email is required.";
    if (!emailRegex.test(billingEmail.trim())) return "Please enter a valid billing email address.";
    if (!billingPhone.trim()) return "Billing contact phone number is required.";
    if (!billingAddress.trim()) return "Billing street address is required.";
    return "";
  };
  const handleCheckoutAndRegister = async e => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }
    setError("");
    setLoading(true);
    const registrationPayload = {
      name: name.trim(),
      desc: desc.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      plan: selectedPlan.replace(" Package", "").replace(" Package Tier", "").replace(" SaaS Tier", ""),
      users: seats,
      billing: calculatedTotal,
      billingName: billingName.trim(),
      billingEmail: billingEmail.trim().toLowerCase(),
      billingPhone: billingPhone.trim(),
      billingAddress: billingAddress.trim(),
      logo: logo,
      autopay: autopay
    };
    if (calculatedTotal === 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/companies/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registrationPayload)
        });
        const data = await response.json();
        if (data.success) {
          setRegisteredEmail(adminEmail.trim().toLowerCase());
          setSuccess(true);
          setTimeout(() => {
            onRegisterSuccess(adminEmail.trim().toLowerCase());
          }, 4000);
        } else {
          setError(data.message || "Free registration failed.");
        }
      } catch (err) {
        console.error(err);
        setError("Server network error. Verify that backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planName: selectedPlan,
          amount: calculatedTotal
        })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.message || "Failed to initialize Razorpay checkout order.");
        setLoading(false);
        return;
      }
      if (orderData.isMock) {
        const confirmPay = window.confirm(`[DEVELOPER CHECKOUT MOCK]: ${orderData.orderId}\nPlan: ${selectedPlan}\nAmount: ₹${calculatedTotal.toLocaleString()} INR\n\nNo keys defined in backend .env. Click OK to simulate capturing transaction.`);
        if (confirmPay) {
          const payload = {
            ...registrationPayload,
            paymentId: `pay_mock_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            razorpay_order_id: orderData.orderId,
            razorpay_signature: "mock_signature"
          };
          const response = await fetch(`${API_BASE_URL}/api/companies/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (data.success) {
            setRegisteredEmail(adminEmail.trim().toLowerCase());
            setSuccess(true);
            setTimeout(() => {
              onRegisterSuccess(adminEmail.trim().toLowerCase());
            }, 4000);
          } else {
            setError(data.message || "Simulated checkout registration failed.");
          }
        } else {
          setError("Payment authorization aborted.");
        }
        setLoading(false);
      } else {
        const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!scriptLoaded) {
          setError("Razorpay SDK failed to compile. Ensure network connectivity.");
          setLoading(false);
          return;
        }
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Syncra SaaS Portal",
          description: `Subscription package: ${selectedPlan}`,
          order_id: orderData.orderId,
          handler: async function (checkoutRes) {
            try {
              const payload = {
                ...registrationPayload,
                paymentId: checkoutRes.razorpay_payment_id,
                razorpay_order_id: checkoutRes.razorpay_order_id,
                razorpay_signature: checkoutRes.razorpay_signature
              };
              const response = await fetch(`${API_BASE_URL}/api/companies/register`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
              });
              const data = await response.json();
              if (data.success) {
                setRegisteredEmail(adminEmail.trim().toLowerCase());
                setSuccess(true);
                setTimeout(() => {
                  onRegisterSuccess(adminEmail.trim().toLowerCase());
                }, 4000);
              } else {
                setError(data.message || "Registration verification captured error.");
              }
            } catch (err) {
              console.error(err);
              setError("Failed to reach payment capture server.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: adminName,
            email: adminEmail,
            contact: billingPhone
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
      setError("Checkout failed. Make sure the backend port 5000 is running.");
      setLoading(false);
    }
  };
  if (success) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-200"> <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div> <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div> <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-10 text-center space-y-6 relative z-10"> <div className="flex justify-center"> <span className="inline-flex p-5 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-full text-emerald-500 shadow-sm animate-pulse"> <CheckCircle2 size={40} /> </span> </div> <div className="space-y-2"> <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight"> Workspace Deployed! </h3> <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed"> Your company <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span> is registered with the <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedPlan}</span>. </p> </div> <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-left space-y-1.5"> <div className="flex items-center space-x-2"> <Mail size={14} className="text-indigo-500 flex-shrink-0" /> <span className="text-xs font-bold text-indigo-700 dark:text-indigo-455">Activation details dispatched to:</span> </div> <p className="text-xs text-indigo-600 dark:text-indigo-350 font-semibold pl-5 break-all">{registeredEmail}</p> <p className="text-[10px] text-indigo-400 dark:text-indigo-500 pl-5 leading-normal"> Check your inbox for your login OTP verification code. Autopay recurring subscription status is active. </p> </div> <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400"> <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div> <span>Redirecting to login dashboard...</span> </div> <button onClick={() => onRegisterSuccess(registeredEmail)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl cursor-pointer transition-all shadow-md shadow-indigo-100 flex items-center justify-center space-x-2"> <span>Navigate to Login</span> <ArrowRight size={15} /> </button> </div> </div>;
  }
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200"> <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div> <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div> {} <button onClick={step === 2 ? () => setStep(1) : onCancel} className="absolute top-8 left-8 flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"> <ArrowLeft size={16} /> <span>{step === 2 ? "Back to pricing tiers" : "Return to Landing"}</span> </button> <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-8 relative z-10 text-left space-y-6"> {} <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4"> <div> <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/30"> {step === 1 ? "Step 1: Choose Subscription Plan" : "Step 2: Company Billing details"} </span> <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-2"> {step === 1 ? "Select Your Workspace Pricing Tier" : "Complete Registration Details"} </h2> <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1"> Configure plan capacity and invoice parameters for your company tenant database. </p> </div> <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 rounded-xl shrink-0 text-xs text-slate-500"> <Building2 size={14} className="text-indigo-600 animate-pulse" /> <span className="font-extrabold text-slate-700 dark:text-slate-300">Secure Deploy</span> </div> </div> {error && <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-1.5"> <AlertCircle size={14} className="flex-shrink-0 text-red-500" /> <span>{error}</span> </div>} {} {step === 1 && <div className="space-y-6 animate-fade-in"> {} <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {plans.map(p => {
            const isSelected = selectedPlan === p.name;
            return <button key={p.name} type="button" onClick={() => handlePlanChange(p.name)} className={`border-2 rounded-2xl p-4 flex flex-col justify-between text-left transition-all cursor-pointer ${isSelected ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-md shadow-indigo-100 dark:shadow-none scale-105" : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"}`}> <div> <div className="flex justify-between items-center mb-1"> <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display truncate max-w-[80px]"> {p.name.split(" ")[0]} </span> {isSelected && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold"> ✓ </span>} </div> <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-2 block"> {p.price === 0 ? "Free" : `₹${p.price.toLocaleString()} INR`} </span> <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold mt-1 leading-tight min-h-[30px]"> {p.limit} capacity limit </p> </div> <ul className="space-y-1.5 mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[9px] font-bold text-slate-500"> <li className="flex items-start space-x-1"> <span className="text-emerald-500">•</span> <span>Max {p.maxUsers === 99999 ? "Unlimited" : p.maxUsers} seats</span> </li> <li className="flex items-start space-x-1"> <span className="text-emerald-500">•</span> <span>Max {p.maxProjects === 99999 ? "Unlimited" : p.maxProjects} projects</span> </li> </ul> </button>;
          })} </div> {} <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350"> <div className="space-y-1"> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-display"> Included Roster Capacity </span> <p className="text-slate-500 dark:text-slate-455 font-medium"> Seat capacity is controlled by the selected plan and cannot be edited during checkout. </p> </div> <div className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-800 dark:text-white"> {seats === 99999 ? "Unlimited" : seats} seats </div> </div> {} <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6 gap-4"> <div className="text-center sm:text-left"> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest font-display block"> Estimated Total Billing </span> <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1 block"> {calculatedTotal === 0 ? "Free Workspace" : `₹${calculatedTotal.toLocaleString()} INR`} {calculatedTotal > 0 && <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold ml-1">/month</span>} </span> </div> <button onClick={() => setStep(2)} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2"> <span>Proceed to Billing Details</span> <ArrowRight size={14} /> </button> </div> </div>} {} {step === 2 && <form onSubmit={handleCheckoutAndRegister} className="space-y-6 animate-fade-in font-semibold text-xs text-slate-700 dark:text-slate-350"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {} <div className="space-y-4"> <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl"> <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">1. Organization Registry</h3> <div className="space-y-3"> <div> <label htmlFor="company-name" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Company Name * </label> <input id="company-name" type="text" required placeholder="e.g. Wayne Enterprises" value={name} onChange={e => {
                    setName(e.target.value);
                    setError("");
                  }} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> <div> <label htmlFor="company-desc" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Organization Summary </label> <textarea id="company-desc" rows={2} placeholder="Core focus, logistics scope..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" /> </div> </div> </div> <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl"> <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">2. Admin User Node</h3> <div className="space-y-3"> <div> <label htmlFor="admin-name" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Administrator Full Name * </label> <input id="admin-name" type="text" required placeholder="e.g. Bruce Wayne" value={adminName} onChange={e => {
                    setAdminName(e.target.value);
                    setError("");
                  }} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> <div> <label htmlFor="admin-email" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Administrator Work Email * </label> <input id="admin-email" type="email" required placeholder="e.g. bruce@wayne.com" value={adminEmail} onChange={e => {
                    setAdminEmail(e.target.value);
                    setError("");
                  }} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> </div> </div> </div> {} <div className="space-y-4"> <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl"> <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">3. Billing & Invoice details</h3> <div className="space-y-3"> {} <div> <span className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display"> Company Logo Image (Optional) </span> <div className="flex items-center space-x-4"> <div className="w-14 h-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative group"> {logoPreview ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" /> : <Camera size={18} className="text-slate-400" />} </div> <div className="space-y-1"> <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold rounded-lg cursor-pointer text-slate-750 dark:text-slate-250 transition-colors border border-slate-250 dark:border-slate-700 inline-block"> Select File <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /> </label> {logoPreview && <button type="button" onClick={removeLogo} className="text-[9px] font-bold text-red-500 hover:underline block pl-1 cursor-pointer"> Remove </button>} </div> </div> </div> <div className="grid grid-cols-2 gap-3"> <div> <label htmlFor="bill-name" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Invoiced Name * </label> <input id="bill-name" type="text" required placeholder="e.g. Wayne Corp Accounts" value={billingName} onChange={e => setBillingName(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> <div> <label htmlFor="bill-email" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Billing Email * </label> <input id="bill-email" type="email" required placeholder="e.g. billing@wayne.com" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> </div> <div> <label htmlFor="bill-phone" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Billing Phone * </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400"> <Phone size={13} /> </span> <input id="bill-phone" type="tel" required placeholder="+91 99999 99999" value={billingPhone} onChange={e => setBillingPhone(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> </div> <div> <label htmlFor="bill-address" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 font-display"> Invoiced Street Address * </label> <div className="relative"> <span className="absolute top-2.5 left-2.5 text-slate-400"> <MapPin size={13} /> </span> <textarea id="bill-address" rows={2} required placeholder="Building, Street name, State, Pincode" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" /> </div> </div> </div> </div> {} <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between"> <div className="space-y-0.5"> <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Autopay Subscription Billing</span> <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal"> Enable automated card debit processing for monthly renewals. </p> </div> <label className="relative inline-flex items-center cursor-pointer"> <input type="checkbox" checked={autopay} onChange={e => setAutopay(e.target.checked)} className="sr-only peer" /> <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650"></div> </label> </div> </div> </div> {} <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-200 pt-6"> <div className="space-y-1"> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-display"> Checkout Summary invoice </span> <div className="flex items-baseline space-x-2"> <span className="text-xl font-black text-slate-850 dark:text-slate-100"> {calculatedTotal === 0 ? "Free Plan" : `₹${calculatedTotal.toLocaleString()} INR`} </span> <span className="text-[10px] text-slate-450 dark:text-slate-500"> - {seats} roster seats permitted </span> </div> </div> <div className="flex items-center space-x-3 w-full md:w-auto"> <button type="button" onClick={() => setStep(1)} disabled={loading} className="flex-1 md:flex-none px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-250 font-bold text-xs rounded-xl cursor-pointer transition-colors"> Cancel </button> <button type="submit" disabled={loading} className="flex-[2] md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center space-x-2"> {loading ? <> <Loader2 size={13} className="animate-spin" /> <span>Creating workspace...</span> </> : <> <ShieldCheck size={14} /> <span>{calculatedTotal === 0 ? "Register Workspace" : "Pay & Deploy Workspace"}</span> </>} </button> </div> </div> </form>} </div> </div>;
}

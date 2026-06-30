import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentSubscription, createSubscriptionOrder, verifyPayment, cancelSubscription } from '../api/subscriptions.js';
import toast from 'react-hot-toast';

export default function Subscription() {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'basic', price: 0, yearlyPrice: 0, label: 'Basic', desc: 'For solo tailors starting out.',
      features: ['Up to 50 orders/month', 'Basic Customer Directory', 'SMS Notifications'],
    },
    {
      name: 'pro', price: 499, yearlyPrice: 4790, label: 'Pro', desc: 'The gold standard for growing shops.', popular: true,
      features: ['Unlimited Orders', 'WhatsApp Bills & Alerts', 'Measurement History', 'Inventory Management'],
    },
    {
      name: 'enterprise', price: 1299, yearlyPrice: 12470, label: 'Enterprise', desc: 'For large boutiques & teams.', bestValue: true,
      features: ['Multi-Staff Accounts (up to 5)', 'Advanced Business Analytics', 'Automated Staff Payroll', 'Priority Call Support'],
    },
  ];

  useEffect(() => {
    getCurrentSubscription()
      .then(({ data }) => {
        setSubscription(data.subscription);
        setCurrentPlan(data.plan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planName) => {
    try {
      const { data } = await createSubscriptionOrder({ planName, period: isYearly ? 'yearly' : 'monthly' });

      if (window.Razorpay) {
        const options = {
          key: 'mock_key',
          amount: data.order.amount,
          currency: 'INR',
          name: 'DarziBook',
          description: `${planName} Plan`,
          order_id: data.order.id,
          handler: async (response) => {
            try {
              await verifyPayment({ ...response, planName });
              toast.success('Subscription activated!');
              const res = await getCurrentSubscription();
              setSubscription(res.data.subscription);
              setCurrentPlan(res.data.plan);
            } catch {
              toast.error('Payment verification failed');
            }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await verifyPayment({
          razorpay_order_id: data.order.id,
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          planName,
        });
        toast.success('Subscription activated!');
        const res = await getCurrentSubscription();
        setSubscription(res.data.subscription);
        setCurrentPlan(res.data.plan);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(t('common.confirm'))) return;
    try {
      await cancelSubscription();
      toast.success('Subscription cancelled');
      const res = await getCurrentSubscription();
      setSubscription(res.data.subscription);
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 pt-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] font-bold text-[13px] tracking-wide uppercase mb-6 shadow-sm border border-[#1e3a8a]/20">
          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
          Premium Plans
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-5 tracking-tight">Upgrade Your Workshop</h2>
        <p className="text-lg text-slate-500">
          Scale your tailoring business with powerful tools designed for modern craftsmanship.
        </p>
      </div>

      {/* Current subscription status */}
      {subscription && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('subscription.current')}</p>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-slate-800 capitalize">{currentPlan?.name}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                  subscription.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  subscription.status === 'trialing' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {t(`subscription.${subscription.status}`)}
                </span>
              </div>
              {subscription.trialEndsAt && (
                <p className="text-sm font-medium text-slate-500 mt-1">Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          {subscription.status !== 'cancelled' && (
            <button 
              onClick={handleCancel}
              className="px-5 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors font-semibold text-sm shadow-sm"
            >
              Cancel Plan
            </button>
          )}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-6 py-4">
        <span className={`text-base font-semibold transition-colors ${!isYearly ? 'text-slate-800' : 'text-slate-400'}`}>Monthly</span>
        <button
          className={`w-16 h-8 rounded-full p-1 relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] ${isYearly ? 'bg-[#1e3a8a]' : 'bg-slate-300'}`}
          onClick={() => setIsYearly(!isYearly)}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 transform ${isYearly ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-base font-semibold transition-colors ${isYearly ? 'text-slate-800' : 'text-slate-400'}`}>Yearly</span>
          <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse uppercase tracking-wider">SAVE 20%</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 sm:px-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.name === plan.name;
          const displayPrice = isYearly ? plan.yearlyPrice : plan.price;
          const displayPeriod = isYearly ? '/yr' : '/mo';
          const yearlySavings = plan.price > 0 ? `SAVE ₹${plan.price * 12 - plan.yearlyPrice}` : null;
          
          const isPopular = plan.popular;
          const cardClasses = isPopular 
            ? "bg-gradient-to-b from-[#1e3a8a] to-[#152a66] text-white rounded-xl p-8 flex flex-col h-full relative z-10 shadow-[0_20px_40px_-10px_rgba(30,58,138,0.4)] md:scale-105 border border-[#1e3a8a]"
            : "bg-white rounded-xl p-8 flex flex-col h-full border border-slate-200 shadow-sm hover:border-[#1e3a8a]/30 hover:shadow-lg transition-all relative";

          return (
            <div key={plan.name} className={cardClasses}>
              {/* Badges */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[11px] font-bold shadow-lg uppercase tracking-wider border border-amber-300">
                  Most Popular
                </div>
              )}
              {!isPopular && plan.bestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm uppercase tracking-wider border border-indigo-200">
                  Best Value
                </div>
              )}

              <div className="mb-6 mt-4">
                <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-slate-800'}`}>{plan.label}</h3>
                <p className={`text-[13px] font-medium ${isPopular ? 'text-slate-200' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${isPopular ? 'text-white' : 'text-slate-800'}`}>₹{displayPrice.toLocaleString()}</span>
                  <span className={`text-lg font-medium ${isPopular ? 'text-slate-300' : 'text-slate-400'}`}>{displayPeriod}</span>
                </div>
                {yearlySavings && isYearly && (
                  <div className={`text-[11px] font-bold mt-2 inline-block px-2 py-1 rounded-md tracking-wider uppercase ${isPopular ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                    {yearlySavings}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${isPopular ? 'text-blue-300' : 'text-[#1e3a8a]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className={`text-[14px] font-medium leading-tight ${isPopular ? 'text-slate-100' : 'text-slate-700'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button className={`w-full py-3 px-6 rounded-lg font-bold text-[14px] transition-all cursor-default ${
                  isPopular 
                    ? 'bg-blue-900/50 text-white border border-blue-800' 
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                }`}>
                  Current Plan
                </button>
              ) : plan.price === 0 ? (
                <button className="w-full py-3 px-6 rounded-lg font-bold text-[14px] bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed">
                  Free Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-[14px] transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    isPopular
                      ? 'bg-white text-[#1e3a8a] hover:bg-slate-50 hover:shadow-lg'
                      : 'bg-[#1e3a8a] text-white hover:bg-[#152a66] hover:shadow-lg'
                  }`}
                >
                  Choose {plan.label} Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center items-center gap-12 opacity-70 hover:opacity-100 transition-opacity duration-300 pt-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-full text-slate-600"><span className="material-symbols-outlined text-[24px]">security</span></div>
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Secure Payments</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-full text-slate-600"><span className="material-symbols-outlined text-[24px]">verified_user</span></div>
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Data Privacy</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-full text-slate-600"><span className="material-symbols-outlined text-[24px]">support_agent</span></div>
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">24/7 Support</span>
        </div>
      </div>
    </div>
  );
}

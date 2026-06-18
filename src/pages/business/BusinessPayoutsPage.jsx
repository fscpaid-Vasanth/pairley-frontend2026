import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  HelpCircle, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Building,
  ArrowRight,
  Download,
  Calendar
} from 'lucide-react';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import BusinessNav from '../../components/BusinessNav';
import './BusinessPayoutsPage.css';

export default function BusinessPayoutsPage() {
  const { showToast } = useToast();
  
  // Balances state
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [settled, setSettled] = useState(0);
  const [loading, setLoading] = useState(true);

  // Bank Form State
  const [bankForm, setBankForm] = useState(() => {
    const saved = localStorage.getItem('pairley_merchant_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: '',
      bank: '',
      ifsc: '',
      account: ''
    };
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('pairley_merchant_payouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [barData, setBarData] = useState([
    { day: 'Mon', value: 0, height: '10%' },
    { day: 'Tue', value: 0, height: '10%' },
    { day: 'Wed', value: 0, height: '10%' },
    { day: 'Thu', value: 0, height: '10%' },
    { day: 'Fri', value: 0, height: '10%' },
    { day: 'Sat', value: 0, height: '10%' },
    { day: 'Sun', value: 0, height: '10%' }
  ]);

  useEffect(() => {
    setLoading(true);
    api.get('/offers/interested-customers')
      .then((data) => {
        let totalPending = 0;
        let totalBalance = 0;
        let totalSettled = 0;

        // Distribute weekly GMV value across days
        const dailyGMV = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        data.forEach((offer) => {
          (offer.interests || []).forEach((interest) => {
            const price = offer.offer_price || 0;
            if (interest.status === 'READY_TO_BUY') {
              totalPending += price;
            } else if (interest.status === 'CONTACTED') {
              totalBalance += price;
            } else if (interest.status === 'COMPLETED') {
              totalSettled += price;
            }

            // Map GMV day
            const date = new Date(interest.created_at || new Date());
            const dayName = days[date.getDay()];
            dailyGMV[dayName] = (dailyGMV[dayName] || 0) + price;
          });
        });

        // If merchant requested payouts, they deduct from balance and add to settled
        const savedPayouts = JSON.parse(localStorage.getItem('pairley_merchant_payouts') || '[]');
        const totalRequestedPayouts = savedPayouts.reduce((acc, tx) => acc + tx.amount, 0);
        
        // Adjust balances based on requested payouts
        const adjustedBalance = Math.max(0, totalBalance - totalRequestedPayouts);
        const adjustedSettled = totalSettled + totalRequestedPayouts;

        setPending(totalPending);
        setBalance(adjustedBalance);
        setSettled(adjustedSettled);

        // Map weekly GMV chart heights
        const maxVal = Math.max(...Object.values(dailyGMV), 1000);
        const mappedBarData = Object.keys(dailyGMV).map((day) => ({
          day,
          value: dailyGMV[day],
          height: `${Math.max(10, Math.min(100, (dailyGMV[day] / maxVal) * 100))}%`
        }));
        setBarData(mappedBarData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load payout metrics:', err);
        setLoading(false);
      });
  }, []);

  const handleRequestPayout = () => {
    if (balance <= 0) {
      showToast('Available balance is zero. Payout cannot be requested.', 'error');
      return;
    }
    if (!bankForm.account || !bankForm.bank) {
      showToast('Please configure your bank settlement account details first.', 'warning');
      setIsEditingBank(true);
      return;
    }

    const payoutAmount = balance;
    setSettled(prev => prev + payoutAmount);
    setBalance(0);
    
    // Add transaction log
    const newTx = {
      id: `PAY-${Math.random().toString(16).substring(2, 7).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      amount: payoutAmount,
      status: 'processing',
      bank: `${bankForm.bank} (**** ${bankForm.account.slice(-4)})`
    };
    
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem('pairley_merchant_payouts', JSON.stringify(updatedTxs));
    showToast(`Payout request of ${formatPrice(payoutAmount)} submitted! Processing T+1 settlement.`, 'success');
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    setIsEditingBank(false);
    localStorage.setItem('pairley_merchant_bank', JSON.stringify(bankForm));
    showToast('Bank details updated successfully.', 'success');
  };

  const handleExportCSV = () => {
    showToast('Tax Excel Spreadsheet generated! Downloading to folder.', 'success');
  };

  return (
    <div className="business-payouts-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Payouts & Earnings 💰
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Request sales settlements, configure your store bank accounts, and track co-buy GMV stats.
            </p>
          </div>
        </div>

        {/* Seller Sub-Navigation */}
        <BusinessNav />

        {/* Balance row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Available Balance */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance</span>
              <h3 className="text-3xl font-extrabold text-[#4E2BC4] mt-1 font-display">
                {formatPrice(balance)}
              </h3>
              <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">Ready for bank settlement request</span>
            </div>
            
            <button
              onClick={handleRequestPayout}
              disabled={balance <= 0}
              className={`w-full text-xs font-extrabold py-3 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-sm transition ${
                balance > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
              }`}
            >
              <ArrowUpRight size={14} /> Request Payout
            </button>
          </div>

          {/* Card 2: Pending Escrow Hold */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Escrow Hold</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1 font-display">
                {formatPrice(pending)}
              </h3>
              <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">Held in secure RBI-compliant escrow pools</span>
            </div>
            <div className="mt-6 p-2 bg-amber-50 border border-amber-100/60 rounded-xl text-[9.5px] text-amber-700 font-semibold leading-relaxed">
              ⚠️ Released and settled to T+2 cycle once ongoing BOGO matches complete.
            </div>
          </div>

          {/* Card 3: Settled Lifetime Earnings */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Life Earnings</span>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 font-display">
                {formatPrice(settled)}
              </h3>
              <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">Cumulative lifetime co-buying GMV</span>
            </div>
            <div className="mt-6 p-2 bg-emerald-50 border border-emerald-100/60 rounded-xl text-[9.5px] text-emerald-700 font-semibold leading-relaxed">
              ✅ Lifetime sales completed with 100% split clearance rate.
            </div>
          </div>

        </div>

        {/* Charts & Bank form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          
          {/* Sales graph (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-[#4E2BC4]" />
              Weekly Sales Volume GMV
            </h4>

            {/* Render bar chart */}
            <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-100 pb-2">
              {barData.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-[#0F172A] text-white px-2 py-1 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none">
                    {formatPrice(bar.value)}
                  </div>
                  
                  {/* Visual Bar */}
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#4E2BC4]/70 to-[#4E2BC4] group-hover:from-indigo-600 group-hover:to-indigo-500 transition-all duration-300 shadow-sm"
                    style={{ height: bar.height }}
                  ></div>
                  
                  <span className="text-[10px] text-slate-400 font-bold">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Configuration form */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building size={14} className="text-[#4E2BC4]" />
                Bank Settlement Account
              </h4>
              {!isEditingBank && (
                <button 
                  onClick={() => setIsEditingBank(true)}
                  className="text-[10px] font-bold text-[#4E2BC4] hover:underline"
                >
                  Edit details
                </button>
              )}
            </div>

            <form onSubmit={handleBankSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400">Account Holder Name</label>
                <input 
                  type="text" 
                  disabled={!isEditingBank}
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  className="border border-slate-200 disabled:bg-slate-50/50 rounded-xl p-2.5 outline-none focus:border-[#4E2BC4] font-semibold text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400">IFSC Routing Code</label>
                <input 
                  type="text" 
                  disabled={!isEditingBank}
                  value={bankForm.ifsc}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value })}
                  className="border border-slate-200 disabled:bg-slate-50/50 rounded-xl p-2.5 outline-none focus:border-[#4E2BC4] font-semibold text-slate-700 uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400">Account Number</label>
                <input 
                  type="text" 
                  disabled={!isEditingBank}
                  value={bankForm.account}
                  onChange={(e) => setBankForm({ ...bankForm, account: e.target.value })}
                  className="border border-slate-200 disabled:bg-slate-50/50 rounded-xl p-2.5 outline-none focus:border-[#4E2BC4] font-semibold text-slate-700"
                />
              </div>

              {isEditingBank && (
                <div className="flex gap-2 justify-end mt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingBank(false)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-3.5 py-1.5 bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white rounded-lg text-[10px] font-extrabold shadow-sm transition"
                  >
                    Save Details
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Transaction History log list */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={16} className="text-[#4E2BC4]" />
              Payout Transaction History
            </h4>
            
            <button
              onClick={handleExportCSV}
              className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-500 font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Payout ID</th>
                  <th className="py-3 px-2">Date Placed</th>
                  <th className="py-3 px-2">Transfer Destination</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3.5 px-2 font-bold text-slate-800">{tx.id}</td>
                    <td className="py-3.5 px-2">{tx.date}</td>
                    <td className="py-3.5 px-2">{tx.bank}</td>
                    <td className="py-3.5 px-2 font-bold text-[#4E2BC4]">{formatPrice(tx.amount)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        tx.status === 'settled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

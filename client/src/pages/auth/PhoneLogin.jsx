import React, { useContext, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const PhoneLogin = () => {
  const { sendPhoneOtp, verifyPhoneOtp, navigate } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const runCooldown = (seconds) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const data = await sendPhoneOtp({ phoneNumber });
      if (data.success) {
        toast.success(data.message);
        runCooldown(data.cooldownSeconds || 60);
        setStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const data = await verifyPhoneOtp({ phoneNumber, otp, name });
      if (data.success) {
        toast.success(data.message);
        setStep(3);
        setTimeout(() => navigate("/"), 1200);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-orange-100 p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Phone authentication</h1>
        {step === 1 && (
          <div className="mt-5 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name (new user)" className="w-full border rounded-lg px-3 py-2.5 outline-orange-500" />
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1XXXXXXXXXX" className="w-full border rounded-lg px-3 py-2.5 outline-orange-500" />
            <button onClick={handleSendOtp} disabled={loading} className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold disabled:bg-orange-300 flex justify-center items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Send OTP
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="mt-5 space-y-3">
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full border rounded-lg px-3 py-2.5 outline-orange-500 tracking-[0.3em]" maxLength={6} />
            <button onClick={handleVerify} disabled={loading} className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold disabled:bg-orange-300 flex justify-center items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Verify OTP
            </button>
            <div className="flex justify-between text-sm">
              <button onClick={() => setStep(1)} className="text-gray-600">Change number</button>
              <button onClick={handleSendOtp} disabled={cooldown > 0} className="text-orange-600 disabled:text-gray-400">
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}
        {step === 3 && <p className="mt-5 text-green-600 font-semibold">Authenticated successfully. Redirecting...</p>}
        <Link to="/login" className="block mt-5 text-sm text-orange-600 font-medium text-center">Back to login</Link>
      </div>
    </div>
  );
};

export default PhoneLogin;

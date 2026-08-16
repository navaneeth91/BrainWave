import React, { useContext, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const getStrength = (password) => {
  if (password.length < 8) return { label: "Weak", color: "bg-red-500", score: 30 };
  if (!/[A-Z]/.test(password) || !/\d/.test(password)) return { label: "Medium", color: "bg-yellow-500", score: 65 };
  return { label: "Strong", color: "bg-green-500", score: 100 };
};

const Register = () => {
  const { register, backendUrl, navigate } = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) return toast.error("Please accept terms and privacy policy");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      const data = await register({ name: form.name, email: form.email, password: form.password });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-black/90 grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center px-16 text-white bg-black">
        <h1 className="text-5xl font-bold leading-tight">Create your BrainWave account.</h1>
        <p className="text-zinc-300 mt-4">Start learning from top educators and earn certifications.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-7 shadow-2xl border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-900">Register</h2>
          <div className="mt-5 space-y-4">
            <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2.5 outline-orange-500" />
            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2.5 outline-orange-500" />
            <div className="border rounded-lg px-3 flex items-center">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full py-2.5 outline-none" />
              <button type="button" onClick={() => setShowPassword((p) => !p)}>{showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}</button>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`${strength.color} h-full`} style={{ width: `${strength.score}%` }} /></div>
            <p className="text-xs text-gray-500">Password strength: {strength.label}</p>
            <div className="border rounded-lg px-3 flex items-center">
              <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="w-full py-2.5 outline-none" />
              <button type="button" onClick={() => setShowConfirm((p) => !p)}>{showConfirm ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}</button>
            </div>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" />I agree to the terms and privacy policy.</label>
            <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold disabled:bg-orange-300 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Create account
            </button>
            <button type="button" onClick={() => window.location.assign(`${backendUrl}/api/auth/google`)} className="w-full border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50">Sign up with Google</button>
            <Link to="/phone-login" className="block text-center text-sm text-orange-600 font-medium">Sign up with Phone OTP</Link>
          </div>
          <p className="text-sm text-center mt-5">Already have an account? <Link to="/login" className="text-orange-600 font-semibold">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;

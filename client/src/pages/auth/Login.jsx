import React, { useContext, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const Login = () => {
  const { login, backendUrl, navigate, authLoading, isAuthenticated } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });

  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "success") toast.success("Google login successful");
    if (googleStatus === "failed") toast.error("Google login failed");
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate("/");
  }, [authLoading, isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      const response = await login({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      if (response.success) {
        toast.success(response.message);
        navigate("/");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-orange-950 text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center px-16">
        <img src={assets.logo} alt="BrainWave" className="w-56 mb-8" />
        <h1 className="text-5xl font-bold leading-tight">Welcome back to BrainWave.</h1>
        <p className="text-zinc-300 mt-4">Continue your learning journey and unlock new career opportunities.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white text-gray-900 rounded-2xl p-7 shadow-2xl border border-orange-100">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your courses and certificates.</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <div className="mt-1 flex items-center border rounded-lg px-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-2 py-2.5 outline-none rounded-lg" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <div className="mt-1 flex items-center border rounded-lg px-3">
                <Lock className="w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full px-2 py-2.5 outline-none rounded-lg" />
                <button type="button" onClick={() => setShowPassword((p) => !p)}>{showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}</button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm((p) => ({ ...p, rememberMe: e.target.checked }))} />Remember me</label>
              <Link to="/forgot-password" className="text-orange-600 font-semibold">Forgot password?</Link>
            </div>
            <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Login
            </button>
            <button type="button" onClick={() => window.location.assign(`${backendUrl}/api/auth/google`)} className="w-full border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50">Continue with Google</button>
            <Link to="/phone-login" className="block text-center text-sm text-orange-600 font-medium">Continue with Phone OTP</Link>
          </div>
          <p className="text-sm text-center mt-5">New to BrainWave? <Link to="/register" className="text-orange-600 font-semibold">Create account</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useContext, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ResetPassword = () => {
  const { resetPassword, navigate } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Invalid reset link");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      const data = await resetPassword({ token, password });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-orange-900 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-7 rounded-2xl border border-orange-100 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <div className="mt-5 space-y-4">
          <div className="border rounded-lg px-3 flex items-center">
            <input type={showPassword ? "text" : "password"} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-2.5 outline-none" />
            <button type="button" onClick={() => setShowPassword((p) => !p)}>{showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}</button>
          </div>
          <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 outline-orange-500" />
          <button disabled={loading} className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold disabled:bg-orange-300 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}Update password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

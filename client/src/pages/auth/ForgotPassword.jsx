import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await forgotPassword({ email });
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-7 rounded-2xl border border-orange-100 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your email and we will send a reset link.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-5 border rounded-lg px-3 py-2.5 outline-orange-500" placeholder="Email address" />
        <button disabled={loading} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-lg font-semibold disabled:bg-orange-300 flex justify-center items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}Send reset link
        </button>
        <Link to="/login" className="block mt-4 text-sm text-center text-orange-600 font-medium">Back to login</Link>
      </form>
    </div>
  );
};

export default ForgotPassword;

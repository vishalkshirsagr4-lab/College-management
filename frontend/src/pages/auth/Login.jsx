import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const data = res.data;

      login({ token: data.token, user: data.user });

      toast.success("Welcome back 👋");

      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-slate-900">
              Welcome Back
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to your College ERP system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full"
                required
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 transition"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} College ERP System
        </p>
      </div>
    </div>
  );
}
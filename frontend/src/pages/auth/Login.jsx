import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { notify } from "../../utils/toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post("/api/auth/login", {
      loginID,
      password,
    });

    const data = res.data;

    // Save auth data
    login({
      token: data.token,
      user: data.user,
    });

    notify.success("Welcome back 👋");

    console.log("Login Response:", data);
    console.log("User Role:", data?.user?.role);

    const role = data?.user?.role;

    // Redirect based on role
    if (role === "admin" || role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (role === "faculty" || role === "FACULTY") {
      navigate("/faculty", { replace: true });
    } else if (role === "student" || role === "STUDENT") {
      navigate("/student", { replace: true });
    } else {
      // fallback
      navigate("/explore-gateway", { replace: true });
    }
  } catch (err) {
    console.error(err?.response?.data);

    notify.error(
      err?.response?.data?.message || "Invalid Login ID or Password"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              KLE BCA COLLEGE
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your College Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Login ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Login ID
              </label>

              <Input
                type="text"
                value={loginID}
                onChange={(e) => setLoginID(e.target.value)}
                placeholder="STU001 / FAC001 / ADMIN001"
                className="w-full"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition"
            >
              {loading ? "Signing In..." : "Login"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} KLE BCA COLLEGE. All rights reserved.
        </p>
      </div>
    </div>
  );
}
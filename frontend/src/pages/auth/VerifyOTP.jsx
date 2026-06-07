import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { pendingAuth, setAuthState, clearPendingAuth } = useAuth();

  const [code, setCode] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (!pendingAuth?.email || !pendingAuth?.mode) {
      navigate("/login");
    }
  }, [pendingAuth, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const otp = code.join("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      if (pendingAuth.mode === "login") {
        const response = await authApi.verifyLogin({
          email: pendingAuth.email,
          otp,
        });

        const authToken = response.data.token;
        const authUser = response.data.user;
        console.log('OTP verified');
        console.log('Token received', authToken);

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(authUser));
        console.log('Token stored');

        setAuthState({
          user: authUser,
          token: authToken,
        });
        console.log('User state updated');

        clearPendingAuth();
        const redirectPath = authUser?.role === 'admin'
          ? '/admin/dashboard'
          : authUser?.role === 'teacher'
            ? '/teacher/dashboard'
            : '/student';
        console.log('Navigating to', redirectPath);
        navigate(redirectPath);
      } else {
        await authApi.verifyRegister({
          email: pendingAuth.email,
          otp,
        });

        clearPendingAuth();
        navigate('/login');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Verify OTP
          </h1>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Enter the 6-digit code sent to
          </p>

          <p className="font-medium text-blue-600 break-all mt-1">
            {pendingAuth?.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                className="w-11 h-11 sm:w-14 sm:h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
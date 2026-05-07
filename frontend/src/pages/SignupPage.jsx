import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7fb] px-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}>
        <h1 className="text-3xl font-bold">Start exchanging skills</h1>
        <p className="mt-2 text-slate-500">No payments, just mutual learning.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 space-y-3">
          <input
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <button className="focus-ring mt-5 w-full rounded-lg bg-ink px-4 py-2 font-semibold text-white">Create account</button>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link className="font-semibold text-coral" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
};

export default SignupPage;

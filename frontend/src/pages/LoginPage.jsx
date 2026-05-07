import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7fb] px-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}>
        <h1 className="text-3xl font-bold">Skill Exchange Platform</h1>
        <p className="mt-2 text-slate-500">Log in to teach, learn, chat, and meet.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 space-y-3">
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
        <button className="focus-ring mt-5 w-full rounded-lg bg-ink px-4 py-2 font-semibold text-white">Log in</button>
        <p className="mt-4 text-sm text-slate-500">
          New here? <Link className="font-semibold text-coral" to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
};

export default LoginPage;

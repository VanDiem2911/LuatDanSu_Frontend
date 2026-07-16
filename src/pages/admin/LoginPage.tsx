import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../../services/cms";
import { isValidEmail, PATTERNS, VALIDATION_MESSAGES } from "../../utils/validation";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@luatdansu.net");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      toast.error(VALIDATION_MESSAGES.email);
      return;
    }
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email, password });
      window.sessionStorage.setItem("admin_token", result.token);
      toast.success("Đăng nhập thành công");
      navigate("/admin");
    } catch {
      toast.error("Thông tin đăng nhập không hợp lệ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Luật Dân Sự CMS</p>
        <h1 className="mt-2 text-3xl font-black text-navy">Đăng nhập quản trị</h1>
        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              pattern={PATTERNS.email}
              title={VALIDATION_MESSAGES.email}
              required
              className="mt-2 w-full border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
              className="mt-2 w-full border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            />
          </label>
          <button
            disabled={loading}
            className="w-full bg-primary px-5 py-3 font-bold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            Đăng nhập
          </button>
          <div className="text-center mt-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition">
              &larr; Quay về trang chủ
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}

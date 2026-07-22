import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { submitLead } from "../services/cms";
import { isValidPhone, PATTERNS, VALIDATION_MESSAGES } from "../utils/validation";

export function ConsultBanner() {
  const [phone, setPhone] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPhone = phone.trim();
    if (!isValidPhone(trimmedPhone)) {
      toast.error(VALIDATION_MESSAGES.phone);
      return;
    }
    await submitLead({ phone: trimmedPhone, source: "category-banner" });
    toast.success("Đã nhận yêu cầu tư vấn.");
    setPhone("");
  }

  return (
    <section className="pt-0">
      <div className="relative h-56 overflow-hidden sm:h-64">
        <img
          src="/consult-banner.jpg"
          alt="Tư vấn pháp luật dân sự"
          width={1280}
          height={256}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 z-0 h-full w-full scale-x-[-1] object-cover object-[center_42%]"
        />
        <div className="absolute inset-0 z-10 bg-white/10" />
        <div className="container-page relative z-20 flex h-full flex-col items-center justify-center gap-3 px-4 text-center sm:items-end sm:text-right sm:px-10">
          <p className="text-[1.1rem] font-medium leading-tight text-navy">
            Kết nối Luật sư ngay để bảo vệ quyền lợi của bạn
          </p>
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-end">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              pattern={PATTERNS.phone}
              title={VALIDATION_MESSAGES.phone}
              inputMode="tel"
              placeholder="Nhập SĐT"
              required
              className="w-full rounded-full border border-slate-300 bg-white px-6 py-2.5 text-black outline-none transition focus:border-primary sm:w-auto sm:min-w-[200px]"
            />
            <button type="submit" aria-label="Nhan tu van phap luat" className="rounded-full bg-primary px-8 py-3 text-[0.95rem] font-bold text-white transition hover:bg-primary-hover">
              Nhận tư vấn
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

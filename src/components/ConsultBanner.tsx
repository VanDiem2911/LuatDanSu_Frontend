import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { submitLead } from "../services/cms";
import { isValidPhone, PATTERNS, VALIDATION_MESSAGES } from "../utils/validation";

const fallbackImage =
  "https://www.qeh.ox.ac.uk/sites/default/files/styles/paragraph_image/public/2025-08/law-blog_shutterstock_2115451628.jpg?itok=B-GlzEQu";

export function ConsultBanner({ image = fallbackImage }: { image?: string }) {
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
      <div className="relative h-64 overflow-hidden">
        <div
          className="absolute inset-0 z-0 scale-x-[-1] bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        />
        <div className="absolute inset-0 z-10 bg-white/20" />
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
            <button className="rounded-full bg-primary px-8 py-3 text-[0.95rem] font-bold text-white transition hover:bg-primary-hover">
              Nhận tư vấn
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

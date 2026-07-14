import { FormEvent, useState } from "react";
import { MessageSquare, Phone, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { submitLead, submitQuestion } from "../services/cms";
import { isValidPhone, PATTERNS, VALIDATION_MESSAGES } from "../utils/validation";

export function LeadForms() {
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPhone = phone.trim();
    if (!isValidPhone(trimmedPhone)) {
      toast.error(VALIDATION_MESSAGES.phone);
      return;
    }

    setIsSubmittingPhone(true);
    try {
      await submitLead({ phone: trimmedPhone, source: "phone-form" });
      toast.success("Đã nhận số điện thoại. Chuyên viên sẽ liên hệ lại.");
      setPhone("");
    } catch {
      toast.error("Không gửi được số điện thoại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingPhone(false);
    }
  }

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 5) {
      toast.error("Câu hỏi phải có ít nhất 5 ký tự.");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      await submitQuestion({ content: trimmedQuestion });
      toast.success("Câu hỏi đã được gửi tới Luật sư.");
      setQuestion("");
    } catch {
      toast.error("Không gửi được câu hỏi. Vui lòng thử lại.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  }

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 overflow-hidden border-t border-slate-200 bg-white md:grid-cols-2">
        <form onSubmit={handlePhoneSubmit} className="flex h-full flex-col p-6 md:p-8">
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-3 text-[1.2rem] font-bold text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </span>
              Tư vấn nhanh
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-slate-500">
              Để lại số điện thoại, chuyên viên pháp lý sẽ gọi lại hỗ trợ bạn.
            </p>
          </div>
          <div className="mt-auto space-y-4">
            <label className="relative block">
              <Smartphone className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                pattern={PATTERNS.phone}
                title={VALIDATION_MESSAGES.phone}
                inputMode="tel"
                required
                placeholder="Số điện thoại của bạn"
                className="w-full rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-800 shadow-sm outline-none transition focus:border-primary"
              />
            </label>
            <button
              disabled={isSubmittingPhone}
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-primary-hover disabled:opacity-60"
            >
              Yêu cầu gọi lại ngay
            </button>
          </div>
        </form>

        <form onSubmit={handleQuestionSubmit} className="flex h-full flex-col border-t border-slate-200 p-6 md:border-l md:border-t-0 md:p-8">
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-3 text-[1.2rem] font-bold text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </span>
              Hỏi đáp miễn phí
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-slate-500">
              Gửi câu hỏi để nhận hướng dẫn xử lý sơ bộ hoàn toàn miễn phí.
            </p>
          </div>
          <div className="mt-auto space-y-4">
            <label className="relative block">
              <Send className="absolute left-4 top-4 h-4.5 w-4.5 text-slate-400" />
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                rows={2}
                minLength={5}
                required
                className="min-h-[46px] w-full resize-none rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm text-slate-800 shadow-sm outline-none transition focus:border-primary"
              />
            </label>
            <button
              disabled={isSubmittingQuestion}
              className="w-full rounded-full border-2 border-primary py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
            >
              Gửi câu hỏi tới Luật sư
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

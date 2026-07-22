import { FormEvent, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageSquare, Phone, Send, Smartphone, MapPin, Mail, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { submitLead, submitQuestion } from "../services/cms";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbJsonLd } from "../components/JsonLd";
import { Seo } from "../components/Seo";
import type { NavigationPayload } from "../types/api";
import { settingValue } from "../utils/format";
import { isValidPhone, PATTERNS, VALIDATION_MESSAGES } from "../utils/validation";

type SiteSetting = {
  name: string;
  company: string;
  hotline: string;
  email: string;
  zalo?: string;
  facebook?: string;
  logoText: string;
};

type Office = {
  title: string;
  address: string;
};

const fallbackSite: SiteSetting = {
  name: "Luật Dân Sự",
  company: "CÔNG TY LUẬT TNHH ANP",
  hotline: "090 360 1234",
  email: "congtyluatanp.hcm@gmail.com",
  logoText: "Luật Dân Sự"
};

export function ContactPage() {
  const navigation = useOutletContext<NavigationPayload>() || { settings: [] };
  const site = settingValue<SiteSetting>(navigation.settings, "site", fallbackSite);
  const offices = settingValue<Office[]>(navigation.settings, "offices", []);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      await submitLead({ phone: trimmedPhone, source: "contact-page-callback" });
      toast.success("Yêu cầu tư vấn đã được tiếp nhận. Chuyên viên sẽ gọi lại sớm nhất.");
      setPhone("");
    } catch {
      toast.error("Không gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsSubmittingPhone(false);
    }
  }

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedQuestion.length < 5) {
      toast.error("Nội dung câu hỏi phải có ít nhất 5 ký tự.");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      await submitQuestion({
        content: trimmedQuestion,
        name: trimmedName || undefined,
        email: trimmedEmail || undefined
      });
      toast.success("Câu hỏi của bạn đã gửi đến luật sư. Chúng tôi sẽ phản hồi sớm.");
      setQuestion("");
      setName("");
      setEmail("");
    } catch {
      toast.error("Gửi câu hỏi thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  }

  return (
    <>
      <Seo title="Đăng ký tư vấn miễn phí & Liên hệ | Luật ANP" description="Kết nối Luật sư tư vấn pháp luật trực tuyến, gửi câu hỏi hoặc đăng ký nhận cuộc gọi tư vấn miễn phí nhanh chóng." />
      <BreadcrumbJsonLd items={[{ label: "Đăng ký tư vấn & Liên hệ" }]} />
      <div className="border-b border-slate-200 bg-white pb-10 pt-6">
        <div className="container-page">
          <Breadcrumb items={[{ label: "Đăng ký tư vấn & Liên hệ" }]} />
          <div className="max-w-3xl">
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-ink md:text-4xl">
              Đăng ký tư vấn miễn phí
            </h1>
            <p className="text-base font-semibold leading-relaxed text-slate-500">
              Hãy gửi thông tin yêu cầu hoặc câu hỏi của bạn. Đội ngũ luật sư và chuyên viên pháp lý của Luật ANP sẽ phản hồi và hỗ trợ bạn trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </div>

      <main className="container-page py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Left Column: Forms */}
          <div className="space-y-8">
            {/* Form 1: Callback request */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-lg">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-black uppercase text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                Yêu cầu gọi lại tư vấn ngay
              </h2>
              <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                Để lại số điện thoại của bạn, chúng tôi sẽ cử chuyên viên tư vấn gọi điện hỗ trợ bạn giải quyết vướng mắc pháp lý ngay lập tức.
              </p>
              <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Smartphone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    pattern={PATTERNS.phone}
                    title={VALIDATION_MESSAGES.phone}
                    required
                    placeholder="Số điện thoại của bạn..."
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-6 text-sm outline-none transition focus:border-primary focus:bg-white"
                  />
                </div>
                <button
                  disabled={isSubmittingPhone}
                  className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSubmittingPhone ? "Đang gửi..." : "Gửi yêu cầu gọi lại"}
                </button>
              </form>
            </div>

            {/* Form 2: Ask question */}
            <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-lg">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-black uppercase text-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </span>
                Gửi câu hỏi chi tiết tới Luật sư
              </h2>
              <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                Bạn có thể trình bày chi tiết sự việc, tranh chấp hoặc thắc mắc của bạn bên dưới. Các luật sư sẽ phân tích và đưa ra giải pháp tư vấn sơ bộ cho bạn.
              </p>
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Họ và tên của bạn (Tùy chọn)</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Nguyễn Văn A..."
                      className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-white rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Địa chỉ Email (Tùy chọn)</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="example@mail.com..."
                      className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-white rounded"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung câu hỏi, yêu cầu tư vấn *</span>
                  <div className="relative mt-2">
                    <Send className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={5}
                      required
                      minLength={5}
                      placeholder="Vui lòng mô tả chi tiết sự việc..."
                      className="w-full resize-none border border-slate-200 bg-slate-50 py-3 pl-12 pr-6 text-sm outline-none transition focus:border-primary focus:bg-white rounded"
                    />
                  </div>
                </label>
                <div className="flex justify-end">
                  <button
                    disabled={isSubmittingQuestion}
                    className="w-full sm:w-auto rounded-full bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isSubmittingQuestion ? "Đang gửi..." : "Gửi câu hỏi pháp lý"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Office coordinates */}
          <div className="space-y-6">
            <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-lg space-y-6">
              <h2 className="text-lg font-black uppercase text-navy border-b border-slate-100 pb-3">
                Thông tin liên hệ
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hotline hỗ trợ 24/7</h3>
                    <a href={`tel:${site.hotline.replace(/\s/g, "")}`} className="text-lg font-black text-blue-600 hover:underline">
                      {site.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ Email</h3>
                    <span className="text-sm font-bold text-slate-700">{site.email}</span>
                  </div>
                </div>
              </div>

              {site.zalo || site.facebook ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {site.zalo && (
                    <a
                      href={site.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-[#0068ff] px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                      Chat Zalo
                    </a>
                  )}
                  {site.facebook && (
                    <a
                      href={site.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-[#1877f2] px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
                    >
                      Facebook Page
                    </a>
                  )}
                </div>
              ) : null}
            </div>

            <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-lg space-y-6">
              <h2 className="text-lg font-black uppercase text-navy border-b border-slate-100 pb-3">
                Hệ thống văn phòng
              </h2>
              <div className="space-y-5">
                {offices.map((office) => (
                  <div key={office.title} className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <h4 className="text-sm font-bold text-navy">{office.title}</h4>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        {office.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

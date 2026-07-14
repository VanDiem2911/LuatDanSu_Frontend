import { HelpCircle, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function FloatingContact() {
  const buttons = [
    { label: "Đặt câu hỏi ngay", icon: HelpCircle, href: "/hoi-dap", className: "bg-[#ff8022]", external: false },
    { label: "Chat Zalo", icon: MessageCircle, href: "https://zalo.me/0903601234", className: "bg-[#0068ff]", external: true },
    { label: "090 360 1234", icon: Phone, href: "tel:0903601234", className: "bg-[#4CAF50]", external: true }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      {buttons.map((button) => {
        const Icon = button.icon;
        const content = (
          <>
            <span className="pointer-events-none translate-x-4 whitespace-nowrap rounded-full border border-gray-100 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              {button.label}
            </span>
            <span
              className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 group-hover:scale-110 ${button.className}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </>
        );

        return button.external ? (
          <a key={button.label} href={button.href} className="group flex items-center gap-3" target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <Link key={button.label} to={button.href} className="group flex items-center gap-3">
            {content}
          </Link>
        );
      })}
    </div>
  );
}

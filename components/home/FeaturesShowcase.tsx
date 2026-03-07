import {
  PlayCircle,
  BookOpenCheck,
  FileText,
  FolderOpen,
  Radio,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: PlayCircle,
    label: "فيديوهات تفسير الدروس",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    highlighted: false,
  },
  {
    icon: BookOpenCheck,
    label: "تمارين مع الإصلاح",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    highlighted: true,
  },
  {
    icon: FileText,
    label: "مجلات وتلاخيص",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    highlighted: false,
  },
  {
    icon: FolderOpen,
    label: "تسجيلات الحصص المباشرة",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    highlighted: false,
  },
  {
    icon: Radio,
    label: "حصص مباشرة",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    highlighted: false,
  },
  {
    icon: MessageSquare,
    label: "منتدى",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    highlighted: false,
  },
  {
    icon: ClipboardCheck,
    label: "امتحانات تقييميّة",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    highlighted: false,
  },
];

export function FeaturesShowcase() {
  return (
    <section className="px-6 lg:px-12 py-16 max-w-4xl mx-auto" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-6 py-5 transition-all ${
                feature.highlighted
                  ? "bg-gradient-to-l from-amber-50 to-amber-100/50 border-r-4 border-r-amber-400"
                  : "hover:bg-zinc-50"
              }`}
            >
              <span
                className={`text-lg font-semibold font-arabic ${
                  feature.highlighted ? "text-sky-600" : "text-sky-500"
                }`}
              >
                {feature.label}
              </span>
              <div
                className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center shadow-sm`}
              >
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Shared phone-bezel wrapper — used by the hero's PhoneMockup and the App
// Screenshots showcase so both render inside an identical, consistent frame.
export default function PhoneFrame({ children, width = 280, height = 560 }) {
  return (
    <div className="relative mx-auto" style={{ width }}>
      <div className="relative rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-20" />
        <div className="bg-slate-50 overflow-hidden relative" style={{ height }}>
          {children}
        </div>
      </div>
    </div>
  );
}

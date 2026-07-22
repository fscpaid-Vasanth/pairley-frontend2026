// Fixed, full-viewport ambient layer that sits behind the whole landing
// page (-z-10). Provides the white base plus a few very-low-opacity color
// blobs that drift slowly, so the white sections feel alive without
// pulling focus. Purely decorative — pointer-events-none, aria-hidden, and
// fully still under prefers-reduced-motion (motion-reduce:animate-none).
export default function LandingAmbient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white" aria-hidden="true">
      <div className="absolute top-[6%] left-[4%] w-[30rem] h-[30rem] rounded-full bg-pairley-purple/20 blur-[100px] animate-drift-slow motion-reduce:animate-none" />
      <div className="absolute top-[40%] right-[2%] w-[34rem] h-[34rem] rounded-full bg-pairley-green/[0.17] blur-[110px] animate-drift-slow-2 motion-reduce:animate-none" />
      <div className="absolute bottom-[4%] left-[26%] w-[28rem] h-[28rem] rounded-full bg-pairley-orange/[0.13] blur-[100px] animate-drift-slow-3 motion-reduce:animate-none" />
      <div className="absolute top-[70%] left-[-4%] w-[26rem] h-[26rem] rounded-full bg-pairley-purple/[0.15] blur-[90px] animate-drift-slow-2 motion-reduce:animate-none" />
    </div>
  );
}

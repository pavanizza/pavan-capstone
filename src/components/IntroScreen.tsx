import { GymGuyAvatar } from "@/components/GymGuyAvatar";

interface IntroScreenProps {
  onGetStarted: () => void;
}

/** First screen a brand-new user sees, before the profile setup form.
 * Purely a welcome/orientation step - doesn't touch profile state itself. */
export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-line bg-panel p-8 text-center shadow-sm shadow-black/40">
      <GymGuyAvatar size={96} />

      <div>
        <h1 className="bg-gradient-to-r from-azure to-violet bg-clip-text text-4xl font-bold text-transparent">
          Grub.
        </h1>
        <p className="mt-2 text-sm text-faint">
          An agent that reads what you just ate and tells you exactly what to eat next.
        </p>
      </div>

      <button
        onClick={onGetStarted}
        className="w-full rounded-lg bg-gradient-to-r from-azure to-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Get started
      </button>
    </div>
  );
}

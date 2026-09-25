import { GymGuyAvatar } from "@/components/GymGuyAvatar";

interface IntroScreenProps {
  onGetStarted: () => void;
}

const HIGHLIGHTS = [
  "Describe a meal in plain language, or snap a photo - AI estimates calories and macros.",
  "Personalized daily calorie and macro targets, calculated from your profile.",
  "Nutrition facts are checked against real, cited sources - not just AI guesses.",
  "Get an AI-suggested next meal that fills whatever you're still short on.",
];

/** First screen a brand-new user sees, before the profile setup form.
 * Purely a welcome/orientation step - doesn't touch profile state itself. */
export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-line bg-panel p-8 text-center shadow-sm shadow-black/40">
      <GymGuyAvatar size={96} />

      <div>
        <h1 className="bg-gradient-to-r from-azure to-violet bg-clip-text text-4xl font-bold text-transparent">
          Grub
        </h1>
        <p className="mt-2 text-sm text-faint">
          Log what you ate. The AI tracks it and tells you what to eat next.
        </p>
      </div>

      <ul className="w-full space-y-3 text-left text-sm text-faint">
        {HIGHLIGHTS.map((text) => (
          <li key={text} className="flex items-start gap-2">
            <span className="mt-0.5 text-violet">&bull;</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onGetStarted}
        className="w-full rounded-lg bg-gradient-to-r from-azure to-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Get started
      </button>
    </div>
  );
}

import { Volume2, PlayCircle } from "lucide-react";

const featuresList = [
  {
    icon: <Volume2 className="w-4 h-4 text-amber-500" />,
    title: "Persistent Volume",
    description:
      "Remember your preferred volume across different videos and sessions.",
  },
  {
    icon: <PlayCircle className="w-4 h-4 text-amber-500" />,
    title: "Playback Speed Control",
    description:
      "Customize your viewing experience with multiple playback speed options from 1x to 2x.",
  },
];

export function Features() {
  return (
    <div className="bg-zinc-950 flex flex-col">
      <div className="flex flex-col gap-4">
        {featuresList.map((feature, index) => (
          <div
            key={index}
            className="
              bg-zinc-900 p-4 rounded-lg flex items-center 
              space-x-4 border border-zinc-800 hover:border-amber-500 
              transition-all duration-300
            "
          >
            <div className="flex-shrink-0">{feature.icon}</div>
            <div className="flex flex-col">
              <h3 className="text-white text-sm font-semibold mb-1">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-xs">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-zinc-500 italic mb-4">
          More features coming soon...
        </p>
      </div>
    </div>
  );
}

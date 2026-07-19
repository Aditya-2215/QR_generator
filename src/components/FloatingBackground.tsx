import React from "react";

export const FloatingBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Glow Blob 1 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/40 dark:bg-indigo-950/20 blur-[120px] animate-blob" />

      {/* Glow Blob 2 */}
      <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-200/40 dark:bg-purple-950/20 blur-[130px] animate-blob [animation-delay:4s]" />

      {/* Glow Blob 3 */}
      <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-blue-200/30 dark:bg-blue-950/15 blur-[110px] animate-blob [animation-delay:8s]" />

      {/* Ambient Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};

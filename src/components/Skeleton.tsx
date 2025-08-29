// src/components/Skeleton.tsx
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={["skel", className].join(" ")} />;
}

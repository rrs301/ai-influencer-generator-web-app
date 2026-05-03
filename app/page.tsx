import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <h1 className="text-6xl font-bold tracking-tighter text-ocean-light">
        Ocean Theme
      </h1>
      <p className="text-xl text-ocean-light/80 max-w-md text-center">
        Welcome to the AI Influencer Generator, now featuring a deep-sea aesthetic.
      </p>
      <div className="flex gap-4">
        <Button variant="primary">Deep Sea Button</Button>
        <Button variant="secondary">Coral Accent</Button>
        <Button variant="outline">Ocean Outline</Button>
      </div>
    </main>
  );
}

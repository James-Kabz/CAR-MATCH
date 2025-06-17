import { cn } from "@/lib/utils";

export default function AuthLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 p-4">
      {/* Logo/Branding - optional */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Car Match</h1>
      </div>

      {/* Main loader container */}
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-sm border">
        {/* Animated loader */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-4 h-4 bg-primary rounded-full",
                  "animate-pulse",
                  i === 0 && "left-0 top-0",
                  i === 1 && "left-1/2 -translate-x-1/2 top-0",
                  i === 2 && "right-0 top-0"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Just a moment...
          </h2>
          <p className="text-sm text-muted-foreground">
            We're preparing your experience
          </p>
        </div>

        {/* Progress bar - optional */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-primary h-1.5 rounded-full animate-pulse"
            style={{ width: "45%" }}
          ></div>
        </div>
      </div>

      {/* Footer note - optional */}
      <p className="text-xs text-muted-foreground mt-8">
        Secure authentication process
      </p>
    </div>
  );
}
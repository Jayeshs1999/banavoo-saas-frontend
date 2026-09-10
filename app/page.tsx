import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-muted px-4">
      <div className="text-center max-w-lg">
        {/* Logo / Brand */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
          <span className="text-white text-2xl font-bold">B</span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3">
          Welcome to Banavoo
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          The marketplace for handmade product sellers.
          Create your store, showcase your craft, and start selling today.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-white text-foreground font-semibold text-base hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

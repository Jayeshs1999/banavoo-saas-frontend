export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-primary mb-4">Welcome to My App</h1>
      <p className="text-muted-foreground text-lg">
        Your application starts here. Edit{" "}
        <code className="bg-secondary px-1 py-0.5 rounded text-sm">app/page.tsx</code>{" "}
        to get started.
      </p>
    </main>
  );
}

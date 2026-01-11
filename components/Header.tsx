import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          <img alt='logo' src="/logo.jpeg" width="100" height="100" />
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="hover:text-accent">Home</Link>
          <Link href="/dashboard" className="hover:text-accent">Dashboard</Link>
          <Link href="/about" className="hover:text-accent">About</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
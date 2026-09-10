/**
 * Footer — minimal site footer.
 * Customise with your own links / legal text.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted py-6 px-6 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
      {/* TODO: Add links, social icons, etc. */}
    </footer>
  );
}

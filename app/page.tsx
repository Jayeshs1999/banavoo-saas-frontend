import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to PGWala</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Find your perfect PG accommodation or manage your PG business
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>PG Admin Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Register your PG, manage bookings, and handle requests from tenants.
            </p>
            <Link href="/admin/login">
              <Button>Go to Admin Portal</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find and book PG accommodations that suit your needs.
            </p>
            <Link href="/user/login">
              <Button>Go to User Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

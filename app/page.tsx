import { Button, Card, CardContent, CardHeader, CardTitle } from '../components';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Dormitory</h1>
        <p className="text-muted-foreground text-lg mb-6">
          A well-managed dormitory management system
        </p>
        <Button size="lg">Get Started</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Efficiently manage dormitory rooms and assignments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Easy access for students to view their information and requests.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Comprehensive tools for dormitory administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

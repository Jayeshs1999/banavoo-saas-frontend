import { Card, CardContent, CardHeader, CardTitle } from '../../components';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Our Dormitory</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Welcome to our modern dormitory management system designed to provide
          a comfortable and efficient living environment for students.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create a supportive community that fosters academic success,
                personal growth, and lifelong friendships through excellent
                dormitory management and services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be the leading dormitory management system that sets the
                standard for student housing excellence and innovation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
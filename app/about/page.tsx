import { Card, CardContent, CardHeader, CardTitle } from "../../components";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About STHALS.IN</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Welcome to STHALS.IN, your comprehensive solution for PG (Paying
          Guest) accommodation management. We connect students and professionals
          with quality PG accommodations while empowering PG owners with
          powerful management tools.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To revolutionize the PG accommodation industry by providing a
                seamless platform that connects tenants with quality living
                spaces while empowering PG owners with modern management tools
                for efficient operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To become the leading platform for PG accommodation management
                in India, setting new standards for transparency, convenience,
                and quality in the student and professional housing market.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>For PG Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2">
                <li>• Create and manage multiple PG properties</li>
                <li>• Real-time room and bed allocation tracking</li>
                <li>• Online booking request management</li>
                <li>• Comprehensive dashboard with occupancy analytics</li>
                <li>• Streamlined payment and billing management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2">
                <li>• Browse available PG accommodations</li>
                <li>• Filter by location, price, and amenities</li>
                <li>• Online booking and request system</li>
                <li>• Transparent pricing and availability</li>
                <li>• Easy communication with PG owners</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2">
                <li>• Modern Next.js frontend</li>
                <li>• Secure authentication system</li>
                <li>• Real-time data synchronization</li>
                <li>• Responsive design for all devices</li>
                <li>• Scalable backend architecture</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At STHALS.IN, we're committed to making the PG accommodation
              experience better for everyone. Whether you're a student looking
              for a comfortable place to stay or a PG owner managing your
              business, our platform is designed to simplify your journey. We
              continuously work on improving our services to meet the evolving
              needs of the accommodation market.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

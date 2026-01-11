'use client';

import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { dummyRequests } from '../../../utils';
import { formatDate } from '../../../utils';
import { useAuth } from '../../context/AuthContext';

export default function UserRequests() {
  const { currentUser } = useAuth();

  // Filter requests for current user
  const userRequests = dummyRequests.filter(req => req.userId === currentUser?.id);

  const handleCall = (phone: string) => {
    // In real app, initiate call
    alert(`Calling ${phone}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Requests</h1>

      <div className="space-y-4">
        {userRequests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          userRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>Request #{request.id.slice(-4)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong>Join Date:</strong> {formatDate(request.joinDate)}</p>
                    <p><strong>Stay Duration:</strong> {request.stayDays} days</p>
                  </div>
                  <div>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </p>
                    <p><strong>Requested:</strong> {formatDate(request.createdAt)}</p>
                  </div>
                </div>

                {request.status === 'approved' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleCall('9876543210')}>
                      Call PG Admin
                    </Button>
                    <p className="text-sm text-gray-600 self-center">
                      Validity: 2 hours
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/Card';
import { dummyRequests } from '../../../utils';
import { formatDate } from '../../../utils';

export default function AdminRequests() {
  const [requests, setRequests] = useState(dummyRequests);

  const handleApprove = (id: string) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Booking Requests</h1>

      <div className="space-y-4">
        {requests.map((request) => (
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

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(request.id)}>
                    Approve
                  </Button>
                  <Button variant="outline" onClick={() => handleReject(request.id)}>
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { Hammer, RefreshCw, Mail, Phone, Calendar, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getContractors, Contractor } from '@/lib/api/users';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminContractorsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadContractors();
    }
  }, [user, authLoading]);

  const loadContractors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getContractors();
      
      if (response.success && response.data) {
        setContractors(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van aannemers');
      }
    } catch (err) {
      console.error('Error loading contractors:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aannemers</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle aannemers op het platform
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aannemers</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle aannemers op het platform
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadContractors} startIcon={<RefreshCw className="h-4 w-4" />}>
          Opnieuw laden
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {contractors.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Geen aannemers gevonden"
              description="Er zijn nog geen aannemers geregistreerd op het platform."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contractors.map((contractor) => (
            <Card key={contractor.id} className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Hammer className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      {contractor.companyName || `${contractor.firstName} ${contractor.lastName}`}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">
                      <Mail className="h-4 w-4" />
                      <span>{contractor.email}</span>
                    </div>
                    {contractor.companyName && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">
                        <User className="h-4 w-4" />
                        <span>Contactpersoon: {contractor.firstName} {contractor.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-3">
                  {contractor.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground-muted">Telefoon:</span>
                      <span className="font-semibold text-foreground">{contractor.phone}</span>
                    </div>
                  )}
                  {contractor.kvkNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground-muted">KVK:</span>
                      <span className="font-semibold text-foreground">{contractor.kvkNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-muted">Geregistreerd:</span>
                    <span className="font-semibold text-foreground">
                      {contractor.createdAt ? new Date(contractor.createdAt).toLocaleDateString('nl-NL') : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


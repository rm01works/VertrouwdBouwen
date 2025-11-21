'use client';

import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Mail, Phone, Calendar, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomers, Customer } from '@/lib/api/users';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format';

export default function AdminCustomersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadCustomers();
    }
  }, [user, authLoading]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getCustomers();
      
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        setError(response.error?.message || 'Fout bij het laden van klanten');
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Klanten</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle klanten op het platform
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
          <h1 className="text-3xl font-bold text-foreground">Klanten</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Beheer alle klanten op het platform
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadCustomers} startIcon={<RefreshCw className="h-4 w-4" />}>
          Opnieuw laden
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger bg-danger-subtle p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {customers.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Geen klanten gevonden"
              description="Er zijn nog geen klanten geregistreerd op het platform."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {customers.map((customer) => (
            <Card key={customer.id} className="border border-gray-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      {customer.firstName} {customer.lastName}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-foreground-muted">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-3">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-foreground-muted" />
                      <span className="text-foreground-muted">Telefoon:</span>
                      <span className="font-semibold text-foreground">{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FolderKanban className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-muted">Projecten:</span>
                    <span className="font-bold text-foreground">
                      {customer._count?.customerProjects || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                    <span className="text-foreground-muted">Geregistreerd:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(customer.createdAt).toLocaleDateString('nl-NL')}
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


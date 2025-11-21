'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  FileText, 
  Hammer, 
  Pause, 
  PartyPopper, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { PageSection } from '@/components/layout/Page';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getFinancialMetrics, FinancialMetrics } from '@/lib/api/admin';
import {
  getPendingEscrowPayments,
  approveEscrowPayment,
  rejectEscrowPayment,
  getPendingPayouts,
  markPayoutPaid,
  ProjectPayment,
  Payout,
} from '@/lib/api/admin-payments';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6b8aff', '#3dd99e', '#ffb84d', '#ff7d7d', '#7bc5ff', '#9aa3bf'];

const PROJECT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Concept',
  PENDING_CONTRACTOR: 'Wacht op aannemer',
  ACTIVE: 'Actief',
  IN_PROGRESS: 'In uitvoering',
  COMPLETED: 'Afgerond',
  CANCELLED: 'Geannuleerd',
  DISPUTED: 'Geschil',
};

const MILESTONE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Niet gestart',
  IN_PROGRESS: 'In uitvoering',
  SUBMITTED: 'Ingediend',
  APPROVED: 'Goedgekeurd',
  REJECTED: 'Afgewezen',
  PAID: 'Betaald',
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [pendingEscrowPayments, setPendingEscrowPayments] = useState<ProjectPayment[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      console.log('⚠️ Admin Dashboard: User is not admin, redirecting...', { userId: user.id, role: user.role });
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load metrics
    if (authLoading) {
      console.log('⏳ Admin Dashboard: Waiting for auth to load...');
      return;
    }

    if (user?.role === 'ADMIN') {
      console.log('🔍 Admin Dashboard: Starting loadMetrics...', { userId: user.id, role: user.role });
      loadMetrics();
    } else if (user) {
      console.log('⚠️ Admin Dashboard: User is not admin, skipping loadMetrics', { userId: user.id, role: user.role });
      // Stop loading if user is not admin
      setIsLoading(false);
    } else {
      console.log('ℹ️ Admin Dashboard: No user found, stopping loading');
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadMetrics = async () => {
    const startTime = Date.now();
    console.log('🚀 Admin Dashboard: loadMetrics started', { timestamp: new Date().toISOString() });
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Promise.allSettled instead of Promise.all to handle partial failures gracefully
      // Note: API client now has its own timeout, but we keep this as a safety net
      const timeout = (promise: Promise<any>, ms: number) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => {
              console.error(`⏱️ Component-level timeout voor request na ${ms}ms`);
              reject(new Error(`Request timeout na ${ms}ms`));
            }, ms)
          ),
        ]);
      };

      console.log('📡 Admin Dashboard: Starting API calls...');
      const [metricsResult, escrowResult, payoutsResult] = await Promise.allSettled([
        timeout(getFinancialMetrics(), 25000), // 25 second timeout (longer than API client timeout)
        timeout(getPendingEscrowPayments(), 25000),
        timeout(getPendingPayouts(), 25000),
      ]);
      
      const elapsed = Date.now() - startTime;
      console.log(`⏱️ Admin Dashboard: All promises settled after ${elapsed}ms`);

      // Handle metrics response
      if (metricsResult.status === 'fulfilled') {
        const metricsResponse = metricsResult.value;
        if (metricsResponse.success && metricsResponse.data) {
          setMetrics(metricsResponse.data);
        } else {
          console.error('❌ Metrics error:', metricsResponse.error);
          setError(metricsResponse.error?.message || 'Fout bij het laden van metrics');
        }
      } else {
        console.error('❌ Metrics promise rejected:', metricsResult.reason);
        setError(
          metricsResult.reason?.message || 
          'Fout bij het laden van metrics. Controleer of de API server draait.'
        );
      }

      // Handle escrow payments response
      if (escrowResult.status === 'fulfilled') {
        const escrowResponse = escrowResult.value;
        if (escrowResponse.success && escrowResponse.data) {
          console.log('✅ Escrow payments loaded:', escrowResponse.data.length);
          setPendingEscrowPayments(escrowResponse.data);
        } else {
          console.error('❌ Escrow payments error:', escrowResponse.error);
          // Don't set error for escrow/payouts, just log and set empty array
          setPendingEscrowPayments([]);
        }
      } else {
        console.error('❌ Escrow payments promise rejected:', escrowResult.reason);
        setPendingEscrowPayments([]);
      }

      // Handle payouts response
      if (payoutsResult.status === 'fulfilled') {
        const payoutsResponse = payoutsResult.value;
        if (payoutsResponse.success && payoutsResponse.data) {
          console.log('✅ Payouts loaded:', payoutsResponse.data.length);
          setPendingPayouts(payoutsResponse.data);
        } else {
          console.error('❌ Payouts error:', payoutsResponse.error);
          setPendingPayouts([]);
        }
      } else {
        console.error('❌ Payouts promise rejected:', payoutsResult.reason);
        setPendingPayouts([]);
      }

      console.log('📊 Admin Dashboard - Load Metrics Results:', {
        metrics: metricsResult.status === 'fulfilled' && metricsResult.value.success,
        escrow: escrowResult.status === 'fulfilled' && escrowResult.value.success,
        payouts: payoutsResult.status === 'fulfilled' && payoutsResult.value.success,
        elapsed: Date.now() - startTime,
      });
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error('❌ Load metrics exception:', err, { elapsed, timestamp: new Date().toISOString() });
      setError(
        err instanceof Error 
          ? err.message 
          : 'Er is een onverwachte fout opgetreden'
      );
    } finally {
      // Always stop loading, even if something went wrong
      console.log('✅ Admin Dashboard: Setting isLoading to false', { elapsed: Date.now() - startTime });
      setIsLoading(false);
    }
  };

  const handleApproveEscrowPayment = async (paymentId: string) => {
    try {
      const response = await approveEscrowPayment(paymentId);
      if (response.success) {
        await loadMetrics(); // Reload data
      } else {
        alert(response.error?.message || 'Fout bij goedkeuren van betaling');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  const handleRejectEscrowPayment = async (paymentId: string, adminNotes: string) => {
    if (!adminNotes || adminNotes.trim().length === 0) {
      alert('Admin notes zijn verplicht bij afwijzing');
      return;
    }
    try {
      const response = await rejectEscrowPayment(paymentId, { adminNotes });
      if (response.success) {
        await loadMetrics(); // Reload data
      } else {
        alert(response.error?.message || 'Fout bij afwijzen van betaling');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  const handleMarkPayoutPaid = async (payoutId: string) => {
    try {
      const response = await markPayoutPaid(payoutId);
      if (response.success) {
        await loadMetrics(); // Reload data
      } else {
        alert(response.error?.message || 'Fout bij markeren van payout');
      }
    } catch (err) {
      alert('Er is een fout opgetreden');
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/admin/projects/${projectId}`);
  };

  // Show loading while auth is loading or while we're loading metrics
  if (authLoading || (isLoading && !error && !metrics)) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Financieel & operationeel control center voor platformbeheer
          </p>
        </div>
        <div className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  // Redirect or show nothing if user is not admin (redirect should happen in useEffect)
  if (user && user.role !== 'ADMIN') {
    return null;
  }

  // Show nothing if no user and auth is done loading
  if (!user && !authLoading) {
    return null;
  }

  // Prepare data for charts
  const monthlyPayoutsData = metrics?.monthlyPayouts.map((item) => ({
    month: `${item.month}/${item.year}`,
    amount: item.amount,
  })) || [];

  const projectStatusData = metrics
    ? Object.entries(metrics.projectCountsByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: PROJECT_STATUS_LABELS[status] || status,
          value: count,
        }))
    : [];

  const milestoneStatusData = metrics
    ? Object.entries(metrics.milestoneCountsByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: MILESTONE_STATUS_LABELS[status] || status,
          value: count,
        }))
    : [];

  // KPI Cards
  const kpiCards = metrics
    ? [
        {
          label: 'Totaal op escrow',
          value: formatCurrency(metrics.totalEscrowHeld),
          description: 'Geld dat nu in escrow staat',
          icon: <Wallet className="h-5 w-5" />,
          color: 'text-primary',
        },
        {
          label: 'Nog uit te betalen',
          value: formatCurrency(metrics.totalPendingPayouts),
          description: 'Afgeronde projecten die nog uitbetaald moeten worden',
          icon: <Clock className="h-5 w-5" />,
          color: 'text-warning',
        },
        {
          label: 'Totaal uitbetaald',
          value: formatCurrency(metrics.totalPaidOut),
          description: 'Totaal bedrag dat al is uitbetaald',
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-success',
        },
        {
          label: 'Niet gestarte opdrachten',
          value: metrics.projectCountsByStatus.DRAFT || 0,
          description: 'Projecten in concept status',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-foreground-muted',
        },
        {
          label: 'Opdrachten in uitvoering',
          value:
            (metrics.projectCountsByStatus.IN_PROGRESS || 0) +
            (metrics.projectCountsByStatus.ACTIVE || 0),
          description: 'Actieve projecten',
          icon: <Hammer className="h-5 w-5" />,
          color: 'text-info',
        },
        {
          label: 'Wacht op klantactie',
          value: metrics.milestoneCountsByStatus.SUBMITTED || 0,
          description: 'Milestones die wachten op goedkeuring',
          icon: <Pause className="h-5 w-5" />,
          color: 'text-warning',
        },
        {
          label: 'Afgeronde projecten',
          value: metrics.projectCountsByStatus.COMPLETED || 0,
          description: 'Volledig afgeronde projecten',
          icon: <PartyPopper className="h-5 w-5" />,
          color: 'text-success',
        },
        {
          label: 'Uitbetalingen deze maand',
          value:
            monthlyPayoutsData.length > 0
              ? formatCurrency(monthlyPayoutsData[monthlyPayoutsData.length - 1].amount)
              : formatCurrency(0),
          description: 'Totaal uitbetaald deze maand',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-primary',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Financieel & operationeel control center voor platformbeheer
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadMetrics} startIcon={<RefreshCw className="h-4 w-4" />}>
          Opnieuw laden
        </Button>
      </div>

        {isLoading ? (
          <div className="space-y-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : !metrics ? (
          <div className="rounded-2xl border border-danger bg-danger-subtle p-8 text-center">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-danger">{error}</p>
              <p className="text-sm text-foreground-muted">
                Het betalingsdashboard kon niet worden geladen. Controleer of de API server draait.
              </p>
              <Button variant="primary" onClick={loadMetrics}>
                Opnieuw proberen
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-8 rounded-2xl border border-warning bg-warning-subtle p-4 text-warning">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm">{error}</p>
                  <Button variant="ghost" size="sm" onClick={loadMetrics}>
                    Opnieuw
                  </Button>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((kpi, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
                        {kpi.label}
                      </p>
                      <div className={kpi.color}>
                        {kpi.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-sm text-foreground-muted">{kpi.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="mb-10 grid gap-6 lg:grid-cols-2">
              {/* Monthly Payouts Chart */}
              <Card className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm">
                <CardBody>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Uitbetalingen per maand
                  </h3>
                  {monthlyPayoutsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyPayoutsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="month"
                          stroke="var(--color-content-muted)"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="var(--color-content-muted)"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          name="Uitbetalingen"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-foreground-muted">
                      Geen data beschikbaar
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Project Status Distribution */}
              <Card className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm">
                <CardBody>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Verdeling projectstatussen
                  </h3>
                  {projectStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-foreground-muted">
                      Geen data beschikbaar
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Milestone Status Chart */}
            <div className="mb-10">
              <Card className="border border-gray-200 dark:border-neutral-700 bg-surface shadow-sm">
                <CardBody>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Verdeling milestonestatussen
                  </h3>
                  {milestoneStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={milestoneStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {milestoneStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-foreground-muted">
                      Geen data beschikbaar
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Projects Pending Payout Table */}
            {metrics && metrics.projectsPendingPayout.length > 0 && (
              <PageSection
                title="Projecten die nog uitbetaald moeten worden"
                description={`${metrics.projectsPendingPayout.length} project${metrics.projectsPendingPayout.length > 1 ? 'en' : ''} met afgeronde milestones waarvan betalingen nog in escrow staan`}
                className="border-warning bg-warning-subtle"
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Project
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Klant
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Aannemer
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                          Escrow bedrag
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                          Milestones
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          Laatste update
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                          Actie
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.projectsPendingPayout.map((project) => (
                        <tr
                          key={project.projectId}
                          className="border-b border-border hover:bg-surface-muted transition-colors cursor-pointer"
                          onClick={() => handleViewProject(project.projectId)}
                        >
                          <td className="py-3 px-4 text-sm text-foreground font-medium">
                            {project.projectTitle}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-muted">
                            {project.customerName}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-muted">
                            {project.contractorName || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground font-semibold text-right">
                            {formatCurrency(project.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-muted text-center">
                            {project.completedMilestones}/{project.totalMilestones}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-muted">
                            {new Date(project.lastUpdated).toLocaleDateString('nl-NL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProject(project.projectId);
                              }}
                            >
                              Details →
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PageSection>
            )}

            {/* Escrow betalingen die wachten op review */}
            {pendingEscrowPayments.length > 0 ? (
              <PageSection
                title={`Escrow betalingen te controleren (${pendingEscrowPayments.length})`}
                description="Consumenten hebben escrow betalingen geïnitieerd die wachten op admin review"
              >
                <div className="space-y-4">
                  {pendingEscrowPayments.map((payment) => (
                    <Card key={payment.id}>
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {payment.project?.title || 'Onbekend project'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Consument: {payment.consumer?.firstName} {payment.consumer?.lastName} ({payment.consumer?.email})
                            </p>
                            <div className="mt-3 flex items-center gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Bedrag:
                                </span>
                                <span className="ml-2 font-semibold">
                                  {formatCurrency(payment.amount)}
                                </span>
                              </div>
                              {payment.transactionRef && (
                                <div>
                                  <span className="text-sm text-muted-foreground">
                                    Transactie ref:
                                  </span>
                                  <span className="ml-2 text-sm font-mono">
                                    {payment.transactionRef}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Aangemaakt:
                                </span>
                                <span className="ml-2 text-sm">
                                  {new Date(payment.createdAt).toLocaleDateString('nl-NL')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveEscrowPayment(payment.id)}
                            >
                              Goedkeuren
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const notes = prompt('Reden voor afwijzing:');
                                if (notes) {
                                  handleRejectEscrowPayment(payment.id, notes);
                                }
                              }}
                            >
                              Afwijzen
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </PageSection>
            ) : (
              <PageSection
                title="Escrow betalingen te controleren"
                description="Er zijn momenteel geen escrow betalingen die wachten op review"
              >
                <div className="rounded-lg border border-border bg-surface-muted/30 p-6 text-center text-sm text-foreground-muted">
                  Geen escrow betalingen in afwachting van review
                </div>
              </PageSection>
            )}

            {/* Payouts die wachten op uitbetaling */}
            {pendingPayouts.length > 0 ? (
              <PageSection
                title={`Payouts te betalen (${pendingPayouts.length})`}
                description="Milestones die goedgekeurd zijn en wachten op uitbetaling aan aannemers"
              >
                <div className="space-y-4">
                  {pendingPayouts.map((payout) => (
                    <Card key={payout.id}>
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {payout.milestone?.title || 'Milestone'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Project: {payout.project?.title || 'Onbekend project'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Aannemer: {payout.contractor?.companyName || `${payout.contractor?.firstName} ${payout.contractor?.lastName}`}
                            </p>
                            <div className="mt-3 flex items-center gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Bedrag:
                                </span>
                                <span className="ml-2 font-semibold">
                                  {formatCurrency(payout.amount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Aangevraagd:
                                </span>
                                <span className="ml-2 text-sm">
                                  {new Date(payout.requestedAt).toLocaleDateString('nl-NL')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkPayoutPaid(payout.id)}
                            >
                              Markeer als betaald
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </PageSection>
            ) : (
              <PageSection
                title="Payouts te betalen"
                description="Er zijn momenteel geen payouts die wachten op uitbetaling"
              >
                <div className="rounded-lg border border-border bg-surface-muted/30 p-6 text-center text-sm text-foreground-muted">
                  Geen payouts in afwachting van uitbetaling
                </div>
              </PageSection>
            )}
          </>
        )}
    </div>
  );
}

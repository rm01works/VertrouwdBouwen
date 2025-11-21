'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, ShieldCheck, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { initiateProjectPayment } from '@/lib/api/project-payments';
import { useToast } from '@/hooks/useToast';

interface PaymentFormProps {
  projectId: string;
  projectTitle: string;
  totalBudget: number;
  currentFunded: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentForm({
  projectId,
  projectTitle,
  totalBudget,
  currentFunded,
  isOpen,
  onClose,
  onSuccess,
}: PaymentFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const remainingBudget = totalBudget - currentFunded;
  const amountNum = parseFloat(amount) || 0;

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💳 PaymentForm: handleSubmit called', { projectId, amount, amountNum, remainingBudget });

    if (!amount || amountNum <= 0) {
      console.log('❌ PaymentForm: Invalid amount', { amount, amountNum });
      showError('Voer een geldig bedrag in');
      return;
    }

    if (amountNum > remainingBudget) {
      console.log('❌ PaymentForm: Amount exceeds remaining budget', { amountNum, remainingBudget });
      showError(`Bedrag mag niet hoger zijn dan resterend budget (${formatCurrency(remainingBudget)})`);
      return;
    }

    setIsSubmitting(true);
    console.log('💳 PaymentForm: Submitting payment...', { projectId, amount: amountNum, transactionRef });

    try {
      const response = await initiateProjectPayment(projectId, {
        amount: amountNum,
        transactionRef: transactionRef.trim() || undefined,
      });

      console.log('💳 PaymentForm: Response received', { success: response.success, error: response.error });

      if (response.success) {
        console.log('✅ PaymentForm: Payment submitted successfully');
        success('Betaling succesvol ingediend! De admin zal deze betaling controleren en goedkeuren.');
        setAmount('');
        setTransactionRef('');
        onSuccess();
        onClose();
      } else {
        console.error('❌ PaymentForm: Payment submission failed', response.error);
        showError(response.error?.message || 'Fout bij het indienen van betaling');
      }
    } catch (err) {
      console.error('❌ PaymentForm: Exception during payment submission', err);
      showError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || typeof window === 'undefined') {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <Card 
        className="w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Escrow Betaling Bevestigen</CardTitle>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-50"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </CardHeader>
        <CardBody className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Info box */}
            <div className="rounded-xl border border-info/30 bg-info/10 dark:bg-info/20 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-info">
                  <div>
                    <p className="font-bold mb-1">Stap 1: Betaling Doen</p>
                    <p className="text-info/90">
                      Maak eerst de betaling over naar het escrow account via je bank of betaalprovider.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Stap 2: Bevestig Hier</p>
                    <p className="text-info/90">
                      Vul hieronder het bedrag en eventuele transactiereferentie in om te bevestigen dat je de betaling hebt gedaan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-foreground-muted mb-1">Project</p>
                <p className="text-sm font-bold text-foreground">{projectTitle}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted/50 p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground-muted">Totaal budget:</span>
                  <span className="font-bold text-foreground">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground-muted">Reeds gefund:</span>
                  <span className="font-medium text-foreground">{formatCurrency(currentFunded)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Resterend budget:</span>
                  <span className="font-bold text-primary">{formatCurrency(remainingBudget)}</span>
                </div>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-foreground mb-2">
                Bedrag dat je hebt overgemaakt *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  <CreditCard className="h-5 w-5" />
                </div>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBudget}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface pl-11 pr-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-foreground-muted">
                Voer het exacte bedrag in dat je hebt overgemaakt. Maximum: <span className="font-semibold">{formatCurrency(remainingBudget)}</span>
              </p>
            </div>

            {/* Transaction reference */}
            <div>
              <label htmlFor="transactionRef" className="block text-sm font-bold text-foreground mb-2">
                Transactie Referentie <span className="text-foreground-muted font-normal">(aanbevolen)</span>
              </label>
              <input
                id="transactionRef"
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Bijv. TXN-123456 of IBAN-REF-789"
              />
              <p className="mt-2 text-xs text-foreground-muted">
                Voer de transactiereferentie in van je bankoverboeking (helpt de admin bij verificatie)
              </p>
            </div>

            {/* Warning box */}
            <div className="rounded-xl border border-warning/30 bg-warning/10 dark:bg-warning/20 p-4 space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-warning">
                  <p className="font-bold">Belangrijk:</p>
                  <p className="text-warning/90">
                    Door op &quot;Bevestig Betaling&quot; te klikken, bevestig je dat je de betaling daadwerkelijk hebt gedaan.
                  </p>
                  <p className="text-warning/90">
                    Een admin zal deze betaling controleren en goedkeuren. Zodra het project volledig gefund is (FULLY_FUNDED), 
                    kan de aannemer beginnen met de milestones.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                className="flex-1"
                startIcon={<ShieldCheck className="h-4 w-4" />}
              >
                Bevestig Betaling
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>,
    document.body
  );
}


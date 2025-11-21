'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-popover max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Escrow Betaling Bevestigen</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
        <div className="rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-info mb-4">
          <p className="font-medium mb-2">📋 Stap 1: Betaling Doen</p>
          <p className="mb-2">
            Maak eerst de betaling over naar het escrow account via je bank of betaalprovider.
          </p>
          <p className="font-medium mb-2">✅ Stap 2: Bevestig Hier</p>
          <p>
            Vul hieronder het bedrag en eventuele transactiereferentie in om te bevestigen dat je de betaling hebt gedaan.
          </p>
        </div>

        <div>
          <p className="text-sm text-foreground-muted mb-4">
            Project: <span className="font-medium text-foreground">{projectTitle}</span>
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Totaal budget:</span>
              <span className="font-medium">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Reeds gefund:</span>
              <span className="font-medium">{formatCurrency(currentFunded)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
              <span>Resterend budget:</span>
              <span>{formatCurrency(remainingBudget)}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Bedrag dat je hebt overgemaakt *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={remainingBudget}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0.00"
            required
          />
          <p className="mt-1 text-xs text-foreground-muted">
            Voer het exacte bedrag in dat je hebt overgemaakt. Maximum: {formatCurrency(remainingBudget)}
          </p>
        </div>

        <div>
          <label htmlFor="transactionRef" className="block text-sm font-medium text-foreground mb-2">
            Transactie Referentie (aanbevolen)
          </label>
          <input
            id="transactionRef"
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Bijv. TXN-123456 of IBAN-REF-789"
          />
          <p className="mt-1 text-xs text-foreground-muted">
            Voer de transactiereferentie in van je bankoverboeking (helpt de admin bij verificatie)
          </p>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <p className="font-medium mb-1">⚠️ Belangrijk:</p>
          <p className="mb-2">
            Door op "Bevestig Betaling" te klikken, bevestig je dat je de betaling daadwerkelijk hebt gedaan.
          </p>
          <p>
            Een admin zal deze betaling controleren en goedkeuren. Zodra het project volledig gefund is (FULLY_FUNDED), 
            kan de aannemer beginnen met de milestones.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuleren
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Bevestig Betaling
          </Button>
        </div>
      </form>
      <div className="border-t border-border px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
          Sluiten
        </Button>
      </div>
      </div>
    </div>,
    document.body
  );
}


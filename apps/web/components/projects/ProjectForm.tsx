'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { MilestoneForm, MilestoneFormData } from './MilestoneForm';
import { createProject } from '@/lib/api/projects';
import { getContractors, Contractor } from '@/lib/api/users';
import { formatCurrency } from '@/lib/utils/format';
import { useToast } from '@/hooks/useToast';

interface ProjectFormData {
  title: string;
  description: string;
  totalBudget: string;
  startDate: string;
  endDate: string;
  contractorId: string;
  milestones: MilestoneFormData[];
}

interface FormErrors {
  title?: string;
  description?: string;
  totalBudget?: string;
  startDate?: string;
  endDate?: string;
  contractorId?: string;
  milestones?: Array<{
    title?: string;
    description?: string;
    amount?: string;
    dueDate?: string;
  }>;
  general?: string;
}

export function ProjectForm() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    totalBudget: '',
    startDate: '',
    endDate: '',
    contractorId: '',
    milestones: [
      {
        title: '',
        description: '',
        amount: '',
        dueDate: '',
      },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoadingContractors, setIsLoadingContractors] = useState(true);

  // Haal aannemers op bij mount
  useEffect(() => {
    const loadContractors = async () => {
      try {
        setIsLoadingContractors(true);
        const response = await getContractors();
        if (response.success && response.data) {
          setContractors(response.data);
        } else {
          showError('Fout bij het laden van aannemers');
        }
      } catch (error) {
        showError('Fout bij het laden van aannemers');
      } finally {
        setIsLoadingContractors(false);
      }
    };

    loadContractors();
  }, [showError]);

  const updateFormData = (field: keyof ProjectFormData, value: string | string[] | MilestoneFormData[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = {
        ...newMilestones[index],
        [field]: value,
      };
      return {
        ...prev,
        milestones: newMilestones,
      };
    });

    // Clear milestone error
    if (errors.milestones?.[index]?.[field]) {
      setErrors((prev) => {
        const newMilestoneErrors = [...(prev.milestones || [])];
        newMilestoneErrors[index] = {
          ...newMilestoneErrors[index],
          [field]: undefined,
        };
        return {
          ...prev,
          milestones: newMilestoneErrors,
        };
      });
    }
  };

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: '',
          description: '',
          amount: '',
          dueDate: '',
        },
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      setFormData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate project fields
    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Titel moet minimaal 3 karakters zijn';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Beschrijving moet minimaal 10 karakters zijn';
    }

    if (!formData.totalBudget) {
      newErrors.totalBudget = 'Totaal budget is verplicht';
    } else {
      const budget = parseFloat(formData.totalBudget);
      if (isNaN(budget) || budget <= 0) {
        newErrors.totalBudget = 'Budget moet een positief getal zijn';
      }
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'Einddatum moet na startdatum zijn';
      }
    }

    // Validate contractor selection (optional, maar aanbevolen)
    // We maken het optioneel zodat consumenten ook zonder aannemer kunnen starten

    // Validate milestones
    const milestoneErrors: Array<{
      title?: string;
      description?: string;
      amount?: string;
      dueDate?: string;
    }> = [];

    let totalMilestoneAmount = 0;

    formData.milestones.forEach((milestone) => {
      const milestoneError: {
        title?: string;
        description?: string;
        amount?: string;
        dueDate?: string;
      } = {};

      if (!milestone.title.trim()) {
        milestoneError.title = 'Titel is verplicht';
      } else if (milestone.title.trim().length < 3) {
        milestoneError.title = 'Titel moet minimaal 3 karakters zijn';
      }

      if (!milestone.description.trim()) {
        milestoneError.description = 'Beschrijving is verplicht';
      } else if (milestone.description.trim().length < 10) {
        milestoneError.description = 'Beschrijving moet minimaal 10 karakters zijn';
      }

      if (!milestone.amount) {
        milestoneError.amount = 'Bedrag is verplicht';
      } else {
        const amount = parseFloat(milestone.amount);
        if (isNaN(amount) || amount <= 0) {
          milestoneError.amount = 'Bedrag moet een positief getal zijn';
        } else {
          totalMilestoneAmount += amount;
        }
      }

      milestoneErrors.push(milestoneError);
    });

    if (milestoneErrors.some((e) => Object.keys(e).length > 0)) {
      newErrors.milestones = milestoneErrors;
    }

    const totalBudget = parseFloat(formData.totalBudget || '0');
    if (
      !isNaN(totalBudget) &&
      !isNaN(totalMilestoneAmount) &&
      Math.abs(totalBudget - totalMilestoneAmount) > 0.01
    ) {
      newErrors.totalBudget = `Totaal budget (${formatCurrency(
        totalBudget
      )}) moet overeenkomen met de som van alle milestones (${formatCurrency(
        totalMilestoneAmount
      )})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data for API
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        totalBudget: parseFloat(formData.totalBudget),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        contractorId: formData.contractorId || undefined,
        milestones: formData.milestones.map((milestone, index) => ({
          title: milestone.title.trim(),
          description: milestone.description.trim(),
          amount: parseFloat(milestone.amount),
          order: index + 1,
          dueDate: milestone.dueDate || undefined,
        })),
      };

      const response = await createProject(projectData);

      if (response.success && response.data) {
        success('Project succesvol aangemaakt!');
        router.push(`/dashboard/projects/${response.data.id}`);
      } else {
        showError(response.error?.message || 'Fout bij het aanmaken van het project');
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Er is een onverwachte fout opgetreden'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMilestoneAmount = formData.milestones.reduce((sum, m) => {
    const amount = parseFloat(m.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalBudget = parseFloat(formData.totalBudget || '0');
  const budgetDifference = totalBudget - totalMilestoneAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Project Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            Projectinformatie
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Project Titel"
            name="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="Bijv. Renovatie Keuken en Badkamer"
            required
            error={errors.title}
          />

          <Textarea
            label="Beschrijving"
            name="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Beschrijf het project in detail..."
            required
            rows={5}
            error={errors.description}
            helperText="Minimaal 10 karakters"
          />

          <Select
            label="Aannemer"
            name="contractorId"
            value={formData.contractorId}
            onChange={(e) => updateFormData('contractorId', e.target.value)}
            placeholder="Selecteer een aannemer (optioneel)"
            options={
              isLoadingContractors
                ? [{ value: '', label: 'Laden...' }]
                : contractors.map((contractor) => ({
                    value: contractor.id,
                    label: `${contractor.firstName} ${contractor.lastName}${
                      contractor.companyName ? ` - ${contractor.companyName}` : ''
                    }`,
                  }))
            }
            error={errors.contractorId}
            helperText="Kies een aannemer om direct aan het project te koppelen, of laat leeg om later te selecteren"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Totaal Budget (€)"
              name="totalBudget"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.totalBudget}
              onChange={(e) => updateFormData('totalBudget', e.target.value)}
              placeholder="0.00"
              required
              error={errors.totalBudget}
              helperText={
                formData.totalBudget
                  ? formatCurrency(parseFloat(formData.totalBudget || '0'))
                  : undefined
              }
            />

            <Input
              label="Startdatum"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
              error={errors.startDate}
            />

            <Input
              label="Einddatum"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData('endDate', e.target.value)}
              error={errors.endDate}
            />
          </div>

          {/* Budget Summary */}
          {formData.totalBudget && formData.milestones.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground-muted">
                  Totaal Budget:
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalBudget)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground-muted">
                  Som Milestones:
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalMilestoneAmount)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center pt-2 border-t border-border ${
                  Math.abs(budgetDifference) < 0.01
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >
                <span className="text-sm font-medium">Verschil:</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(budgetDifference)}
                </span>
              </div>
              {Math.abs(budgetDifference) > 0.01 && (
                <p className="text-xs text-danger mt-2">
                  ⚠️ Budget moet overeenkomen met som van milestones
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              Milestones ({formData.milestones.length})
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addMilestone}
            >
              + Milestone toevoegen
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {formData.milestones.map((milestone, index) => (
            <MilestoneForm
              key={index}
              milestone={milestone}
              index={index}
              onChange={updateMilestone}
              onRemove={removeMilestone}
              errors={errors.milestones?.[index]}
            />
          ))}
        </CardBody>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Annuleren
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Project Aanmaken
        </Button>
      </div>
    </form>
  );
}


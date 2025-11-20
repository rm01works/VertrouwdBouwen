'use client';

import React from 'react';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

export interface MilestoneFormData {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
}

interface MilestoneFormProps {
  milestone: MilestoneFormData;
  index: number;
  onChange: (index: number, field: keyof MilestoneFormData, value: string) => void;
  onRemove: (index: number) => void;
  errors?: {
    title?: string;
    description?: string;
    amount?: string;
    dueDate?: string;
  };
}

export function MilestoneForm({
  milestone,
  index,
  onChange,
  onRemove,
  errors,
}: MilestoneFormProps) {
  return (
    <div className="border border-[#333333] rounded-lg p-4 bg-[#2a2a2a]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Milestone {index + 1}
        </h3>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onRemove(index)}
        >
          Verwijderen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Titel"
            name={`milestone-title-${index}`}
            value={milestone.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="Bijv. Voorbereiding en planning"
            required
            error={errors?.title}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Beschrijving"
            name={`milestone-description-${index}`}
            value={milestone.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Beschrijf wat er in deze fase gebeurt..."
            required
            rows={3}
            error={errors?.description}
          />
        </div>

        <Input
          label="Bedrag (€)"
          name={`milestone-amount-${index}`}
          type="number"
          step="0.01"
          min="0.01"
          value={milestone.amount}
          onChange={(e) => onChange(index, 'amount', e.target.value)}
          placeholder="0.00"
          required
          error={errors?.amount}
          helperText={
            milestone.amount
              ? `€ ${parseFloat(milestone.amount || '0').toLocaleString('nl-NL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : undefined
          }
        />

        <Input
          label="Deadline"
          name={`milestone-dueDate-${index}`}
          type="date"
          value={milestone.dueDate}
          onChange={(e) => onChange(index, 'dueDate', e.target.value)}
          error={errors?.dueDate}
        />
      </div>
    </div>
  );
}


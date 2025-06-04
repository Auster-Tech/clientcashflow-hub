
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CostCenter } from '@/types';

const costCenterFormSchema = z.object({
  name: z.string().min(1, 'Cost center name is required'),
  description: z.string().optional(),
});

type CostCenterFormData = z.infer<typeof costCenterFormSchema>;

interface CostCenterFormProps {
  costCenter?: CostCenter | null;
  onSubmit: (data: Omit<CostCenter, 'id'>) => void;
  onCancel: () => void;
}

export function CostCenterForm({ costCenter, onSubmit, onCancel }: CostCenterFormProps) {
  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterFormSchema),
    defaultValues: {
      name: costCenter?.name || '',
      description: costCenter?.description || '',
    },
  });

  const handleSubmit = (data: CostCenterFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Center Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter cost center name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter cost center description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {costCenter ? 'Update Cost Center' : 'Create Cost Center'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

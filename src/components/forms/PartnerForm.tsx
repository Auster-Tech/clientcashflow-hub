
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
import { Partner, Status } from '@/types';

const partnerFormSchema = z.object({
  name: z.string().min(1, 'Partner name is required'),
  contact_info: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

interface PartnerFormProps {
  partner?: Partner | null;
  onSubmit: (data: Omit<Partner, 'id' | 'client_id'>) => void;
  onCancel: () => void;
}

export function PartnerForm({ partner, onSubmit, onCancel }: PartnerFormProps) {
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: partner?.name || '',
      contact_info: partner?.contact_info || '',
    },
  });

  const handleSubmit = (data: PartnerFormData) => {
    onSubmit({
      name: data.name,
      contact_info: data.contact_info || '',
      status: partner?.status ?? Status.ACTIVE,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Partner Name</FormLabel>
            <FormControl><Input placeholder="Enter partner name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="contact_info" render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Info (Optional)</FormLabel>
            <FormControl><Input placeholder="Enter contact information" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{partner ? 'Update Partner' : 'Create Partner'}</Button>
        </div>
      </form>
    </Form>
  );
}

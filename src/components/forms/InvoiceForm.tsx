
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
import { Invoice, Status } from '@/types';

const invoiceFormSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSubmit: (data: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, onSubmit, onCancel }: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice_number: invoice?.invoice_number || '',
      issue_date: invoice?.issue_date ? invoice.issue_date.split('T')[0] : '',
      due_date: invoice?.due_date ? invoice.due_date.split('T')[0] : '',
      amount: invoice?.amount || 0,
    },
  });

  const handleSubmit = (data: InvoiceFormData) => {
    onSubmit({
      invoice_number: data.invoice_number,
      issue_date: data.issue_date,
      due_date: data.due_date,
      amount: data.amount,
      status: invoice?.status ?? Status.ACTIVE,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="invoice_number" render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Number</FormLabel>
            <FormControl><Input placeholder="Enter invoice number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="issue_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="due_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="amount" render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" placeholder="0.00" {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{invoice ? 'Update Invoice' : 'Create Invoice'}</Button>
        </div>
      </form>
    </Form>
  );
}

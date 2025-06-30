
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Category } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a category type',
  }),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      type: (category?.type as 'income' | 'expense') || undefined,
      description: category?.description || '',
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({
      name: data.name,
      type: data.type,
      description: data.description || '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categories.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.enterName')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.type')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">{t('categories.income')}</SelectItem>
                  <SelectItem value="expense">{t('categories.expense')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.description')} ({t('form.optional')})</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.enterDescription')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">
            {category ? t('categories.update') : t('categories.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

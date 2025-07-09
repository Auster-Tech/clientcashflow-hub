
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserRole, Category } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Rent',
    type: 'expense',
    description: 'Monthly rental expenses'
  },
  {
    id: '2',
    name: 'Salaries',
    type: 'expense',
    description: 'Employee salaries'
  },
  {
    id: '3',
    name: 'Sales Revenue',
    type: 'income',
    description: 'Income from product sales'
  },
  {
    id: '4',
    name: 'Interest Income',
    type: 'income',
    description: 'Income from interest payments'
  },
  {
    id: '5',
    name: 'Marketing Expenses',
    type: 'expense',
    description: 'Expenses related to marketing activities'
  }
];

interface CategoriesProps {
  userRole: UserRole;
}

export default function Categories({ userRole }: CategoriesProps) {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const [categories, setCategories] = useState(mockCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpload = (data: any[]) => {
    const newCategories = data.map((item, index) => ({
      id: (categories.length + index + 1).toString(),
      name: item.name || '',
      type: item.type || 'expense',
      description: item.description || '',
    }));
    setCategories([...categories, ...newCategories]);
    setUploadDialogOpen(false);
  };

  const handleSubmit = (data: Omit<Category, 'id'>) => {
    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c))
      );
    } else {
      // Create new category
      const newCategory: Category = {
        id: (categories.length + 1).toString(),
        ...data,
      };
      setCategories([...categories, newCategory]);
    }
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Category>[] = [
    { 
      accessorKey: 'name',
      header: t('common.name'),
    },
    { 
      accessorKey: 'type',
      header: t('common.type'),
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.type === 'income' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.type === 'income' ? t('categories.income') : t('categories.expense')}
        </span>
      )
    },
    { 
      accessorKey: 'description',
      header: t('common.description'),
      cell: ({ row }) => row.original.description || '-'
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: t('categories.total'),
      value: categories.length.toString(),
      icon: Plus,
    },
    {
      title: t('categories.incomeCount'),
      value: categories.filter(c => c.type === 'income').length.toString(),
      icon: Plus,
    },
    {
      title: t('categories.expenseCount'),
      value: categories.filter(c => c.type === 'expense').length.toString(),
      icon: Plus,
    },
  ];

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
              <p className="text-muted-foreground">{t('categories.subtitle')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">{t('categories.selectClient')}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
            <p className="text-muted-foreground">{t('categories.subtitle')}</p>
            {userRole === 'accountant' && selectedClient && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('common.client')}: {selectedClient.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {t('common.upload')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('common.upload')}</DialogTitle>
                  </DialogHeader>
                  <UploadCSV 
                    onUpload={handleUpload}
                    onCancel={() => setUploadDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('categories.add')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? t('categories.edit') : t('categories.add')}
                    </DialogTitle>
                  </DialogHeader>
                  <CategoryForm
                    category={editingCategory}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setDialogOpen(false);
                      setEditingCategory(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredCategories}
            searchColumn="name"
            searchPlaceholder={t('common.search')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

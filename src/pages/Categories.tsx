import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { UserRole, Category } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CategoriesProps {
  userRole?: UserRole;
}

// Mock data for categories
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Office Supplies',
    type: 'expense',
    description: 'Office equipment and supplies'
  },
  {
    id: '2',
    name: 'Travel Expenses',
    type: 'expense',
    description: 'Business travel and accommodation'
  },
  {
    id: '3',
    name: 'Sales Revenue',
    type: 'income',
    description: 'Revenue from product sales'
  },
  {
    id: '4',
    name: 'Consulting Services',
    type: 'income',
    description: 'Income from consulting work'
  },
  {
    id: '5',
    name: 'Marketing',
    type: 'expense',
    description: 'Marketing and advertising expenses'
  }
];

const Categories = ({ userRole = 'accountant' }: CategoriesProps) => {
  const { selectedClient } = useClient();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Show message for accountants who haven't selected a client
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">
                Manage your income and expense categories
              </p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select a client to manage categories.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
      title: "Category deleted",
      description: "The category has been successfully deleted.",
    });
  };

  const handleFormSubmit = (categoryData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...editingCategory, ...categoryData }
            : cat
        )
      );
      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData
      };
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Category created",
        description: "The new category has been successfully created.",
      });
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            type === 'income' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {type === 'income' ? 'Income' : 'Expense'}
          </span>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Manage your income and expense categories
              {selectedClient && ` for ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <Button onClick={handleAddCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Categories"
            value={categories.length}
            icon={Tag}
            description="All categories"
          />
          <StatsCard
            title="Income Categories"
            value={incomeCategories.length}
            icon={TrendingUp}
            description="Revenue categories"
            trend={{
              value: `${Math.round((incomeCategories.length / categories.length) * 100)}%`,
              label: "of total"
            }}
          />
          <StatsCard
            title="Expense Categories"
            value={expenseCategories.length}
            icon={TrendingDown}
            description="Expense categories"
            trend={{
              value: `${Math.round((expenseCategories.length / categories.length) * 100)}%`,
              label: "of total"
            }}
          />
        </div>

        {/* Categories Table */}
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={categories}
            searchColumn="name"
            searchPlaceholder="Search categories..."
          />
        </div>

        {/* Category Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Categories;

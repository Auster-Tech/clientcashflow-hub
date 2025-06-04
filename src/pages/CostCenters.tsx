import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { CostCenterForm } from '@/components/forms/CostCenterForm';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { UserRole, CostCenter } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Tag } from 'lucide-react';
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

interface CostCentersProps {
  userRole?: UserRole;
}

// Mock data for cost centers
const mockCostCenters: CostCenter[] = [
  {
    id: '1',
    name: 'Marketing Department',
    description: 'All marketing and advertising activities'
  },
  {
    id: '2',
    name: 'Sales Team',
    description: 'Sales operations and customer acquisition'
  },
  {
    id: '3',
    name: 'IT Department',
    description: 'Information technology and infrastructure'
  },
  {
    id: '4',
    name: 'Human Resources',
    description: 'HR operations and employee management'
  },
  {
    id: '5',
    name: 'Finance & Accounting',
    description: 'Financial operations and accounting'
  }
];

const CostCenters = ({ userRole = 'accountant' }: CostCentersProps) => {
  const { selectedClient } = useClient();
  const [costCenters, setCostCenters] = useState<CostCenter[]>(mockCostCenters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const { toast } = useToast();

  // Show message for accountants who haven't selected a client
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cost Centers</h1>
              <p className="text-muted-foreground">
                Manage your organizational cost centers
              </p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select a client to manage cost centers.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddCostCenter = () => {
    setEditingCostCenter(null);
    setIsFormOpen(true);
  };

  const handleEditCostCenter = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setIsFormOpen(true);
  };

  const handleDeleteCostCenter = (costCenterId: string) => {
    setCostCenters(prev => prev.filter(cc => cc.id !== costCenterId));
    toast({
      title: "Cost center deleted",
      description: "The cost center has been successfully deleted.",
    });
  };

  const handleFormSubmit = (costCenterData: Omit<CostCenter, 'id'>) => {
    if (editingCostCenter) {
      // Update existing cost center
      setCostCenters(prev => 
        prev.map(cc => 
          cc.id === editingCostCenter.id 
            ? { ...editingCostCenter, ...costCenterData }
            : cc
        )
      );
      toast({
        title: "Cost center updated",
        description: "The cost center has been successfully updated.",
      });
    } else {
      // Add new cost center
      const newCostCenter: CostCenter = {
        id: Date.now().toString(),
        ...costCenterData
      };
      setCostCenters(prev => [...prev, newCostCenter]);
      toast({
        title: "Cost center created",
        description: "The new cost center has been successfully created.",
      });
    }
    setIsFormOpen(false);
    setEditingCostCenter(null);
  };

  const columns: ColumnDef<CostCenter>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const costCenter = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCostCenter(costCenter)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteCostCenter(costCenter.id)}
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

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cost Centers</h1>
            <p className="text-muted-foreground">
              Manage your organizational cost centers
              {selectedClient && ` for ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <Button onClick={handleAddCostCenter} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Cost Center
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Cost Centers"
            value={costCenters.length}
            icon={Tag}
            description="All cost centers"
          />
          <StatsCard
            title="Active Departments"
            value={costCenters.length}
            icon={Tag}
            description="Currently active"
          />
          <StatsCard
            title="Average per Department"
            value="N/A"
            icon={Tag}
            description="Cost allocation"
          />
        </div>

        {/* Cost Centers Table */}
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={costCenters}
            searchColumn="name"
            searchPlaceholder="Search cost centers..."
          />
        </div>

        {/* Cost Center Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCostCenter ? 'Edit Cost Center' : 'Add New Cost Center'}
              </DialogTitle>
            </DialogHeader>
            <CostCenterForm
              costCenter={editingCostCenter}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CostCenters;

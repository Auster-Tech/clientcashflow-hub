
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { PartnerForm } from '@/components/forms/PartnerForm';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserRole, Partner } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Tag, TrendingUp, TrendingDown, Upload } from 'lucide-react';
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

interface PartnersProps {
  userRole?: UserRole;
}

// Mock data for partners
const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'supplier',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    address: '123 Business St, City, State 12345'
  },
  {
    id: '2',
    name: 'Global Tech Solutions',
    type: 'customer',
    email: 'info@globaltech.com',
    phone: '+1-555-0456',
    address: '456 Tech Ave, City, State 67890'
  },
  {
    id: '3',
    name: 'Metro Consulting',
    type: 'vendor',
    email: 'hello@metro.com',
    phone: '+1-555-0789'
  },
  {
    id: '4',
    name: 'Digital Innovations Inc',
    type: 'customer',
    email: 'contact@digitalinc.com',
    phone: '+1-555-0321',
    address: '789 Innovation Blvd, City, State 54321'
  },
  {
    id: '5',
    name: 'Office Supply Co',
    type: 'supplier',
    email: 'orders@officesupply.com',
    phone: '+1-555-0654'
  }
];

const Partners = ({ userRole = 'accountant' }: PartnersProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { toast } = useToast();

  // Show message for accountants who haven't selected a client
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('partners.title')}</h1>
              <p className="text-muted-foreground">{t('partners.subtitle')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('partners.selectClient')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddPartner = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const handleUploadCSV = () => {
    setIsUploadOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const handleDeletePartner = (partnerId: string) => {
    setPartners(prev => prev.filter(partner => partner.id !== partnerId));
    toast({
      title: t('partners.title'),
      description: t('common.delete'),
    });
  };

  const handleFormSubmit = (partnerData: Omit<Partner, 'id'>) => {
    if (editingPartner) {
      setPartners(prev => 
        prev.map(partner => 
          partner.id === editingPartner.id 
            ? { ...editingPartner, ...partnerData }
            : partner
        )
      );
      toast({
        title: t('partners.update'),
        description: t('common.update'),
      });
    } else {
      const newPartner: Partner = {
        id: Date.now().toString(),
        ...partnerData
      };
      setPartners(prev => [...prev, newPartner]);
      toast({
        title: t('partners.create'),
        description: t('common.create'),
      });
    }
    setIsFormOpen(false);
    setEditingPartner(null);
  };

  const handleCSVUpload = (csvData: any[]) => {
    const newPartners: Partner[] = csvData.map((row, index) => ({
      id: `csv-${Date.now()}-${index}`,
      name: row.name || row.Name || '',
      type: (row.type || row.Type || 'customer').toLowerCase(),
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      address: row.address || row.Address || ''
    })).filter(partner => partner.name);

    setPartners(prev => [...prev, ...newPartners]);
    setIsUploadOpen(false);
    
    toast({
      title: t('partners.title'),
      description: t('common.upload'),
    });
  };

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: 'name',
      header: t('partners.name'),
    },
    {
      accessorKey: 'type',
      header: t('common.type'),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const typeColors = {
          customer: 'bg-blue-100 text-blue-800',
          supplier: 'bg-green-100 text-green-800',
          vendor: 'bg-purple-100 text-purple-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {type === 'customer' ? t('partners.customer') : type === 'supplier' ? t('partners.supplier') : type}
          </span>
        );
      },
    },
    {
      accessorKey: 'email',
      header: t('partners.email'),
    },
    {
      accessorKey: 'phone',
      header: t('partners.phone'),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditPartner(partner)}>
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeletePartner(partner.id)}
                className="text-red-600"
              >
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const customerPartners = partners.filter(partner => partner.type === 'customer');
  const supplierPartners = partners.filter(partner => partner.type === 'supplier');
  const vendorPartners = partners.filter(partner => partner.type === 'vendor');

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('partners.title')}</h1>
            <p className="text-muted-foreground">
              {t('partners.subtitle')}
              {selectedClient && ` ${t('common.client')}: ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button onClick={handleUploadCSV} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                {t('common.upload')}
              </Button>
              <Button onClick={handleAddPartner} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('partners.add')}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title={t('partners.total')}
            value={partners.length}
            icon={Tag}
            description={t('partners.total')}
          />
          <StatsCard
            title={t('partners.customers')}
            value={customerPartners.length}
            icon={TrendingUp}
            description={t('partners.customers')}
          />
          <StatsCard
            title={t('partners.suppliers')}
            value={supplierPartners.length}
            icon={TrendingDown}
            description={t('partners.suppliers')}
          />
          <StatsCard
            title="Vendors"
            value={vendorPartners.length}
            icon={Tag}
            description="Vendor partners"
          />
        </div>

        {/* Partners Table */}
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={partners}
            searchColumn="name"
            searchPlaceholder={t('common.search')}
          />
        </div>

        {/* Partner Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? t('partners.edit') : t('partners.add')}
              </DialogTitle>
            </DialogHeader>
            <PartnerForm
              partner={editingPartner}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* CSV Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('common.upload')}</DialogTitle>
            </DialogHeader>
            <UploadCSV
              onUpload={handleCSVUpload}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Partners;

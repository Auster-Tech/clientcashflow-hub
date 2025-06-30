
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.cashflow': 'Cashflow',
    'nav.transactions': 'Transactions',
    'nav.accounts': 'Accounts',
    'nav.categories': 'Categories',
    'nav.costCenters': 'Cost Centers',
    'nav.partners': 'Partners',
    'nav.invoices': 'Invoices',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Common
    'common.client': 'Client',
    'common.selectClient': 'Select a client',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.type': 'Type',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.upload': 'Upload CSV',
    'common.downloadTemplate': 'Download Template',
    
    // Forms
    'form.required': 'This field is required',
    'form.selectType': 'Select type',
    'form.enterName': 'Enter name',
    'form.enterDescription': 'Enter description',
    'form.optional': 'Optional',
    
    // Categories
    'categories.title': 'Categories',
    'categories.subtitle': 'Manage your income and expense categories',
    'categories.add': 'Add Category',
    'categories.edit': 'Edit Category',
    'categories.create': 'Create Category',
    'categories.update': 'Update Category',
    'categories.name': 'Category Name',
    'categories.income': 'Income',
    'categories.expense': 'Expense',
    'categories.total': 'Total Categories',
    'categories.incomeCount': 'Income Categories',
    'categories.expenseCount': 'Expense Categories',
    'categories.selectClient': 'Please select a client to view categories',
    
    // Cost Centers
    'costCenters.title': 'Cost Centers',
    'costCenters.subtitle': 'Manage your cost centers',
    'costCenters.add': 'Add Cost Center',
    'costCenters.edit': 'Edit Cost Center',
    'costCenters.create': 'Create Cost Center',
    'costCenters.update': 'Update Cost Center',
    'costCenters.name': 'Cost Center Name',
    'costCenters.total': 'Total Cost Centers',
    'costCenters.active': 'Active',
    'costCenters.inactive': 'Inactive',
    'costCenters.selectClient': 'Please select a client to view cost centers',
    
    // Partners
    'partners.title': 'Partners',
    'partners.subtitle': 'Manage your business partners',
    'partners.add': 'Add Partner',
    'partners.edit': 'Edit Partner',
    'partners.create': 'Create Partner',
    'partners.update': 'Update Partner',
    'partners.name': 'Partner Name',
    'partners.email': 'Email',
    'partners.phone': 'Phone',
    'partners.address': 'Address',
    'partners.total': 'Total Partners',
    'partners.customers': 'Customers',
    'partners.suppliers': 'Suppliers',
    'partners.selectClient': 'Please select a client to view partners',
    'partners.customer': 'Customer',
    'partners.supplier': 'Supplier',
    
    // Invoices
    'invoices.title': 'Invoices',
    'invoices.subtitle': 'Manage your invoices',
    'invoices.add': 'Add Invoice',
    'invoices.edit': 'Edit Invoice',
    'invoices.create': 'Create Invoice',
    'invoices.update': 'Update Invoice',
    'invoices.number': 'Invoice Number',
    'invoices.amount': 'Amount',
    'invoices.date': 'Date',
    'invoices.dueDate': 'Due Date',
    'invoices.client': 'Client',
    'invoices.total': 'Total Invoices',
    'invoices.pending': 'Pending',
    'invoices.paid': 'Paid',
    'invoices.overdue': 'Overdue',
    'invoices.selectClient': 'Please select a client to view invoices',
    
    // Language
    'language.toggle': 'Language',
    'language.english': 'English',
    'language.portuguese': 'Portuguese',
    
    // Toast messages
    'toast.loggedOut': 'Logged out successfully',
    'toast.loggedOutDesc': 'You have been logged out of your account.',
  },
  pt: {
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.clients': 'Clientes',
    'nav.cashflow': 'Fluxo de Caixa',
    'nav.transactions': 'Transações',
    'nav.accounts': 'Contas',
    'nav.categories': 'Categorias',
    'nav.costCenters': 'Centros de Custo',
    'nav.partners': 'Parceiros',
    'nav.invoices': 'Faturas',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    
    // Common
    'common.client': 'Cliente',
    'common.selectClient': 'Selecionar um cliente',
    'common.add': 'Adicionar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.create': 'Criar',
    'common.update': 'Atualizar',
    'common.name': 'Nome',
    'common.description': 'Descrição',
    'common.type': 'Tipo',
    'common.status': 'Status',
    'common.actions': 'Ações',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.upload': 'Carregar CSV',
    'common.downloadTemplate': 'Baixar Modelo',
    
    // Forms
    'form.required': 'Este campo é obrigatório',
    'form.selectType': 'Selecionar tipo',
    'form.enterName': 'Digite o nome',
    'form.enterDescription': 'Digite a descrição',
    'form.optional': 'Opcional',
    
    // Categories
    'categories.title': 'Categorias',
    'categories.subtitle': 'Gerencie suas categorias de receita e despesa',
    'categories.add': 'Adicionar Categoria',
    'categories.edit': 'Editar Categoria',
    'categories.create': 'Criar Categoria',
    'categories.update': 'Atualizar Categoria',
    'categories.name': 'Nome da Categoria',
    'categories.income': 'Receita',
    'categories.expense': 'Despesa',
    'categories.total': 'Total de Categorias',
    'categories.incomeCount': 'Categorias de Receita',
    'categories.expenseCount': 'Categorias de Despesa',
    'categories.selectClient': 'Por favor, selecione um cliente para ver as categorias',
    
    // Cost Centers
    'costCenters.title': 'Centros de Custo',
    'costCenters.subtitle': 'Gerencie seus centros de custo',
    'costCenters.add': 'Adicionar Centro de Custo',
    'costCenters.edit': 'Editar Centro de Custo',
    'costCenters.create': 'Criar Centro de Custo',
    'costCenters.update': 'Atualizar Centro de Custo',
    'costCenters.name': 'Nome do Centro de Custo',
    'costCenters.total': 'Total de Centros de Custo',
    'costCenters.active': 'Ativo',
    'costCenters.inactive': 'Inativo',
    'costCenters.selectClient': 'Por favor, selecione um cliente para ver os centros de custo',
    
    // Partners
    'partners.title': 'Parceiros',
    'partners.subtitle': 'Gerencie seus parceiros de negócios',
    'partners.add': 'Adicionar Parceiro',
    'partners.edit': 'Editar Parceiro',
    'partners.create': 'Criar Parceiro',
    'partners.update': 'Atualizar Parceiro',
    'partners.name': 'Nome do Parceiro',
    'partners.email': 'Email',
    'partners.phone': 'Telefone',
    'partners.address': 'Endereço',
    'partners.total': 'Total de Parceiros',
    'partners.customers': 'Clientes',
    'partners.suppliers': 'Fornecedores',
    'partners.selectClient': 'Por favor, selecione um cliente para ver os parceiros',
    'partners.customer': 'Cliente',
    'partners.supplier': 'Fornecedor',
    
    // Invoices
    'invoices.title': 'Faturas',
    'invoices.subtitle': 'Gerencie suas faturas',
    'invoices.add': 'Adicionar Fatura',
    'invoices.edit': 'Editar Fatura',
    'invoices.create': 'Criar Fatura',
    'invoices.update': 'Atualizar Fatura',
    'invoices.number': 'Número da Fatura',
    'invoices.amount': 'Valor',
    'invoices.date': 'Data',
    'invoices.dueDate': 'Data de Vencimento',
    'invoices.client': 'Cliente',
    'invoices.total': 'Total de Faturas',
    'invoices.pending': 'Pendente',
    'invoices.paid': 'Pago',
    'invoices.overdue': 'Vencido',
    'invoices.selectClient': 'Por favor, selecione um cliente para ver as faturas',
    
    // Language
    'language.toggle': 'Idioma',
    'language.english': 'Inglês',
    'language.portuguese': 'Português',
    
    // Toast messages
    'toast.loggedOut': 'Deslogado com sucesso',
    'toast.loggedOutDesc': 'Você foi deslogado da sua conta.',
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

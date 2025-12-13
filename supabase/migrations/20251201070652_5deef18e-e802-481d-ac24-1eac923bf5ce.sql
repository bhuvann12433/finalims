-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin Users Table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parties Table
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  gstin TEXT,
  pan TEXT,
  party_type TEXT NOT NULL CHECK (party_type IN ('customer', 'supplier', 'both')),
  party_category TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_pincode TEXT,
  billing_country TEXT DEFAULT 'India',
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  shipping_country TEXT DEFAULT 'India',
  credit_limit DECIMAL(15, 2) DEFAULT 0,
  opening_balance DECIMAL(15, 2) DEFAULT 0,
  balance DECIMAL(15, 2) DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_branch TEXT,
  dl_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Godowns (Warehouses) Table
CREATE TABLE public.godowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_code TEXT UNIQUE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('goods', 'service')),
  category TEXT,
  measuring_unit TEXT DEFAULT 'PCS',
  sales_price DECIMAL(15, 2) DEFAULT 0,
  purchase_price DECIMAL(15, 2) DEFAULT 0,
  mrp DECIMAL(15, 2) DEFAULT 0,
  wholesale_price DECIMAL(15, 2) DEFAULT 0,
  gst_rate DECIMAL(5, 2) DEFAULT 0,
  hsn_code TEXT,
  enable_batching BOOLEAN DEFAULT false,
  low_stock_threshold INTEGER DEFAULT 10,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Table
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  godown_id UUID NOT NULL REFERENCES public.godowns(id) ON DELETE CASCADE,
  batch_number TEXT,
  quantity DECIMAL(15, 3) DEFAULT 0,
  value DECIMAL(15, 2) DEFAULT 0,
  manufacturing_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, godown_id, batch_number)
);

-- Invoices Table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_prefix TEXT DEFAULT 'INV',
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_terms TEXT,
  godown_id UUID REFERENCES public.godowns(id),
  subtotal DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  payment_received DECIMAL(15, 2) DEFAULT 0,
  balance_due DECIMAL(15, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial', 'overdue')),
  notes TEXT,
  terms_conditions TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  signature_url TEXT,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  batch_number TEXT,
  quantity DECIMAL(15, 3) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_percent DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Log Table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'payment_received', 'payment_made', 'expense')),
  party_id UUID REFERENCES public.parties(id),
  party_name TEXT,
  invoice_id UUID REFERENCES public.invoices(id),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  payment_mode TEXT,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_mode TEXT,
  reference_number TEXT,
  description TEXT,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated admins (all tables accessible to authenticated users)
CREATE POLICY "Admins can view all admin_users" ON public.admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert admin_users" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update admin_users" ON public.admin_users FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can manage parties" ON public.parties FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage godowns" ON public.godowns FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage items" ON public.items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage stock" ON public.stock FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_parties_party_type ON public.parties(party_type);
CREATE INDEX idx_stock_item_id ON public.stock(item_id);
CREATE INDEX idx_stock_godown_id ON public.stock(godown_id);
CREATE INDEX idx_invoices_party_id ON public.invoices(party_id);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_payment_status ON public.invoices(payment_status);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_party_id ON public.transactions(party_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update party balance
CREATE OR REPLACE FUNCTION public.update_party_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.parties
    SET balance = opening_balance + (
      SELECT COALESCE(SUM(balance_due), 0)
      FROM public.invoices
      WHERE party_id = NEW.party_id
    )
    WHERE id = NEW.party_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_invoice_change
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_party_balance();

-- Insert default godown
INSERT INTO public.godowns (name, address) VALUES ('Main Warehouse', 'Default warehouse location');
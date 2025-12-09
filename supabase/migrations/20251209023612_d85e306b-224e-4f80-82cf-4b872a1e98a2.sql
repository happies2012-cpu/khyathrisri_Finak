-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'owner');

-- Create subscription plans enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'starter', 'business', 'enterprise');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  subscription_plan subscription_plan DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create hosting_accounts table (workspaces for hosting)
CREATE TABLE public.hosting_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan subscription_plan DEFAULT 'free',
  domain TEXT,
  server_location TEXT DEFAULT 'us-east',
  storage_used_gb DECIMAL DEFAULT 0,
  bandwidth_used_gb DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hosting_account_members table for team access
CREATE TABLE public.hosting_account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(hosting_account_id, user_id)
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for billing
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE SET NULL,
  plan subscription_plan NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create activity_log table for real-time updates
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create domains table
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE SET NULL,
  domain_name TEXT NOT NULL UNIQUE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  dns_records JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create testimonials table for landing page
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check hosting account membership
CREATE OR REPLACE FUNCTION public.is_hosting_account_member(_user_id UUID, _account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hosting_accounts WHERE id = _account_id AND owner_id = _user_id
    UNION
    SELECT 1 FROM public.hosting_account_members WHERE hosting_account_id = _account_id AND user_id = _user_id
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Hosting accounts policies
CREATE POLICY "Users can view own hosting accounts" ON public.hosting_accounts FOR SELECT USING (
  owner_id = auth.uid() OR public.is_hosting_account_member(auth.uid(), id)
);
CREATE POLICY "Users can create hosting accounts" ON public.hosting_accounts FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update hosting accounts" ON public.hosting_accounts FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete hosting accounts" ON public.hosting_accounts FOR DELETE USING (owner_id = auth.uid());

-- Hosting account members policies
CREATE POLICY "Members can view account members" ON public.hosting_account_members FOR SELECT USING (
  public.is_hosting_account_member(auth.uid(), hosting_account_id)
);
CREATE POLICY "Owners can manage members" ON public.hosting_account_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.hosting_accounts WHERE id = hosting_account_id AND owner_id = auth.uid())
);

-- Invitations policies
CREATE POLICY "Users can view invitations to their email" ON public.invitations FOR SELECT USING (true);
CREATE POLICY "Account owners can create invitations" ON public.invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.hosting_accounts WHERE id = hosting_account_id AND owner_id = auth.uid())
);
CREATE POLICY "Account owners can manage invitations" ON public.invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.hosting_accounts WHERE id = hosting_account_id AND owner_id = auth.uid())
);

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Ticket comments policies
CREATE POLICY "Users can view ticket comments" ON public.ticket_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Users can create comments" ON public.ticket_comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (
  user_id = auth.uid() OR public.is_hosting_account_member(auth.uid(), hosting_account_id)
);
CREATE POLICY "Users can create activity" ON public.activity_log FOR INSERT WITH CHECK (user_id = auth.uid());

-- Domains policies
CREATE POLICY "Users can view own domains" ON public.domains FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own domains" ON public.domains FOR ALL USING (user_id = auth.uid());

-- Testimonials are public
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hosting_accounts_updated_at BEFORE UPDATE ON public.hosting_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity and tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_hosting_accounts_owner ON public.hosting_accounts(owner_id);
CREATE INDEX idx_hosting_account_members_user ON public.hosting_account_members(user_id);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_domains_user ON public.domains(user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample testimonials
INSERT INTO public.testimonials (author_name, author_title, content, rating, is_featured) VALUES
('Sarah Johnson', 'CEO at TechStart', 'KSFoundation hosting transformed our online presence. 99.9% uptime and blazing fast speeds!', 5, true),
('Mike Chen', 'Developer', 'The one-click WordPress install saved me hours. Best hosting decision I ever made.', 5, true),
('Emily Rodriguez', 'E-commerce Owner', 'Moved from a competitor and saw 40% faster load times. Customer support is amazing!', 5, true),
('David Kim', 'Freelance Designer', 'Affordable, reliable, and the control panel is intuitive. Highly recommend for any project.', 5, false),
('Lisa Thompson', 'Blogger', 'Started with shared hosting, now on VPS. Seamless upgrade path and great performance.', 5, false);
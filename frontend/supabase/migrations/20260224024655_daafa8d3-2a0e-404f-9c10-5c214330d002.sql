
-- Fix profiles policies: drop restrictive, recreate as permissive
DROP POLICY "Admins can read all profiles" ON public.profiles;
DROP POLICY "Users can read own profile" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix invoices policies
DROP POLICY "Admins can read all invoices" ON public.invoices;
DROP POLICY "Users can read own invoices" ON public.invoices;

CREATE POLICY "Admins can read all invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix payment_methods policies
DROP POLICY "Admins can read all payment methods" ON public.payment_methods;
DROP POLICY "Users can manage own payment methods" ON public.payment_methods;

CREATE POLICY "Admins can read all payment methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own payment methods"
  ON public.payment_methods FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix user_roles policies
DROP POLICY "Admins can read all roles" ON public.user_roles;
DROP POLICY "Users can read own roles" ON public.user_roles;

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

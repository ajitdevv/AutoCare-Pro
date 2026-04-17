-- =============================================
-- AutoCare Pro - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 0: Disable email confirmation
-- This auto-confirms all new users so no verification email is sent
-- =============================================

-- Auto-confirm any NEW user immediately (skips email verification)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Also confirm any existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'technician')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT,
  vin TEXT,
  color TEXT,
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all vehicles" ON vehicles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all bookings" ON bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Products table (Auto Parts Store)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  brand TEXT,
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT,
  phone TEXT,
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Service History table
CREATE TABLE IF NOT EXISTS service_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  mileage_at_service INTEGER,
  cost DECIMAL(10,2),
  service_date DATE NOT NULL,
  next_service_date DATE,
  technician_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own service history" ON service_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own service history" ON service_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all service history" ON service_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all service history" ON service_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 9. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reviews" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- =============================================
-- Seed Data
-- =============================================

-- Seed Services
INSERT INTO services (name, description, category, price, duration_minutes) VALUES
  ('General Service', 'Complete vehicle inspection, fluid top-up, filter cleaning, and multi-point check.', 'maintenance', 2499.00, 120),
  ('Oil Change', 'Engine oil replacement with premium quality oil and oil filter change.', 'maintenance', 999.00, 45),
  ('Brake Inspection & Repair', 'Complete brake system inspection, pad replacement, and fluid check.', 'repair', 1999.00, 90),
  ('Engine Diagnostics', 'Full computer diagnostics to identify engine issues and error codes.', 'diagnostics', 799.00, 60),
  ('Tire Replacement', 'Tire mounting, balancing, and alignment for all four wheels.', 'tires', 3499.00, 60),
  ('AC Service & Repair', 'Complete AC system check, gas refill, and component inspection.', 'maintenance', 1499.00, 75),
  ('Battery Replacement', 'Battery testing and replacement with warranty-backed new battery.', 'electrical', 2999.00, 30),
  ('Wheel Alignment', 'Precision 4-wheel alignment using computerized equipment.', 'tires', 699.00, 45),
  ('Car Wash & Detailing', 'Premium exterior wash, interior vacuum, dashboard polish, and tire shine.', 'detailing', 499.00, 60),
  ('Suspension Repair', 'Shock absorber, strut inspection, and replacement service.', 'repair', 4999.00, 180),
  ('Clutch Repair', 'Complete clutch plate, pressure plate inspection and replacement.', 'repair', 5999.00, 240),
  ('Paint & Dent Repair', 'Scratch removal, dent repair, and paint touch-up service.', 'bodywork', 2999.00, 180)
ON CONFLICT DO NOTHING;

-- Seed Products
INSERT INTO products (name, description, category, price, stock, brand, sku) VALUES
  ('Engine Oil 5W-30 (4L)', 'Premium fully synthetic engine oil for modern engines. Provides superior protection.', 'oils', 1899.00, 50, 'Castrol', 'OIL-5W30-4L'),
  ('Oil Filter - Universal', 'High-quality oil filter compatible with most car models.', 'filters', 299.00, 100, 'Bosch', 'FIL-OIL-UNI'),
  ('Air Filter - Standard', 'Premium air filter for improved engine performance and fuel efficiency.', 'filters', 449.00, 75, 'Mann', 'FIL-AIR-STD'),
  ('Brake Pads - Front (Set)', 'High-performance ceramic brake pads for reliable stopping power.', 'brakes', 1599.00, 40, 'Brembo', 'BRK-PAD-FRT'),
  ('Brake Pads - Rear (Set)', 'Quality rear brake pads with anti-noise shims.', 'brakes', 1299.00, 40, 'Bosch', 'BRK-PAD-RR'),
  ('Car Battery 60Ah', 'Maintenance-free car battery with 2-year warranty.', 'electrical', 4499.00, 25, 'Amaron', 'BAT-60AH'),
  ('Spark Plugs (Set of 4)', 'Iridium spark plugs for better ignition and fuel efficiency.', 'engine', 899.00, 60, 'NGK', 'SPK-IRID-4'),
  ('Coolant Fluid (1L)', 'Ready-to-use coolant for optimal engine temperature management.', 'fluids', 349.00, 80, 'Shell', 'CLT-1L'),
  ('Wiper Blades (Pair)', 'All-weather wiper blades with natural rubber for clear visibility.', 'accessories', 599.00, 55, 'Bosch', 'WPR-PAIR'),
  ('LED Headlight Bulbs (Pair)', 'Super bright LED headlight bulbs with 50,000 hour lifespan.', 'lighting', 1299.00, 35, 'Philips', 'LED-HEAD-PR'),
  ('Car Phone Mount', 'Universal magnetic car phone mount with 360-degree rotation.', 'accessories', 499.00, 70, 'Generic', 'ACC-PHONE-MT'),
  ('Dash Cam 1080p', 'Full HD dash camera with night vision, loop recording, and G-sensor.', 'accessories', 3499.00, 20, 'Generic', 'ACC-DASHCAM'),
  ('Tire Inflator Portable', 'Portable 12V tire inflator with digital pressure gauge.', 'tools', 1999.00, 30, 'Generic', 'TOOL-INFLATOR'),
  ('Car Seat Cover Set', 'Premium PU leather seat covers, universal fit, easy installation.', 'accessories', 2999.00, 25, 'Generic', 'ACC-SEAT-CVR'),
  ('Steering Wheel Cover', 'Anti-slip leather steering wheel cover for better grip and comfort.', 'accessories', 399.00, 60, 'Generic', 'ACC-STR-CVR')
ON CONFLICT DO NOTHING;

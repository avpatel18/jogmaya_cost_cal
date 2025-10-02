
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create tables for the Textile Calculator

-- Users table (handled by Supabase Auth automatically)

-- Calculations table
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Basic info
  quality_name TEXT NOT NULL,
  
  -- Main parameters
  total_card DECIMAL NOT NULL DEFAULT 0,
  pick_on_looms DECIMAL NOT NULL DEFAULT 0,
  pano DECIMAL NOT NULL DEFAULT 0,
  
  -- Extra info
  wastage_percent DECIMAL DEFAULT 2,
  job_charge DECIMAL DEFAULT 0.35,
  rebate_percent DECIMAL DEFAULT 2,
  sales_rate DECIMAL DEFAULT 335,
  brokerage_percent DECIMAL DEFAULT 0
);

-- Weft feeders table
CREATE TABLE weft_feeders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES calculations(id) ON DELETE CASCADE NOT NULL,
  
  feeder_name TEXT NOT NULL,
  yarn_name TEXT NOT NULL,
  card DECIMAL NOT NULL DEFAULT 0,
  denier DECIMAL NOT NULL DEFAULT 0,
  rate DECIMAL NOT NULL DEFAULT 0,
  wastage_percent DECIMAL DEFAULT 10,
  sort_order INTEGER DEFAULT 0
);

-- Warp yarns table
CREATE TABLE warp_yarns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES calculations(id) ON DELETE CASCADE NOT NULL,
  
  yarn_name TEXT NOT NULL,
  tar DECIMAL NOT NULL DEFAULT 0,
  denier DECIMAL NOT NULL DEFAULT 0,
  rate DECIMAL NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weft_feeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE warp_yarns ENABLE ROW LEVEL SECURITY;

-- Create policies for calculations
CREATE POLICY "Users can view their own calculations" ON calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations" ON calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" ON calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" ON calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for weft_feeders
CREATE POLICY "Users can view their own weft feeders" ON weft_feeders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = weft_feeders.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own weft feeders" ON weft_feeders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = weft_feeders.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own weft feeders" ON weft_feeders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = weft_feeders.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own weft feeders" ON weft_feeders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = weft_feeders.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

-- Create policies for warp_yarns
CREATE POLICY "Users can view their own warp yarns" ON warp_yarns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = warp_yarns.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own warp yarns" ON warp_yarns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = warp_yarns.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own warp yarns" ON warp_yarns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = warp_yarns.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own warp yarns" ON warp_yarns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM calculations 
      WHERE calculations.id = warp_yarns.calculation_id 
      AND calculations.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX calculations_user_id_idx ON calculations(user_id);
CREATE INDEX calculations_created_at_idx ON calculations(created_at DESC);
CREATE INDEX weft_feeders_calculation_id_idx ON weft_feeders(calculation_id);
CREATE INDEX weft_feeders_sort_order_idx ON weft_feeders(sort_order);
CREATE INDEX warp_yarns_calculation_id_idx ON warp_yarns(calculation_id);
CREATE INDEX warp_yarns_sort_order_idx ON warp_yarns(sort_order);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for calculations table
CREATE TRIGGER update_calculations_updated_at 
  BEFORE UPDATE ON calculations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize PostgreSQL database with extensions and optimizations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensor_readings_sensor_timestamp 
ON sensor_readings(sensor_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_energy_readings_device_timestamp 
ON energy_readings(device_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_home_timestamp 
ON security_events(home_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_executions_rule_timestamp 
ON automation_executions(rule_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_timestamp 
ON activities(user_id, timestamp DESC);

-- Create partial indexes for active/online records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devices_online 
ON devices(home_id) WHERE is_online = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_rules_enabled 
ON automation_rules(home_id) WHERE enabled = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_unresolved 
ON security_events(home_id, severity) WHERE resolved = false;

-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devices_home_room_type 
ON devices(home_id, room_id, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sensors_device_type 
ON sensors(device_id, type);

-- Add database-level constraints
ALTER TABLE sensor_readings 
ADD CONSTRAINT chk_sensor_readings_quality 
CHECK (quality IS NULL OR (quality >= 0 AND quality <= 1));

ALTER TABLE energy_readings 
ADD CONSTRAINT chk_energy_readings_power 
CHECK (power >= 0);

ALTER TABLE energy_data 
ADD CONSTRAINT chk_energy_data_battery 
CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));

-- Create views for common queries
CREATE OR REPLACE VIEW device_status_summary AS
SELECT 
  h.id as home_id,
  h.name as home_name,
  COUNT(d.id) as total_devices,
  COUNT(CASE WHEN d.is_online THEN 1 END) as online_devices,
  COUNT(CASE WHEN d.status = 'ERROR' THEN 1 END) as error_devices,
  COUNT(CASE WHEN d.last_seen < NOW() - INTERVAL '5 minutes' THEN 1 END) as stale_devices
FROM homes h
LEFT JOIN devices d ON h.id = d.home_id
GROUP BY h.id, h.name;

CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
  se.*,
  h.name as home_name,
  d.name as device_name
FROM security_events se
JOIN homes h ON se.home_id = h.id
LEFT JOIN devices d ON se.device_id = d.id
WHERE se.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY se.timestamp DESC;

CREATE OR REPLACE VIEW automation_performance AS
SELECT 
  ar.id,
  ar.name,
  ar.home_id,
  ar.enabled,
  ar.executions,
  ar.last_triggered,
  COUNT(ae.id) as logged_executions,
  AVG(ae.duration) as avg_duration,
  COUNT(CASE WHEN ae.success THEN 1 END)::float / COUNT(ae.id) as success_rate
FROM automation_rules ar
LEFT JOIN automation_executions ae ON ar.id = ae.rule_id
WHERE ae.timestamp > NOW() - INTERVAL '30 days'
GROUP BY ar.id, ar.name, ar.home_id, ar.enabled, ar.executions, ar.last_triggered;

-- Create functions for data cleanup
CREATE OR REPLACE FUNCTION cleanup_old_sensor_data()
RETURNS void AS $$
BEGIN
  -- Delete sensor readings older than 7 days
  DELETE FROM sensor_readings 
  WHERE timestamp < NOW() - INTERVAL '7 days';
  
  -- Delete energy readings older than 30 days
  DELETE FROM energy_readings 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete resolved security events older than 30 days
  DELETE FROM security_events 
  WHERE resolved = true 
    AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Delete old automation executions (keep last 30 days)
  DELETE FROM automation_executions 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete old activities (keep last 90 days)
  DELETE FROM activities 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Database cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update device last seen
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices 
  SET last_seen = NOW() 
  WHERE id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_device_last_seen_sensor
  AFTER INSERT ON sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

CREATE TRIGGER trigger_update_device_last_seen_energy
  AFTER INSERT ON energy_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_sensor_data();');

COMMIT;

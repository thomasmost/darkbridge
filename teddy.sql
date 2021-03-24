create table `user` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  verified_at BIGINT NULL,
  disabled_at BIGINT NULL,
  avatar_url varchar(255) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  phone varchar(255) DEFAULT NULL,
  recovery_email varchar(255) DEFAULT NULL,
  given_name VARCHAR(255) NULL,
  family_name VARCHAR(255) NULL,
  password_hash varchar(255) NULL,
  password_salt varchar(255) NULL,
  stripe_express_account_id varchar(255) NULL,
  UNIQUE KEY(email),
  UNIQUE KEY(recovery_email)
);

create table `verify_email_request` (
  verification_token varchar(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  fulfilled_at BIGINT NULL,
  email varchar(255) NOT NULL,
  email_type varchar(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  INDEX(user_id)
);

create table `reset_password_request` (
  verification_token varchar(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  fulfilled_at BIGINT NULL,
  email_sent_to varchar(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  INDEX(user_id)
);

create table `auth_token` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  last_used_at BIGINT NOT NULL,
  disabled_at BIGINT NULL,
  disabled_reason VARCHAR(255) NULL,
  user_id VARCHAR(255) NOT NULL,
  auth_method VARCHAR(255) NOT NULL,
  client_type VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL
);

create table `appointment` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  started_at BIGINT NULL,
  completed_at BIGINT NULL,
  service_provider_user_id VARCHAR(255) NOT NULL,
  client_profile_id VARCHAR(255) NOT NULL,
  parent_appointment_id VARCHAR(255) NULL,
  invoice_id VARCHAR(255) NULL,
  status VARCHAR(255) NOT NULL,
  priority VARCHAR(16) NOT NULL,
  datetime_utc DATETIME NOT NULL,
  datetime_end_utc DATETIME NOT NULL,
  logged_minutes SMALLINT NULL,
  notes TEXT NULL,
  summary VARCHAR(255) NOT NULL DEFAULT '',
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(255) NOT NULL,
  address_postal_code VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  timezone_offset TINYINT NOT NULL,
  coordinates POINT NULL,
  requires_followup TINYINT DEFAULT 0,
  rating_of_service TINYINT NULL,
  rating_of_client TINYINT NULL,
  -- SPATIAL INDEX `SPATIAL` (`coordinates`),
  INDEX(service_provider_user_id),
  INDEX(parent_appointment_id)
);

create table `appointment_activity` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  recorded_at BIGINT NOT NULL,
  acting_user_id VARCHAR(255) NOT NULL,
  appointment_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  note VARCHAR(255) NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL
);

create table `invoice` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  service_provider_user_id VARCHAR(255) NOT NULL,
  client_profile_id VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  payment_method VARCHAR(255) NULL,
  flat_rate INT NULL,
  hourly_rate INT NULL,
  daily_rate INT NULL,
  processing_fee INT NULL,
  minutes_billed INT NULL,
  days_billed INT NULL,
  total_from_line_items INT NOT NULL DEFAULT 0,
  currency_code VARCHAR(255) NOT NULL,
  INDEX(service_provider_user_id),
  INDEX(client_profile_id)
);

create table `invoice_item` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  invoice_id VARCHAR(255) NOT NULL,
  service_provider_user_id VARCHAR(255) NOT NULL,
  client_profile_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_in_minor_units INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
  quantity INT NOT NULL DEFAULT 1,
  metadata_json TEXT NULL,
  INDEX(invoice_id),
  INDEX(service_provider_user_id),
  INDEX(client_profile_id)
);

create table `client_profile` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  user_id VARCHAR(255) NULL,
  created_by_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  given_name VARCHAR(255) NULL,
  family_name VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(255) NOT NULL,
  address_postal_code VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  timezone_offset TINYINT NOT NULL,
  coordinates POINT NULL,
  stripe_customer_id VARCHAR(255) NULL,
  -- SPATIAL INDEX `SPATIAL` (`coordinates`),
  UNIQUE KEY(user_id)
);

create table `contractor_profile` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NULL,
  license_number VARCHAR(255) NULL,
  licensing_state VARCHAR(255) NULL,
  primary_work VARCHAR(255) NULL,
  appointment_fee INT NULL,
  hourly_rate INT NULL,
  daily_rate INT NULL,
  estimated_yearly_income INT NULL,
  estimated_yearly_expenses INT NULL,
  onboarding_completed TINYINT DEFAULT 0,
  UNIQUE KEY(user_id)
);

create table `work_image` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  appointment_id VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  thumb_url VARCHAR(255) DEFAULT NULL
);

create table `user_notification_setting` (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  notification_id VARCHAR(255) NOT NULL,
  email TINYINT NOT NULL,
  push TINYINT NOT NULL,
  text TINYINT NOT NULL,
  UNIQUE KEY(user_id, notification_id)
);

create table `user` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  verified_at BIGINT NULL,
  disabled_at BIGINT NULL,
  email varchar(255) DEFAULT NULL,
  phone varchar(255) NULL,
  recovery_email varchar(255) DEFAULT NULL,
  given_name VARCHAR(255) NULL,
  family_name VARCHAR(255) NULL,
  password_hash varchar(255) NULL,
  password_salt varchar(255) NULL,
  PRIMARY KEY(id),
  UNIQUE KEY(email),
  UNIQUE KEY(recovery_email)
);

create table `verify_email_request` (
  verification_token varchar(255) NOT NULL,
  created_at BIGINT NOT NULL,
  fulfilled_at BIGINT NULL,
  email varchar(255) NOT NULL,
  email_type varchar(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  PRIMARY KEY(verification_token),
  INDEX(user_id)
);

create table `reset_password_request` (
  verification_token varchar(255) NOT NULL,
  created_at BIGINT NOT NULL,
  fulfilled_at BIGINT NULL,
  email_sent_to varchar(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  PRIMARY KEY(verification_token),
  INDEX(user_id)
);

create table `auth_token` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  last_used_at BIGINT NOT NULL,
  disabled_at BIGINT NULL,
  disabled_reason VARCHAR(255) NULL,
  user_id VARCHAR(255) NOT NULL,
  auth_method VARCHAR(255) NOT NULL,
  client_type VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

create table `appointment` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  service_provider_user_id VARCHAR(255) NOT NULL,
  client_profile_id VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  datetime_local: DATETIME NOT NULL,
  datetime_utc: DATETIME NOT NULL,
  timezone: VARCHAR(255) NOT NULL,
  duration_minutes: SMALLINT NOT NULL
);

create table `appointment_activity` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  acting_user_id VARCHAR(255) NOT NULL,
  appointment_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL
);

create table `client_profile` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  user_id VARCHAR(255) NULL,
  created_by_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(255) NOT NULL,
  address_postal_code VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL
);

create table `contractor_profile` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NULL,
  license_number VARCHAR(255) NULL,
  licensing_state VARCHAR(255) NULL,
  primary_work VARCHAR(255) NULL
);

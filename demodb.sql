create table `user` (
  id VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  verified_at BIGINT NULL,
  disabled_at BIGINT NULL,
  email varchar(255) DEFAULT NULL,
  recovery_email varchar(255) DEFAULT NULL,
  given_name VARCHAR(255) NULL,
  family_name VARCHAR(255) NULL,
  password_hash varchar(255) NULL,
  password_salt varchar(255) NULL,
  phone_number varchar(255) NULL,
  company_name varchar(255) NULL,
  title varchar(255) NULL,
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
  user_id VARCHAR(255) NOT NULL,
  organization_id VARCHAR(255) NULL,
  auth_method VARCHAR(255) NOT NULL,
  disabled_reason VARCHAR(255) NULL,
  PRIMARY KEY(id)
);

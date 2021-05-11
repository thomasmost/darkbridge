# Database Management

This document has some basic guidance on setting up secure staging/production MySQL databases, connecting them to your Fargate cluster, and tunneling through an EC2 instance for the purpose of schema setup and migration.

## Environment Variables

For each database instance (staging and prod, for example) you will need a separate set of AWS Secrets for MYSQL_HOST, MYSQL_USERNAME, and MYSQL_PASSWORD. Link to these in your task definition files accordingly.

## Setting up a Database

1. Create the database in RDS (this template assumes MySQL)

- Make sure the database is in the same VPC as your Fargate cluster

2. Configure the security group for your RDS database to allow our Fargate cluster to connnect

- Open Inbound Rules
- Add a MySQL rule with the Source being our Fargate security group (select from dropdown)

3. Create an EC2 instance for the purpose of SSH tunneling

- Use the same VPC as your Fargate cluster
- Create a new security group
- Make sure it's in a public subnet

4. Configure the EC2 instance security group to allow SSH connections from your machine

- Open Inbound Rules
- Add an SSH rule with the Source being your current IP address (select from dropdown)

5. Configure the security group for your RDS database to allow our new EC2 instance to connect

- Open Inbound Rules
- Add a MySQL rule with the Source being our EC2 instance's **private** IPv4 address

6. We can now connect to the RDS database manually! Let's set up the schema.

- SSH into the EC2 instance
- Run `yum install mysql` (may need `sudo`?)
- Connect to your RDS database from the command line
- Create your schema and run your setup script

# ISPB Application Database - MySQL Setup

This directory contains the MySQL database schema and sample data for the ISPB (Indian Society of Pathologists and Bacteriologists) application, converted from the original Supabase/PostgreSQL setup.

## Files Description

### 1. `schema.sql`
Contains the complete database schema with all tables, constraints, and indexes.

**Key Features:**
- 15 main tables matching the original Supabase structure
- Proper foreign key relationships
- Indexes for optimal performance
- MySQL-compatible data types

**Tables included:**
- `activities` - Organization activities and mandates
- `conferences` - Conference information and management
- `conference_registrations` - Conference registration tracking
- `contact_messages` - Contact form submissions
- `gallery` & `gallery_categories` - Image gallery management
- `life_members` - Life member profiles
- `mandates` - Organization mandates
- `membership_plans` - Different membership plan types
- `memberships` - User membership records
- `office_bearers` - Organization leadership
- `orders` - Payment order tracking
- `payment_tracking` - Payment history
- `publications` - Research publications
- `user_roles` - User authentication and roles

### 2. `sample_data.sql`
Contains sample data for testing and development purposes.

**Includes:**
- Sample activities and mandates
- Conference examples
- Membership plans (Annual, Student, Lifetime, Corporate)
- Office bearer profiles
- Life member records
- Publication entries
- Contact messages

### 3. `stored_procedures.sql`
Contains MySQL functions, procedures, triggers, and events.

**Features:**
- `generate_member_code()` - Auto-generates member codes (LM-001, LM-002, etc.)
- `deactivate_expired_memberships()` - Deactivates expired memberships
- `is_admin()` - Checks if user has admin privileges
- Auto-triggers for member code generation and validity updates
- Automated daily cleanup of expired memberships

## Setup Instructions

### Prerequisites
- MySQL 8.0 or higher
- phpMyAdmin (or any MySQL client)
- Proper MySQL user with CREATE, INSERT, UPDATE, DELETE privileges

### Installation Steps

1. **Create Database:**
   ```sql
   CREATE DATABASE ispb_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE ispb_app;
   ```

2. **Import Schema:**
   - In phpMyAdmin, select the `ispb_app` database
   - Go to Import tab
   - Select `schema.sql` file
   - Execute import

3. **Import Sample Data (Optional):**
   - Import `sample_data.sql` for testing data
   - Import `stored_procedures.sql` for functions and triggers

4. **Enable Event Scheduler (if using automated cleanup):**
   ```sql
   SET GLOBAL event_scheduler = ON;
   ```

## Key Differences from Supabase

### Data Type Conversions
- `uuid` → `CHAR(36)` with `UUID()` default
- `timestamp with time zone` → `TIMESTAMP`
- `jsonb` → `JSON`
- `text` → `TEXT`
- `numeric` → `DECIMAL(10,2)`
- `boolean` → `BOOLEAN`

### Authentication Changes
- No built-in auth system (Supabase Auth removed)
- User management through `user_roles` table
- Simple role-based access control

### Missing Features
- Row Level Security (RLS) - implement in application layer
- Real-time subscriptions - implement with WebSockets if needed
- Built-in file storage - use separate file storage solution

## Application Code Changes Required

After importing this database, you'll need to update your application code:

1. **Remove Supabase Dependencies:**
   ```bash
   npm uninstall @supabase/supabase-js
   ```

2. **Install MySQL Client:**
   ```bash
   npm install mysql2
   # or
   npm install mysql
   ```

3. **Update Database Connection:**
   - Replace Supabase client with MySQL connection
   - Update all queries to use MySQL syntax
   - Implement authentication logic in application

4. **Environment Variables:**
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=ispb_app
   DB_PORT=3306
   ```

## Performance Optimization

### Indexes Created
- Active status indexes on all main tables
- User-specific indexes for memberships and orders
- Date indexes for conferences and payments
- Category indexes for gallery items

### Recommended Additional Indexes
Add these if you experience performance issues:
```sql
CREATE INDEX idx_memberships_type_status ON memberships(membership_type, status);
CREATE INDEX idx_conferences_registration_dates ON conferences(date_from, registration_required);
CREATE INDEX idx_publications_category_year ON publications(category, year);
```

## Maintenance Tasks

### Regular Cleanup
- Run `CALL deactivate_expired_memberships();` daily (automated via events)
- Clean old contact messages periodically
- Archive old conference registrations

### Backup Strategy
- Daily backups of the entire database
- Separate backups before major updates
- Export structure and data separately for flexibility

## Security Considerations

1. **User Permissions:**
   - Create separate MySQL users for application vs admin access
   - Use minimal required privileges for each user

2. **Connection Security:**
   - Use SSL for database connections
   - Never store database credentials in version control

3. **Input Validation:**
   - Sanitize all user inputs
   - Use prepared statements for all queries
   - Implement proper error handling

## Support and Migration

For issues or questions about the database setup:
1. Check MySQL error logs
2. Verify all foreign key constraints are satisfied
3. Ensure proper character encoding (utf8mb4)
4. Test with sample data before using in production

The database structure is designed to be compatible with the existing application logic while providing the flexibility of a traditional MySQL setup.
-- Stored Procedures and Functions for ISPB Application MySQL Database

DELIMITER //

-- Function to generate member code
CREATE FUNCTION generate_member_code()
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_number INT;
    DECLARE member_code VARCHAR(50);
    
    -- Get the highest existing member code number
    SELECT COALESCE(MAX(CAST(SUBSTRING(member_code, 4) AS UNSIGNED)), 0) + 1
    INTO next_number
    FROM memberships
    WHERE member_code IS NOT NULL AND member_code REGEXP '^LM-[0-9]+$';
    
    -- Format the member code with leading zeros
    SET member_code = CONCAT('LM-', LPAD(next_number, 3, '0'));
    
    RETURN member_code;
END//

-- Procedure to deactivate expired memberships
CREATE PROCEDURE deactivate_expired_memberships()
BEGIN
    -- Deactivate non-lifetime memberships that have expired
    UPDATE memberships 
    SET status = 'expired'
    WHERE membership_type != 'lifetime' 
      AND status = 'active' 
      AND valid_until < CURDATE();
END//

-- Trigger to auto-generate member code for paid memberships
CREATE TRIGGER auto_generate_member_code
    BEFORE UPDATE ON memberships
    FOR EACH ROW
BEGIN
    -- Only generate member code for paid/manual memberships that don't already have one
    IF (NEW.payment_status IN ('paid', 'manual') AND NEW.status = 'active' AND NEW.member_code IS NULL) THEN
        SET NEW.member_code = generate_member_code();
    END IF;
END//

-- Trigger to update membership validity
CREATE TRIGGER update_membership_validity
    BEFORE UPDATE ON memberships
    FOR EACH ROW
BEGIN
    -- For lifetime memberships, extend valid_until by one year from current date
    IF NEW.membership_type = 'lifetime' AND NEW.status = 'active' THEN
        SET NEW.valid_until = DATE_ADD(CURDATE(), INTERVAL 1 YEAR);
    -- For other memberships, set validity to one year from valid_from date
    ELSEIF NEW.membership_type != 'lifetime' AND NEW.status = 'active' AND NEW.valid_from IS NOT NULL THEN
        SET NEW.valid_until = DATE_ADD(NEW.valid_from, INTERVAL 1 YEAR);
    END IF;
END//

-- Function to check if user is admin
CREATE FUNCTION is_admin(user_uuid CHAR(36))
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE admin_count INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO admin_count
    FROM user_roles 
    WHERE user_id = user_uuid AND role = 'admin';
    
    RETURN admin_count > 0;
END//

-- Procedure to get membership statistics
CREATE PROCEDURE get_membership_stats()
BEGIN
    SELECT 
        COUNT(*) as total_memberships,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_memberships,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_memberships,
        COUNT(CASE WHEN membership_type = 'lifetime' THEN 1 END) as lifetime_memberships,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_memberships
    FROM memberships;
END//

-- Procedure to get conference registration stats
CREATE PROCEDURE get_conference_stats(IN conference_uuid CHAR(36))
BEGIN
    SELECT 
        c.title as conference_title,
        COUNT(cr.id) as total_registrations,
        COUNT(CASE WHEN cr.payment_status = 'paid' THEN 1 END) as paid_registrations,
        SUM(CASE WHEN cr.payment_status = 'paid' THEN cr.amount_paid ELSE 0 END) as total_revenue
    FROM conferences c
    LEFT JOIN conference_registrations cr ON c.id = cr.conference_id
    WHERE c.id = conference_uuid
    GROUP BY c.id, c.title;
END//

-- Procedure to update last login for user roles
CREATE PROCEDURE update_user_last_login(IN user_uuid CHAR(36))
BEGIN
    UPDATE user_roles 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = user_uuid;
END//

-- Event to automatically deactivate expired memberships (runs daily)
CREATE EVENT auto_deactivate_expired_memberships
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL deactivate_expired_memberships()//

DELIMITER ;

-- Enable event scheduler (run this as admin if events are not working)
-- SET GLOBAL event_scheduler = ON;
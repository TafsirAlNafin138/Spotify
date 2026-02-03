import db from '../config/database.js';
import bcrypt from 'bcrypt';

class SuperAdmin {
    // Create a new super admin
    static async create({ name, email, password }) {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO super_admins (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, is_active, created_at, updated_at`,
            [name, email, password_hash]
        );
        return result.rows[0];
    }

    // Find super admin by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT id, name, email, is_active, last_login, created_at, updated_at FROM super_admins WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find super admin by email
    static async findByEmail(email) {
        const result = await db.query(
            'SELECT * FROM super_admins WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Get all super admins
    static async findAll(limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT id, name, email, is_active, last_login, created_at, updated_at 
       FROM super_admins 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    }

    // Update super admin
    static async update(id, { name, email, is_active }) {
        const result = await db.query(
            `UPDATE super_admins 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email),
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING id, name, email, is_active, last_login, created_at, updated_at`,
            [name, email, is_active, id]
        );
        return result.rows[0];
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const password_hash = await bcrypt.hash(newPassword, 10);
        const result = await db.query(
            `UPDATE super_admins 
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2 
       RETURNING id, name, email`,
            [password_hash, id]
        );
        return result.rows[0];
    }

    // Verify password
    static async verifyPassword(email, password) {
        const admin = await this.findByEmail(email);
        if (!admin) return null;

        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) return null;

        // Remove password_hash before returning
        const { password_hash, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
    }

    // Update last login
    static async updateLastLogin(id) {
        const result = await db.query(
            `UPDATE super_admins 
       SET last_login = NOW()
       WHERE id = $1 
       RETURNING id, name, email, last_login`,
            [id]
        );
        return result.rows[0];
    }

    // Deactivate admin
    static async deactivate(id) {
        const result = await db.query(
            `UPDATE super_admins 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 
       RETURNING id, name, email, is_active`,
            [id]
        );
        return result.rows[0];
    }

    // Activate admin
    static async activate(id) {
        const result = await db.query(
            `UPDATE super_admins 
       SET is_active = true, updated_at = NOW()
       WHERE id = $1 
       RETURNING id, name, email, is_active`,
            [id]
        );
        return result.rows[0];
    }

    // Delete super admin
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM super_admins WHERE id = $1 RETURNING id, name, email',
            [id]
        );
        return result.rows[0];
    }

    // Check if email exists
    static async emailExists(email) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM super_admins WHERE email = $1)',
            [email]
        );
        return result.rows[0].exists;
    }

    // Get active admins count
    static async getActiveCount() {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM super_admins WHERE is_active = true'
        );
        return parseInt(result.rows[0].count);
    }

    // Get admin stats
    static async getStats(adminId) {
        const result = await db.query(
            `SELECT 
        (SELECT COUNT(*) FROM admin_audit_logs WHERE admin_id = $1) as total_actions,
        (SELECT COUNT(DISTINCT DATE(created_at)) FROM admin_audit_logs WHERE admin_id = $1) as active_days,
        (SELECT action FROM admin_audit_logs WHERE admin_id = $1 ORDER BY created_at DESC LIMIT 1) as last_action`,
            [adminId]
        );
        return result.rows[0];
    }
}

export default SuperAdmin;
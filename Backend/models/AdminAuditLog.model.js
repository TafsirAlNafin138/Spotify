import db from '../config/database.js';

class AdminAuditLog {
  // Create a new audit log entry
  static async create({ admin_id, action, target_table, target_id, changes, ip_address }) {
    const result = await db.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_table, target_id, changes, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [admin_id, action, target_table, target_id, changes, ip_address]
    );
    return result.rows[0];
  }

  // Get all audit logs
  static async findAll(limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Get audit logs by admin ID
  static async getByAdminId(adminId, limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT * FROM admin_audit_logs 
       WHERE admin_id = $1 
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [adminId, limit, offset]
    );
    return result.rows;
  }

  // Get audit logs by action type
  static async getByAction(action, limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       WHERE al.action = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [action, limit, offset]
    );
    return result.rows;
  }

  // Get audit logs by target table
  static async getByTable(targetTable, limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       WHERE al.target_table = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [targetTable, limit, offset]
    );
    return result.rows;
  }

  // Get audit logs for a specific record
  static async getByTarget(targetTable, targetId, limit = 50) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       WHERE al.target_table = $1 AND al.target_id = $2
       ORDER BY al.created_at DESC
       LIMIT $3`,
      [targetTable, targetId, limit]
    );
    return result.rows;
  }

  // Get audit logs by date range
  static async getByDateRange(startDate, endDate, limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       WHERE al.created_at BETWEEN $1 AND $2
       ORDER BY al.created_at DESC
       LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit, offset]
    );
    return result.rows;
  }

  // Get recent audit logs
  static async getRecent(limit = 50) {
    const result = await db.query(
      `SELECT al.*, sa.name as admin_name, sa.email as admin_email
       FROM admin_audit_logs al
       INNER JOIN super_admins sa ON al.admin_id = sa.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Search audit logs
  static async search({ admin_id, action, target_table, start_date, end_date }, limit = 100, offset = 0) {
    let query = `
      SELECT al.*, sa.name as admin_name, sa.email as admin_email
      FROM admin_audit_logs al
      INNER JOIN super_admins sa ON al.admin_id = sa.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (admin_id) {
      query += ` AND al.admin_id = $${paramCount}`;
      params.push(admin_id);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (target_table) {
      query += ` AND al.target_table = $${paramCount}`;
      params.push(target_table);
      paramCount++;
    }

    if (start_date) {
      query += ` AND al.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND al.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // Get audit log statistics
  static async getStats() {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT admin_id) as unique_admins,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT target_table) as affected_tables,
        (SELECT action FROM admin_audit_logs GROUP BY action ORDER BY COUNT(*) DESC LIMIT 1) as most_common_action`
    );
    return result.rows[0];
  }

  // Get admin activity summary
  static async getAdminActivitySummary(adminId) {
    const result = await db.query(
      `SELECT 
        action,
        COUNT(*) as count
       FROM admin_audit_logs
       WHERE admin_id = $1
       GROUP BY action
       ORDER BY count DESC`,
      [adminId]
    );
    return result.rows;
  }

  // Get table activity summary
  static async getTableActivitySummary() {
    const result = await db.query(
      `SELECT 
        target_table,
        COUNT(*) as count
       FROM admin_audit_logs
       GROUP BY target_table
       ORDER BY count DESC`
    );
    return result.rows;
  }

  // Delete old audit logs (retention policy)
  static async deleteOlderThan(days) {
    const result = await db.query(
      `DELETE FROM admin_audit_logs 
       WHERE created_at < NOW() - INTERVAL '${days} days'`
    );
    return result.rowCount;
  }

  // Get logs count by admin
  static async getCountByAdmin(adminId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM admin_audit_logs WHERE admin_id = $1',
      [adminId]
    );
    return parseInt(result.rows[0].count);
  }
}

export default AdminAuditLog;
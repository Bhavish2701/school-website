/**
 * Centralized ERP Live-Sync Event Bus
 * Broadcasts domain mutation events to connected Server-Sent Events (SSE) clients
 * so authorized dashboards invalidate and refresh live telemetry without full-page reloads.
 */
const { EventEmitter } = require('events');

class LiveSyncBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  /**
   * Emit a structured domain sync event.
   * @param {string} domain - Domain name (STUDENTS, ADMISSIONS, TEACHERS, LEAVES, ATTENDANCE, TIMETABLE, EXAMS, FEES, TRANSFERS, ARCHIVAL, PLATFORM, SETTINGS, COMMUNICATION)
   * @param {string} action - Action performed (CREATED, UPDATED, DELETED, APPROVED, REJECTED, PAID, MARKED, PUBLISHED)
   * @param {object} [meta] - Optional metadata (entityId, academicYear, institutionId, roles)
   */
  emitSync(domain, action, meta = {}) {
    const payload = {
      domain: String(domain || 'GENERAL').toUpperCase(),
      action: String(action || 'UPDATED').toUpperCase(),
      entityId: meta.entityId ? String(meta.entityId) : null,
      academicYear: meta.academicYear || null,
      institutionId: meta.institutionId || null,
      roles: Array.isArray(meta.roles) ? meta.roles : null,
      timestamp: new Date().toISOString(),
    };
    this.emit('sync', payload);
    return payload;
  }
}

module.exports = new LiveSyncBus();

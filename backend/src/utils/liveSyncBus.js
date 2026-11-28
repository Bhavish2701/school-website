const { EventEmitter } = require('events');

class LiveSyncBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

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

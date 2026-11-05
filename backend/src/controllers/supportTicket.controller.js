/**
 * Sri Vidya Educational Trust - Support & Issue Management Controller
 * Module 14: Support Overview, Ticket Directory, Lifecycle Workflow, and Internal Notes
 */

const SupportTicketService = require('../services/supportTicket.service');

const getSupportOverview = async (req, res) => {
  try {
    const result = await SupportTicketService.getSupportOverview();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listTickets = async (req, res) => {
  try {
    const result = await SupportTicketService.listTickets(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTicket = async (req, res) => {
  try {
    const result = await SupportTicketService.getTicketById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const actor = req.body.requesterName || req.user?.username || 'Platform Administrator';
    const result = await SupportTicketService.createTicket(req.body, actor);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const assignTicket = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SupportTicketService.assignTicket(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const changePriority = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SupportTicketService.changePriority(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addReply = async (req, res) => {
  try {
    const actor = req.body.senderName || req.user?.username || 'Support Agent';
    const result = await SupportTicketService.addReply(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const actor = req.body.authorName || req.user?.username || 'Platform Administrator';
    const result = await SupportTicketService.addInternalNote(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const requestAdditionalInfo = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Support Agent';
    const result = await SupportTicketService.requestAdditionalInfo(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const escalateTicket = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Support';
    const result = await SupportTicketService.escalateTicket(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const resolveTicket = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Support';
    const result = await SupportTicketService.resolveTicket(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const reopenTicket = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'School Staff';
    const result = await SupportTicketService.reopenTicket(req.params.id, req.body, actor);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSupportOverview,
  listTickets,
  getTicket,
  createTicket,
  assignTicket,
  changePriority,
  addReply,
  addInternalNote,
  requestAdditionalInfo,
  escalateTicket,
  resolveTicket,
  reopenTicket
};


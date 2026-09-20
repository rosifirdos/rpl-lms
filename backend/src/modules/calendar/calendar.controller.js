import { calendarService } from './calendar.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export const calendarController = {
  async list(req, res, next) {
    try {
      const { events, meta } = await calendarService.getCalendar(req.query);
      return apiResponse.success(res, {
        message: 'Daftar agenda kalender akademik berhasil diambil',
        data: events,
        meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async detail(req, res, next) {
    try {
      const event = await calendarService.getCalendarById(req.params.id);
      return apiResponse.success(res, {
        message: 'Rincian agenda kalender akademik berhasil diambil',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const event = await calendarService.createCalendar(req.body, {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Agenda kalender akademik berhasil dibuat',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const event = await calendarService.updateCalendar(req.params.id, req.body, {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return apiResponse.success(res, {
        message: 'Agenda kalender akademik berhasil diperbarui',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await calendarService.deleteCalendar(req.params.id, {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return apiResponse.success(res, {
        message: 'Agenda kalender akademik berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

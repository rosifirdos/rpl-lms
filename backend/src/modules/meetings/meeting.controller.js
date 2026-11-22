import { MeetingService } from "./meeting.service.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { extractClientInfo } from "../../middlewares/audit.middleware.js";

export class MeetingController {
  static async getMeetingsByClassId(req, res, next) {
    try {
      const { classId } = req.params;
      const { meetings } = await MeetingService.getMeetingsByClassId({
        classId,
        user: req.user,
      });
      return apiResponse.success(res, {
        message: "Daftar 16 pertemuan kelas berhasil diambil",
        data: meetings,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getMeetingById(req, res, next) {
    try {
      const { id } = req.params;
      const meeting = await MeetingService.getMeetingById({
        meetingId: id,
        user: req.user,
      });
      return apiResponse.success(res, {
        message: "Detail pertemuan berhasil diambil",
        data: meeting,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateMeeting(req, res, next) {
    try {
      const { id } = req.params;
      const { ipAddress, userAgent } = extractClientInfo(req);
      const updatedMeeting = await MeetingService.updateMeeting({
        meetingId: id,
        updateData: req.body,
        user: req.user,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        message: "Topik pertemuan berhasil diperbarui",
        data: updatedMeeting,
      });
    } catch (error) {
      return next(error);
    }
  }
}


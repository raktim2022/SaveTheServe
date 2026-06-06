import { VolunteerService } from '../services/volunteer.service.js';

const volunteerService = new VolunteerService();

export class VolunteerController {

  /**
   * GET /api/volunteers/ngos
   * Public – list NGOs for registration dropdown
   */
  async listNGOs(req, res, next) {
    try {
      const ngos = await volunteerService.listNGOs();
      res.json({ success: true, data: ngos });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/volunteers/register
   * Public – volunteer submits application
   */
  async register(req, res, next) {
    try {
      const { ngoId, name, email, phone } = req.body;
      if (!ngoId || !name || !email) {
        return res.status(400).json({ success: false, message: 'ngoId, name, and email are required' });
      }
      const volunteer = await volunteerService.registerVolunteer({
        ngoId: parseInt(ngoId),
        name,
        email,
        phone,
        currentUserId: req.user?.id,
      });
      res.status(201).json({
        success: true,
        message: 'Volunteer application submitted. You will receive an email once the NGO verifies you.',
        data: { id: volunteer.id, name: volunteer.name, email: volunteer.email, status: volunteer.status },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/volunteers/my-ngo
   * NGO – fetch volunteers for their NGO
   */
  async getVolunteersForMyNGO(req, res, next) {
    try {
      const volunteers = await volunteerService.getVolunteersByNGO(req.user.id);
      res.json({ success: true, data: volunteers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/volunteers/:id/verify
   * NGO – verify volunteer, create credentials
   */
  async verify(req, res, next) {
    try {
      const { id } = req.params;
      const volunteer = await volunteerService.verifyVolunteer(parseInt(id), req.user.id);
      res.json({ success: true, message: 'Volunteer accepted. Invite sent via email.', data: volunteer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/volunteers/complete-invite
   * Public – accepted volunteer sets their password from invite email
   */
  async completeInvite(req, res, next) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'token and password are required' });
      }
      const result = await volunteerService.completeInvite(token, password);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/volunteers/:id/reject
   * NGO – reject volunteer application
   */
  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const volunteer = await volunteerService.rejectVolunteer(parseInt(id), req.user.id);
      res.json({ success: true, message: 'Volunteer application rejected.', data: volunteer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/volunteers/me
   * Volunteer – get own profile
   */
  async getMyProfile(req, res, next) {
    try {
      const profile = await volunteerService.getMyProfile(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/volunteers/change-password
   * Volunteer – change temporary password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
      }
      const result = await volunteerService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/volunteers/phone/request-otp
   * Volunteer – request phone OTP
   */
  async requestPhoneOTP(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await volunteerService.requestPhoneOTP(req.user.id, phone);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/volunteers/phone/verify
   * Volunteer – verify phone OTP
   */
  async verifyPhoneOTP(req, res, next) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).json({ success: false, message: 'otp is required' });
      }
      const result = await volunteerService.verifyPhoneOTP(req.user.id, otp);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const volunteerController = new VolunteerController();

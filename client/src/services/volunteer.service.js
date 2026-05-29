import axios from '@/lib/axios';

/**
 * Volunteer service – API integration
 */

/** Public: list all NGOs for the registration dropdown */
export const listNGOs = async () => {
  const res = await axios.get('/volunteers/ngos');
  return res.data;
};

/** Public: submit a volunteer application */
export const registerVolunteer = async ({ ngoId, name, email, phone }) => {
  const res = await axios.post('/volunteers/register', { ngoId, name, email, phone });
  return res.data;
};

// ── NGO endpoints ─────────────────────────────────────────────────────────────

/** NGO: fetch all volunteers for their NGO */
export const getVolunteersForMyNGO = async () => {
  const res = await axios.get('/volunteers/my-ngo');
  return res.data;
};

/** NGO: verify a volunteer application and send credentials */
export const verifyVolunteer = async (volunteerId, temporaryPassword) => {
  const res = await axios.put(`/volunteers/${volunteerId}/verify`, { temporaryPassword });
  return res.data;
};

/** NGO: reject a volunteer application */
export const rejectVolunteer = async (volunteerId) => {
  const res = await axios.put(`/volunteers/${volunteerId}/reject`);
  return res.data;
};

// ── Volunteer endpoints ────────────────────────────────────────────────────────

/** Volunteer: get own profile */
export const getMyVolunteerProfile = async () => {
  const res = await axios.get('/volunteers/me');
  return res.data;
};

/** Volunteer: change temporary password */
export const changeVolunteerPassword = async (currentPassword, newPassword) => {
  const res = await axios.put('/volunteers/change-password', { currentPassword, newPassword });
  return res.data;
};

/** Volunteer: request phone OTP */
export const requestPhoneOTP = async (phone) => {
  const res = await axios.post('/volunteers/phone/request-otp', { phone });
  return res.data;
};

/** Volunteer: verify phone OTP */
export const verifyPhoneOTP = async (otp) => {
  const res = await axios.put('/volunteers/phone/verify', { otp });
  return res.data;
};

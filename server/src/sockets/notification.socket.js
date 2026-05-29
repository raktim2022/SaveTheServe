/**
 * Socket event name constants and typed notification payload builders.
 * Imported by services to emit structured, consistent events.
 */

export const SOCKET_EVENTS = {
  // Food events (broadcast to role:NGO)
  FOOD_NEW:            'food:new',
  FOOD_UPDATED:        'food:updated',
  FOOD_DELETED:        'food:deleted',
  FOOD_STATUS_CHANGED: 'food:status_changed',

  // Request events (sent to individual users)
  REQUEST_NEW:            'request:new',
  REQUEST_STATUS_CHANGED: 'request:status_changed',

  // Generic push notification
  NOTIFICATION_NEW: 'notification:new',

  // Volunteer events (sent to individual volunteer user)
  VOLUNTEER_ASSIGNED: 'volunteer:assigned',
};

/**
 * Build the payload for a new food listing event sent to all NGOs.
 * @param {Object} foodListing
 */
export function buildFoodNewPayload(foodListing) {
  return {
    type: SOCKET_EVENTS.FOOD_NEW,
    message: `New food available: ${foodListing.foodName}`,
    data: foodListing,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build the payload for a new request event sent to the restaurant.
 * @param {Object} request - Full request including ngo and foodListing relations
 */
export function buildRequestNewPayload(request) {
  const ngoName = request.ngo?.ngoName || request.ngo?.user?.name || 'An NGO';
  const foodName = request.foodListing?.foodName || 'a food item';
  return {
    type: SOCKET_EVENTS.REQUEST_NEW,
    message: `${ngoName} requested "${foodName}"`,
    data: request,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build the payload for a request status change event sent to the NGO.
 * @param {number} requestId
 * @param {string} status - ACCEPTED | REJECTED | COMPLETED | CANCELLED
 * @param {number} foodListingId
 */
/**
 * Build the payload for a volunteer pickup assignment event.
 * @param {Object} request - Full request with foodListing + ngo + volunteer relations
 */
export function buildVolunteerAssignedPayload(request) {
  const foodName = request.foodListing?.foodName || 'a food item';
  const donorName = request.foodListing?.restaurant?.shopName || 'Donor';
  return {
    type: SOCKET_EVENTS.VOLUNTEER_ASSIGNED,
    message: `You've been assigned to pick up "${foodName}" from ${donorName}`,
    data: request,
    timestamp: new Date().toISOString(),
  };
}

export function buildRequestStatusPayload(requestId, status, foodListingId) {
  const messages = {
    ACCEPTED:  'Your food request has been accepted!',
    REJECTED:  'Your food request was declined.',
    COMPLETED: 'Your food pickup has been marked as completed!',
    CANCELLED: 'A food request was cancelled.',
  };
  return {
    type: SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
    message: messages[status] ?? `Request status updated to ${status}`,
    data: { requestId, status, foodListingId },
    timestamp: new Date().toISOString(),
  };
}

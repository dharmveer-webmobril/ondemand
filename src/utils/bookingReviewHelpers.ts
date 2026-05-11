// Customer review helpers used by booking list/detail and rating modal.
/** Customer review slice from booking / booked-service API */
export type CustomerReviewSlice = {
  submitted?: boolean;
  rating?: number;
  reviewText?: string;
  updatedAt?: string;
};

export type CustomerReviewInfo = {
  service?: CustomerReviewSlice;
  sp?: CustomerReviewSlice;
  member?: CustomerReviewSlice;
};

export function hasAssignedMember(bookedService: any): boolean {
  const m = bookedService?.assignedMemberId ?? bookedService?.assignedMember;
  if (!m) return false;
  if (typeof m === 'string') return m.length > 0;
  return !!(m?._id);
}

export function bookedServiceNeedsAnyReview(bookedService: any): boolean {
  if (!bookedService) return false;
  const r: CustomerReviewInfo | undefined = bookedService.customerReviewInfo;
  const needMember = hasAssignedMember(bookedService);
  if (!r) return true;
  if (!r.service?.submitted) return true;
  if (!r.sp?.submitted) return true;
  if (needMember && !r.member?.submitted) return true;
  return false;
}

/** True if the booked service has at least one submitted review slice. */
export function bookedServiceHasAnySubmittedReview(bookedService: any): boolean {
  const r: CustomerReviewInfo | undefined = bookedService?.customerReviewInfo;
  if (!r) return false;
  return !!(r.service?.submitted || r.sp?.submitted || r.member?.submitted);
}

/** True if any booked service in the booking has at least one submitted review slice. */
export function bookingHasAnySubmittedReview(booking: any): boolean {
  const services = booking?.bookedServices;
  if (!Array.isArray(services) || services.length === 0) return false;
  return services.some(bookedServiceHasAnySubmittedReview);
}

/**
 * True when the booking should display a "Rate Now" button.
 * - Booking must be completed.
 * - Nothing has been submitted yet by the customer.
 */
export function bookingHasPendingCustomerReviews(booking: any): boolean {
  if (String(booking?.bookingStatus || '').toLowerCase() !== 'completed') {
    return false;
  }
  return !bookingHasAnySubmittedReview(booking);
}

export function pickFirstBookedServiceNeedingReviews(
  bookedServices: any[],
  preferBookedServiceId?: string | null,
): any | null {
  if (!Array.isArray(bookedServices) || bookedServices.length === 0) {
    return null;
  }
  if (preferBookedServiceId) {
    const pref = bookedServices.find(b => b?._id === preferBookedServiceId);
    if (pref && bookedServiceNeedsAnyReview(pref)) {
      return pref;
    }
  }
  return bookedServices.find(bookedServiceNeedsAnyReview) ?? null;
}

export function getCatalogServiceIdFromBooked(bookedService: any): string | null {
  const sid = bookedService?.serviceId;
  if (typeof sid === 'string' && sid.length > 0) return sid;
  if (sid && typeof sid === 'object' && sid._id) return String(sid._id);
  return null;
}

export function getSpIdFromBooking(booking: any): string | null {
  const sp = booking?.spId;
  if (typeof sp === 'string' && sp.length > 0) return sp;
  if (sp && typeof sp === 'object' && sp._id) return String(sp._id);
  return null;
}

export function getMemberIdFromBooked(bookedService: any): string | null {
  const m = bookedService?.assignedMemberId ?? bookedService?.assignedMember;
  if (typeof m === 'string' && m.length > 0) return m;
  if (m && typeof m === 'object' && m._id) return String(m._id);
  return null;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "pending": return "Forming group";
    case "accepted": return "Pay deposit";
    case "confirmed": return "Confirmed";
    case "declined": return "Declined";
    case "cancelled": return "Cancelled";
    case "expired": return "Expired";
    case "waitlisted": return "Waitlisted";
    default: return status;
  }
}

export function statusClasses(status: string): string {
  switch (status) {
    case "confirmed": return "bg-jade/15 text-jade";
    case "accepted": return "bg-sky-100 text-sky-700";
    case "pending": return "bg-amber-100 text-amber-700";
    case "waitlisted": return "bg-ink/10 text-ink/70";
    default: return "bg-ink/10 text-muted";
  }
}

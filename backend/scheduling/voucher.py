"""Booking voucher / payment receipt PDF (fpdf2 — pure-Python, no system deps).

Amounts are printed as "INR 1,234" because the built-in PDF core fonts can't
render the ₹ glyph (that would need an embedded Unicode TTF). Best-effort:
returns None on any failure so a PDF problem never blocks the email/booking.
"""
import logging

logger = logging.getLogger(__name__)

INK = (28, 28, 26)
GOLD = (175, 138, 78)
MUTED = (120, 120, 120)
LINE = (214, 214, 210)


def booking_ref(booking) -> str:
    return f"TS-{booking.id:05d}"


def build_voucher_pdf(booking) -> bytes | None:
    try:
        from fpdf import FPDF
        from fpdf.enums import XPos, YPos
    except Exception:
        logger.warning("fpdf2 not installed — skipping voucher PDF")
        return None

    NEXTLINE = dict(new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    SAMELINE = dict(new_x=XPos.RIGHT, new_y=YPos.TOP)

    try:
        dep = booking.departure
        ref = booking_ref(booking)
        fully = booking.payment_status == "fully_paid"

        pdf = FPDF(format="A4")
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_margins(15, 15, 15)

        # Header band
        pdf.set_fill_color(*INK)
        pdf.rect(0, 0, 210, 30, style="F")
        pdf.set_xy(15, 9)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 19)
        pdf.cell(0, 8, "Trip Sangam", **NEXTLINE)
        pdf.set_xy(15, 18)
        pdf.set_text_color(206, 188, 156)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 5, "Journey Beyond Borders   -   Booking Voucher", **NEXTLINE)

        pdf.set_xy(15, 40)
        pdf.set_text_color(*INK)
        pdf.set_font("Helvetica", "B", 15)
        pdf.cell(0, 8, "Payment Receipt" if fully else "Booking Confirmed", **NEXTLINE)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*MUTED)
        status = booking.get_status_display() if hasattr(booking, "get_status_display") else booking.status
        pdf.cell(0, 6, f"Reference: {ref}      Status: {status}", **NEXTLINE)
        pdf.ln(4)

        def section(title):
            pdf.ln(2)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(*INK)
            pdf.cell(0, 7, title, **NEXTLINE)
            pdf.set_draw_color(*LINE)
            y = pdf.get_y()
            pdf.line(15, y, 195, y)
            pdf.ln(2)

        def row(label, value):
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*MUTED)
            pdf.cell(50, 6, label, **SAMELINE)
            pdf.set_text_color(*INK)
            pdf.set_font("Helvetica", "B", 10)
            pdf.multi_cell(0, 6, str(value), **NEXTLINE)

        section("Trip details")
        row("Package", booking.package.title)
        if dep:
            dates = str(dep.start_date) + (f" to {dep.end_date}" if dep.end_date else "")
            row("Travel dates", dates)
            row("Group", dep.group_label)
        row("Travellers", str(booking.party_size))

        section("Traveller details")
        row("Lead", f"{booking.lead_name}  |  {booking.lead_phone or '-'}  |  {booking.lead_email or '-'}")
        for i, t in enumerate(booking.travellers.all(), 1):
            bits = [t.full_name]
            if t.age:
                bits.append(f"{t.age}y")
            if t.gender:
                bits.append(t.gender)
            row(f"Traveller {i}", "   |   ".join(bits))

        section("Payment summary")
        row("Trip total", f"INR {booking.total_amount:,}")
        if fully:
            row("Deposit paid", f"INR {booking.deposit_amount:,}")
            row("Balance paid", f"INR {booking.balance_amount:,}")
            row("Total paid", f"INR {booking.total_amount:,}")
        else:
            row("Deposit paid now", f"INR {booking.deposit_amount:,}")
            row("Balance (due later)", f"INR {booking.balance_amount:,}")

        pdf.ln(8)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(
            0, 4,
            "This is a computer-generated voucher and needs no signature. Payments are processed securely "
            "via Razorpay (RBI-compliant). For any change or assistance, reply to your confirmation email "
            "or contact Trip Sangam. We can't wait to host you!",
        )

        return bytes(pdf.output())
    except Exception:
        logger.exception("Failed to build voucher PDF for booking %s", getattr(booking, "id", "?"))
        return None

"""Booking voucher cum payment receipt PDF (fpdf2 — pure-Python, no system deps).

A document-style e-ticket / invoice: header, status, trip details, a bordered
passenger table, an itemised payment table, transaction details and terms.
Amounts print as "INR 1,234" (the built-in PDF core fonts can't render ₹).
Best-effort: returns None on any failure so a PDF problem never blocks the email.
"""
import logging

logger = logging.getLogger(__name__)

INK = (28, 28, 26)
GOLD = (175, 138, 78)
MUTED = (110, 110, 110)
LINE = (210, 210, 206)
SAND = (244, 240, 232)
GREEN = (31, 122, 77)
CONTENT_W = 186  # A4 (210mm) minus 12mm margins each side


def booking_ref(booking) -> str:
    return f"TS-{booking.id:05d}"


def _txn(booking, payment):
    """(payment_id, order_id, paid_on) from the supplied or latest successful Payment."""
    pay = payment or booking.payments.filter(status="success").order_by("-id").first()
    if not pay:
        return "", "", ""
    pid = (pay.raw_response or {}).get("razorpay_payment_id") or ""
    if not pid:
        ent = ((pay.raw_response or {}).get("payload") or {}).get("payment") or {}
        pid = (ent.get("entity") or {}).get("id") or ""
    order_id = pay.phonepe_order_id or ""
    paid_on = pay.updated_at.strftime("%d %b %Y, %H:%M") if getattr(pay, "updated_at", None) else ""
    return pid, order_id, paid_on


def build_voucher_pdf(booking, payment=None) -> bytes | None:
    try:
        from fpdf import FPDF
        from fpdf.enums import XPos, YPos
        from fpdf.fonts import FontFace
    except Exception:
        logger.warning("fpdf2 not installed — skipping voucher PDF")
        return None

    NEXT = dict(new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    try:
        from django.utils import timezone
        dep = booking.departure
        ref = booking_ref(booking)
        fully = booking.payment_status == "fully_paid"
        status = booking.get_status_display() if hasattr(booking, "get_status_display") else booking.status
        pid, order_id, paid_on = _txn(booking, payment)
        try:
            issued = timezone.localtime(timezone.now()).strftime("%d %b %Y, %H:%M")
        except Exception:
            issued = ""

        pdf = FPDF(format="A4")
        pdf.set_auto_page_break(auto=True, margin=12)
        pdf.add_page()
        pdf.set_margins(12, 12, 12)

        head = FontFace(emphasis="BOLD", color=(255, 255, 255), fill_color=INK)

        # ---------- Header band ----------
        pdf.set_fill_color(*INK)
        pdf.rect(0, 0, 210, 27, "F")
        pdf.set_xy(12, 6)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 17)
        pdf.cell(110, 8, "Trip Sangam", **NEXT)
        pdf.set_x(12)
        pdf.set_text_color(206, 188, 156)
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(110, 5, "Journey Beyond Borders", **NEXT)
        pdf.set_xy(110, 8)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(88, 5, "BOOKING VOUCHER cum RECEIPT", align="R", **NEXT)
        pdf.set_x(110)
        pdf.set_text_color(206, 188, 156)
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(88, 5, f"Ref: {ref}    Issued: {issued}", align="R", **NEXT)

        # ---------- Status strip ----------
        pdf.set_xy(12, 31)
        pdf.set_fill_color(*(SAND if not fully else (234, 244, 238)))
        pdf.rect(12, 31, CONTENT_W, 9, "F")
        pdf.set_xy(14, 33)
        pdf.set_text_color(*(GREEN if fully else INK))
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(120, 5, "Payment Complete" if fully else "Booking Confirmed", **NEXT)
        pdf.set_xy(14, 33)
        pdf.set_text_color(*MUTED)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.cell(CONTENT_W - 4, 5, f"Status: {status}", align="R", **NEXT)
        pdf.set_y(43)

        def heading(text):
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*INK)
            pdf.cell(0, 6, text, **NEXT)
            pdf.set_draw_color(*GOLD)
            pdf.set_line_width(0.4)
            y = pdf.get_y()
            pdf.line(12, y, 12 + CONTENT_W, y)
            pdf.set_line_width(0.2)
            pdf.ln(1.5)

        def kv_table(pairs):
            pdf.set_font("Helvetica", "", 9)
            with pdf.table(
                col_widths=(34, 66), width=CONTENT_W, line_height=5.5,
                borders_layout="HORIZONTAL_LINES", first_row_as_headings=False,
                text_align=("LEFT", "LEFT"),
            ) as table:
                for k, v in pairs:
                    r = table.row()
                    r.cell(k, style=FontFace(color=MUTED))
                    r.cell(str(v), style=FontFace(emphasis="BOLD", color=INK))

        # ---------- Trip details ----------
        heading("Trip details")
        dates = ""
        if dep:
            dates = str(dep.start_date) + (f"  to  {dep.end_date}" if dep.end_date else "")
        trip_pairs = [("Package", booking.package.title)]
        if dates:
            trip_pairs.append(("Travel dates", dates))
        if dep:
            trip_pairs.append(("Group", dep.group_label))
        trip_pairs += [
            ("Travellers", str(booking.party_size)),
            ("Lead contact", f"{booking.lead_name}  |  {booking.lead_phone or '-'}  |  {booking.lead_email or '-'}"),
            ("Booked on", booking.created_at.strftime("%d %b %Y") if getattr(booking, "created_at", None) else "-"),
        ]
        kv_table(trip_pairs)

        # ---------- Passenger table ----------
        heading("Traveller details")
        pdf.set_font("Helvetica", "", 9)
        travellers = list(booking.travellers.all())
        with pdf.table(
            col_widths=(8, 56, 12, 18, 22), width=CONTENT_W, line_height=6,
            borders_layout="ALL", first_row_as_headings=True,
            headings_style=head, cell_fill_color=(248, 246, 241), cell_fill_mode="ROWS",
            text_align=("CENTER", "LEFT", "CENTER", "CENTER", "LEFT"),
        ) as table:
            table.row(["#", "Name", "Age", "Gender", "ID"])
            if travellers:
                for i, t in enumerate(travellers, 1):
                    idv = ""
                    if getattr(t, "id_type", "") and getattr(t, "id_number", ""):
                        idv = f"{t.id_type}: {t.id_number}"
                    table.row([str(i), t.full_name, str(t.age or "-"), t.gender or "-", idv or "-"])
            else:
                table.row(["1", booking.lead_name, "-", "-", "-"])

        # ---------- Payment table ----------
        heading("Payment details")
        pdf.set_font("Helvetica", "", 9)
        paid = booking.total_amount if fully else booking.deposit_amount
        with pdf.table(
            col_widths=(130, 56), width=CONTENT_W, line_height=6,
            borders_layout="HORIZONTAL_LINES", first_row_as_headings=True,
            headings_style=head, text_align=("LEFT", "RIGHT"),
        ) as table:
            table.row(["Description", "Amount"])
            table.row(["Trip total (inclusive of applicable taxes)", f"INR {booking.total_amount:,}"])
            table.row(["Deposit (50%)" + ("  - paid" if True else ""), f"INR {booking.deposit_amount:,}"])
            table.row(["Balance" + ("  - paid" if fully else "  - due before departure"), f"INR {booking.balance_amount:,}"])
            bold = FontFace(emphasis="BOLD", color=INK, fill_color=(234, 244, 238))
            r = table.row()
            r.cell("Amount paid" + ("  (in full)" if fully else "  (deposit)"), style=bold)
            r.cell(f"INR {paid:,}", style=bold)

        # ---------- Transaction ----------
        if pid or order_id or paid_on:
            heading("Transaction")
            kv_table([
                ("Payment ID", pid or "-"),
                ("Order ID", order_id or "-"),
                ("Method", "Online - Razorpay (UPI / Card / Net Banking)"),
                ("Paid on", paid_on or "-"),
                ("Status", "Captured / Paid"),
            ])

        # ---------- Important information ----------
        heading("Important information")
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(*MUTED)
        for line in [
            "1. Carry a valid government photo ID for every traveller - it may be required en route and at sites.",
            "2. This voucher is your confirmation of booking. Keep it handy (digital or printed) during your journey.",
            "3. Any balance shown is payable before departure as per your itinerary.",
            "4. Date changes, cancellations and refunds follow the Trip Sangam booking policy - contact us for changes.",
            "5. Payments are processed securely via Razorpay (RBI-compliant). Trip Sangam never asks for your card PIN, CVV or OTP.",
        ]:
            pdf.multi_cell(CONTENT_W, 4.4, line, **NEXT)

        # ---------- Footer ----------
        pdf.ln(3)
        pdf.set_draw_color(*LINE)
        pdf.line(12, pdf.get_y(), 12 + CONTENT_W, pdf.get_y())
        pdf.ln(2)
        pdf.set_font("Helvetica", "", 7.5)
        pdf.set_text_color(*MUTED)
        pdf.multi_cell(
            CONTENT_W, 4,
            "Computer-generated voucher - no signature required.   |   tripsangam.com   |   "
            "Secured by Razorpay.   For assistance, reply to your confirmation email or contact Trip Sangam.",
            align="C", **NEXT,
        )

        return bytes(pdf.output())
    except Exception:
        logger.exception("Failed to build voucher PDF for booking %s", getattr(booking, "id", "?"))
        return None

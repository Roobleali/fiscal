# models/payment_method.py
from odoo import models, fields

class PaymentMethod(models.Model):
    _inherit = 'pos.payment.method'

    payment_type_code = fields.Integer(
        string="Payment Type Code",
        help="Code to identify the payment type in the fiscal operations."
    )


class AccountTax(models.Model):
    _inherit = 'account.tax'

    vat_group_code = fields.Integer(
        string="VAT Group Code",
        help="Code for categorizing VAT groups for fiscal purposes."
    )

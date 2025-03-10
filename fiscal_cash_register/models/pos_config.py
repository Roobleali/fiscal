# -*- coding: utf-8 -*-
from odoo import models, fields

class PosConfig(models.Model):
    _inherit = 'pos.config'

    fiscal_printer_enabled = fields.Boolean(
        string='Enable Fiscal Printer',
        default=True,
        help='Enable fiscal printer integration for cash operations'
    )
    
    fiscal_printer_output_dir = fields.Char(
        string='Fiscal Files Directory',
        default='/tmp/fiscal',
        help='Directory where fiscal operation files will be saved'
    )

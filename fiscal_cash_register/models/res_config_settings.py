from odoo import fields, models, api

class ResCompany(models.Model):
    _inherit = 'res.company'

    auto_download_receipt = fields.Boolean(string='Auto Download Receipt')
    dude_com_url = fields.Char(string="DUDE COM Url", widget="url")

    @api.onchange("auto_download_receipt")
    def set_download_receipt(self):
        self.env['ir.config_parameter'].sudo().set_param('fiscal_cash_register.auto_download_receipt', self.auto_download_receipt)

    @api.onchange("dude_com_url")
    def set_download_receipt(self):
        self.env['ir.config_parameter'].sudo().set_param('fiscal_cash_register.dude_com_url', self.dude_com_url)


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    auto_download_receipt = fields.Boolean(related='company_id.auto_download_receipt', readonly=False)
    dude_com_url = fields.Char(related='company_id.dude_com_url', readonly=False)

    @api.onchange("dude_com_url")
    def set_download_receipt(self):
        print("\n\n\t\t\tCHANGED !!\n\n")
        self.env['ir.config_parameter'].sudo().set_param('fiscal_cash_register.dude_com_url', self.dude_com_url)

    @api.onchange("auto_download_receipt")
    def set_download_receipt(self):
        self.env['ir.config_parameter'].sudo().set_param('fiscal_cash_register.auto_download_receipt', self.auto_download_receipt)



class PosConfig(models.Model):
    _inherit = 'pos.config'

    image = fields.Binary(string='Image', help="Set logo image for viewing it"
                                               "in POS Screen and Receipt")

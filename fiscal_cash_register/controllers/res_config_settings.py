from odoo import http
from odoo.http import request

class MyModuleController(http.Controller):
    @http.route('/fiscal_cash_register/configs', type='json', auth="user")
    def get_custom_field(self):
        auto_download_receipt = request.env['ir.config_parameter'].sudo().get_param('fiscal_cash_register.auto_download_receipt')
        dude_com_url = request.env['ir.config_parameter'].sudo().get_param('fiscal_cash_register.dude_com_url')
        return {
                'auto_download_receipt': auto_download_receipt,
                'dude_com_url': dude_com_url,
            }
    

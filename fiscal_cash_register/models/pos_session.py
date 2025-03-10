# -*- coding: utf-8 -*-
from odoo import models, api
import logging
import os

_logger = logging.getLogger(__name__)

class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_pos_payment_method(self):
        """Add custom field to POS session loader params for payment methods."""
        params = super()._loader_params_pos_payment_method()
        params['search_params']['fields'].append('payment_type_code')
        return params

    def _loader_params_account_tax(self):
        """Add custom field to POS session loader params for taxes."""
        params = super()._loader_params_account_tax()
        params['search_params']['fields'].append('vat_group_code')
        return params

    @api.model
    def ensure_fiscal_directory(self):
        """Ensure the fiscal files directory exists"""
        config = self.config_id
        if config.fiscal_printer_enabled and config.fiscal_printer_output_dir:
            os.makedirs(config.fiscal_printer_output_dir, exist_ok=True)
            return True
        return False

    # def _validate_session(self):
    #     """Override to add fiscal operations handling"""
    #     res = super()._validate_session()
    #     if self.config_id.fiscal_printer_enabled:
    #         try:
    #             self.ensure_fiscal_directory()
    #             _logger.info('Fiscal directory checked for session %s', self.name)
    #         except Exception as e:
    #             _logger.error('Failed to ensure fiscal directory: %s', str(e))
    #     return res



    """updated by zain dev"""
    def _validate_session(self, balancing_account=False, amount_to_balance=0, bank_payment_method_diffs=None):
        # Call the original method to retain its functionality
        res = super(PosSession, self)._validate_session(balancing_account, amount_to_balance, bank_payment_method_diffs)

        # Now add your fiscal operations handling
        if self.config_id.fiscal_printer_enabled:
            _logger.error('fiscal_printer_enabled is true')
            try:
                self.ensure_fiscal_directory()  # Ensure fiscal directory is available
                _logger.info('Fiscal directory checked for session %s', self.name)
            except Exception as e:
                _logger.error('Failed to ensure fiscal directory: %s', str(e))

        return res

# -*- coding: utf-8 -*-
from odoo import models, fields
import logging
import json
from datetime import datetime

_logger = logging.getLogger(__name__)

class FiscalOperationLog(models.Model):
    _name = 'fiscal.operation.log'
    _description = 'Fiscal Operation Log'
    _order = 'create_date desc'

    name = fields.Char(string='Operation ID', required=True, readonly=True)
    operation_type = fields.Selection([
        ('cash_in', 'Cash In'),
        ('cash_out', 'Cash Out'),
        ('drawer', 'Drawer Operation'),
        ('receipt', 'Fiscal Receipt')
    ], string='Operation Type', required=True)
    
    amount = fields.Float(string='Amount', digits=(16, 2))
    pos_session_id = fields.Many2one('pos.session', string='POS Session')
    pos_config_id = fields.Many2one('pos.config', string='POS Config')
    user_id = fields.Many2one('res.users', string='User', default=lambda self: self.env.user)
    
    file_name = fields.Char(string='File Name')
    file_content = fields.Text(string='File Content')
    
    state = fields.Selection([
        ('success', 'Success'),
        ('failed', 'Failed')
    ], string='Status', default='success')
    
    error_message = fields.Text(string='Error Message')
    additional_data = fields.Text(string='Additional Data')

    def log_operation(self, operation_type, amount=0.0, file_name='', file_content='', 
                     pos_session=None, pos_config=None, state='success', error_message='', 
                     additional_data=None):
        """Create a log entry for fiscal operations"""
        try:
            name = f'FO{datetime.now().strftime("%Y%m%d%H%M%S")}'
            
            vals = {
                'name': name,
                'operation_type': operation_type,
                'amount': amount,
                'file_name': file_name,
                'file_content': file_content,
                'state': state,
                'error_message': error_message,
                'additional_data': json.dumps(additional_data) if additional_data else None,
                'pos_session_id': pos_session and pos_session.id,
                'pos_config_id': pos_config and pos_config.id
            }
            
            log_entry = self.create(vals)
            _logger.info('Fiscal operation logged: %s', name)
            return log_entry
            
        except Exception as e:
            _logger.error('Failed to log fiscal operation: %s', str(e))
            return False

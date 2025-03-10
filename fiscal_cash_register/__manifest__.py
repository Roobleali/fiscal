# -*- coding: utf-8 -*-
{
    'name': "Fiscal Cash Register",
    'summary': "Automatically download receipt as TXT file after order completion",
    'description': """
Fiscal Cash Register for Point of Sale
===================================

This module enables automatic receipt download in TXT format after order completion.
Key features:
- Automatic receipt generation
- TXT file download
- Fiscal operations tracking
- Integration with POS system
""",
    'author': "Salut Tech",
    'website': "https://saluttech.ro/",
    'license': 'OPL-1',
    'category': 'Localization',
    'version': '17.0.1.0.0',
    'depends': ['point_of_sale'],
    'data': [
                'security/ir.model.access.csv',

        'views/pos_config_view.xml',
        'views/fiscal_operation_log_views.xml',
        'views/payment_method_form.xml',

    ],
    'assets': {
        'point_of_sale.assets': [
            'fiscal_cash_register/static/src/js/fiscal_cash_operations.js',
        ],
        'point_of_sale.assets_prod': [
            'fiscal_cash_register/static/src/js/payment_screen.js',
            'fiscal_cash_register/static/src/css/pos.css',
            'fiscal_cash_register/static/src/js/pos_fiscal_operations.js',
            'fiscal_cash_register/static/src/js/cashin_cashout.js',
            'fiscal_cash_register/static/src/js/z_report.js',
            'fiscal_cash_register/static/src/js/opening_balance.js',
        ],
        'point_of_sale._assets_pos': [
            'fiscal_cash_register/static/src/xml/navbar_logo.xml',
            'fiscal_cash_register/static/src/xml/receipt_logo.xml',
            'fiscal_cash_register/static/src/xml/pos.xml',
        ],
        'web.assets_common': [
            'fiscal_cash_register/static/description/style.css',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
    'price': 199.0,
    'currency': 'EUR',
}


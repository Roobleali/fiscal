odoo.define('fiscal_cash_register.models', ['point_of_sale.models'], function (require) {
    "use strict";

    const models = require('point_of_sale.models');
    const PosModelSuper = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            // Add 'payment_type_code' field to pos.payment.method model
            const pos_payment_method_model = this.models.find(model => model.model === 'pos.payment.method');
            if (pos_payment_method_model) {
                pos_payment_method_model.fields.push('payment_type_code');
                // Check if fields are correctly loaded
                console.log(this.models.find(model => model.model === 'pos.payment.method').fields);

            }

            // Add 'vat_group_code' field to account.tax model
            const account_tax_model = this.models.find(model => model.model === 'account.tax');
            if (account_tax_model) {
                account_tax_model.fields.push('vat_group_code');
                console.log(this.models.find(model => model.model === 'account.tax').fields);
            }

            return PosModelSuper.initialize.call(this, session, attributes);
        },
    });
});

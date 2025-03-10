/** @odoo-module */

import { CashMovePopup } from "@point_of_sale/app/navbar/cash_move_popup/cash_move_popup";
import { MoneyDetailsPopup } from "@point_of_sale/app/utils/money_details_popup/money_details_popup";
import { CashOpeningPopup } from "@point_of_sale/app/store/cash_opening_popup/cash_opening_popup";
import { _t } from "@web/core/l10n/translation";
import { parseFloat } from "@web/views/fields/parsers";

// Monkey patch the confirm method of CashMovePopup
CashMovePopup.prototype.confirm = async function () {
    // Check if the method has already been executed
    if (this._isConfirming) {
        return; // Prevent recursion if already in the middle of the confirm method
    }

    // Set the flag to indicate that the method is being executed
    this._isConfirming = true;

    try {
        // Custom logic before calling the original confirm logic
        const amount = parseFloat(this.state.amount);
        const formattedAmount = this.env.utils.formatCurrency(amount);

        if (!amount) {
            this.notification.add(_t("Cash in/out of %s is ignored.", formattedAmount), 3000);
            this.props.close();
            return;
        }

        // Original confirm logic
        const type = this.state.type;
        const translatedType = _t(type);
        const extras = { formattedAmount, translatedType };
        const reason = this.state.reason.trim();
        const employee = this.pos.get_cashier();
        const employeeName = employee ? employee.name : "Unknown Employee"; // Fallback to "Unknown Employee" if not found
        var fileName = '';
        const lines = [];
        if (type === "in") {
            fileName = `bon_cashIn.txt`;
            lines.push(`I^${Math.round(amount * 100)}`);
            console.log(`${employeeName} is adding cash: The amount added is I^VALUE${Math.round(amount * 100)}`);
        } else if (type === "out") {
            fileName = `bon_casOut.txt`;
            lines.push(`O^${Math.round(amount * 100)}`);
            console.log(`${employeeName} is removing cash: The amount removed is O^VALUE${Math.round(amount * 100)}`);
        }

        const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });

          try {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, fileName);
              return;
            }
            debugger;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Error saving file:", error);
            throw new Error("Could not save the z report file");
          }

        // Call the original confirm method
        await CashMovePopup.prototype.confirm.call(this);

        // After the original confirm logic, add your custom console messages
        this.notification.add(
            _t("Custom notification: Cash %s confirmed for amount: %s.", type, formattedAmount),
            3000
        );

    } finally {
        // Reset the flag to allow the method to be called again in the future
        this._isConfirming = false;

        // Ensure the popup is closed
        this.props.close();
    }
};

const originalOpenDetailsPopup = CashOpeningPopup.prototype.openDetailsPopup;
// Override the openDetailsPopup method of CashMovePopup
CashOpeningPopup.prototype.openDetailsPopup = async function () {
    debugger;
    const fileName = `bon_openDrawer.txt`;
    const lines = [];
    lines.push(`DS^`);
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });

      try {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
          return;
        }
        debugger;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error saving file:", error);
        throw new Error("Could not save the  file");
      }
    await originalOpenDetailsPopup.call(this);
};

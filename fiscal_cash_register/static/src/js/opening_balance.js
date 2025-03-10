/** @odoo-module */

import { CashOpeningPopup } from "@point_of_sale/app/store/cash_opening_popup/cash_opening_popup";

// Extend the confirm method of CashOpeningPopup to add a console message
CashOpeningPopup.prototype.confirm = async function () {
    // Retrieve the opening cash balance and employee (cashier) name
    const openingBalance = parseFloat(this.state.openingCash) || 0;
    const employee = this.pos.get_cashier();
    const employeeName = employee ? employee.name : "Unknown Employee";

    // Log custom console message with opening balance and employee name
    const fileName = `bon_openingBalance.txt`;
        const lines = [];
        lines.push(`I^${openingBalance}`);
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
            throw new Error("Could not save the opening balance report");
          }
    console.log(`User ${employeeName} is opening the cash register. Opening Balance: ${openingBalance}`);

    // Set the session state to "opened"
    this.pos.pos_session.state = "opened";

    // Set the opening balance and notes in the database
    await this.orm.call("pos.session", "set_cashbox_pos", [
        this.pos.pos_session.id,
        openingBalance,
        this.state.notes,
    ]);

    // Call the original confirm method to proceed with the opening process
    return await CashOpeningPopup.prototype.__proto__.confirm.call(this);
};

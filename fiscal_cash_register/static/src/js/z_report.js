/** @odoo-module */

import { ClosePosPopup } from "@point_of_sale/app/navbar/closing_popup/closing_popup";

// Extend or monkey patch ClosePosPopup to add a console message
ClosePosPopup.prototype.downloadSalesReport = async function () {
const closingBalance = this.state.payments[this.props.default_cash_details.id]?.counted || "0.00";
    const employee = this.pos.get_cashier();
    const employeeName = employee ? employee.name : "Unknown Employee";
    const fileName = `bon_z_report.txt`;
    const lines = [];
    lines.push(`Z^${closingBalance}`);
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
    console.log(`User ${employeeName} is printing the Daily Sales Report. Closing Balance: ${closingBalance}`);
    // Call the original downloadSalesReport function to print the report
    return this.report.doAction("point_of_sale.sale_details_report", [
        this.pos.pos_session.id,
    ]);
};

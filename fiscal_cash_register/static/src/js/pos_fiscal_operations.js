/** @odoo-module */
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

/**
 * Handles fiscal operations command generation and file creation
 */
class FiscalOperations {
  /**
   * Formats amount to cents without decimal point
   * @param {number} amount Amount in decimal format
   * @returns {number} Amount in cents
   */
  static formatAmount(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Creates a fiscal command for cash in operation
   * @param {number} amount Amount to process
   * @returns {string} Formatted command
   */
  static createCashInCommand(amount) {
    const amountInCents = this.formatAmount(amount);
    debugger;
    return `I^${amountInCents}\n`;
  }

  /**
   * Creates a fiscal command for cash out operation
   * @param {number} amount Amount to process
   * @returns {string} Formatted command
   */
  static createCashOutCommand(amount) {
    const amountInCents = this.formatAmount(amount);
    debugger;
    return `O^${amountInCents}\n`;
  }

  /**
   * Creates a fiscal command for drawer opening
   * @returns {string} Formatted command
   */
  static createDrawerCommand() {
    debugger;
    return "DS^\n";
  }

  /**
   * Creates and triggers download of a fiscal file
   * @param {string} content File content
   * @param {string} fileName Name of the file to create
   * @returns {Promise} Promise that resolves when file is created
   */
  static async createFiscalFile(content, fileName) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    return new Promise((resolve, reject) => {
      try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          resolve();
        }, 100);
      } catch (error) {
        reject(new Error(`Could not create fiscal file: ${error.message}`));
      }
    });
  }
}

patch(PaymentScreen.prototype, {
  setup() {
    super.setup(...arguments);
    this.notification = useService("notification");
  },

  /**
   * Handles cash drawer opening
   */
  async _onClickOpenCashbox() {
    try {
      await super._onClickOpenCashbox(...arguments);
      const fileName = `drawer_${Date.now()}.txt`;
      const command = FiscalOperations.createDrawerCommand();

      await FiscalOperations.createFiscalFile(command, fileName);

      this.notification.add("Drawer opening command sent", {
        type: "success",
        sticky: false,
      });
    } catch (error) {
      console.error("Drawer operation error:", error);
      this.notification.add(`Failed to open drawer: ${error.message}`, {
        type: "danger",
        sticky: true,
      });
    }
  },

  /**
   * Handles money in/out operations
   */
  async validateMoneyInOut({ type, amount, reason }) {
    console.log("Processing money operation:", { type, amount, reason });

    try {
      // Call original validation
      await super.validateMoneyInOut(...arguments);

      let command = "";
      let operationType = "";

      if (type === "in") {
        command = FiscalOperations.createCashInCommand(amount);
        operationType = "IN";
      } else if (type === "out") {
        command = FiscalOperations.createCashOutCommand(amount);
        operationType = "OUT";
      }

      if (command) {
        const fileName = `cash_${type}_${Date.now()}.txt`;
        await FiscalOperations.createFiscalFile(command, fileName);

        this.notification.add(
          `Fiscal ${operationType} operation completed (${amount} RON)`,
          {
            type: "success",
            sticky: false,
          }
        );
      }
    } catch (error) {
      console.error("Fiscal operation error:", error);
      this.notification.add(`Fiscal operation failed: ${error.message}`, {
        type: "danger",
        sticky: true,
      });
      throw error;
    }
  },
});

export { FiscalOperations };

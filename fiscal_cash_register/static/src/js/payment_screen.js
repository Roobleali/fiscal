/** @odoo-module */
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

// Patch the existing CashBoxIn operation
patch(PaymentScreen.prototype, {
  async _onValidateMoney(ev) {
    // First call the original implementation
    await super._onValidateMoney(...arguments);
    debugger;

    // Get the values from the event
    const { amount, reason, type } = ev.detail;

    try {
      // Generate fiscal printer command based on operation type
      let content = "";
      const formattedAmount = Math.round(amount * 100); // Convert to cents

      if (type === "in") {
        content = `I^${formattedAmount}`;
      } else if (type === "out") {
        content = `O^${formattedAmount}`;
      }

      // Create and download the fiscal file
      if (content) {
        const fileName = `cash_op_${type}_${Date.now()}.txt`;
        await createDownload(content, fileName);

        // Show success notification
        this.env.services.notification.add(
          `Fiscal ${type.toUpperCase()} operation completed`,
          { type: "success" }
        );
      }
    } catch (error) {
      console.error(`Fiscal cash operation error:`, error);
      this.env.services.notification.add(
        `Failed to process fiscal cash operation: ${error.message}`,
        { type: "danger" }
      );
    }
  },
  async _onClickOpenCashbox() {
    debugger;
    try {
      await super._onClickOpenCashbox(...arguments);
      debugger;
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
  async validateMoneyInOut({ type, amount, reason }) {
    debugger;
    console.log("Processing money operation:", { type, amount, reason });

    try {
      // Call original validation
      await super.validateMoneyInOut(...arguments);

      let command = "";
      let operationType = "";
      debugger;
      if (type === "in") {
        debugger;
        command = FiscalOperations.createCashInCommand(amount);
        operationType = "IN";
      } else if (type === "out") {
        debugger;
        command = FiscalOperations.createCashOutCommand(amount);
        operationType = "OUT";
      }

      if (command) {
        debugger;
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
const createDownload = (content, fileName) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

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
    throw new Error("Could not save the fiscal receipt file");
  }
};

function get_line_attributes(line) {
  debugger;
  const unit = line.product.uom_id ? line.product.uom_id[1] : "buc";

//  const priceWithTax = Math.round(line.get_price_with_tax() * 100);
  const priceWithTax = Math.round(line.get_price_with_tax_before_discount() * 100);

  debugger;
  const quantity = Math.round(line.quantity * 1000);

  // Get VAT group from product taxes
  let vatGroup = 1;
  if (line.get_taxes().length > 0) {
    debugger;
    const tax = line.get_taxes()[0];
    vatGroup = tax.vat_group_code || 1; // Use dynamic field or default to 1
  }
  debugger;
  return [line.full_product_name, priceWithTax, quantity, unit, vatGroup];
}

function addFiscalSection(order,fileName) {
  const lines = [];
  let subtotal = 0;
  debugger;

  try {
    // Handle VAT number
    const isRefundOrder = order.orderlines.some(line => line.refunded_orderline_id);
        if (isRefundOrder) {
          console.log("This is a refund order.");
          lines.push(`VB^${fileName.replace(".txt", "")}^ALT TEXT`);
        }
    if (order.partner && order.partner.vat) {
      const cleanVat = order.partner.vat
        .replace(/\s+/g, "")
        .replace(/^RO/i, "")
        .replace(/[^0-9]/g, "");
      if (cleanVat) {
        lines.push(`CF^${cleanVat}`);
      }
    }

    // Process order lines
    order.orderlines.forEach((line) => {
      const refund_line = line.refunded_orderline_id
        ? line.refunded_orderline_id
        : false;
      const orderline_str = get_line_attributes(line);
      debugger;

//      line added for discounted price


      if (!refund_line) {
        debugger;
        // Add sale line with the already discounted price
        lines.push(
          `S^${orderline_str[0]}^${orderline_str[1]}^${orderline_str[2]}^${orderline_str[3]}^${orderline_str[4]}^1`
        );

        // Show discount percentage if exists
        if (line.discount > 0) {
          // Convert discount to required format (e.g., 5% becomes 500)
          const discountValue = Math.round(line.discount * 100);
          lines.push(`DP^${discountValue}`);
          const discountAmount = Math.round(line.get_price_with_tax_before_discount() * line.discount / 100);
          debugger;
          lines.push(`DV^${discountAmount}`);
        }
      } else {
        lines.push(
          `VS^${orderline_str[0]}^${orderline_str[1] * -1}^${
            orderline_str[2] * -1
          }^${orderline_str[3]}^${orderline_str[4]}^1`
        );
      }
    });

    // Add subtotal
//    lines.push("ST^");
      lines.push(`ST^${Math.round(subtotal * 100)}`);
    // Process payments
    debugger;
    order.paymentlines.forEach((payment) => {

      debugger;
      const paymentType = payment.payment_method.payment_type_code || 9;
      const amountInCents = Math.round(payment.amount * 100);
      const adjustedAmount = isRefundOrder ? Math.abs(amountInCents) : amountInCents;
      lines.push(`P^${paymentType}^${adjustedAmount}`);

    });

    return lines.join("\n");
  } catch (error) {
    console.error("Error generating fiscal content:", error);
    throw new Error("Failed to generate fiscal receipt content");
  }
}

patch(PaymentScreen.prototype, {
  setup() {
    super.setup(...arguments);
    this.orm = useService("orm");
  },

  async createAndSaveFiscalFile(order) {
    try {
      debugger;
      const fileName = `bon_${order.name.replace(/[^a-z0-9]/gi, "_")}.txt`;
      const content = addFiscalSection(order,fileName);
      createDownload(content, fileName);
    } catch (error) {
      debugger;
      console.error("Fiscal file creation error:", error);
      this.env.services.notification.add(error.message, {
          title: "Error",
          type: "danger",
      });
    }
  },

  async validateOrder(isForceValidate) {
    try {
      const order = this.pos.get_order();

      // Validate totals
      const total = Math.round(order.get_total_with_tax() * 100) / 100;
      const payments = Math.round(order.get_total_paid() * 100) / 100;
      const difference = Math.abs(total - payments);
      debugger;
//      if (difference > 0.5) {
//        throw new Error(
//          `Payment difference of ${difference.toFixed(2)} RON exceeds limit`
//        );
//      }
      debugger;
      await super.validateOrder(...arguments);
      await this.createAndSaveFiscalFile(order);
    } catch (error) {
      debugger;
      console.error("Order validation error:", error);
      this.env.services.notification.add(error.message, {
          title: "Error",
          type: "danger",
      });
    }
  },
});

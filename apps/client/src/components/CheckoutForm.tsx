"use client";

import { ShippingFormInputs } from "@repo/types";
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js";
import { ConfirmError } from "@stripe/stripe-js";
import { useState } from "react";

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmError | null>(null);

  const handleClick = async () => {
    setLoading(true);
    await checkout.updateEmail(shippingForm.email);
    await checkout.updateShippingAddress({
      name: "shipping_address",
      address: {
        line1: shippingForm.address,
        city: shippingForm.city,
        country: "US",
      },
    });

    const res = await checkout.confirm();
    if (res.type === "error") {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <form className="flex flex-col gap-6">
      <PaymentElement options={{ layout: "accordion" }} />
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-white p-3 rounded-lg cursor-pointer font-medium"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error.message}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;

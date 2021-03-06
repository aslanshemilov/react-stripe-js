// @noflow

import React, {useState, useEffect} from 'react';
import {PaymentRequestButtonElement, Elements, useStripe} from '../../src';

import {Result, ErrorResult} from '../util';
import '../styles/common.css';

const NotAvailableResult = () => (
  <Result>
    <p style={{textAlign: 'center'}}>
      PaymentRequest is not available in your browser.
    </p>
    {window.location.protocol !== 'https:' && (
      <p style={{textAlign: 'center'}}>
        Try using{' '}
        <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer">
          ngrok
        </a>{' '}
        to view this demo over https.
      </p>
    )}
  </Result>
);

const ELEMENT_OPTIONS = {
  style: {
    paymentRequestButton: {
      type: 'buy',
      theme: 'dark',
    },
  },
};

const Checkout = () => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Demo total',
        amount: 100,
      },
    });

    pr.on('paymentmethod', async (e) => {
      setResult(<Result>Got PaymentMethod: {e.paymentMethod.id}</Result>);
      e.complete('success');
    });

    pr.canMakePayment().then((canMakePaymentRes) => {
      if (canMakePaymentRes) {
        setPaymentRequest(pr);
      } else {
        setResult(<NotAvailableResult />);
      }
    });
  }, [stripe]);

  return (
    <form>
      {paymentRequest && (
        <PaymentRequestButtonElement
          onClick={(e) => {
            if (result) {
              e.preventDefault();
              setResult(
                <ErrorResult>
                  You can only use the PaymentRequest button once. Refresh the
                  page to start over.
                </ErrorResult>
              );
            }
          }}
          options={{
            ...ELEMENT_OPTIONS,
            paymentRequest,
          }}
        />
      )}
      {result}
    </form>
  );
};

const stripe = window.Stripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

const App = () => {
  return (
    <Elements stripe={stripe}>
      <Checkout />
    </Elements>
  );
};

export default App;

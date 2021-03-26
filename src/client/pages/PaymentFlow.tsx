import React, { useContext, useEffect, useState } from 'react';
import {
  NavigateFn,
  RouteComponentProps,
  Router,
  useNavigate,
} from '@reach/router';
import { queryAppointments } from '../services/appointment.svc';
import { DispatchContext, StateContext } from '../reducers';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceReview } from './InvoiceReview';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { PaymentSuccess } from './PaymentSuccess';
import { InvoiceView } from './InvoiceView';
import { AppointmentAttributes } from '../../models/appointment.model';

const HeadingText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

const useFormState = () => {
  const [billingMethod, setBillingMethod] = useState<'hourly' | 'daily'>(
    'hourly',
  );
  const [includeAppointmentFee, setIncludeAppointmentFee] = useState<boolean>(
    false,
  );
  const [includeTaxes, setIncludeTaxes] = useState<boolean>(true);
  return {
    billingMethod,
    setBillingMethod,
    includeAppointmentFee,
    setIncludeAppointmentFee,
    includeTaxes,
    setIncludeTaxes,
  };
};

function handleRedirectAndAbortRender(
  currentAppointment: AppointmentAttributes,
  navigate: NavigateFn,
) {
  if (currentAppointment.status !== 'completed') {
    navigate(`/appointment/${currentAppointment.id}`);
    // abort render
    return true;
  }
  if (currentAppointment.invoice_id && !location.pathname.includes('/view')) {
    navigate(`view`);
  }
  return false;
}

export const PaymentFlow: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IInvoicePostBody | null>(null);
  const {
    billingMethod,
    setBillingMethod,
    includeAppointmentFee,
    setIncludeAppointmentFee,
    includeTaxes,
    setIncludeTaxes,
  } = useFormState();

  const { appointment_id } = props;

  const currentAppointment = appointments?.find(
    (appointment) => appointment.id === appointment_id,
  );

  useEffect(() => {
    if (!appointment_id) {
      return;
    }
    if (currentAppointment) {
      return;
    }
    // the additional 'noop' id is a hack to satisfy the swagger validation
    queryAppointments({ ids: [appointment_id, 'noop'] }).then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

  if (!currentAppointment) {
    return null;
  }
  if (handleRedirectAndAbortRender(currentAppointment, navigate)) {
    return null;
  }

  return (
    <div>
      <HeadingText>{currentAppointment.summary}</HeadingText>
      <Router>
        <InvoiceForm
          appointment={currentAppointment}
          invoice={invoice}
          setInvoice={setInvoice}
          billingMethod={billingMethod}
          setBillingMethod={setBillingMethod}
          includeAppointmentFee={includeAppointmentFee}
          setIncludeAppointmentFee={setIncludeAppointmentFee}
          includeTaxes={includeTaxes}
          setIncludeTaxes={setIncludeTaxes}
          path="invoice"
        />
        <InvoiceReview
          appointment={currentAppointment}
          invoice={invoice}
          includeTaxes={includeTaxes}
          path="review"
        />
        <InvoiceView appointment={currentAppointment} path="view" />
        <PaymentSuccess
          appointment={currentAppointment}
          invoice={invoice}
          path="success"
        />
      </Router>
    </div>
  );
};

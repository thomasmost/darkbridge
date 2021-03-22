import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, Router, useNavigate } from '@reach/router';
import { queryAppointments } from '../services/appointment.svc';
import { DispatchContext, StateContext } from '../reducers';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceReview } from './InvoiceReview';
import { InvoiceCreationAttributes } from '../../models/invoice.model';

const HeadingText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

export const PaymentFlow: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceCreationAttributes | null>(
    null,
  );

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
  if (currentAppointment.status !== 'completed') {
    navigate(`/appointment/${currentAppointment.id}`);
    return null;
  }
  return (
    <div>
      <HeadingText>{currentAppointment.summary}</HeadingText>
      <Router>
        <InvoiceForm
          appointment={currentAppointment}
          setInvoice={setInvoice}
          path="invoice"
        />
        <InvoiceReview
          appointment={currentAppointment}
          invoice={invoice}
          path="review"
        />
      </Router>
    </div>
  );
};

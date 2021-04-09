import { toast } from 'react-toastify';
import { AppointmentAttributes } from '../../models/appointment.model';
import { IInvoiceCore } from '../../shared/invoice.dto';
import { getRequest } from './api.svc';

export const loadInvoice = async (
  appointment: AppointmentAttributes,
  setInvoice: (invoice: IInvoiceCore) => void,
) => {
  if (!appointment.invoice_id) {
    return;
  }
  const { error, data } = await getRequest<IInvoiceCore>(
    `invoice/${appointment.invoice_id}`,
  );
  if (error) {
    toast.error(error);
  }
  if (!data) {
    // This really shouldn't be necessary, I should look into why data is possibly undefined at this point
    return;
  }
  setInvoice(data);
};

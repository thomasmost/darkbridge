import styled from '@emotion/styled';
import { DateTimePicker } from '@material-ui/pickers';
import { Link, RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect } from 'react';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentListItem } from '../components/AppointmentListItem';
import { FlexColumns } from '../elements/FlexColumns';
import { Icon } from '../elements/Icon';
import { DispatchContext, StateContext } from '../reducers';
import { getCalendar } from '../services/appointment.svc';
import { theme } from '../theme';

const StyledLink = styled(Link)`
  color: ${theme.buttonColorActive};
  font-size: 2em;
`;

const Spacer = styled.div`
  height: 20px;
  width: 100%;
`;

const CalendarHeader = styled.div`
  font-weight: 600;
  font-size: 1em;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
`;

const Count = styled.label`
  color: ${theme.passiveLinkColor};
`;

const mapAppointmentsToDays = (appointments: AppointmentAttributes[]) => {
  const byDay: Record<string, AppointmentAttributes[]> = {};
  for (const appointment of appointments) {
    const day = DateTimeHelper.formatForDayHeader(
      new Date(appointment.datetime_local),
    );
    if (!byDay[day]) {
      byDay[day] = [];
    }
    byDay[day].push(appointment);
  }
  return byDay;
};

const renderDay = (header: string, appointments: AppointmentAttributes[]) => {
  return (
    <div>
      <CalendarHeader>
        <label>{header}</label>
        <Count>{appointments.length} Appointments</Count>
      </CalendarHeader>
      {appointments?.map((appointment) => (
        <AppointmentListItem key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};

export const Calendar: React.FC<RouteComponentProps> = () => {
  const { appointments } = useContext(StateContext);

  const dispatch = useContext(DispatchContext);

  const byDay = mapAppointmentsToDays(appointments);

  useEffect(() => {
    // Always refresh day's appointments
    // in the future we shouldq query for a range
    getCalendar().then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

  const days = Object.keys(byDay);

  return (
    <div>
      <FlexColumns>
        <div>List view</div>
        <StyledLink to="add-appointment">
          <Icon name="Plus" />
        </StyledLink>
      </FlexColumns>
      <Spacer />
      {days?.map((day) => renderDay(day, byDay[day]))}
    </div>
  );
};

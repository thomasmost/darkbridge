import React, { useContext, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { startOfDay } from 'date-fns';
import styled from '@emotion/styled';
import Accordion from '@material-ui/core/Accordion';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentListItem } from '../components/AppointmentListItem';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { DispatchContext, StateContext } from '../reducers';
import { FlexColumns } from '../elements/FlexColumns';
import { getCalendar } from '../services/appointment.svc';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { Spacer } from '../elements/Spacer';

const StyledLink = styled(Link)`
  color: ${theme.buttonColorActive};
  font-size: 2em;
`;

const CalendarHeader = styled.div`
  font-weight: 600;
  font-size: 1em;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  span {
    color: ${theme.lightIconColor};
  }
`;

const Count = styled.label`
  color: ${theme.passiveLinkColor};
  margin-right: 10px;
`;

const mapAppointmentsToDays = (
  appointments: Readonly<Readonly<AppointmentAttributes>[]>,
) => {
  const byDay: Record<string, AppointmentAttributes[]> = {};
  for (const appointment of appointments) {
    if (appointment.status === 'canceled') {
      continue;
    }
    const dayUnix = startOfDay(new Date(appointment.datetime_utc)).valueOf();
    if (!byDay[dayUnix]) {
      byDay[dayUnix] = [];
    }
    byDay[dayUnix].push(appointment);
  }
  return byDay;
};

const CalendarDay: React.FC<{
  headerUnixStr: string;
  appointments: Readonly<Readonly<AppointmentAttributes>[]>;
}> = ({ headerUnixStr, appointments }) => {
  const isToday = headerUnixStr === startOfDay(new Date()).valueOf().toString();
  const [expanded, setExpanded] = useState<boolean>(isToday);
  return (
    <Accordion expanded={expanded}>
      <CalendarHeader onClick={() => setExpanded(!expanded)}>
        <label>
          {DateTimeHelper.formatForDayHeader(new Date(parseInt(headerUnixStr)))}
        </label>
        <div>
          <Count>{appointments.length} Appointments</Count>
          <Icon name={expanded ? 'Arrow-Up-2' : 'Arrow-Down-2'} />
        </div>
      </CalendarHeader>
      {appointments?.map((appointment) => (
        <AppointmentListItem key={appointment.id} appointment={appointment} />
      ))}
    </Accordion>
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

  const days = Object.keys(byDay).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div>
      <FlexColumns>
        <div>List view</div>
        <StyledLink to="add-appointment">
          <Icon name="Plus" />
        </StyledLink>
      </FlexColumns>
      <Spacer y={4} />
      {days?.map((day) => (
        <CalendarDay key={day} headerUnixStr={day} appointments={byDay[day]} />
      ))}
      <Spacer y={4} />
    </div>
  );
};

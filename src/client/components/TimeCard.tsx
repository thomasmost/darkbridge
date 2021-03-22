import React from 'react';
import styled from '@emotion/styled';
import { Card } from '../elements/Card';
import { theme } from '../theme';
import { Icon } from '../elements/Icon';

const Header = styled.div`
  align-items: center;
  color: ${theme.passiveLinkColor};
  display: inline-block;
  display: flex;
  margin-bottom: 10px;
  width: 200px;
  span {
    font-size: 1.5em;
    margin-right: 5px;
  }
`;
type TimeCardProps = {
  secondsLogged: number;
};

export const TimeCard: React.FC<TimeCardProps> = ({ secondsLogged }) => {
  const minutes = Math.floor(secondsLogged / 60);
  let seconds = (secondsLogged % 60).toString();
  if (seconds.length === 1) {
    seconds = '0' + seconds;
  }
  return (
    <Card style={{ marginBottom: '30px' }}>
      <Header>
        <span>
          <Icon name="Time-Circle" />
        </span>
        Time
      </Header>
      <div>
        {minutes}:{seconds}
      </div>
    </Card>
  );
};

import styled from '@emotion/styled';
import React from 'react';

const iconUnicode = {
  Activity: '\\e900',
  'Add-User': '\\e901',
  'Arrow-Down': '\\e902',
  'Arrow-Down-2': '\\e903',
  'Arrow-Down-3': '\\e904',
  'Arrow-Down-Circle': '\\e905',
  'Arrow-Down-Square': '\\e906',
  'Arrow-Left': '\\e907',
  'Arrow-Left-2': '\\e908',
  'Arrow-Left-3': '\\e909',
  'Arrow-Left-Circle': '\\e90a',
  'Arrow-Left-Square': '\\e90b',
  'Arrow-Right': '\\e90c',
  'Arrow-Right-2': '\\e90d',
  'Arrow-Right-3': '\\e90e',
  'Arrow-Right-Circle': '\\e90f',
  'Arrow-Right-Square': '\\e910',
  'Arrow-Up': '\\e911',
  'Arrow-Up-2': '\\e912',
  'Arrow-Up-3': '\\e913',
  'Arrow-Up-Circle': '\\e914',
  'Arrow-Up-Square': '\\e915',
  Bag: '\\e916',
  'Bag-2': '\\e917',
  Bookmark: '\\e918',
  Buy: '\\e919',
  Calendar: '\\e91a',
  Call: '\\e91b',
  'Call-Missed': '\\e91c',
  'Call-Silent': '\\e91d',
  Calling: '\\e91e',
  Camera: '\\e91f',
  Category: '\\e920',
  Chart: '\\e921',
  Chat: '\\e922',
  'Close-Square': '\\e923',
  Danger: '\\e924',
  Delete: '\\e925',
  Discount: '\\e926',
  Discovery: '\\e927',
  Document: '\\e928',
  Download: '\\e929',
  Edit: '\\e92a',
  'Edit-Square': '\\e92b',
  Filter: '\\e92c',
  'Filter-2': '\\e92d',
  Folder: '\\e92e',
  Game: '\\e92f',
  Graph: '\\e930',
  Heart: '\\e931',
  Hide: '\\e932',
  Home: '\\e933',
  Image: '\\e934',
  'Image-2': '\\e935',
  'Info-Circle': '\\e936',
  'Info-Square': '\\e937',
  Location: '\\e938',
  Lock: '\\e939',
  Login: '\\e93a',
  Logout: '\\e93b',
  Message: '\\e93c',
  'More-Circle': '\\e93d',
  'More-Square': '\\e93e',
  Notification: '\\e93f',
  Paper: '\\e940',
  'Paper-Download': '\\e941',
  'Paper-Fail': '\\e942',
  'Paper-Negative': '\\e943',
  'Paper-Plus': '\\e944',
  'Paper-Upload': '\\e945',
  Password: '\\e946',
  Play: '\\e947',
  Plus: '\\e948',
  Profile: '\\e949',
  Scan: '\\e94a',
  Search: '\\e94b',
  Send: '\\e94c',
  Setting: '\\e94d',
  'Shield-Done': '\\e94e',
  'Shield-Fail': '\\e94f',
  Show: '\\e950',
  Star: '\\e951',
  Swap: '\\e952',
  'Tick-Square': '\\e953',
  Ticket: '\\e954',
  'Ticket-Star': '\\e955',
  'Time-Circle': '\\e956',
  'Time-Square': '\\e957',
  Unlock: '\\e958',
  Upload: '\\e959',
  User2: '\\e95a',
  User3: '\\e95b',
  Video: '\\e95c',
  Voice: '\\e95d',
  'Voice-2': '\\e95e',
  'Volume-Down': '\\e95f',
  'Volume-Off': '\\e960',
  'Volume-Up': '\\e961',
  Wallet: '\\e962',
  Work: '\\e963',
};

type IconName = keyof typeof iconUnicode;
interface IIconProps {
  name: IconName;
  color?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IIconProps> = ({ name, color, onClick }) => {
  const StyledIcon = styled.span`
    &:before {
      font-family: 'Teddy Icons';
      content: '${iconUnicode[name]}';
      ${color ? `color: ${color};` : ''}
      ${onClick ? `cursor: pointer;` : ''}
    }
  `;

  return (
    <StyledIcon
      onClick={onClick}
      aria-hidden="true"
      data-icon={iconUnicode[name]}
    />
  );
};

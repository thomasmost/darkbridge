import React from 'react';

export const Profile: React.FC<{ name: string }> = ({ name }) => (
  <div>Hello {name}; this is your profile!</div>
);

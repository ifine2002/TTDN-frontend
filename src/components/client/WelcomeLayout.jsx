import React from 'react';
import { Outlet } from 'react-router-dom';

const WelcomeLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default WelcomeLayout;
import React from 'react';
import BreakOut from './break-out';
import {shallow} from 'enzyme';

it('renders without crashing', () => {
  shallow(<BreakOut />);
});

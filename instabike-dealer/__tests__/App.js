import 'react-native';
import React from 'react';
import expect from 'expect';
import renderer from 'react-test-renderer';
import InstaBikeApp from '../index';

it('renders correctly', () => {
  const tree = renderer.create(<InstaBikeApp />).toJSON();
  /**
  * Uncommenting the below line will generate a snap file after
  * running test case.
  */
  expect(tree).toMatchSnapshot();
});

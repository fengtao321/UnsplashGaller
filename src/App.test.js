import { render, screen } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import React from "react";
import App from './App';

import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });



test('category text exists', () => {
  render(<App />);
  const category = screen.getByText(/Animal/i);
  expect(category).toBeInTheDocument();
});

test('search bar exists', () => {
  render(<App />);
  const search = screen.getByText(/Search/i);
  expect(search).toBeInTheDocument();
});

test('Loading bar disappear when isloading is false', () => {
  const myComponent = shallow(<App />);
  myComponent.setState({isLoading: false});
  const instance = myComponent.instance();
  expect(instance.state).toHaveProperty("isLoading", false);
  expect(instance.render()).not.toContain("Loading");
});




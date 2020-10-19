
import React from 'react';
import _ from 'underscore'
// import { render, unmountComponentAtNode } from "react-dom";

export default {
  verbose:true,
  testEnvironment: 'jest-environment-jsdom-sixteen',
  transform:{},
  globals:{
    URL: "http://localhost:4444",
    _,
    React
  }
}
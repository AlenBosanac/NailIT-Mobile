const React = require('react');
const { View } = require('react-native');
const mock = (name) => { const C = (p) => React.createElement(View, p); C.displayName = name; return C; };
const mocks = ['Svg','Circle','Ellipse','G','Text','TSpan','TextPath','Path','Polygon','Polyline','Line','Rect','Use','Image','Symbol','Defs','LinearGradient','RadialGradient','Stop','ClipPath','Pattern','Mask'];
const obj = { __esModule: true, default: mock('Svg') };
mocks.forEach(n => obj[n] = mock(n));
module.exports = obj;
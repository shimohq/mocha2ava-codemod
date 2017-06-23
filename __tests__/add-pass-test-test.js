jest.autoMockOff();
const defineTest = require('jscodeshift/src/testUtils').defineTest;
const transform = require('../add-pass-test');

defineTest(__dirname, 'add-pass-test');

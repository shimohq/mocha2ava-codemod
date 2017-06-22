jest.autoMockOff();
const defineTest = require('jscodeshift/src/testUtils').defineTest;
const transform = require('../mocha2ava');

defineTest(__dirname, 'mocha2ava');

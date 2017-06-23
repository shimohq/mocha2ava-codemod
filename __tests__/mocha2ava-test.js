jest.autoMockOff();
const defineTest = require('jscodeshift/src/testUtils').defineTest;

defineTest(__dirname, 'lib/mocha2ava');

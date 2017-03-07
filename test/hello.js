const test = require('blue-tape');
const Promise = require('bluebird');


// Documentation for tape is at:
// https://github.com/substack/tape


 
test('simple Promise should pass', function(t) {
  t.pass('Hello world, we passed'); 
  return Promise.resolve(true);
});
 

/*
 * Uncomment this test if you want to see a test fail
 *
test("should fail", function(t) {
  return Promise.delay(1).then(function() {
    throw new Error("Failed!");
  });
});

*/

// vim: ts=2:et

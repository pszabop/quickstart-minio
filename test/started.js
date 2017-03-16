require('leaked-handles').set({
    fullStack: true, // use full stack traces 
    timeout: 5000, // run every 5 seconds instead of 5. 
    debugSockets: true // pretty print tcp thrown exceptions. 
});
const test = require('blue-tape');
const Promise = require('bluebird');
const request = require('superagent');
const Minio = Promise.promisifyAll(require('minio'));
const _ = require('lodash');
const streamToPromise = require('stream-to-promise');

const agent = request;

var minio = new Minio.Client({
  endPoint: 'miniotest',      // XXX BUG https://github.com/minio/minio-js/issues/542
  port: 9000,
  secure: false,
  accessKey: 'quickstart',
  secretKey: 'quickstart'
});

// NOTE:  minio does not comply with node callback standards...
// will need to use this with .spread()
// http://bluebirdjs.com/docs/api/promise.promisify.html
// http://bluebirdjs.com/docs/api/spread.html
minio.presignedPostPolicyAsync = Promise.promisify(
    minio.presignedPostPolicy,
    { multiArgs: true,
      context: minio }
  );

const bucket = 'test';

 
test('upload a file', function(assert) {

  const file = 'test/data/test.txt';
  var chksum;

  // NOTE:  makeBucket is not idempotent, calling it again throws an error
  return minio.makeBucketAsync(bucket, 'us-east-1')
  .then(r =>  {
    // NOTE: r is undefined, no return value for makeBucket...
    assert.pass('bucket created successfully with no errors');
    return minio.fPutObjectAsync(bucket, 'test.txt', file, 'application/octet-stream');
  }).then(etag => {
    chksum = etag;
    assert.same(etag.length, 32, 'file put, etag is of correct length');
    return minio.statObjectAsync(bucket, 'test.txt');
  }).then(stat => {
    assert.same(stat.etag, chksum, 'checksum (etag) matches');
  }).catch(err => {
    assert.fail(err, 'got error');
  });
});

test('create a presigned URL policy and POST a file with that policy', function(assert) {
  
  // the name of the file as it will appear in the bucket after an upload
  const filename = 'signedtest.txt';
  var checksum;

  // NOTE: making a bucket is not idempotent.  Depending on test above for that.
  // making an existing bucket throws an error.  XXX write helper function for this
  // All APIs in 2017 should be as idempotent as possible

  var policy = minio.newPostPolicy();

  // Policy restricted only for bucket.  
  policy.setBucket(bucket);

  // Policy restricted only for the file object.
  policy.setKey(filename);
  
  // Policy restricted for incoming objects with keyPrefix.
  // NOTE: I have no idea what this does but it does rename the file set above
  //policy.setKeyStartsWith('keyPrefix');

  // Policy expires in 10 days.
  // XXX BUG: setting it in the near future when you aren't in Greenwich 
  // made me find this: // https://github.com/minio/minio-js/issues/545
  var expires = new Date;
  expires.setSeconds(24 * 60 * 60 * 10);
  policy.setExpires(expires);

  // Only allow 'text'.
  policy.setContentType('text/plain');

  // Only allow content size in range 1B to 1MB.
  policy.setContentLengthRange(1, 1024*1024);

  // create policy (would typically be done on your app server)
  return minio.presignedPostPolicyAsync(policy)
  .spread((url, formData) => {
    assert.ok(url.length > 1, 'URL is non empty');
    console.log(formData);
    var req = agent.post(url);
    _.each(formData, function(value, key) {
      req.field(key, value);
    });
    // upload file via the created signed policy.  This would be done in the browser
    // or some other untrusted third party
    // NOTE:  browsers don't allow you to use the .attach() API.  You
    // must do get the file the browser way.
    return req 
    .set('Content-Type', 'text/plain')
    .attach('file', 'test/data/test.txt');
  }).then(r => {
    assert.ok(r.ok, 'POST should have returned ok');
    checksum = JSON.parse(r.header.etag);

    // the following is run on your server to verify the upload was completed
    // by the browser.  your app API should ask the browser to supply
    // the checksum
    return minio.statObjectAsync(bucket, filename);
  }).then(stat => {
    assert.same(stat.etag, checksum, 'after POST checksum matches');
    return streamToPromise(minio.listObjectsV2(bucket, '', true));
  }).then(objects => {
    const oneOf = objects.filter(el => { return el.name == filename; });
    assert.same(oneOf.length, 1, 'bucket contains only one copy of the file posted');
    assert.same(oneOf[0].name, filename, 'bucket contains the file posted');
    return minio.presignedGetObjectAsync(bucket, filename, 60 * 60 * 24 * 6);
  }).then(url => {
    assert.ok(url.length > 1, 'URL is non empty');
    return agent
    .get(url)
    .set('Content-Type', 'text/plain');
  }).then(r => {
    assert.ok(r.ok, 'presigned GET should have returned ok');
    assert.same(JSON.parse(r.headers.etag), checksum, 'presigned GET had correct checksum');
  }).catch(err => {
    assert.fail(err, 'got error');
  });
});


test('PUT a file to a presigned URL', function(assert) {
  
  // the name of the file as it will appear in the bucket after an upload
  const filename = 'signedtest2.txt';

  return minio.presignedPutObjectAsync(bucket, filename, 60)
  .then(url => {
    assert.ok(url.length > 200, 'URL is non empty');
    return agent
    .put(url)
    .set('Content-Type', 'text/plain')
    .attach('file', 'test/data/test.txt');
  }).then(r => {
    assert.ok(r.ok);
    assert.same(JSON.parse(r.header.etag).length, 32, 'etag is correct length');
  }).catch(err => {
    assert.fail('got error', err);
  });
});
 
test.onFinish(function() {
  // redis-session doesn't close cleanly, unfortunetely.  So just whack ourselves on the head
  process.exit(0);
});



// vim: ts=2:et

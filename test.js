
var assert = require('assert');
var generator = require('./test-generator');
var bep15 = require('./');

describe('connect', function() {

  var input = {
    transactionId: generate.transactionId()
  };

  var request;

  describe('request', function() {

    it('should write without any opts', function() {
      request = bep15.writeConnectRequest(input);
    });

    it('should be at least 16 bytes', function () {
      assert.ok(request.length >= 16);
    });

    it('should read out equal transactionId from write to read', function () {
      var packet = bep15.writeConnectRequest(input);
      var output = bep15.readConnectRequest(packet);
      assert.deepEqual(input.transactionId, output.transactionId);
    });
  });

  describe('response', function() {
    var input = {
      transactionId: generate.transactionId(),
      connectionId: generate.connectionId()
    };
    var packet;
    var output;
    it('should write packet without error thrown', function() {
      packet = bep15.writeConnectResponse(input);
    });
    it('should read what was written', function() {
      output = bep15.readConnectResponse(packet);
      assert.deepEqual(input.transactionId, output.transactionId);
      assert.deepEqual(input.connectionId, output.connectionId);
    });
    it('should set action as 1', function() {
      output = bep15.readConnectResponse(packet);
    });
  });
});


describe('announce', function() {
  describe('request', function() {
    var input = {
      connectionId: generate.connectionId(),
      transactionId: generate.transactionId(),
      infoHash: generate.infoHash(),
      peerId: generate.peerId(),
      downloaded: generate.downloaded(),
      left: generate.left(),
      uploaded: generate.uploaded(),
      event: generate.event(),
      ipAddress: generate.ipAddress(),
      key: generate.key(),
      numWant: generate.numWant(),
      port: generate.port()
    };
    var packet;
    it('should write a packet without thrown error', function() {
      packet = bep15.writeAnnounceRequest(input);
    });
    it('should be at least 20 bytes', function() {
      assert.ok((packet.length >= 20) ? true : false);
    });
    it('should read what was written', function() {
      var output = bep15.readAnnounceRequest(packet);
      assert.deepEqual(input.connectionId, output.connectionId);
      assert.equal(1, output.action);
      assert.equal(input.transactionId, output.transactionId);
      assert.equal(input.infoHash, output.infoHash);
      assert.equal(input.peerId, output.peerId);
      assert.deepEqual(input.downloaded, output.downloaded);
      assert.deepEqual(input.left, output.left);
      assert.deepEqual(input.uploaded, output.uploaded);
      assert.equal(input.event, output.event);
      assert.equal(input.ipAddress, output.ipAddress);
      assert.equal(input.key, output.key);
      assert.equal(input.numWant, output.numWant);
    });
  });
  describe('response', function() {
    var packet;
    it('should write a packet as expected', function() {
      var input = {
        transactionId: generate.transactionId(),
        interval: generate.interval(),
        leechers: generate.leechers(),
        seeders: generate.seeders(),
        peers: generate.peers()
      };
      packet = bep15.writeAnnounceResponse(input);
    });
    it('should be at least 20 bytes', function() {
      assert.ok((packet.length >= 20) ? true : false);
    });
    it('should read what was written', function() {

      var output = bep15.readAnnounceResponse(packet);
    });
  });
});


describe('scrape', function() {
  describe('request', function() {
    var packet;
    it('should be at least x bytes');
    it('should read what was written');
  });
  describe('response', function() {
    var packet;
    it('should be at least x bytes');
    it('should read what was written');
  });
});
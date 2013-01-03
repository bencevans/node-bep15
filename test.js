
var assert = require('assert');
var packetMachine = require('./');

describe('connect', function() {

  var input;
  var request;

  describe('request', function() {

    it('should write without any opts', function() {
      request = packetMachine.writeConnectRequest();
    });

    it('should be at least 16 bytes', function () {
      assert.ok(request.length >= 16);
    });

    it('should read out equal transactionId from write to read', function () {
      var packet = packetMachine.writeConnectRequest({transactionId:233});
      var output = packetMachine.readConnectRequest(packet);
      assert.equal(233, output.transactionId);
    });
  });

  describe('responce', function() {
    var packet;
    it('should be at least 16 bytes');
    it('should read what was written');
  });
});


describe('announce', function() {
  describe('request', function() {
    var input = {
      connectionId:new Buffer([1, 2, 3, 4, 5, 6, 7, 8]),
      transactionId: 23,
      infoHash:new Buffer('335990D615594B9BE409CCFEB95864E24EC702C7', 'hex'),
      peerId:'1234567890123456789000000000000000000000',
      downloaded:new Buffer([0,0,0,0,0,0,0,0]),
      left:new Buffer([0,0,0,0,0,0,0,0]),
      uploaded:new Buffer([0,0,0,0,0,0,0,0]),
      event:1,
      ipAddress:0,
      key:23,
      numWant:10,
      port:10
    };
    var packet;
    it('should write a packet without thrown error', function() {
      packet = packetMachine.writeAnnounceRequest(input);
    });
    it('should be at least 20 bytes', function() {
      assert.ok((packet.length >= 20) ? true : false);
    });
    it('should read what was written', function() {
      var output = packetMachine.readAnnounceRequest(packet);
      assert.equal(input.connectionId.toString('hex'), output.connectionId.toString('hex'));
      assert.equal(1, output.action);
      assert.equal(input.transactionId, output.transactionId);
      assert.equal(input.infoHash.toString('hex'), output.infoHash.toString('hex'));
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
  describe('responce', function() {
    var packet;
    it('should write a packet as expected', function() {
      var input = {
        transactionId: 21,
        interval: 20,
        leechers: 10,
        seeders: 10,
        peers: [{
          address: '10.10.10.10',
          port: 3030
        }, {
          address: '11.11.11.11',
          port: 8765
        }]
      };
      packet = packetMachine.writeAnnounceResponce(input);
    });
    it('should be at least 20 bytes', function() {
      assert.ok((packet.length >= 20) ? true : false);
    });
    it('should read what was written', function() {

      var output = packetMachine.readAnnounceResponce(packet);
    });
  });
});


describe('scrape', function() {
  describe('request', function() {
    var packet;
    it('should be at least x bytes');
    it('should read what was written');
  });
  describe('responce', function() {
    var packet;
    it('should be at least x bytes');
    it('should read what was written');
  });
});
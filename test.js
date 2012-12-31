
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
    var packet;
    it('should be at least x bytes');
    it('should read what was written');
  });
  describe('responce', function() {
    var packet;
    it('should be at least x bytes');
    it('should read what was written', function() {
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
      var packet = packetMachine.writeAnnounceResponce(input);
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
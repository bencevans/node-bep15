
//
// Connect: Request
//

var writeConnectRequest = function(opts) {

  var connectionId = new Buffer([0x41, 0x72, 0x71, 0x01, 0x98, 0x0]);
  var action = 0;
  var transactionId = Math.floor(Math.random() * 255);

  var packet = new Buffer(16);
  connectionId.copy(packet, 0);
  packet.writeInt32BE(action, 8);
  packet.writeInt32BE(transactionId, 12);

  return packet;

};

var readConnectRequest = function(packet) {

  var connectionId = packet.slice(0, 8);
  var action = packet.readInt32BE(8);
  var transactionId = packet.readInt32BE(12);

  return {
    connectionId:connectionId,
    action:action,
    transactionId:transactionId
  };

};

//
// Connect: Responce
//

var writeConnectResponse = function(opts) {

  var packet = new Buffer(16);

  // action
  packet.writeInt32BE(0, 0);
  // transaction_id
  packet.writeInt32BE(opts.transactionId, 4);
  // connection_id
  opts.connectionId.copy(packet, 8);

  return packet;

};

var readConnectResponse = function(packet) {

  var action = packet.readInt32BE();
  var transactionId = packet.readInt32BE(4);
  var connectionId = packet.slice(8, 2);

  return {
    action:action,
    transactionId:transactionId,
    connectionId:connectionId
  };

};

//
// Announce: Request
//

var writeAnnounceRequest = function(opts) {

  var connection_id = opts.connectionId;
  var action = new Buffer(4).writeInt32BE(1);
  var transaction_id = new Buffer(4).writeInt32BE(transactionId);
  var info_hash = new Buffer(opts.infoHash);
  var peer_id = new Buffer(opts.peerId);
  var downloaded = opts.downloaded;
  var left = opts.left;
  var uploaded = opts.uploaded;
  var event = opts.event || new Buffer(4).writeInt32BE(0);
  var ip_address = 0;
  var key = opts.key;
  var num_want = new Buffer(4).writeInt32BE(-1);
  var port = new Buffer(2).writeInt16BE(opts.port);

  var packet = new Buffer(98);

  connection_id.copy(packet);
  action.copy(packet, 8);
  transaction_id.copy(packet, 12);
  info_hash.copy(packet, 16);
  peer_id.copy(packet, 36);
  downloaded.copy(packet, 56);
  left.copy(packet, 64);
  uploaded.copy(packet, 72);
  event.copy(packet, 80);
  ip_address.copy(packet, 84);
  key.copy(packet, 88);
  num_want.copy(packet, 92);
  port.copy(packet, 96);

  return packet;

};

//
// Anounce: Responce
//

var readAnnounceResponce = function(packet) {
  var action = packet.readInt32BE();
  var transactionId = packet.readInt32BE(4);
  var interval = packet.readInt32BE(8);
  var leechers = packet.readInt32BE(12);
  var seeders = packet.readInt32BE(16);
  var peers = [];

  return {
    action:action,
    transactionId:transactionId,
    interval:interval,
    leechers:leechers,
    seeders:seeders,
    peersaction:peersaction
  };

};

//
// Scrape: Request
//

var writeScrapeRequest = function (opts) {

  var packet = new Buffer(16 + ((typeof opts.infoHash == 'array') ? opts.infoHash.length : 1) * 20);

  opts.connectionId.copy(packet);
  packet.writeInt32BE(2, 8);
  opts.transactionId.copy(packet, 12);

  if(typeof opts.infoHash == 'array') {
    for (var i = opts.infoHash.length - 1; i >= 0; i--) {
      opts.infoHash[i].copy(packet, 16 + (20*i));
    }
  } else {
    opts.infoHash.copy(packet, 16);
  }

  return packet;

};

var readScrapeRequest = function (packet) {

  var connectionId = packet.slice(0, 8);
  var action = packet.readInt32BE(8);
  var transactionId = packet.slice(12, 16);
  var infoHash = [];

  var infoHashCount = (packet.length - 16) / 20;

  for (var i = 0; i < infoHashCount; i++) {
    infoHash.push(packet.toString('hex', 16+(i*20), 16+(i*20) + 20));
  }

  return {
    connectionId:connectionId,
    action:action,
    transactionId:transactionId,
    infoHash:infoHash
  };

};


//
// Misc
//

var readErrorResponce = function(packet) {

  var action = packet.readInt32BE();
  var transactionId = packet.readInt32BE(4);
  var message = packet.slice(8, packet.lenth - 8);

  return {
    action:action,
    transactionId:transactionId,
    message:message
  };
};

var isResponceError = function(packet) {

  return (packet.readInt32BE() == 3) ? true : false;

};

var getRequestAction = function(packet) {

  return packet.readInt32BE(8);

};

var getResponceAction = function(packet) {

  return packet.readInt32BE(0);

};

module.exports.writeConnectRequest = writeConnectRequest;
module.exports.readConnectRequest = readConnectRequest;

module.exports.writeConnectResponse = writeConnectResponse;
module.exports.readConnectResponse = readConnectResponse;

module.exports.writeAnnounceRequest = writeAnnounceRequest;

module.exports.readAnnounceResponce = readAnnounceResponce;

module.exports.writeScrapeRequest = writeScrapeRequest;
module.exports.readScrapeRequest = readScrapeRequest;

module.exports.readErrorResponce = readErrorResponce;

module.exports.isResponceError = isResponceError;
module.exports.getRequestAction = getRequestAction;
module.exports.getResponceAction = getResponceAction;
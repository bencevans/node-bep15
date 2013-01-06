
//
// Requires
//

var ipport = require('ipport');

//
// Helpers
//

function bufferEach (buffer, objectLength, offset, eachCb) {
  for (var i = offset; i <= (buffer.length - offset / objectLength) - 1; i = i + objectLength) {
    eachCb(buffer.slice(i, i + objectLength));
  }
}

//
// Connect: Request
//

var writeConnectRequest = function(opts) {

  var connectionId = new Buffer([0x41, 0x72, 0x71, 0x01, 0x98, 0x0]);
  var action = 0;
  var transactionId = opts.transactionId;

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
// Connect: Response
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

  var action = packet.readInt32BE(0);
  var transactionId = packet.readInt32BE(4);
  var connectionId = packet.slice(8, 16);

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
  var action = new Buffer(4);
  action.writeInt32BE(1, 0);
  var transaction_id = new Buffer(4);
  transaction_id.writeInt32BE(opts.transactionId, 0);
  var info_hash = new Buffer(opts.infoHash, 'hex');
  var peer_id = new Buffer(20);
  peer_id.write(opts.peerId, 0, opts.peerId.length, 'hex');
  var downloaded = opts.downloaded;
  var left = opts.left;
  var uploaded = opts.uploaded;
  var event = new Buffer(4);
  event.writeInt32BE(opts.event || 0, 0);
  var ip_address = ipport.toBuffer(opts.ipAddress + ':0').slice(0, 4);
  var key = new Buffer(4);
  key.writeInt32BE(opts.key, 0);
  var num_want = new Buffer(4);
  num_want.writeInt32BE(opts.numWant || -1, 0);
  var port = new Buffer(2);
  port.writeInt16BE(3001, 0);

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

var readAnnounceRequest = function(packet) {

  var output = {};

  output.connectionId = packet.slice(0, 8);
  output.action = packet.readInt32BE(8);
  output.transactionId = packet.readInt32BE(12);
  output.infoHash = packet.slice(16, 36).toString('hex');
  output.peerId = packet.slice(36, 56).toString('hex');
  output.downloaded = packet.slice(56, 64);
  output.left = packet.slice(64, 72);
  output.uploaded = packet.slice(72, 80);
  output.event = packet.readInt32BE(80);
  output.ipAddress = ipport.toString(packet.slice(84, 90)).split(':')[0];
  output.key = packet.readInt32BE(88);
  output.numWant = packet.readInt32BE(92);
  //output.port = packet.readInt32BE(96);

  return output;

};

//
// Announce: Response
//

var writeAnnounceResponse = function(opts) {

  var packet = new Buffer(20 + (opts.peers.length * 12));

  // action
  packet.writeInt32BE(1, 0);
  // transaction_id
  packet.writeInt32BE(opts.transactionId, 4);
  // interval
  packet.writeInt32BE(opts.interval, 8);
  // leechers
  packet.writeInt32BE(opts.leechers, 12);
  // seeders
  packet.writeInt32BE(opts.seeders, 16);

  for (var i = 0; i < opts.peers.length; i++) {
    var ip = opts.peers[i];
    var ipBuf = ipport.toBuffer(ip);
    ipBuf.copy(packet, 24 + (i*6));
  }

  return packet;

};

var readAnnounceResponse = function(packet) {
  var action = packet.readInt32BE(0);
  var transactionId = packet.readInt32BE(4);
  var interval = packet.readInt32BE(8);
  var leechers = packet.readInt32BE(12);
  var seeders = packet.readInt32BE(16);
  var peers = [];

  bufferEach(packet, 6, 20, function(buf) {
    peers.push(ipport.toObject(buf));
  });

  return {
    action:action,
    transactionId:transactionId,
    interval:interval,
    leechers:leechers,
    seeders:seeders,
    peers:peers
  };

};

//
// Scrape: Request
//

var writeScrapeRequest = function (opts) {

  var packet = new Buffer(16 + ((typeof opts.torrents == 'array') ? opts.torrents.length : 1) * 20);

  opts.connectionId.copy(packet);
  packet.writeInt32BE(2, 8);
  packet.writeInt32BE(opts.transactionId, 12);

  if(typeof opts.torrents == 'object') {
    for (var i = opts.torrents.length - 1; i >= 0; i--) {
      packet.write(opts.torrents[i], 16 + (20*i));
    }
  } else {
    opts.torrents.copy(packet, 16);
  }

  return packet;

};

var readScrapeRequest = function (packet) {

  var connectionId = packet.slice(0, 8);
  var action = packet.readInt32BE(8);
  var transactionId = packet.slice(12, 16);
  var torrents = [];

  var torrentCount = (packet.length - 16) / 20;

  for (var i = 0; i < torrentCount; i++) {
    torrents.push(packet.toString('hex', 16+(i*20), 16+(i*20) + 20));
  }

  return {
    connectionId:connectionId,
    action:action,
    transactionId:transactionId,
    torrents:torrents
  };

};

//
// Scrape: Response
//

var writeScrapeResponse = function (opts) {

  var packet = new Buffer(8 + (opts.torrents.length * 12));

  // action
  packet.writeInt32BE(2, 0);
  // transaction_id
  opts.transactionId.copy(packet, 4);

  // torrents
  for(var i in opts.torrents) {
    // seeders
    packet.writeInt32BE(opts.torrents[i].seeders, 8 + (12 * i));
    // completed
    packet.writeInt32BE(opts.torrents[i].completed, 12 + (12 * i));
    // leechers
    packet.writeInt32BE(opts.torrents[i].leechers, 16 + (12 * i));
  }

  return packet;

};

var readScrapeResponse = function (packet) {

  var action = packet.readInt32BE(0);
  var transactionId = packet.slice(4, 8);

  // torrents
  var torrents = [];
  var torrentCount = (packet.length - 8) / 12;
  for(var i = 0; i < torrentCount; i++) {
    var seeders = packet.readInt32BE(8 + (12 * i));
    var completed = packet.readInt32BE(16 + (12 * i));
    var leechers = packet.readInt32BE(16 + (12 * i));
    torrents.push({seeders:seeders, completed:completed, leechers:leechers});
  }

  return {
    actions:action,
    transactionId:transactionId,
    torrents:torrents
  };

};

//
// Misc
//

var writeErrorResponse = function(opts) {

  var message = new Buffer(opts.message);

  var packet = new Buffer(8 + message.length);

  var action = packet.writeInt32BE(3, 0);
  var transactionId = packet.writeInt32BE(opts.transactionId, 4);
  message.copy(packet, 8);

  return packet;
};

var readErrorResponse = function(packet) {

  var action = packet.readInt32BE();
  var transactionId = packet.readInt32BE(4);
  var message = packet.slice(8, packet.lenth - 8);

  return {
    action:action,
    transactionId:transactionId,
    message:message
  };
};

var isResponseError = function(packet) {

  return (packet.readInt32BE() == 3) ? true : false;

};

var getRequestAction = function(packet) {

  return packet.readInt32BE(8);

};

var getRequestPeerId = function(packet) {

  return packet.slice(36, 56).toString('hex');

};

var getResponseAction = function(packet) {

  return packet.readInt32BE(0);

};

module.exports.writeConnectRequest = writeConnectRequest;
module.exports.readConnectRequest = readConnectRequest;

module.exports.writeConnectResponse = writeConnectResponse;
module.exports.readConnectResponse = readConnectResponse;

module.exports.writeAnnounceRequest = writeAnnounceRequest;
module.exports.readAnnounceRequest = readAnnounceRequest;

module.exports.writeAnnounceResponse = writeAnnounceResponse;
module.exports.readAnnounceResponse = readAnnounceResponse;

module.exports.writeScrapeRequest = writeScrapeRequest;
module.exports.readScrapeRequest = readScrapeRequest;

module.exports.writeScrapeResponse = writeScrapeResponse;
module.exports.readScrapeResponse = readScrapeResponse;


module.exports.readErrorResponse = readErrorResponse;

module.exports.isResponseError = isResponseError;
module.exports.getRequestAction = getRequestAction;
module.exports.getRequestPeerId = getRequestPeerId;
module.exports.getResponseAction = getResponseAction;
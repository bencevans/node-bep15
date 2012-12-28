
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

  var action = packet.readInt32BE(0);
  var transactionId = packet.readInt32BE(4);
  var connectionId = packet.slice(8, 10);

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

var readAnnounceRequest = function(packet) {

  var output = {};

  output.connectionId = packet.slice(0, 7);
  output.action = packet.readInt32BE(8);
  output.transactionId = packet.readInt32BE(12);
  output.infoHash = packet.slice(16, 35).toString('hex');
  output.peerId = packet.slice(36, 55);
  output.downloaded = packet.readInt32BE(56);
  output.left = packet.readInt32BE(64);
  output.uploaded = packet.readInt32BE(72);
  output.event = packet.readInt32BE(80);
  output.ipAddress = 0;
  output.key = packet.readInt32BE(88);
  output.numWant = packet.readInt32BE(92);
  //output.port = packet.readInt32BE(96);

  return output;

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

  var packet = new Buffer(16 + ((typeof opts.torrents == 'array') ? opts.torrents.length : 1) * 20);

  opts.connectionId.copy(packet);
  packet.writeInt32BE(2, 8);
  opts.transactionId.copy(packet, 12);

  if(typeof opts.torrents == 'object') {
    for (var i = opts.torrents.length - 1; i >= 0; i--) {
      opts.torrents[i].copy(packet, 16 + (20*i));
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
// Scrape: Responce
//

var writeScrapeResponce = function (opts) {

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

var readScrapeResponce = function (packet) {

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
module.exports.readAnnounceRequest = readAnnounceRequest;

module.exports.readAnnounceResponce = readAnnounceResponce;

module.exports.writeScrapeRequest = writeScrapeRequest;
module.exports.readScrapeRequest = readScrapeRequest;

module.exports.writeScrapeResponce = writeScrapeResponce;
module.exports.readScrapeResponce = readScrapeResponce;


module.exports.readErrorResponce = readErrorResponce;

module.exports.isResponceError = isResponceError;
module.exports.getRequestAction = getRequestAction;
module.exports.getResponceAction = getResponceAction;
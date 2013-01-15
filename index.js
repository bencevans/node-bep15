
//
// Requires
//

var ipport = require('ipport');
var _ = require('underscore');

//
// Helpers
//

function bufferEach (buffer, objectLength, offset, eachCb) {
  for (var i = offset; i <= (buffer.length - offset / objectLength) - 1; i = i + objectLength) {
    eachCb(buffer.slice(i, i + objectLength));
  }
}

//
// Generics
// --------
//
// Generics: Request
//

var writeGenericRequest = function(options) {

  if(typeof options.connectionId !== 'object' && Buffer.isBuffer(options.connectionId) && options.connectionId.length == 6)
    throw new Error('options.transactionId must be a 6 byte buffer');

  if(typeof options.action !== 'number')
    throw new Error('options.action must be a number');

  if(typeof options.transactionId !== 'number')
    throw new Error('options.transactionId must be a number');

  var packet = new Buffer(16);

  options.connectionId.copy(packet, 0);
  packet.writeInt32BE(options.action, 8);
  packet.writeInt32BE(options.transactionId, 12);

  return packet;
};

var readGenericRequest = function(packet) {

  if(!Buffer.isBuffer(packet) || packet.length < 16)
    throw new Error('packet must be a buffer of at least 16 bytes');

  return {
    connectionId: packet.slice(0, 8),
    action: packet.readInt32BE(8),
    transactionId: packet.readInt32BE(12)
  };
};

//
// Generics: Response
//

var writeGenericResponse = function(options) {

  if(typeof options.action !== 'number') {
    throw new Error('options.action must be a number');
  }

  if(typeof options.transactionId !== 'number')
    throw new Error('options.transactionId must be a number');

  if(typeof options.connectionId !== 'object' && Buffer.isBuffer(options.connectionId) && options.connectionId.length == 6)
    throw new Error('options.transactionId must be a 6 byte buffer');

  var packet = new Buffer(16);

  packet.writeInt32BE(options.action, 0);
  packet.writeInt32BE(options.transactionId, 4);
  options.connectionId.copy(packet, 8);

  return packet;
};

var readGenericResponse = function(packet) {

  if(!Buffer.isBuffer(packet) || packet.length < 16)
    throw new Error('packet must be a buffer of at least 16 bytes');

  return {
    action: packet.readInt32BE(0),
    transactionId: packet.readInt32BE(4),
    connectionId: packet.slice(8, 16)
  };
};


//
// Connect: Request
//

var writeConnectRequest = function(options) {
  return writeGenericRequest(_.extend(options, {action:0}));
};

var readConnectRequest = readGenericRequest;

//
// Connect: Response
//

var writeConnectResponse = function(options) {
  return writeGenericResponse(_.extend(options, {action:0}));
};

var readConnectResponse = readGenericResponse;

//
// Announce: Request
//

var writeAnnounceRequest = function(options) {

  // TODO: Packet & Data size decrease to given options

  var packet = new Buffer(98);

  writeGenericRequest(_.extend(options, {action:1})).copy(packet);

  var info_hash = new Buffer(options.infoHash, 'hex');
  var peer_id = new Buffer(20);
  peer_id.write(options.peerId, 0, options.peerId.length, 'hex');
  var downloaded = options.downloaded;
  var left = options.left;
  var uploaded = options.uploaded;
  var event = new Buffer(4);
  event.writeInt32BE(options.event || 0, 0);
  var ip_address = ipport.toBuffer(options.ipAddress + ':0').slice(0, 4);
  var key = new Buffer(4);
  key.writeInt32BE(options.key, 0);
  var num_want = new Buffer(4);
  num_want.writeInt32BE(options.numWant || -1, 0);
  var port = new Buffer(2);
  port.writeInt16BE(3001, 0);

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

  if(!Buffer.isBuffer(packet) || packet.length < 36)
    throw new Error('packet must be a buffer at least 36 bytes long');

  var output = readGenericRequest(packet);

  output.infoHash = packet.slice(16, 36).toString('hex');

  if(packet.length >= 56)
    output.peerId = packet.slice(36, 56).toString('hex');

  if(packet.length >= 64)
    output.downloaded = packet.slice(56, 64);

  if(packet.length >= 72)
    output.left = packet.slice(64, 72);

  if(packet.length >= 80)
    output.uploaded = packet.slice(72, 80);

  if(packet.length >= 84)
    output.event = packet.readInt32BE(80);

  if(packet.length >= 88)
    output.ipAddress = ipport.toString(packet.slice(84, 90)).split(':')[0];

  if(packet.length >= 92)
    output.key = packet.readInt32BE(88);

  if(packet.length >= 96)
    output.numWant = packet.readInt32BE(92);

  if(packet.length >= 100)
    output.port = packet.readInt32BE(96);

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
      packet.write(opts.torrents[i], 16 + (20*i), opts.torrents[i].length, 'hex');
    }
  } else {
    opts.torrents.copy(packet, 16);
  }

  return packet;

};

var readScrapeRequest = function (packet) {

  var connectionId = packet.slice(0, 8);
  var action = packet.readInt32BE(8);
  var transactionId = packet.readInt32BE(12);
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

var writeScrapeResponse = function (options) {

  var packet = new Buffer(8 + (options.torrents.length * 12));

  writeGenericResponse(_.extend(options, {action:2})).copy(packet, 0);

  // torrents
  for(var i in options.torrents) {
    // seeders
    packet.writeInt32BE(options.torrents[i].seeders, 8 + (12 * i));
    // completed
    packet.writeInt32BE(options.torrents[i].completed, 12 + (12 * i));
    // leechers
    packet.writeInt32BE(options.torrents[i].leechers, 16 + (12 * i));
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
  var action = packet.readInt32BE(0);
  var transactionId = packet.readInt32BE(4);
  var message = packet.slice(8, packet.lenth).toString();
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

var getResponseTransactionId = function(packet) {

  return packet.readInt32BE(4);

};

var readRequest = function(packet) {
  var res = readGenericRequest(packet);
  if(res.action === 0)
    return readConnectRequest(packet);
  else if(res.action == 1)
    return readAnnounceRequest(packet);
  else if(res.action == 2)
    return readScrapeRequest(packet);
  else
    throw new Error('Unrecognisable request packet');
};

var readResponse = function(packet) {
  var res = readGenericRequest(packet);
  if(res.action === 0)
    return readConnectResponse(packet);
  else if(res.action == 1)
    return readAnnounceResponse(packet);
  else if(res.action == 2)
    return readScrapeResponse(packet);
  else
    return readErrorResponse(packet);
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
module.exports.getResponseTransactionId = getResponseTransactionId;
module.exports.readRequest = readRequest;
module.exports.readResponse = readResponse;
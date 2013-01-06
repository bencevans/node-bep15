
function rand255() {
  return Math.floor(Math.random() * 255);
}

function rand255Array(length) {
  var randArray = [];
  for (var i = 0; i < length; i++) {
    randArray[i] = rand255();
  }
  return randArray;
}

generate = {};

generate.transactionId = function() {
  return Math.floor(Math.random() * 1000);
};

generate.connectionId = function() {
  return new Buffer(rand255Array(8));
};

generate.infoHash = function() {
  return Buffer(rand255Array(20)).toString('hex');
};

generate.peerId = generate.infoHash;

generate.downloaded = function() {
  return Buffer(rand255Array(8));
};

generate.left = function() {
  return Buffer(rand255Array(8));
};

generate.uploaded = function() {
  return Buffer(rand255Array(8));
};

generate.event = function() {
  return Math.floor(Math.random() * 3.999);
};

generate.ipAddress = function() {
  return [rand255(), rand255(), rand255(), rand255()].join('.');
};

generate.key = function() {
  return Math.floor(Math.random() * 1000);
};

generate.numWant = function() {
  // Heigten Changes of -1 (50%)
  if(Math.floor(Math.random() * 2) === 0) {
    return -1;
  } else {
    return Math.floor(Math.random() * 1000);
  }
};

generate.port = function() {
  return rand255();
};

generate.interval = function() {
  return rand255() * 10;
};

generate.leechers = function() {
  return rand255() * 10;
};

generate.seeders = function() {
  return rand255() * 10;
};

generate.peers = function() {
  return [{address:generate.ipAddress(), port:generate.port()}];
};

module.exports = generate;
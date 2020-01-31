const fs = require("fs");
const archiver = require("archiver");

/**
 * zip with configuration
 *
 * example configuration is like
 * {
 *    "outputFile":"example.zip",
 *    "include":[
 *      "lib/**",
 *      "dist/example.js"
 *    ]
 * }
 * @param {Config} conf config
 */
function zippack(conf, logger) {
  logger = logger || {
    log: () => {},
    warn: () => {},
    error: () => {}
  };

  const output = fs.createWriteStream(conf.outputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on("close", function() {
    logger.log(archive.pointer() + " total bytes");
    logger.log(`${conf.outputFile} is finalized`);
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on("end", function() {
    logger.log("Data has been drained");
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on("warning", function(err) {
    if (err.code === "ENOENT") {
      // log warning
      logger.warn(err);
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on("error", function(err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  conf.include.forEach(p => {
    if (p.indexOf("*") >= 0) {
      archive.glob(p);
    } else if (p.endsWith("/")) {
      archive.directory(p);
    } else {
      archive.file(p);
    }
  });

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  archive.finalize();
}

module.exports = zippack;

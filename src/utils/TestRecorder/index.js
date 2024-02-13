module.exports = process.env["IS_BUN"] === "true" ?
    require('./BunRecorder') :
    require('./Recorder');
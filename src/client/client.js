/**
* Client application.
*/
class Client {

  /**
  * Constructor.
  */
  constructor() {
    this._eventLoopStatus = false;
    this._eventListeners = new Map();
    this._dataSources = [];
    this._filters = [];

    this.prepareEventLoop();
  }

  /**
  * Prepare event loop.
  *
  * @param options
  */
  prepareEventLoop(options = {}) {
    let self = this;
    let freq = options.hasOwnProperty('freq') ? options.freq : 500;
    this._eventLoop = setInterval(self.eventLoop(), freq);
  }

  /**
  * Apply filters to filter telegrams before processing.
  */
  applyFilters(options) {
    this._filters = [];
  }

  /**
  * Start telegram processing.
  */
  startProcessing() {
    this._eventLoopStatus = true;
  }

  /**
  * Stop telegram processing.
  */
  stopProcessing() {
    this._eventLoopStatus = false;
  }

  /**
  * Event loop to handle processing.
  */
  eventLoop() {
    if (!this._eventLoopStatus)
      return;

    // TODO:
  }

  /**
  * Register data source.
  *
  * @param dataSource
  */
  registerDataSource(dataSource) {

  }

  /**
  * Subscribe listener to fetch information about processed telegrams.
  *
  * @param name
  * @param callback
  */
  subscribeListener(name, callback) {
    this._eventListeners.set(name, callback);
  }
}

export default Client;
import { request } from 'xhr-stream-dl';
import { EventEmitter } from 'events';


class Client {

  constructor(server, options) {
    this._server = server;
  }

  streamCommand(commandName, params) {
    return new Command(this._server, commandName, params);
  }
}


class Command extends EventEmitter {
  constructor(server, endpoint, params) {
    super();

    this._server = server;
    this._endpoint = endpoint;
    this._params = params;
    this._numRetries = 3;
  }

  run() {

    const query = this._server + '/' + this._endpoint;

    let numAttempts = 1;
    let emittedData = false;
    let emittedErr = false;

    const attemptRequest = () => {

      const requestId = genRandomId();
      const params = Object.assign({
        _requestId: requestId,
        _appendErrors: true,
        _attemptNum: numAttempts,
      }, this._params);

      this._stream = request(query, {
        method: 'POST',
        params: params,
        contentType: 'text/plain; charset=utf-8',
      });

      let lastChunk = "";

      this._stream.onData((data) => {
        lastChunk = data;
        this.emit('data', data);
        emittedData = true;
      });
      this._stream.onEnd(() => {
        if (lastChunk.endsWith("GRU_ERROR_SENTINEL")) {
          this.emit('error', "Unknown streaming error");
        }
        else {
          this.emit('end');
        }
      });
      this._stream.onError((e) => {

        // If we've already emitted data, don't try to fix the stream, and emit
        // an error. Otherwise we may still be able to retry and succeed.
        if (emittedData === true || numAttempts >= this._numRetries) {
          // emittedErr is for preventing duplicate errors
          if (!emittedErr) {
            emittedErr = true;
            //logToServer(params, e);
            this.emit('error', e);
          }
        }
        else {
          this._stream.cancel();
          numAttempts += 1;
          attemptRequest();
        }
      });
    }

    //const logToServer = (params, e) => {
    //  // This is just a random endpoint to avoid bots accidentally submitting
    //  // garbage as reports. It's not a security measure, as it's trivial
    //  // to inspect our network calls to determine the endpoint.
    //  fetch('https://log.iobio.io/eGJvfRfF300fGpxnB52LmFpD9IIJPzYb', {
    //    method: 'POST',
    //    body: JSON.stringify({
    //      type: 'error',
    //      error: e,
    //      numAttempts,
    //      endpoint: this._endpoint,
    //      params: params,
    //    }, null, 2),
    //  });
    //};

    attemptRequest();
  }

  cancel() {
    this._stream.cancel();
  }
}

// Modified from https://stackoverflow.com/a/1349426
function genRandomId() {
  let result           = '';
  //const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < 4; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  result += "-";

  for ( var i = 0; i < 4; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export {
  Client,
};

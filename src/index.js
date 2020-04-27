import { request } from 'xhr-stream-dl';
import { EventEmitter } from 'events';


class Client {

  constructor(server, options) {
    const proto = options && options.secure ? 'https://' : 'http://';
    this._server = proto + server;
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
  }

  run() {
    const query = this._server + '/' + this._endpoint;
    //console.log(query);
    this._stream = request(query, {
      method: 'POST',
      params: this._params,
      contentType: 'text/plain; charset=utf-8',
    });

    this._stream.onData((data) => {
      this.emit('data', data);
    });
    this._stream.onEnd(() => {
      this.emit('end');
    });
    this._stream.onError((e) => {
      this.emit('error', e);
    });
  }

  cancel() {
    this._stream.cancel();
  }
}


export {
  Client,
};

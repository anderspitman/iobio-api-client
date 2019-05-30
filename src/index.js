import { request } from 'xhr-stream-dl';

console.log(request);

export class Api {

  constructor() {
    this._server = "http://localhost:9001";
  }

  call(endpoint, params) {
    const paramStr = encodeParams(params);
    const query = encodeURI(this._server + "/" + endpoint + paramStr);
    const stream = request(query);
    return stream;
  }
}

function encodeParams(obj) {

  const keys = Object.keys(obj);

  const params = Object.keys(obj).map((key, i) => {
    let sep = '&';
    if (i === 0) {
      sep = '?';
    }

    // TODO: might need this
    //let value = encodeURIComponent(String(obj[key]));
    const value = String(obj[key]);

    return sep + key + '=' + value;
  });

  return params.join('');
}

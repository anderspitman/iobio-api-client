import { request } from 'xhr-stream-dl';

console.log(request);

export class Api {

  constructor() {
    this._server = "http://localhost:9001";
  }

  async getAlignmentHeader(alignmentUrl) {
    const query = this._server + "/getAlignmentHeader?url=" + encodeURIComponent(alignmentUrl);
    console.log(query);
    const result = await fetch(query);
    const text = await result.text();
    return text;
  }

  getAlignment(alignmentUrl) {
    const query = this._server + "/getAlignment?chr=18&url=" + encodeURIComponent(alignmentUrl);
    const producer = request(query);
    return producer;
  }
}

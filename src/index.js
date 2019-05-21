export class Api {

  constructor() {
    this._server = "http://localhost:9001";
  }

  async getAlignmentHeader(alignmentUrl) {
    const query = this._server + "/getAlignmentHeader?alignmentUrl=" + encodeURIComponent(alignmentUrl);
    console.log(query);
    const result = await fetch(query);
    const text = await result.text();
    return text;
  }
}

(async () => {
  const api = new Api();

  api.getAlignmentHeader("https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam")
  .then((header) => {
    console.log(header);
  });
})();

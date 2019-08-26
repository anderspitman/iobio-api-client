import { request } from 'xhr-stream-dl';
import { EventEmitter } from 'events';


class Client {

  constructor(server, options) {
    this.cmd = Command;
    const proto = options && options.secure ? 'https://' : 'http://';
    this._server = proto + server;
  }

  // bam.iobio endpoints
  //
  streamAlignmentHeader(url) {
    return new Command(this._server, 'alignmentHeader', { url });
  }

  streamBaiReadDepth(url) {
    return new Command(this._server, 'baiReadDepth', { url });
  }

  streamCraiReadDepth(url) {
    return new Command(this._server, 'craiReadDepth', { url });
  }

  streamAlignmentStatsStream(url, indexUrl, regions) {

    //const regArr = regions.map(function(d) { return d.name+ ":"+ d.start + '-' + d.end;});
    //const regStr = JSON.stringify(regions.map(function(d) { return {start:d.start,end:d.end,chr:d.name};}));
    return new Command(this._server, 'alignmentStatsStream', {
      url,
      indexUrl: indexUrl ? indexUrl : "",
      regions: JSON.stringify(regions),
    });
  }


  // gene.iobio endpoints
  //
  streamVariantHeader(url, indexUrl) {
    return new Command(this._server, 'variantHeader', { 
      url,
      indexUrl: indexUrl ? indexUrl : "",
    });
  }

  streamVcfReadDepth(url) {
    return new Command(this._server, 'vcfReadDepth', { url });
  }

  streamAlignmentCoverage(url, indexUrl, samtoolsRegion, maxPoints, coverageRegions) {
    return new PostCommand(this._server, 'alignmentCoverage', {
      url,
      indexUrl: indexUrl ? indexUrl : "",
      samtoolsRegion,
      maxPoints,
      coverageRegions,
    });
  }

  streamGeneCoverage(url, indexUrl, refName, geneName, regionStart, regionEnd, regions) {
    return new Command(this._server, 'geneCoverage', {
      url,
      indexUrl: indexUrl ? indexUrl : "",
      refName,
      geneName,
      regionStart,
      regionEnd,
      regions: JSON.stringify(regions),
    });
  }

  streamNormalizeVariants(vcfUrl, tbiUrl, refName, regions, contigStr, refFastaFile) {
    return new Command(this._server, 'normalizeVariants', {
      vcfUrl,
      tbiUrl: tbiUrl ? tbiUrl: "",
      refName,
      regions: JSON.stringify(regions),
      contigStr: encodeURIComponent(contigStr),
      refFastaFile: encodeURIComponent(refFastaFile),
    });
  }

  streamAnnotateVariants(args) {
    return new Command(this._server, 'annotateVariants', Object.assign({},
      args, {
        refNames: JSON.stringify(args.refNames),
        regions: JSON.stringify(args.regions),
        vcfSampleNames: JSON.stringify(args.vcfSampleNames),
      }
    ));
  }


  // genepanel endpoints
  //
  async clinphen(args) {
    return fetchNoStream(this._server, 'clinphen', args);
  }
  streamClinphen(args) {
    return new Command(this._server, 'clinphen', args);
  }
}


async function fetchNoStream(server, endpoint, params) {
  const query = encodeURI(server + '/' + endpoint + encodeParams(params));
  const response = await fetch(query);
  if (response.ok) {
    return response.text();
  }
  else {
    throw new Error(`iobio API call failed with status code ${response.status}: '${query}'`);
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
    const query = encodeURI(this._server + '/' + this._endpoint + encodeParams(this._params));
    //console.log(query);
    this._stream = request(query);

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


class PostCommand extends EventEmitter {
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


function encodeParams(obj) {

  const keys = Object.keys(obj);

  const params = Object.keys(obj).map((key, i) => {
    let sep = '&';
    if (i === 0) {
      sep = '?';
    }

    // TODO: might need this
    //const value = encodeURIComponent(String(obj[key]));
    const value = String(obj[key]);

    return sep + key + '=' + value;
  });

  return params.join('');
}


export {
  Client,
};

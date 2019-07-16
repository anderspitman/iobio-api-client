import { request } from 'xhr-stream-dl';


class Api {

  constructor(server, options) {
    this.cmd = Command;
    const proto = options && options.secure ? 'https://' : 'http://';
    this._server = proto + server;
  }

  // bam.iobio endpoints
  //
  alignmentHeader(url) {
    return new Command(this._server, 'alignmentHeader', { url });
  }

  baiReadDepth(url) {
    return new Command(this._server, 'baiReadDepth', { url });
  }

  craiReadDepth(url) {
    return new Command(this._server, 'craiReadDepth', { url });
  }

  alignmentStatsStream(url, indexUrl, regions) {

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
  variantHeader(url) {
    return new Command(this._server, 'variantHeader', { url });
  }

  vcfReadDepth(url) {
    return new Command(this._server, 'vcfReadDepth', { url });
  }

  alignmentCoverage(url, indexUrl, samtoolsRegion, maxPoints, coverageRegions) {
    return new Command(this._server, 'alignmentCoverage', {
      url,
      indexUrl: indexUrl ? indexUrl : "",
      samtoolsRegion: JSON.stringify(samtoolsRegion),
      maxPoints,
      coverageRegions: JSON.stringify(coverageRegions),
    });
  }

  geneCoverage(url, indexUrl, refName, geneName, regionStart, regionEnd, regions) {
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

  normalizeVariants(vcfUrl, tbiUrl, refName, regions, contigStr, refFastaFile) {
    return new Command(this._server, 'normalizeVariants', {
      vcfUrl,
      tbiUrl: tbiUrl ? tbiUrl: "",
      refName,
      regions: JSON.stringify(regions),
      contigStr: encodeURIComponent(contigStr),
      refFastaFile: encodeURIComponent(refFastaFile),
    });
  }

  annotateVariants(args) {
    return new Command(this._server, 'annotateVariants', Object.assign({},
      args, {
        refNames: JSON.stringify(args.refNames),
        regions: JSON.stringify(args.regions),
        vcfSampleNames: JSON.stringify(args.vcfSampleNames),
      }
    ));
  }
}


class Command {
  constructor(server, endpoint, params) {

    this._server = server;
    this._endpoint = endpoint;
    this._params = params;

    this._callbacks = {
      'data': () => {},
      'end': () => {},
      'error': null,
      'queue': null,
      'exit': null,
    };
  }

  on(eventName, callback) {
    if (this._callbacks[eventName] !== undefined) {
      this._callbacks[eventName] = callback;
    }
    else {
      const valid = Object.keys(this._callbacks).join(', ');
      throw new Error(`Invalid event name "${eventName}". Valid options are [${valid}]`);
    }
  }

  off(eventName) {
    delete this._callbacks[eventName];
  }

  run() {
    const query = encodeURI(this._server + '/' + this._endpoint + encodeParams(this._params));
    //console.log(query);
    this._stream = request(query);

    this._stream.onData(this._callbacks['data']);
    this._stream.onEnd(this._callbacks['end']);
    this._stream.onError(this._callbacks['error']);
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
  Api,
};

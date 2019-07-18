import { Client } from 'iobio-api-client';
const api = new Client('localhost:9001');

//const regionStr = '[{"start":39697719,"end":39707719,"chr":"1"},{"start":173319070,"end":173329070,"chr":"1"},{"start":123891752,"end":123901752,"chr":"10"},{"start":49582354,"end":49592354,"chr":"11"},{"start":65243529,"end":65253529,"chr":"13"},{"start":91147450,"end":91157450,"chr":"13"},{"start":113709194,"end":113719194,"chr":"13"},{"start":80271641,"end":80281641,"chr":"16"},{"start":34443549,"end":34453549,"chr":"17"},{"start":23060934,"end":23070934,"chr":"19"},{"start":37767899,"end":37777899,"chr":"19"},{"start":201113125,"end":201123125,"chr":"2"},{"start":20160448,"end":20170448,"chr":"20"},{"start":38696603,"end":38706603,"chr":"22"},{"start":3484376,"end":3494376,"chr":"3"},{"start":95856565,"end":95866565,"chr":"4"},{"start":25191924,"end":25201924,"chr":"7"},{"start":73141151,"end":73151151,"chr":"7"},{"start":77315453,"end":77325453,"chr":"7"},{"start":58404660,"end":58414660,"chr":"8"}]';
//
//const regions = JSON.parse(regionStr);

//const cmd = api.getAlignmentHeader("https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam");
//const cmd = api.getBaiReadDepth("https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam.bai");
//const cmd = api.craiReadDepth("https://fbrg.xyz/6y44-72sg/16-243-140846.cram.crai");
//const cmd = api.alignmentStatsStream("https://fbrg.xyz/6y44-72sg/16-243-140846.cram", regionStr);
const cmd = api.streamClinphen({ notes: "The child has short stature and long eyelashes. She has a cleft palate and a small jaw"});
//
cmd.on('data', (data) => {
  console.log(data);
});

cmd.on('end', () => {
  console.log("done");
});

cmd.on('error', (e) => {
  console.error(e);
});

cmd.run();


(async () => {

  const response = await api.clinphen({ notes: "The child has short stature and long eyelashes. She has a cleft palate and a small jaw"});
  console.log(response);

})();


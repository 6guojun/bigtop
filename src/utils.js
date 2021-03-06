import * as R from 'ramda';
import {scaleLinear} from 'd3-scale';
import {max, extent} from 'd3-array';

export const createChromosomeScale = function(chroms, sizes) {
  let index = -1;
  let chromosomeLengths = R.zipWith(function(a, b) {
    index++;
    return {chrom: a, size: b, index: index};
  })(chroms, sizes);

  let cumSum = 0;
  chromosomeLengths = R.map(function(d) {
    d.start = cumSum;
    cumSum += d.size;
    d.end = cumSum;
    return d;
  }, chromosomeLengths);

  chromosomeLengths = R.map(function(d) {
    d.scaledStart = d.start / cumSum;
    d.scaledEnd = d.end / cumSum;
    return d;
  }, chromosomeLengths);

  return R.zipObj(R.pluck("chrom", chromosomeLengths), chromosomeLengths);
};

export const scaleByChromPos = function(dict, chrom, pos) {
  if (dict && dict[chrom] && dict[chrom].chrom === chrom) {
    if (pos >= 0 && pos <= dict[chrom].size) {
      let seg = dict[chrom];
      return ((pos / seg.size) * (seg.scaledEnd - seg.scaledStart)) + seg.scaledStart;
    } else {
      console.error(`invalid pos = ${pos}, should be between 0 and ${dict[chrom].size}`);
    }
  } else {
    console.error(`no chrom ${chrom} found in dict:`, dict);
  }
}


// object of arrays --> array of objects
// {x: [1,2,3], y: [4,5,6]} --> [{x:1, y:4}, {x:2, y:5}, {x:3, y:6}]
export const gather = function(obj) {

  // Find lengths of arrays and make sure they are all the same:
  let lengths = R.compose(R.uniq, R.map(R.length), R.values)(obj);
  if (lengths.length !== 1) {
    throw new Error("gather requires same length array within each key, but lengths are not matching.");
  }
  let len = lengths[0];

  return R.map(function(i) {
    return R.map(val => val[i], obj);
  })(R.range(0, len));
};


export const polarToCartesian = function(r, theta) {
  return {
    x: r * Math.cos(theta - (Math.PI / 2)),
    z: r * Math.sin(theta - (Math.PI / 2))
  };
}

export const degreesToRadians = function(degrees) {
  return degrees * (Math.PI / 180);
}

export const radiansToDegrees = function(degrees) {
  return degrees * (180 / Math.PI);
}

export const calculateCoordinates = function(data, chromDict, roomRadius, roomHeight, pCutoff) {
  // OPTIONS:
  const yRange = [0, roomHeight];
  const optionalCeilingP = undefined; // 20
  const innerRadius = roomRadius * 0.1;
  const yTransform = y => -1 * Math.log10(y);

  const keys = {r: "frequency", y: "p", chrom: "chr", pos: "location"};

  // rScale determines how far away from center a point is
  let rScale = scaleLinear()
    .domain(extent(data, d => d[keys.r]))
    .range([innerRadius, roomRadius]);

  const dataMaxP = max(data, d => yTransform(d[keys.y]));
  const maxP = optionalCeilingP || dataMaxP * 1.05;

  const floorDistance = 0; // Distance from 0 to floor, lowers points by this amount
  let yScale = scaleLinear()
    .domain([floorDistance - Math.log10(pCutoff), maxP + floorDistance])
    .range(yRange);

  let thetaScale = scaleLinear()
    .domain([0, max(R.values(chromDict), d => d.end)])
    .range([0, 2 * Math.PI])

  const calculateCoordinatesInner = function(d) {
    let r = rScale(d[keys.r]);
    // let transformedY = yTransform(d[keys.y]); // use this if we ever need the transformed p-values
    let y = yScale(yTransform(d[keys.y]));
    let c = chromDict[d[keys.chrom]];
    if (!c)
      return null;

    let chromPos = c.start + d[keys.pos];
    let theta = thetaScale(chromPos);
    let {x, z} = polarToCartesian(r, theta);
    return {...d, theta: theta, radius: r, coords: [x, y, z]};
  }

  let coordinates = R.filter(R.identity, R.map(calculateCoordinatesInner, data));

  let yScaleDomain = yScale.domain();
  let radiusScaleInfo = {domain: rScale.domain(), range: rScale.range()};
  return {coordinates, yScaleDomain, radiusScaleInfo};
};

export const shadeColor = (color, percent) => {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF; // eslint-disable-line no-mixed-operators
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}


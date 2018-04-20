import React from 'react';
import {View} from 'react-vr';
import {map, zip, apply, add, multiply, filter, identity} from 'ramda';
import Point from '../../atoms/Point';

const scale = (scale, coords) => map(apply(multiply), zip(scale, coords));
const translate = (trans, coords) => map(apply(add), zip(trans, coords));

export default class PointCloud extends React.Component {
  render() {
    let {threshold} = this.props;

    let points = filter(identity, map((point) => {
      let adjustedCoords = translate(this.props.translationFactor, scale(this.props.scaleFactor, point.coords));
      if (point.p < threshold)
        return <Point cartesianCoords={adjustedCoords} key={point.id} id={point.id} />
    }, this.props.points));

    return (
      <View>
        {points}
      </View>
    )
  }
}

import 'aframe';
import 'aframe-particle-system-component';
import {Entity} from 'aframe-react';
import React, {Component} from 'react';

class CylindricalPanel extends Component {
  render() {

  const {
    start,
    length,
    radius,
    height,
    color
  } = this.props;
  console.log('start:', start);

  return (
    <Entity
      geometry={{
        primitive: 'cylinder',
        thetaStart: start,
        thetaLength: length,
        radius: radius,
        height: height
      }}
      material={{color: color, side: "double"}}
      position={{x: 0, y: 0, z: 0}}
      />
  );
  }
}

export default CylindricalPanel;

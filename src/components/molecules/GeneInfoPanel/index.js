import 'aframe';
import {Entity} from 'aframe-react';
import React, {Component} from 'react';
import {format as d3Format} from 'd3-format';
import InfoPanel from '../InfoPanel';

require('aframe-look-at-component');

class GeneInfoPanel extends Component {
  render() {
    const {data} = this.props;
    const {id, gene, p, frequency, chr, location} = data;

    return <InfoPanel position={this.props.position} scale={this.props.scale} rotation={this.props.rotation} look-at="[camera]">
      <Entity
        text={{
          font: "fonts/Roboto-msdf.json",
          value: `${id}\n${gene}\n\n\n\n`, // Extra CRs to force space in the panel for the following text
          align: 'center',
          color: 'white',
          width: 1
        }}
      />
      <Entity position={{x: 0, y: -.01, z: 0}} scale="0.7 0.7 0.7">
        <Entity position={{x: 0.25}}>
          <Entity
            text={{
              font: "fonts/Roboto-msdf.json",
              value: 'p:',
              color: 'rgb(128, 128, 128)'
            }}
          />
          <Entity
            text={{
              font: "fonts/Roboto-msdf.json",
              value: p.toExponential(4),
              color: 'white',
            }}
            position={{x: 0.037}}
          />
        </Entity>
        <Entity position={{x: -0.25}}>
          <Entity
            text={{
              font: "fonts/Roboto-msdf.json",
              value: '%',
              color: 'rgb(128, 128, 128)',
              align: 'right'
            }}
            position={{x: 0, y: 0, z: 0}}
          />
          <Entity
            text={{
              font: "fonts/Roboto-msdf.json",
              value: d3Format('.1f')(frequency * 100),
              color: 'white',
              align: 'right'
            }}
            position={{x: -0.035, y: 0, z: 0}}
          />
        </Entity>
      </Entity>
      <Entity
        text={{
          font: "fonts/Roboto-msdf.json",
          value: `${chr}:${d3Format(`,.${location.toString().length}r`)(location)}`,
          color: 'white',
          align: 'center'
        }}
        position={{y: -0.08}}
      />
    </InfoPanel>;
  }
}

export default GeneInfoPanel;

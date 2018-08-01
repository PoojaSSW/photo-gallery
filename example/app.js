import React from 'react';
import ReactDOM from 'react-dom';

import ImageGallery from '../src/ImageGallery';


const PREFIX_URL = 'https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      showIndex: false,
      infinite: true,
      slideDuration: 450
    };

    this.images = [
      {
        original: `${PREFIX_URL}3.jpg`,
        description: 'CRATER LAKE'
      },
      {
        original: `${PREFIX_URL}5.jpg`,

        description: 'NAPA VALLEY'
      },
      {
        original: `${PREFIX_URL}9.jpg`,
        description: 'DENALI'
      },
      {
        original: `${PREFIX_URL}10.jpg`,
        description: 'MUIR WOODS'
      },
      {
        original: `${PREFIX_URL}12.jpg`,
        description: 'ALASKA'
      },
    ];
  }

  onImageClick(event) {
    window.open(event.target.currentSrc, '_blank');
    // console.log('clicked on image', event.target, 'at index', this._imageGallery.getCurrentIndex());
  }

  onImageLoad(event) {
    console.debug('loaded image', event.target.src);
  }

  render() {
    return (

      <section className='app'>
        <ImageGallery
          ref={i => this._imageGallery = i}
          items={this.images}
          onClick={this.onImageClick}
          onImageLoad={this.onImageLoad}
          showIndex={this.state.showIndex}

        />

      </section>
    );
  }

}

ReactDOM.render(<App/>, document.getElementById('container'));

import React from 'react';
import Swipeable from 'react-swipeable';
import PropTypes from 'prop-types';

export default class ImageGallery extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        currentIndex: props.startIndex,
        offsetPercentage: 0
      };
    }
    static propTypes = {
      items: PropTypes.array.isRequired,
      infinite: PropTypes.bool,
      showIndex: PropTypes.bool,
      startIndex: PropTypes.number,
      onClick: PropTypes.func,
      onImageLoad: PropTypes.func,
      onImageError: PropTypes.func,
      renderLeftNav: PropTypes.func,
      renderRightNav: PropTypes.func,
      renderItem: PropTypes.func
    };

    static defaultProps = {
      items: [],
      infinite: true,
      showIndex: false,
      stopPropagation: false,
      startIndex: 0,
      slideDuration: 450,
      renderLeftNav: (onClick) => {
        return (
          <button
            type='button'
            className='image-gallery-left-nav'

            onClick={onClick}
            aria-label='Previous Slide'
          />
        );
      },
      renderRightNav: (onClick) => {
        return (
          <button
            type='button'
            className='image-gallery-right-nav'

            onClick={onClick}
            aria-label='Next Slide'
          />
        );
      },

    };
    componentWillReceiveProps(nextProps) {

      if (this.state.currentIndex >= nextProps.items.length) {
        this.slideToIndex(0);
      }
    }
    getCurrentIndex() {
      return this.state.currentIndex;
    }

    slideToIndex = (index) => {
      const {currentIndex, isTransitioning} = this.state;

      if (!isTransitioning) {
        let slideCount = this.props.items.length - 1;
        let nextIndex = index;
        if (index < 0) {
          nextIndex = slideCount;
        } else if (index > slideCount) {
          nextIndex = 0;
        }
        this.setState({
          previousIndex: currentIndex,
          currentIndex: nextIndex,
          isTransitioning: nextIndex !== currentIndex,
          offsetPercentage: 0,
          style: {
            transition: `all ${this.props.slideDuration}ms ease-out`
          }
        }, this._onSliding);
      }
    };
    _onSliding = () => {
      const { isTransitioning } = this.state;
      this._transitionTimer = window.setTimeout(() => {
        if (isTransitioning) {
          this.setState({isTransitioning: !isTransitioning});
        }
      }, this.props.slideDuration + 50);
    };

    _canSlideLeft() {
      return this.props.infinite || this.state.currentIndex > 0;
    }

    _canSlideRight() {
      return this.props.infinite ||
        this.state.currentIndex < this.props.items.length - 1;
    }

    _getAlignmentClassName(index) {
      // LEFT, and RIGHT alignments are necessary for lazyLoad
      let {currentIndex} = this.state;
      let alignment = '';
      const LEFT = 'left';
      const CENTER = 'center';
      const RIGHT = 'right';

      switch (index) {
        case (currentIndex - 1):
          alignment = ` ${LEFT}`;
          break;
        case (currentIndex):
          alignment = ` ${CENTER}`;
          break;
        case (currentIndex + 1):
          alignment = ` ${RIGHT}`;
          break;
      }

      if (this.props.items.length >= 3 && this.props.infinite) {
        if (index === 0 && currentIndex === this.props.items.length - 1) {
          // set first slide as right slide if were sliding right from last slide
          alignment = ` ${RIGHT}`;
        } else if (index === this.props.items.length - 1 && currentIndex === 0) {
          // set last slide as left slide if were sliding left from first slide
          alignment = ` ${LEFT}`;
        }
      }

      return alignment;
    }



    _shouldPushSlideOnInfiniteMode(index) {
      return !this._slideIsTransitioning(index);
    }

    _slideIsTransitioning(index) {
      const { isTransitioning, previousIndex, currentIndex } = this.state;
      const indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
      return isTransitioning && indexIsNotPreviousOrNextSlide;
    }

    _getSlideStyle(index) {
      const { currentIndex, offsetPercentage } = this.state;
      const { infinite, items } = this.props;
      const baseTranslateX = -100 * currentIndex;
      const totalSlides = items.length - 1;

      let translateX = baseTranslateX + (index * 100) + offsetPercentage;

      if (infinite && items.length > 2) {
        if (currentIndex === 0 && index === totalSlides) {
          translateX = -100 + offsetPercentage;
        } else if (currentIndex === totalSlides && index === 0) {
          translateX = 100 + offsetPercentage;
        }
      }

      let translate = `translate(${translateX}%, 0)`;

      return {
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        transform: translate,
      };
    }

    _slideLeft = (event) => {
      this.slideToIndex(this.state.currentIndex - 1, event);
    };

    _slideRight = (event) => {
      this.slideToIndex(this.state.currentIndex + 1, event);
    };

    _renderItem = (item) => {
      const onImageError = this.props.onImageError || this._handleImageError;

      return (
        <div className='image-gallery-image'>
          {
              <img
                src={item.original}
                alt={item.originalAlt}
                srcSet={item.srcSet}
                sizes={item.sizes}
                title={item.originalTitle}
                onLoad={this.props.onImageLoad}
                onError={onImageError}
              />
          }

          {
            item.description &&
              <span className='image-gallery-description'>
                {item.description}
              </span>
          }
        </div>
      );
    };

    render() {
      const slideLeft = this._slideLeft;
      const slideRight = this._slideRight;
      let slides = [];
      this.props.items.forEach((item, index) => {
        const alignment = this._getAlignmentClassName(index);

        const renderItem = item.renderItem ||
          this.props.renderItem || this._renderItem;

        let slideStyle = this._getSlideStyle(index);

        const slide = (
          <div
            key={index}
            className={'image-gallery-slide' + alignment}
            style={Object.assign(slideStyle, this.state.style)}
            onClick={this.props.onClick}>
              {renderItem(item)}
          </div>
        );

        if (this.props.infinite) {
          if (this._shouldPushSlideOnInfiniteMode(index)) {
            slides.push(slide);
          }
        } else {
          slides.push(slide);
        }

      });

      const slideWrapper = (
        <div className={`image-gallery-slide-wrapper`}>
          {[<span key='navigation'>
              {this.props.renderLeftNav(slideLeft, !this._canSlideLeft())}
              {this.props.renderRightNav(slideRight, !this._canSlideRight())}
            </span>,

            <Swipeable
              className='image-gallery-swipe'
              key='swipeable'
              stopPropagation={this.props.stopPropagation}>
              <div className='image-gallery-slides'>
                {slides}
              </div>
          </Swipeable>]}

        </div>
      );
      return (
        <div className="image-gallery">
          <div className="image-gallery-content">{slideWrapper}</div>
        </div>
      );
    }

  }

import 'swiper/css';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules'

import Arrow from '@/@static/images/arrow.svg'
import '../styles/interval-slider.scss'

import { data, IntervalSliders } from '@/shared/data/history-dates';
import { Spinner } from '@/features/Spinner';
import { getWindowDimensions } from '@/shared/model';
import { useCallback, useEffect, useRef, useState } from 'react';

interface IntervalSliderProps {}
 
const IntervalSlider: React.FunctionComponent<IntervalSliderProps> = () => {
  const [sliders, setSliders] = useState<IntervalSliders>(data);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalStart, setIntervalStart] = useState(sliders[currentIndex].interval.start);
  const [intervalEnd, setIntervalEnd] = useState(sliders[currentIndex].interval.end);
  const [activeSlides, setActiveSlides] = useState(sliders[currentIndex].slides);
  const [sliderTitle, setSliderTitle] = useState(sliders[currentIndex].name);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewport, setViewport] = useState(getWindowDimensions());

  const sliderRef = useRef<SwiperRef | null>(null);

  const handleResize = useCallback(() => {
      setViewport(getWindowDimensions());
  }, []);

  const changeIntervalIndex = (direction: number) => {
      const newIndex = currentIndex + direction;
      if (newIndex >= 0 && newIndex < sliders.length) {
          setCurrentIndex(newIndex);
      }
  };

  useEffect(() => {
      const updateIntervals = () => {
          const { start, end } = sliders[currentIndex].interval;
          let startTemp = intervalStart;
          let endTemp = intervalEnd;

          const updateStart = setInterval(() => {
              if (startTemp !== start) {
                  setIntervalStart(startTemp < start ? ++startTemp : --startTemp);
              } else {
                  clearInterval(updateStart);
              }
          }, 50);

          const updateEnd = setInterval(() => {
              if (endTemp !== end) {
                  setIntervalEnd(endTemp < end ? ++endTemp : --endTemp);
              } else {
                  clearInterval(updateEnd);
              }
          }, 50);
      };

      updateIntervals();

      const timer = setTimeout(() => {
          setActiveSlides(sliders[currentIndex].slides);
          setSliderTitle(sliders[currentIndex].name);
          sliderRef.current?.swiper.slideTo(0);
      }, 100);

      return () => clearTimeout(timer);
  }, [currentIndex, sliders, intervalStart, intervalEnd]);

  useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => {
          window.removeEventListener('resize', handleResize);
      };
  }, [handleResize]);

  const renderSlider = (
      <div className={`interval-slider_slider ${isAnimating ? '--hidden' : ''}`}>
          {viewport.width <= 768 && <div className="interval-slider_slider--title">{sliderTitle}</div>}
          <div className="interval-slider_slider__container">
              <Swiper
                  ref={sliderRef}
                  slidesPerView={3}
                  spaceBetween={80}
                  breakpoints={{
                      0: { slidesPerView: 2, spaceBetween: 20 },
                      768: { slidesPerView: 3 },
                  }}
                  grabCursor={viewport.width > 768}
                  freeMode={viewport.width <= 768}
                  navigation={{
                      prevEl: '.interval-slider_slider__arrow.--prev',
                      nextEl: '.interval-slider_slider__arrow.--next',
                  }}
                  pagination={{
                      el: '.interval-slider_pagination',
                      type: 'bullets',
                      clickable: true,
                  }}
                  modules={[Navigation, Pagination]}
              >
                  {activeSlides.map((slide, index) => (
                      <SwiperSlide key={`slide-${index}`} className="interval-slider_slider__slide">
                          <div className="interval-slider_slider__slide--title">{slide.name}</div>
                          <div className="interval-slider_slider__slide--text">{slide.description}</div>
                      </SwiperSlide>
                  ))}
              </Swiper>
              <div className="interval-slider_slider__arrow --prev">
                  <Arrow />
              </div>
              <div className="interval-slider_slider__arrow --next">
                  <Arrow />
              </div>
          </div>
      </div>
  );

  return (
      <div className="interval-slider">
          <div className="interval-slider__content">
              <div className="interval-slider__title">
                  <div className="interval-slider__title--text">Исторические<br />даты</div>
              </div>

              <div className="interval-slider_wrapper">
                  <Spinner
                      sliders={sliders}
                      setIntervalIndex={setCurrentIndex}
                      intervalIndex={currentIndex}
                      setSliderInAnim={setIsAnimating}
                      intervalStart={intervalStart}
                      intervalEnd={intervalEnd}
                  />
                  {viewport.width <= 768 && renderSlider}
              </div>

              <div className="interval-slider_navigation">
                  <div className="interval-slider_navigation__wrapper">
                      <div className="interval-slider_navigation__progress">
                          {String(currentIndex + 1).padStart(2, '0')}/{String(sliders.length).padStart(2, '0')}
                      </div>
                      <div className="interval-slider_navigation__controls">
                          <div
                              className={`interval-slider_navigation__controls--arrow --prev ${currentIndex === 0 ? '--disabled' : ''}`}
                              onClick={() => changeIntervalIndex(-1)}
                          >
                              <Arrow />
                          </div>
                          <div
                              className={`interval-slider_navigation__controls--arrow --next ${currentIndex === sliders.length - 1 ? '--disabled' : ''}`}
                              onClick={() => changeIntervalIndex(1)}
                          >
                              <Arrow />
                          </div>
                      </div>
                  </div>
                  <div className="interval-slider_pagination"></div>
              </div>

              {viewport.width > 768 && renderSlider}
          </div>
      </div>
  );
};
 
export default IntervalSlider;
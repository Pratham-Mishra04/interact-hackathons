import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { NextButton, PrevButton, usePrevNextButtons } from '@/components/carousel/arrow-buttons';
import { HackathonPrize } from '@/types';
import Image from 'next/image';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { BorderBeam } from '../ui/border-beam';

const TWEEN_SCALE_FACTOR_BASE = 0.25;
const TWEEN_OPACITY_FACTOR_BASE = 0.4;

const numberWithinRange = (number: number, min: number, max: number): number => Math.min(Math.max(number, min), max);

export type PrizeCarouselProps = {
  prizes: HackathonPrize[];
  options?: EmblaOptionsType;
  currentPrize: HackathonPrize;
  setCurrentPrize: React.Dispatch<React.SetStateAction<HackathonPrize>>;
};

const PrizesCarousel: React.FC<PrizeCarouselProps> = props => {
  const { prizes, options, setCurrentPrize, currentPrize } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const tweenScaleFactor = useRef(0);
  const tweenOpacityFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const [inFrameIndex, setInFrameIndex] = useState(0);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map(slideNode => {
      return slideNode.querySelector('.embla__slide__number') as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenScaleFactor.current = TWEEN_SCALE_FACTOR_BASE * emblaApi.scrollSnapList().length;
    tweenOpacityFactor.current = TWEEN_OPACITY_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScaleAndOpacity = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach(slideIndex => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach(loopItem => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenScaleValue = 1 - Math.abs(diffToTarget * tweenScaleFactor.current);
          const scale = numberWithinRange(tweenScaleValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          if (tweenNode) tweenNode.style.transform = `scale(${scale})`;

          const tweenOpacityValue = 1 - Math.abs(diffToTarget * tweenOpacityFactor.current);
          const opacity = numberWithinRange(tweenOpacityValue, 0, 1).toString();
          emblaApi.slideNodes()[slideIndex].style.opacity = opacity;

          if (prizes?.length > 2 && Number(opacity) + 0.001 > 1) {
            setCurrentPrize(prizes[slideIndex]);
          }
        });
      });
    },
    [prizes]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const handleInit = () => {
      setTweenNodes(emblaApi);
      setTweenFactor(emblaApi);
      tweenScaleAndOpacity(emblaApi);
    };

    emblaApi.on('reInit', handleInit);
    emblaApi.on('init', handleInit);
    emblaApi.on('scroll', tweenScaleAndOpacity);
    emblaApi.on('slideFocus', tweenScaleAndOpacity);

    return () => {
      emblaApi.off('reInit', handleInit);
      emblaApi.off('init', handleInit);
      emblaApi.off('scroll', tweenScaleAndOpacity);
      emblaApi.off('slideFocus', tweenScaleAndOpacity);
    };
  }, [emblaApi, tweenScaleAndOpacity]);

  useEffect(() => {
    if (!emblaApi) return;
    const slides = emblaApi.slideNodes();
    // a reflow (forcing the layout) to ensure the animation and effects are applied after the DOM elements are rendered.
    // because the state or layout hasn’t been fully calculated on the first render
    slides.forEach(slide => {
      slide.offsetHeight;
    });

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScaleAndOpacity(emblaApi);
  }, [emblaApi]);

  useEffect(() => {
    if (prizes?.length > 0) {
      setCurrentPrize(prizes[0]);
    }
  }, [setCurrentPrize]);

  return (
    <div className="embla w-full relative">
      <div className="embla__viewport px-20" ref={emblaRef}>
        <div className="embla__container items-center">
          {prizes.map((prizeCard, index) => (
            <div key={prizeCard.id} className={'embla__slide flex justify-center'}>
              <Prize
                // index={index}
                prize={prizeCard}
                isCurrent={prizeCard.id === currentPrize.id}
                setCurrentPrize={setCurrentPrize}
                // setInFrameIndex={setInFrameIndex}
              />
            </div>
          ))}
        </div>
      </div>
      {prizes.length > 2 && (
        <div className="embla__controls">
          <div className="embla__buttons">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
              className={'bg-white rounded-full absolute left-5 top-1/2 size-8 flex justify-center items-center'}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
              className={'bg-white rounded-full absolute right-5 top-1/2 size-8 flex justify-center items-center'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export interface PrizeCardProps {
  // index: number;
  prize: HackathonPrize;
  isCurrent: boolean;
  setCurrentPrize: React.Dispatch<React.SetStateAction<HackathonPrize>>;
  // setInFrameIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const Prize = ({
  // index,
  prize,
  isCurrent,
  setCurrentPrize,
}: // setInFrameIndex
PrizeCardProps) => {
  return (
    <div
      onClick={() => {
        setCurrentPrize(prize);
        // setInFrameIndex(index);
      }}
      className={`w-96 max-md:w-64 h-52 max-md:h-40 rounded-lg prize-card-bg relative flex justify-center items-center text-white embla__slide__number ${
        !prize.team && 'prize-card-bg'
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-full bg-white ${!isCurrent ? 'opacity-50' : 'opacity-0'} transition-ease-300`} />
      {prize.team && (
        <Image
          crossOrigin="anonymous"
          className={`absolute top-0 left-0 w-full h-full object-cover rounded-lg -z-10 animate-fade_half`}
          src={getProjectPicURL(prize.team?.project)}
          alt="Project Cover"
          width={430}
          height={270}
          placeholder="blur"
          blurDataURL={getProjectPicHash(prize.team?.project)}
        />
      )}
      {isCurrent && <BorderBeam />}
      {prize.hackathonTrackID && (
        <div className={'absolute px-2 py-1 top-2 left-2 text-white bg-primary_black text-xs rounded-full w-fit'}>{prize.track?.title}</div>
      )}
      <div className={'flex flex-col'}>
        <p className={'text-2xl max-md:text-lg font-primary text-center font-semibold'}>{prize.title}</p>
        {prize.team?.title ? (
          <p className={'text-base font-primary font-light text-center max-md:text-xs'}>Team - {prize.team?.title}</p>
        ) : (
          isCurrent && <p className={'text-xs font-primary font-light text-center max-md:px-2'}>Select team to declare winner</p>
        )}
      </div>
    </div>
  );
};

export default PrizesCarousel;

import * as topojson from 'topojson-client';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { scaleLinear } from 'd3-scale';
import { GeoProjection, geoAlbersUsa, geoPath, geoDistance } from 'd3-geo';
import { select } from 'd3-selection';
import Sprite, { type Artboard, type SpriteOptions } from './Sprite';
import { TWO_PI } from '../util/canvas';
import { type Location } from '../store/data';

type CanvasName = 'map' | 'datums' | 'cursor';
type Canvases = Record<CanvasName, HTMLCanvasElement>;
type SpriteName = 'map' | 'datum';
type ColorValueHex = `#${string}`;
type ScaleName = 'viewport' | 'size' | 'feature' | 'capita';
type Scales = Record<ScaleName, any>;

interface MapConfig {
  canvases: Canvases;
  locations: Location[];
  getCountyValuesByFips: Function;
  datasetIndex: number;
  onMouseMove: Function;
  hideToolTip: Function;
  perCapita: boolean;
  fipsData: any[];
  usa: any;
}

interface MapState {
  transform: typeof zoomIdentity;
  mouse: [number, number];
  cursorDatum: Location | null;
  datasetIndex: number;
  perCapita: boolean;
}

const COLORS: Record<string, ColorValueHex> = {
  background: `#0F0611`,
  countyFill: '#1B0B1C',
  countyStroke: '#996699',
  stateStroke: '#996699',
  nationStroke: '#996699',
  pointColor: '#E80040',
  pointShadow: '#0F0611',
};

const POINT_SIZE = 80;

export default class Map {
  public sprites: Record<SpriteName, Sprite>;
  public ctx: Record<CanvasName, CanvasRenderingContext2D>;
  public projection: GeoProjection;
  public scales: Scales;
  public state: MapState;
  public locations: Location[];
  public totalLocations: number;
  public zoom;
  public coords: ([number, number] | null)[];
  public transformedCoords: ([number, number] | null)[];
  public getCountyValuesByFips: Function;
  public raf: number;
  public onMouseMove: Function;
  public hideToolTip: Function;
  public fipsData: any[];
  public usa: any;

  constructor({
    canvases,
    locations,
    getCountyValuesByFips,
    datasetIndex,
    onMouseMove,
    hideToolTip,
    perCapita,
    fipsData,
    usa,
  }: MapConfig) {
    this.locations = locations;
    this.totalLocations = locations.length;
    this.getCountyValuesByFips = getCountyValuesByFips;
    this.onMouseMove = onMouseMove;
    this.hideToolTip = hideToolTip;
    this.fipsData = fipsData;
    this.usa = usa;

    this.raf = 0;

    this.state = {
      transform: zoomIdentity,
      mouse: [0, 0],
      cursorDatum: null,
      datasetIndex,
      perCapita,
    };

    this.ctx = (Object.keys(canvases) as CanvasName[]).reduce(
      (acc, key: CanvasName) => {
        const ctx: CanvasRenderingContext2D | null =
          canvases[key].getContext('2d');

        if (ctx) {
          const dpr = window.devicePixelRatio;

          ctx.resetTransform();
          ctx.scale(dpr, dpr);

          acc[key] = ctx;
        }

        return acc;
      },
      {} as Record<CanvasName, CanvasRenderingContext2D>
    );

    this.projection = this.buildProjection();
    this.scales = this.buildScales();
    this.sprites = this.buildSprites();
    this.zoom = this.initZoom();
    this.coords = this.calculateDatumCoordinates();
    this.transformedCoords = this.transformDatumCoordinates();

    this.initMouse();

    this.paint = this.paint.bind(this);

    this.raf = requestAnimationFrame(this.paint);
  }

  get size() {
    const dpr = window.devicePixelRatio;
    return [
      this.ctx.map.canvas.width / dpr,
      this.ctx.map.canvas.height / dpr,
      dpr,
    ];
  }

  buildProjection(): GeoProjection {
    const [width, height] = this.size;
    this.state.transform = zoomIdentity;

    return geoAlbersUsa().fitExtent(
      [
        [20, 50],
        [width - 20, height - 50],
      ],
      topojson.feature(this.usa as any, this.usa.objects.nation as any)
    );
  }

  calculateDatumCoordinates(): ([number, number] | null)[] {
    let i = 0;

    const coordinates = [];

    for (; i < this.totalLocations; i++) {
      const coords = this.projection([
        this.locations[i].lon,
        this.locations[i].lat,
      ]);

      coordinates.push(coords);
    }

    return coordinates;
  }

  transformDatumCoordinates(): ([number, number] | null)[] {
    let i = 0;

    const coordinates = [];

    for (; i < this.totalLocations; i++) {
      if (this.coords[i] === null) {
        coordinates.push(null);
      } else {
        const coords = this.state.transform.apply(
          this.coords[i] as [number, number]
        );
        coordinates.push(coords);
      }
    }

    return coordinates;
  }

  buildScales(): Scales {
    const viewport = scaleLinear([0, 1920], [0.6, 1]);
    const scale = viewport(this.size[0]);

    const size = scaleLinear(
      [1, 100, 1000, 10000],
      [1 * scale, 3 * scale, 10 * scale, 30 * scale]
    );
    const capita = scaleLinear(
      [0, 0.1, 1],
      [1 * scale, 1.5 * scale, 18 * scale]
    );
    const feature = scaleLinear([0, 1920], [0, 5]);

    return {
      viewport,
      size,
      feature,
      capita,
    };
  }

  buildSprites(): Record<SpriteName, Sprite> {
    const [width, height] = this.size;

    const {
      projection,
      scales: { feature },
      usa,
    } = this;

    this.sprites?.map?.destroy();
    this.sprites?.datum?.destroy();

    const map: SpriteOptions = {
      width: width * 2,
      height: height * 2,
      paint({ ctx }: Artboard) {
        ctx.scale(2, 2);
        ctx.lineWidth = feature(width) / 10;
        ctx.fillStyle = COLORS.countyFill;
        ctx.strokeStyle = COLORS.countyStroke;
        ctx.beginPath();
        const path = geoPath(projection, ctx);
        path(topojson.feature(usa as any, usa.objects.counties as any));
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = feature(width) / 3;
        ctx.strokeStyle = COLORS.stateStroke;
        ctx.beginPath();
        path(topojson.mesh(usa as any, usa.objects.states as any));
        ctx.stroke();
        ctx.lineWidth = feature(width) / 3;
        ctx.strokeStyle = COLORS.nationStroke;
        ctx.beginPath();
        path(topojson.mesh(usa as any, usa.objects.nation as any));
        ctx.stroke();
      },
    };

    const datum: SpriteOptions = {
      width: POINT_SIZE,
      height: POINT_SIZE,
      paint({ ctx }: Artboard) {
        ctx.strokeStyle = COLORS.pointColor;
        ctx.fillStyle = COLORS.pointColor;
        ctx.shadowBlur = POINT_SIZE / 2;
        ctx.shadowColor = COLORS.pointShadow;
        ctx.lineWidth = POINT_SIZE / 30;
        ctx.beginPath();
        ctx.arc(POINT_SIZE / 2, POINT_SIZE / 2, POINT_SIZE / 4, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
      },
    };

    return {
      map: new Sprite(map),
      datum: new Sprite(datum),
    };
  }

  initZoom(): ZoomBehavior<Element, unknown> {
    const [width, height] = this.size;
    const canvas = select('canvas.cursor');

    this.zoom?.transform?.(canvas as any, zoomIdentity);
    this.zoom?.on?.('zoom', null);

    canvas.on('zoom', null);

    const _zoom = zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ]);

    _zoom.on('zoom', ({ transform }) => {
      const [width, height] = this.size;
      this.state.transform = transform;
      this.transformedCoords = this.transformDatumCoordinates();
      this.ctx.cursor.clearRect(0, 0, width, height);
      this.hideToolTip();
      this.paint();
    });

    _zoom.filter(function (e) {
      if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
        return e.touches.length > 1;
      }

      return true;
    });

    _zoom.touchable();

    canvas.call(_zoom as any);

    return _zoom;
  }

  resetZoom(): void {
    const [width, height] = this.size;
    this.zoom.scaleExtent([1, 8]);
    this.zoom.translateExtent([
      [0, 0],
      [width, height],
    ]);
    const canvas = select('canvas.cursor') as any;
    this.zoom.transform(canvas, zoomIdentity);
  }

  initMouse() {
    if ('ontouchstart' in window) return this.initMouseMove('touchmove');
    return this.initMouseMove('mousemove');
  }

  initMouseMove(event: string) {
    select('canvas.cursor').on(event, (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.state.mouse = [e.pageX, e.pageY];

      const coords = this.projection?.invert?.(
        this.state.transform.invert(this.state.mouse)
      );

      if (!coords) return;

      let i = 0;
      let match = null;
      let closest = null;

      for (; i < this.totalLocations; i++) {
        const location = this.locations?.[i];

        if (location.lat && location.lon) {
          const distance = geoDistance(coords, [
            this.locations?.[i]?.lon,
            this.locations?.[i]?.lat,
          ]);

          if (
            typeof distance === 'number' &&
            (closest === null || distance < closest)
          ) {
            closest = distance;
            match = this.locations?.[i];
          }
        }
      }

      this.state.cursorDatum = match;

      this.paintCursor();

      this.onMouseMove({
        coords: this.state.mouse,
        datum:
          match === null
            ? null
            : {
                ...match,
                values: this.getCountyValuesByFips(match.fips),
              },
      });
    });
  }

  resize() {
    const dpr = this.size[2];

    this.ctx.map.resetTransform();
    this.ctx.map.scale(dpr, dpr);

    this.ctx.datums.resetTransform();
    this.ctx.datums.scale(dpr, dpr);

    this.ctx.cursor.resetTransform();
    this.ctx.cursor.scale(dpr, dpr);

    this.scales = this.buildScales();
    this.projection = this.buildProjection();
    this.sprites = this.buildSprites();
    this.coords = this.calculateDatumCoordinates();

    this.resetZoom();
    this.paint();
  }

  paintMap() {
    const [width, height] = this.size;
    const { map } = this.ctx;
    const { x, y, k } = this.state.transform;

    map.fillStyle = COLORS.background;
    map.fillRect(0, 0, width, height);
    map.save();
    map.translate(x, y);
    map.scale(k, k);
    this.sprites.map.applyTo(map, width / 2, height / 2, width, height);
    map.restore();
  }

  paintDatums() {
    const [width, height] = this.size;
    const calls: any = [() => this.ctx.datums.clearRect(0, 0, width, height)];

    let i = 0;

    for (; i < this.totalLocations; i++) {
      const value = this.getCountyValuesByFips(this.locations[i].fips);
      const size = Math.min(
        this.state.perCapita
          ? this.scales.capita(
              (value[this.state.datasetIndex] / this.locations[i].population) *
                100
            )
          : this.scales.size(value[this.state.datasetIndex]),
        150
      );

      if (value) {
        const coords = this.transformedCoords[i];

        coords &&
          calls.push(() => {
            this.sprites.datum.applyTo(
              this.ctx.datums,
              coords[0],
              coords[1],
              size,
              size
            );
          });
      }
    }

    calls.forEach((c: any) => c());
  }

  paintCursor() {
    const [width, height] = this.size;

    if (this.state.cursorDatum === null) return;

    const i = (this.fipsData as any)?.[this.state?.cursorDatum?.fips];
    const coords = this.transformedCoords[i] as any;

    if (!coords) return;

    const value = this.getCountyValuesByFips(this.state?.cursorDatum?.fips);

    if (!value) return;

    const radius = Math.max(
      this.scales.size(value[this.state.datasetIndex]) / 1.5,
      3
    );

    this.ctx.cursor.clearRect(0, 0, width, height);
    this.ctx.cursor.lineWidth = 1;
    this.ctx.cursor.strokeStyle = 'white';
    this.ctx.cursor.beginPath();
    this.ctx.cursor.arc(coords[0], coords[1], radius, 0, TWO_PI);
    this.ctx.cursor.closePath();
    this.ctx.cursor.stroke();
  }

  paint() {
    this.paintMap();
    this.paintDatums();
  }

  destroy() {
    console.log('destroy()');
  }
}

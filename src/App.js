import React, {Component, PureComponent}  from 'react';
import './App.scss';
import { YMaps, Map, Polyline, GeoObject } from 'react-yandex-maps';

const round100 = function ($n) {
    return Math.round(($n)*100)/100
};

class App extends Component {


    mapState = {
        center: [55.75, 37.57],
        zoom: 10,
        width: '100%',
        height: 400,
    };

    /**
     * Стартовый набор маркеров
     * @type {*[]}
     */
    placemarkersStart = [
        {
            name: 'Маркер 1',
            coordinates: [55.74, 37.4],
            selected: false,
            draggable: true
        },
        {
            name: 'Маркер 2',
            coordinates: [55.72, 37.61],
            selected: false,
            draggable: true
        },
        {
            name: 'Маркер 3',
            coordinates: [55.8, 37.7],
            selected: false,
            draggable: true
        },
        {
            name: 'Маркер 4',
            coordinates: [55.82, 37.5],
            selected: false,
            draggable: true
        }
    ];

    constructor(props) {
        super(props);
        this.state = {
            markerInput: '',
            markers: this.placemarkersStart,
            dragging: undefined,
            dragged: undefined
        };

        this.inputOnChangeHandler = this.inputOnChangeHandler.bind(this);
        this.formOnSubmitHandler = this.formOnSubmitHandler.bind(this);

        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        this.dragEndHandler = this.dragEndHandler.bind(this);
    }

    inputOnChangeHandler(ev) {
        this.setState({markerInput: ev.target.value});
    }

    formOnSubmitHandler(ev) {
        ev.preventDefault();
        if(!!this.state.markerInput && this.state.markerInput.length > 0){
            this.state.markers.push({
                name: this.state.markerInput,
                coordinates: this.mapState.center,
                selected: false,
                draggable: true
            });
            this.setState({
                markerInput: ""
            });
        }
    }

    listMarkerClickHandler(ev,index) {
        let newMarkers = this.state.markers,
            bSelected = newMarkers[index].selected;

        newMarkers.map((elPlacemark,i) => {
            elPlacemark.selected = false;
            return elPlacemark;
        });

        newMarkers[index].selected = !bSelected;

        this.setState({
            markers: newMarkers
        });

    }

    /**
     * Клик по лист-итему списка маркеров
     *
     * @param ev
     * @param index
     */
    listMarkerDeleteClickHandler(ev,index) {
        ev.preventDefault();

        let newMarkers = this.state.markers.filter((elPlacemark,i) => {
            return index !== i;
        });

        this.setState({
            markers: newMarkers
        });
    }

    /**
     * Перенос маркера на карте
     *
     * @param ev
     * @param index
     */
    mapMarkerOnDragEndHandler(ev,index){
        const trgt = ev.originalEvent.target,
            newCoords = trgt.geometry._coordinates;

        let newMarkers = this.state.markers;

        newMarkers[index].coordinates = newCoords;

        this.setState({
            markers: newMarkers
        });
    }


    /**
     * Тулза для устновки стейта полей
     *
     * @param markers
     * @param dragging
     */
    setMarkersAndDragging(markers, dragging) {
        const state = this.state;
        state.markers = markers;
        state.dragging = dragging;
        this.setState({state});
    }

    /**
     * Старт ДрагДропа
     *
     * @param ev
     */
    dragStartHandler(ev) {
        this.state.dragged = Number(ev.currentTarget.dataset.id);
        ev.dataTransfer.effectAllowed = 'move';

        // Firefox requires calling dataTransfer.setData
        // for the drag to properly work
        ev.dataTransfer.setData("text/html", null);
    }

    /**
     *
     *
     * @param ev
     */
    dragOverHandler (ev) {
        ev.preventDefault();
        const items = this.state.markers;
        const over = ev.currentTarget;
        const dragging = this.state.dragging;
        const from = isFinite(dragging) ? dragging : this.state.dragged;
        let to = Number(over.dataset.id);

        items.splice(to, 0, items.splice(from,1)[0]);
        this.setMarkersAndDragging(items, to);
    }

    /**
     * Конец ДрагДропа
     *
     * @param ev
     */
    dragEndHandler(ev) {
        this.setMarkersAndDragging(this.state.markers, undefined);
    }


    render() {

        const { width, height } = this.mapState;
        return (

            <div className="container">
                <div className="container-inner">

                    <div className="row">
                        <div className="col-md-5">

                            <form className="" onSubmit={this.formOnSubmitHandler}>
                                <div className="row">
                                    <div className="col ">
                                        <input type="text"
                                               className="form-control w-100 "
                                               placeholder="Новая точка маршрута"
                                               value={this.state.markerInput}
                                               onChange={this.inputOnChangeHandler}
                                        />
                                    </div>
                                    <div className="col col-auto">
                                        <button type="submit" className="btn btn-primary" >Добавить</button>
                                    </div>
                                </div>
                            </form>

                            <br/>

                            <ul className="list-group">
                                {
                                    this.state.markers
                                        .map( (placemark,i) => {
                                            return <li
                                                       className={ "marker list-group-item d-flex justify-content-between align-items-center " + (placemark.selected ? "active " : "") + (i === this.state.dragging ? "dragging " : "") }
                                                       data-id={i}
                                                       key={i}
                                                       draggable="true"
                                                       onDragStart={this.dragStartHandler}
                                                       onDragOver={this.dragOverHandler}
                                                       onDragEnd={this.dragEndHandler}
                                            >
                                                <span className="marker-name" onClick={ (ev) => this.listMarkerClickHandler(ev,i) }>{ placemark.name } [ { round100(placemark.coordinates[0]) + " , " + round100(placemark.coordinates[1]) } ]</span>
                                                <button type="button" className="close" onClick={ (ev) => this.listMarkerDeleteClickHandler(ev,i) } >
                                                    <span>&times;</span>
                                                </button>

                                            </li>
                                        })
                                }
                            </ul>

                            <br/>

                        </div>
                        <div className="col-md-7">

                            <YMaps>
                                <Map state={this.mapState} width={width} height={height} >
                                    {
                                        this.state.markers
                                            .map( (placemark,i) => {
                                                return <GeoObject
                                                    key={'placemark_'+i}
                                                    geometry={{
                                                        type: 'Point',
                                                        coordinates: placemark.coordinates
                                                    }}
                                                    properties={{
                                                        hintContent: placemark.name,
                                                        balloonContent: placemark.name,
                                                        iconContent: placemark.selected ? placemark.name : null,
                                                    }}
                                                    options={{
                                                        preset: placemark.selected ? "islands#redStretchyIcon" : 'islands#black',
                                                        draggable: placemark.draggable
                                                    }}
                                                    onDragEnd={(ev) => {this.mapMarkerOnDragEndHandler(ev,i)}}
                                                />
                                            })

                                    }
                                    <Polyline
                                        geometry={{
                                            coordinates: Array.from(this.state.markers, (placemark, i) => placemark.coordinates ),
                                        }}
                                        properties={{
                                            balloonContent: 'Маршрут',
                                        }}
                                        options={{
                                            balloonCloseButton: false,
                                            strokeColor: '#007bff',
                                            strokeWidth: 6,
                                            strokeOpacity: 0.8,
                                        }}
                                    />

                                </Map>
                            </YMaps>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

import React, {Component} from 'react';
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
        small: true
    };

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
            markers: this.placemarkersStart
        };

        this.inputOnChangeHandler = this.inputOnChangeHandler.bind(this);
        this.formOnSubmitHandler = this.formOnSubmitHandler.bind(this);
    }

    componentDidMount() {

        console.log( Array.from(this.state.markers, (placemark, i) => placemark.coordinates ) )

    }

    inputOnChangeHandler(event) {
        this.setState({markerInput: event.target.value});
    }

    formOnSubmitHandler(event) {
        event.preventDefault();
        if(!!this.state.markerInput && this.state.markerInput.length > 0){
            //console.log('A name was submitted: ' + this.state.markerInput);
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

    listMarkerClickHandler(event,placemark,index) {

        //console.log('listMarkerClickHandler: ', index , placemark);

        let newMarkers = this.state.markers;

        let bSelected = newMarkers[index].selected;

        newMarkers.map((elPlacemark,i) => {
            elPlacemark.selected = false;
            return elPlacemark;
        });


        newMarkers[index].selected = !bSelected;

        this.setState({
            markers: newMarkers
        });

    }

    mapMarkerOnDragEndHandler(event,placemark,index){
        const trgt = event.originalEvent.target,
            newCoords = trgt.geometry._coordinates;

        let newMarkers = this.state.markers;

        newMarkers[index].coordinates = newCoords;

        this.setState({
            markers: newMarkers
        });

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
                                            //console.log(i,placemark);
                                            return <li key={'marker_'+i}
                                                       className={ "list-group-item d-flex justify-content-between align-items-cente " + (placemark.selected ? "active" : "") }
                                                       onClick={ (event) => this.listMarkerClickHandler(event,placemark,i) }
                                            >
                                                <span>{ placemark.name } [ { round100(placemark.coordinates[0]) + " , " + round100(placemark.coordinates[1]) } ]</span>
                                                <span className="close-icon">×</span>
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
                                                //console.log(i,placemark);
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

                                                    onDragEnd={(event) => {this.mapMarkerOnDragEndHandler(event,placemark,i)}}

                                                />
                                            })

                                   }

                                    <Polyline
                                        geometry={{
                                            coordinates: Array.from(this.state.markers, (placemark, i) => placemark.coordinates ),
                                        }}
                                        properties={{
                                            balloonContent: 'Ломаная линия',
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
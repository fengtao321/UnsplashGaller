import Unsplash from 'unsplash-js';
import React from 'react';
import _ from 'lodash';

// import ReactDOM from 'react-dom';
//
// import logo from './logo.svg';
import './App.css';
import './gallery.css';

// TODO: Replace "APP_ACCESS_KEY" with your own key, which
// can be generated here: https://unsplash.com/developers
const unsplash = new Unsplash({accessKey: '08LdVyqWqRjW9u94CuN2T9yaUx-tVA-X4h4IuQGw2eI'});
const toJson = require('unsplash-js').toJson;

//the number of loading images for initial loading and each scroll
const loadingImageNum = 10;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            images: {},
        };
        this.prev = window.scrollY;


        this.throttleHandleChange = _.debounce(this.throttleHandleChange, 500);
    }

    componentDidMount() {
        this.loadImages();
        window.addEventListener('scroll', e => this.handleScroll(e));
    }

    //scroll down to load more images
    handleScroll = (e) => {
        const window = e.currentTarget;
        if (this.prev < window.scrollY) {
            this.throttleHandleChange();
        }
        this.prev = window.scrollY;
    };

    throttleHandleChange = () => this.loadImages();

    //init the gallery, include fetching Random Photos
    loadImages() {
        unsplash.photos.getRandomPhoto({count: loadingImageNum})
            .then(toJson)
            .then(json => {
                this.setState({images: json, isLoading: false});
            });
    }

    render() {
        const isLoading = this.state.isLoading;
        return (
            <div>
                <Gallery images={this.state.images}/>
                {isLoading && <LoadingScreen />}
            </div>
        );
    }
}

function LoadingScreen() {
    return (
        <div className="loading ">
            <div className="loading-icon"> </div>
            <p>Loading...</p>
        </div>
    );
}

class Gallery extends React.Component {
    state = {
        thumbs: [],
    };

    handleClick(id) {
        console.log(id);
    }

    renderThumb(images) {
        console.log(images);
        const thumbs = this.state.thumbs;

        if(images.length > 0) {
            thumbs.push(images.map((data) => {
                return (<Thumb url={data.urls && data.urls.thumb} key={data.id} desc={data.alt_description} onClick={() => this.handleClick(data.id)}/>);
            }));
        }

        if (this.state.thumbs.length < thumbs.length) {
            this.setState({thumbs:thumbs});
        }

        return thumbs;
    }

    render() {
        return (
            <div className="gallery">
                <h2>Gallery wall</h2>
                <div className="waterfall">{this.renderThumb(this.props.images)}</div>
            </div>
        );
    }
}

function Thumb (props) {
    return (
        <div className="item inbound" onClick={props.onClick}>
            <img
                src={props.url}
                alt={props.desc}
            />
        </div>
    );
}

export default App;

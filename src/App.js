import Unsplash from 'unsplash-js';
import React from "react";
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


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
    constructor(props) {
        super(props);
        this.state = {
            thumbs: [],
            image: {},
        };
    }

    handleClick(id) {
        console.log(id);
        unsplash.photos.getPhoto(id)
            .then(toJson)
            .then(json => {
                console.log('debug');
                console.log(json);
                this.setState({image:json});
            });

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
        console.log('this.image');
        console.log(this.state.image);
        return (
            <div className="gallery">

                <h2>Gallery wall</h2>
                <div className="waterfall">{this.renderThumb(this.props.images)}</div>

                <PopupModal img={this.state.image} />
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

class PopupModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false
        };
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        console.log('image update');
        if (this.props.img.id !== prevProps.img.id) {
            this.handleShow();
        }
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    render() {
        return (
            <div>
                <Modal show={this.state.show} onHide={this.handleClose} dialogClassName="custom-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.img.description}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>By: {this.props.img.user && this.props.img.user.name}</h4>
                        <img
                            src={this.props.img.urls && this.props.img.urls.full}
                            alt={this.props.img.alt_description}
                        />
                        <p>{this.props.img.descirption}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default App;
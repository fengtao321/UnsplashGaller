import Unsplash from 'unsplash-js';
import React from "react";
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';

//
// import logo from './logo.svg';
import './App.css';
import './gallery.css';

// TODO: Replace "APP_ACCESS_KEY" with your own key, which
// can be generated here: https://unsplash.com/developers
// const unsplash = new Unsplash({accessKey: '08LdVyqWqRjW9u94CuN2T9yaUx-tVA-X4h4IuQGw2eI'});
const unsplash = new Unsplash({accessKey: '1rG7Hp7SYcsk8PgVo0rhKkWBgEfTReln-qA5M4EwQcU'});
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
        console.log('lazy loading');
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
            currentId: 0,
            imageListLastIndex:-1,
        };
        this.imageList =[]
        this.imageIndex = -1;

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (isNaN(prevProps.images.length) || this.props.images[1].id !== prevProps.images[1].id) {
            this.renderThumb(this.props.images);
        }
    }

    handleClick(id) {
        if(id > -1) {
            this.getPhotoAccordingToId(this.imageList[id], id);
        }
    }


    getPhotoAccordingToId(imageId, id) {
        unsplash.photos.getPhoto(imageId)
            .then(toJson)
            .then(json => {
                this.setState({image:json, currentId:id});
            });
    }

    renderThumb(images) {
        console.log(images);
        const thumbs = this.state.thumbs;

        if( images.length > 0) {
            // let index= this.baseIndex * loadingImageNum;
            console.log("debug here");
            this.imageIndex = this.state.imageListLastIndex;
            if(images.length > 0) {
                thumbs.push(images.map((data) => {
                    this.imageIndex++;
                    this.imageList.push(data.id);
                    return (<Thumb url={data.urls && data.urls.thumb} key={data.id} desc={data.alt_description} current={this.imageIndex} onClick={this.handleClick}/>);
                }));
            }
            this.setState({imageListLastIndex:this.imageIndex});

        }

        this.setState({thumbs:thumbs});
    }

    render() {
        let showNext = (this.state.currentId !== this.state.imageListLastIndex);
        return (
            <div className="gallery">
                <h2>Gallery wall</h2>
                <div className="waterfall">{this.state.thumbs}</div>
                <PopupModal img={this.state.image} id={this.state.currentId} showNext={showNext} onClick={this.handleClick} />
            </div>
        );
    }
}

function Thumb (props) {
    return (
        <div className="item inbound" onClick={()=>props.onClick(props.current)}>
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
        this.state = {
            show: false,
        };
        this.lastId = -1;
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.img.id && (this.state.lastId < 0 || this.props.img.id !== this.lastId)) {
            this.lastId = this.props.img.id;
            this.handleShow();
        }
    }

    handleClose() {
        // Simple debounce function, in case the user click one image too fast.
        setTimeout(
            () => this.lastId = -1,
            100
        );
        this.setState({ show: false });
    }

    handleShow() {
        console.log('show modal');
        this.setState({ show: true });
    }

    render() {
        console.log('DEBUG  DEBUG');
        return (
            ReactDOM.createPortal(
            <div>
                <Modal show={this.state.show} onHide={this.handleClose} dialogClassName="custom-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.img.description}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>By: {this.props.img.user && this.props.img.user.name}</h4>
                        <img
                            src={this.props.img.urls && this.props.img.urls.regular}
                            alt={this.props.img.alt_description}
                        />
                        <p>{this.props.img.descirption}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClose}>Close</Button>
                    </Modal.Footer>
                    <div className={"prev arrow " + (this.props.id>0?"":"hidden")}  onClick={()=>this.props.onClick(this.props.id-1)}></div>
                    <div className={"next arrow" + (this.props.showNext?"":"hidden")}  onClick={()=>this.props.onClick(this.props.id+1)}></div>
                </Modal>
            </div>,document.body)
        );
    }
}
export default App;
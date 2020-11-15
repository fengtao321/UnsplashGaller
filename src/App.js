import Unsplash from 'unsplash-js';
import React from "react";
import _ from 'lodash';
import { Button, Navbar, Nav, Modal, Form, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';

//
// import logo from './logo.svg';
import './App.css';
import './gallery.css';

// TODO: Replace "APP_ACCESS_KEY" with your own key, which
// can be generated here: https://unsplash.com/developers
const unsplash = new Unsplash({accessKey: '08LdVyqWqRjW9u94CuN2T9yaUx-tVA-X4h4IuQGw2eI'});
// const unsplash = new Unsplash({accessKey: '1rG7Hp7SYcsk8PgVo0rhKkWBgEfTReln-qA5M4EwQcU'});
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
                <h2>Gallery wall</h2>
                <NavBar />
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
            forcePopup:false,
        };
        this.imageList =[]
        this.imageIndex = -1;
        this.prevId = -1;

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (isNaN(prevProps.images.length) || this.props.images[1].id !== prevProps.images[1].id) {
            this.renderThumb(this.props.images);
        }
    }

    handleClick(id) {
        if(id > -1) {
            if(this.prevId === id) {
                this.setState({forcePopup: true});
                setTimeout(
                    () => this.setState({ forcePopup: false}),
                    100
                );
            } else {
                this.prevId = id;
                this.getPhotoAccordingToId(this.imageList[id], id);
            }
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
        const thumbs = this.state.thumbs;

        if( images.length > 0) {
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
                <div className="waterfall">{this.state.thumbs}</div>
                <PopupModal img={this.state.image} forcePopup={this.state.forcePopup} id={this.state.currentId} showNext={showNext} onClick={this.handleClick} />
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

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidUpdate(prevProps) {
        if ((this.props.forcePopup || this.props.img.id !== prevProps.img.id) && !this.state.show)  {
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

function NavBar() {
    return(
        <>
        <Navbar variant="dark">
            <Nav className="mr-auto">
                <Nav.Link href="#random">Random</Nav.Link>
                <Nav.Link href="#animal">Animal</Nav.Link>
                <Nav.Link href="#nature">Nature</Nav.Link>
                <Nav.Link href="#people">People</Nav.Link>
            </Nav>
            <Form inline>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                <Button variant="outline-info">Search</Button>
            </Form>
        </Navbar>
        </>
    );
}
export default App;
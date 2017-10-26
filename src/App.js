import React, { Component } from 'react';
import Clippy from './images/Clippy.png';
import './App.css';
// import Typed from 'typed.js';
// import Typing from 'react-typing-animation';
import io from 'socket.io-client';
import questions from './data/questions.json';
// const socket = io.connect('https://saveclippy.herokuapp.com/', {reconnect: true, transports: ['websocket'], path: '/socket.io'});
const socket = io.connect('http://localhost:4000');

// class AnimatedTyping extends Component {
//   render() {

//     return (
//       <Typing>
//         <span>This span will get typed, then erased.</span>
//       </Typing>
//     ); 
//   }
// }



export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      responses: questions.responses,
      questions: questions.questions || [],
      currentQuestion: {prompt: ''},
      currentResponses: {},
      playerCount: 0,
      gameScore: 0,
      reverseDirection: 0
    };
    this.fetchNewQuestion = this.fetchNewQuestion.bind(this);
    this.setPlayerCount = this.setPlayerCount.bind(this);
    this.setGameScore = this.setGameScore.bind(this);
    this.evaluateAnswer = this.evaluateAnswer.bind(this);
    this.randomFloat = this.randomFloat.bind(this);
  }
  randomFloat() {
    this.setState({
      reverseDirection: Math.Round(Math.Random())
    });
  }
  fetchNewQuestion() {
    const nextQuestion = this.state.questions[
      Math.floor(
        Math.random() * this.state.questions.length
      )
    ];
    const nextGroup = nextQuestion.group;
    const possibleResponses = this.state.responses[nextGroup];
    const responses = {
      yes: possibleResponses.yes[Math.floor(
        Math.random() * possibleResponses.yes.length
      )],
      no: possibleResponses.no[Math.floor(
        Math.random() * possibleResponses.no.length
      )]
    };
    
    this.setState({
      currentQuestion: nextQuestion,
      currentResponses: responses
    });
    // if (this.typed) {
    //   console.log('Reset')
    //   this.typed.reset();
    // }
    // this.typed = new Typed(this.question, {
    //   strings: [this.state.currentQuestion.prompt],
    //   typeSpeed: 50
    // });

    console.log(this.state.currentQuestion.prompt)
    
  }
  setPlayerCount(count) {
    this.setState({playerCount: count});
  }
  setGameScore(score) {
    this.setState({gameScore: score});
  }
  evaluateAnswer(input) {
    socket.emit('game:action', {
      answer: input,
      weight: this.state.currentQuestion.weight
    });
    this.setState({response: (
      input ?
        '+1 Thank you. This makes me happy.':
        '-1 Really? So it’s true...people don’t need me after all.'
    ) 
    });
    this.fetchNewQuestion();
  }
  componentWillMount() {
  }
  componentWillUnMount() {
    socket.off('player:count');
    socket.off('game:score');
    this.typed.destroy();
  }
  componentDidMount() {
    if (this.typed) {
      this.typed.destroy();
    }
    socket.on('player:count', this.setPlayerCount);
    socket.on('game:score', this.setGameScore);

    this.fetchNewQuestion();
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">HI. I’M CLIPPY, AND I’M SAD.</h1>
        </header>
        <div class="subtitle-block">
          <p className="header-subtitle">As the Microsoft Office assistant, I used to help people with their word processing needs. But I got deleted...and I haven’t worked in years.</p>
          <p>I JUST WANT TO ASSIST YOU.
          IT WOULD MAKE ME HAPPY AGAIN...
          </p>
        </div>
        <div className="content">

          <div className="clippy-container clearfix">
            <div className="clippy-tooltip">
              <div className="clippy-text" >
                <p>
              Hypothetically, would you let me help you...  {this.state.currentQuestion.prompt}?
              </p>
                {/* <p ref={(question) => {this.question = question; }}></p> */}
                {/* <AnimatedTyping/> */}
              </div>
              <div className="clippy-buttons clearfix">
                <a className="" 
                  onClick={() => this.evaluateAnswer(true) }
                  style={{float: 'right'}}
                >
                  {this.state.currentResponses.yes}
                </a>
                <a className=""
                  onClick={() => this.evaluateAnswer(false) }
                  style={{float: 'left'}}
                >
                  {this.state.currentResponses.no}
                </a>
              </div>
            </div>
            <img src={Clippy} className="clippy-image" alt="Clippy" />
            <br/>
            <br/>
            <p>{this.state.response}</p>
          </div>
        </div>
        <div className="fixed-footer">
          <div className="col-half">
            <span className="score-value">{this.state.gameScore} / 50</span>
            <span className="score-label">Clippy’s happiness level</span>
          </div>
          <div className="col-half">
            <span className="score-value">
            {this.state.playerCount}
            </span>
          <span className="score-label">Current Players</span>
          {/* <div className="progress-bar">

          </div> */}
          {/* <span>words - Jason Searcy / code - Michael Rogers</span> */}
          </div>
        </div>


      </div>
    );
  }
}


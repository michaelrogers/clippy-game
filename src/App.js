import React, { Component } from 'react';
import Clippy from './images/Clippy.png';
import './App.css';
import io from 'socket.io-client';
import questions from './data/questions.json';
const socket = io.connect('https://saveclippy.herokuapp.com/', {reconnect: true, transports: ['websocket'], path: '/socket.io'});
// const socket = io.connect('http://localhost:3000');

// import Typed from 'typed.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      responses: questions.responses,
      questions: questions.questions || [],
      currentQuestion: {},
      currentResponses: {},
      playerCount: 0,
      gameScore: 0
    };
    this.fetchNewQuestion = this.fetchNewQuestion.bind(this);
    this.setPlayerCount = this.setPlayerCount.bind(this);
    this.setGameScore = this.setGameScore.bind(this);
    this.evaluateAnswer = this.evaluateAnswer.bind(this);
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
    this.fetchNewQuestion();
  }
  componentWillUnMount() {
    socket.off('player:count');
    socket.off('game:score');
  }
  componentDidMount() {
    socket.on('player:count', this.setPlayerCount);
    socket.on('game:score', this.setGameScore);
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">HI. I’M CLIPPY, AND I’M SAD.</h1>
          <p>As the Microsoft Office assistant, I used to help people with their word processing needs. But I got deleted...and I haven’t worked in years.</p>
        </header>
        <br/>
        <div className="content">

          <div className="clippy-container clearfix">
            <div className="clippy-tooltip">
              <div className="clippy-text">
                <p>Hypothetically, would you let ME help YOU {this.state.currentQuestion.prompt}?</p>
              </div>
              <div className="clippy-buttons clearfix">
                <a className="" onClick={() => this.evaluateAnswer(true) }>{this.state.currentResponses.yes}</a>
                <a className="" onClick={() => this.evaluateAnswer(false) }>{this.state.currentResponses.no}</a>
              </div>
            </div>
            <img src={Clippy} className="clippy-image" alt="Clippy" />
            <br/>
            <br/>
            <p>{this.state.response}</p>
          </div>
        </div>
        <div className="fixed-footer">
          <p>Current Players: {this.state.playerCount}</p>
          <p>Game Score: {this.state.gameScore} / 50</p>
          {/* <div className="progress-bar">

          </div> */}
        </div>


      </div>
    );
  }
}


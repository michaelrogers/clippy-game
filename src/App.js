import React, { Component } from 'react';
import Clippy from './images/Clippy.png';
import './App.css';
import io from 'socket.io-client';
import questions from './data/questions.json';
const socket = io.connect();
// const socket = io.connect('/');

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: questions.questions || [],
      currentQuestion: {},
      playerCount: 0,
      gameScore: 0
    };
    this.fetchNewQuestion = this.fetchNewQuestion.bind(this);
    this.setPlayerCount = this.setPlayerCount.bind(this);
    this.setGameScore = this.setGameScore.bind(this);
    this.evaluateAnswer = this.evaluateAnswer.bind(this);
  }
  fetchNewQuestion() {
    this.setState({currentQuestion: (
      this.state.questions[
        Math.floor(
          Math.random() *this.state.questions.length
        )
      ]
    )
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
                <p>{this.state.currentQuestion.prompt}</p>
              </div>
              <div className="clippy-buttons clearfix">
                <a className="" onClick={() => this.evaluateAnswer(true) }>{this.state.currentQuestion.text.yes}</a>
                <a className="" onClick={() => this.evaluateAnswer(false) }>{this.state.currentQuestion.text.no}</a>
              </div>
            </div>
            <img src={Clippy} className="clippy-image" alt="Clippy" />
          </div>
        </div>
        <div className="fixed-footer">
          <p>Current Players: {this.state.playerCount}</p>
          <p>Game Score: {this.state.gameScore}</p>
          <div className="progress-bar">

          </div>
        </div>


      </div>
    );
  }
}


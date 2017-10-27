import React, { Component } from 'react';
import Clippy from './images/Clippy.png';
import './App.css';
import io from 'socket.io-client';
import questions from './data/questions.json';
import { LinearProgress, Snackbar, Button } from 'material-ui';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

const socket = io.connect('https://saveclippy.herokuapp.com/', {reconnect: true, transports: ['websocket'], path: '/socket.io'});
// const socket = io.connect('http://localhost:4000');


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      responses: questions.responses,
      questions: questions.questions || [],
      winNumber: 50,
      questionsAnswered: 0,
      currentQuestion: {
        prompt: 'write a letter',
        group: 'A',
        weight: 1
      },
      currentResponses: {yes: 'Yes', no: 'No'},
      playerCount: 0,
      gameScore: 0,
      // reverseDirection: 0,
      // typing: 1,
      noFloat: 'right',
      yesFloat: 'yes',
      isSnackbarActive: false,
      isDialogActive: true
    };
    this.fetchNewQuestion = this.fetchNewQuestion.bind(this);
    this.setPlayerCount = this.setPlayerCount.bind(this);
    this.setGameScore = this.setGameScore.bind(this);
    this.evaluateAnswer = this.evaluateAnswer.bind(this);
    this.randomFloat = this.randomFloat.bind(this);
    // this.typingComplete = this.typingComplete.bind(this);
    this.handleTimeoutSnackbar = this.handleTimeoutSnackbar.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  handleTimeoutSnackbar() {
    this.setState({ isSnackbarActive: false });
  }

  // typingComplete() {
  //   if (!this.state.typing) {
  //     this.fetchNewQuestion();
  //   }
  // }
  randomFloat() {
    const value = Math.round(Math.random());
    

    this.setState({
      noFloat: value ? 'left' : 'right',
      yesFloat: value ? 'right' : 'left'
    });
  }
  fetchNewQuestion() {
    let nextQuestion;
    if (this.state.questionsAnswered < 2) {
      nextQuestion = this.state.questions[this.state.questionsAnswered]
    } else {
      nextQuestion = this.state.questions[
        Math.floor(
          Math.random() * this.state.questions.length
        )
      ];
    }


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
      currentResponses: responses,
      questionsAnswered: this.state.questionsAnswered + 1
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
        '-1 So it’s true...people don’t need me after all.'
    ) 
    });
    this.setState({isSnackbarActive: true});
    this.randomFloat();
    this.fetchNewQuestion();
  }
  handleCloseDialog() {
    this.setState({isDialogActive: false});
  }
  componentWillMount() {
  }
  componentWillUnMount() {
    socket.off('player:count');
    socket.off('game:score');
  }
  componentDidMount() {
    socket.on('player:count', this.setPlayerCount);
    socket.on('game:score', this.setGameScore);
    this.fetchNewQuestion();
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Save Clippy</h1>
        </header>
  
          
        <div className="content">

          <div className="clippy-container clearfix">
            <div className="clippy-tooltip">
              <div className="clippy-text" >
                <p>Hypothetically, would you let me help you...  {this.state.currentQuestion.prompt}?
                </p>
              </div>
              <div className="clippy-buttons clearfix">
                <a className="" 
                  onClick={() => this.evaluateAnswer(true) }
                  style={{float: this.state.yesFloat}}
                >
                  {this.state.currentResponses.yes}
                </a>
                <a className=""
                  onClick={() => this.evaluateAnswer(false) }
                  style={{float: this.state.noFloat}}
                >
                  {this.state.currentResponses.no}
                </a>
              </div>
            </div>
            <img src={Clippy} className="clippy-image" alt="Clippy" />
 
            <div>
    
            </div>
          </div>
          <Dialog
            open={this.state.isDialogActive}
            transition={<Slide direction="up" />}
            keepMounted
            onRequestClose={this.handleCloseDialog}
          >
            <DialogTitle>{'HI. I’M CLIPPY, AND I’M SAD.'}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                  As the Microsoft Office assistant, I used to help people with their word processing needs. But I got deleted...and I haven’t worked in years.
              </DialogContentText>
              <br/>
              <DialogContentText>
                  I JUST WANT TO ASSIST YOU.
                  IT WOULD MAKE ME HAPPY AGAIN...
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseDialog} color="primary">
                Sure friend
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={this.state.isSnackbarActive}
            autoHideDuration={1500}
            onRequestClose={this.handleTimeoutSnackbar}
            message={this.state.response}
            
          />
        </div>
        <div className="fixed-footer">
          <LinearProgress value={this.state.gameScore * 2} mode='determinate'/>
          <div className="col-half">
            <span className="score-value">{this.state.gameScore} / {this.state.winNumber}</span>
            <span className="score-label">Clippy’s happiness level</span>
          </div>
          <div className="col-half">
            <span className="score-value">
              {this.state.playerCount}
            </span>
            <span className="score-label">Current Players</span>
          </div>
        </div>

        
      </div>
    );
  }
}


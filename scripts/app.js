'use strict';
const playerFactory = (nickname, choice) => {
  const getNickname = () => nickname;
  const getChoice = () => choice;
  return { getNickname, getChoice };
};

// init handlers
(() => {
  const gameMode = document.querySelector('.modal.game-mode');
  const nickNames = document.querySelector('.modal.nicknames');
  const gameOver = document.querySelector('.modal.game-over');
  const game = document.querySelector('.game');

  let isPVE = false;

  function _switchParentWrapper(from, to) {
    from.parentElement.style.display = 'none';
    to.parentElement.style.display = '';
  }

  function _startNewGame() {
    // create 2 players
    const [firstPlayer, secondPlayer] = (() => {
      // create nicknames for players
      const [firstNickname, secondNickname] = (() => {
        return (function _getNickNames() {
          function _validate(first, second) {
            if (first == '') {
              first = 'Player1';
            }
            if (second == '') {
              second = 'Player2';
              if (isPVE) {
                second += '-PC';
              }
            }
            return [first, second];
          }
          const first = document.getElementById('first-player-nickname').value;
          const second = document.getElementById('second-player-nickname')
            .value;
          return [..._validate(first, second)];
        })();
      })();

      return (function _getPlayers() {
        let firstPl = playerFactory(firstNickname, 'X');
        let secondPl = null;

        if (isPVE) {
          // make a pc bot
          secondPl = ((player) => {
            const { getNickname, getChoice } = player;
            return { getNickname, getChoice };
          })(playerFactory(secondNickname, 'O'));
        } else {
          secondPl = playerFactory(secondNickname, 'O');
        }
        return [firstPl, secondPl];
      })();
    })();

    _switchParentWrapper(nickNames, game);
    const gameBoard = ((firstPlayer, secondPlayer) => {
      let board = ['', '', '', '', '', '', '', '', ''];
      let winner = null;

      const firstPlCh = firstPlayer.getChoice();
      const secondPlCh = secondPlayer.getChoice();

      let currentPlCh = null;

      function _playNextPlayer() {
        if (currentPlCh == firstPlCh) {
          currentPlCh = secondPlCh;
        } else {
          currentPlCh = firstPlCh;
        }
      }

      function _playPC() {
        function _getEmptySpots(bd) {
          return bd
            .map((elm, i) => {
              if (elm == '') {
                return i;
              }
            })
            .join('')
            .split('');
        }

        function _getBestMove(newBD, curPl, winPl, losePl, curIndex = -1) {
          const emptyBD = _getEmptySpots(newBD);
          let score = 0;
          const moves = [];

          // check terminal state
          const winner = _checkForWinner(newBD);
          if (winner) {
            if (winner == losePl.getNickname()) {
              score = -10 * (emptyBD.length + 1);
            } else if (winner == winPl.getNickname()) {
              score = 10 * (emptyBD.length + 1);
            } else {
              score = 0;
            }

            return { index: curIndex, score };
          }

          for (let i = 0; i < emptyBD.length; i++) {
            let nextBD = [...newBD];
            nextBD[emptyBD[i]] = curPl;
            let bstMove = _getBestMove(
              nextBD,
              _nextPlayerCh(curPl),
              winPl,
              losePl,
              emptyBD[i]
            );

            moves.push({ index: emptyBD[i], score: bstMove.score });
          }

          let bestMove = {};
          // check for win move or draw

          const winMoves = moves.filter((m) => m.score > 0);
          const loseMoves = moves.filter((m) => m.score <= 0);

          if (winMoves.length > 0) {
            bestMove = winMoves.reduce((ac, prev) => {
              if (ac.score < prev.score) {
                ac = prev;
              }
              return ac;
            });
          } else {
            bestMove = loseMoves.reduce((ac, prev) => {
              if (prev.score > ac.score) {
                ac = prev;
              }
              return ac;
            });
          }

          return bestMove;
        }

        function _nextPlayerCh(pl = null) {
          if (pl == secondPlCh) {
            pl = firstPlCh;
          } else {
            pl = secondPlCh;
          }
          return pl;
        }
        if (board.join('').length > 1) {
          const indexO = _getBestMove(
            [...board],
            'O',
            secondPlayer,
            firstPlayer
          ).index;

          const indexX = _getBestMove(
            [...board],
            'X',
            firstPlayer,
            secondPlayer
          ).index;

          const futureWinO = [...board];
          const futureWinX = [...board];
          futureWinO[indexO] = 'O';
          futureWinX[indexX] = 'X';
          if (_checkForWinner(futureWinO) == secondPlayer.getNickname()) {
            return indexO;
          } else if (_checkForWinner(futureWinX) == firstPlayer.getNickname()) {
            return indexX;
          } else {
            return indexO;
          }
        } else {
          if (board[4] != 'X') {
            return 4;
          } else {
            return 0;
          }
        }
      }

      function getPCMoveIndex() {
        return _playPC();
      }

      function hasWinner() {
        if (winner) {
          return true;
        }
        return false;
      }

      function getWinnerName() {
        return winner;
      }

      function _checkForWinner(bd) {
        function _findW(condition) {
          function _getVal(i1, i2, i3) {
            return bd[i1] + bd[i2] + bd[i3];
          }
          function _win(val) {
            return val == condition;
          }

          if (
            _win(_getVal(0, 1, 2)) ||
            _win(_getVal(3, 4, 5)) ||
            _win(_getVal(6, 7, 8)) ||
            _win(_getVal(0, 3, 6)) ||
            _win(_getVal(1, 4, 7)) ||
            _win(_getVal(2, 5, 8)) ||
            _win(_getVal(0, 4, 8)) ||
            _win(_getVal(6, 4, 2))
          ) {
            return true;
          }
        }
        const fc = 'XXX';
        const sc = 'OOO';

        if (_findW(fc)) {
          return firstPlayer.getNickname();
        } else if (_findW(sc)) {
          return secondPlayer.getNickname();
        } else if (!bd.includes('')) {
          return 'draw';
        }
        return null;
      }

      function getCurrentPlayerCh() {
        _playNextPlayer();
        return currentPlCh;
      }

      function getNameOfPlayer(player) {
        if (player == 'first') {
          return firstPlayer.getNickname();
        }
        if (player == 'second') {
          return secondPlayer.getNickname();
        }
      }

      function getValueOf(index) {
        return board[index];
      }

      function setValueOf(index) {
        board[index] = currentPlCh;
        winner = _checkForWinner(board);
      }
      return {
        getValueOf,
        setValueOf,
        getCurrentPlayerCh,
        getNameOfPlayer,
        hasWinner,
        getWinnerName,
        getPCMoveIndex
      };
    })(firstPlayer, secondPlayer);

    const displayController = ((gb) => {
      const board = document.querySelector('.game-board');

      function _currentBoardHandler(e) {
        if (e.target.classList.contains('content-element')) {
          _setPlayerChoice(e.target);
        }
      }

      function _setPlayerChoice(element) {
        function _endGame(w) {
          const over = document.querySelector('.modal.game-over');
          _switchParentWrapper(game, over);
          over.querySelector('.winner').textContent = w;
        }
        function _playGame(s) {
          s.textContent = gb.getCurrentPlayerCh();
          gb.setValueOf(element.dataset.id);
          if (isPVE) {
            function _setPCMove(id) {
              [...board.children].forEach((elm) => {
                if (elm.dataset.id == id) {
                  elm.firstElementChild.textContent = gb.getCurrentPlayerCh();
                  gb.setValueOf(id);
                }
              });
            }
            const id = gb.getPCMoveIndex();
            _setPCMove(id);
          }
        }

        const span = element.querySelector('span');
        if (span.textContent == '') {
          _playGame(span);

          if (gb.hasWinner()) {
            _endGame(gb.getWinnerName());
          }
        }
      }

      function _renderNickNames() {
        const fName = document.querySelector(
          '.player-info.first-pl .nick-name'
        );
        const sName = document.querySelector(
          '.player-info.second-pl .nick-name'
        );
        fName.textContent = gb.getNameOfPlayer('first');
        sName.textContent = gb.getNameOfPlayer('second');
      }

      function _renderBoard() {
        board.querySelectorAll('.content-element').forEach((elm, i) => {
          elm.querySelector('span').textContent = gb.getValueOf(i);
        });
      }

      function _setClearGameHandler() {
        function _clearHandler(e) {
          board.removeEventListener('click', _currentBoardHandler);
          e.target.removeEventListener('click', _clearHandler);
        }

        document.querySelectorAll('.new-game').forEach((newGameBtn) => {
          newGameBtn.addEventListener('click', _clearHandler);
        });
        document.querySelectorAll('.reset-game').forEach((resetGameBtn) => {
          resetGameBtn.addEventListener('click', _clearHandler);
        });
      }

      function _createNewHandler() {
        _setClearGameHandler();
        board.addEventListener('click', _currentBoardHandler);
      }

      function renderNewGame() {
        _createNewHandler();
        _renderNickNames();
        _renderBoard();
      }
      return { renderNewGame };
    })(gameBoard);

    displayController.renderNewGame();
  }

  gameMode.querySelector('.pvp-mode').addEventListener('click', () => {
    isPVE = false;
    _switchParentWrapper(gameMode, nickNames);
  });
  gameMode.querySelector('.pve-mode').addEventListener('click', () => {
    isPVE = true;
    _switchParentWrapper(gameMode, nickNames);
  });
  nickNames.querySelector('.back').addEventListener('click', () => {
    _switchParentWrapper(nickNames, gameMode);
  });
  nickNames.querySelector('.next').addEventListener('click', _startNewGame);
  // reset current game
  document.querySelectorAll('.new-game').forEach((newGameBtn) => {
    newGameBtn.addEventListener('click', () => {
      _startNewGame();
      _switchParentWrapper(gameOver, game);
    });
  });
  // reset the game
  document.querySelectorAll('.reset-game').forEach((resetGameBtn) => {
    resetGameBtn.addEventListener('click', () => {
      _switchParentWrapper(gameOver, game);
      _switchParentWrapper(game, gameMode);
    });
  });
})();

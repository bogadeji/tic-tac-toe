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
          // TODO
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
    // TODO
    const gameBoard = ((firstPlayer, secondPlayer) => {
      let board = ['', '', '', '', '', '', '', '', ''];

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
        console.log(board);
      }
      return { getValueOf, setValueOf, getCurrentPlayerCh, getNameOfPlayer };
    })(firstPlayer, secondPlayer);

    const displayController = ((gb) => {
      const board = document.querySelector('.game-board');

      function _currentBoardHandler(e) {
        if (e.target.classList.contains('content-element')) {
          _setPlayerChoice(e.target);
        }
      }

      function _setPlayerChoice(element) {
        const span = element.querySelector('span');
        if (span.textContent == '') {
          span.textContent = gb.getCurrentPlayerCh();
          gb.setValueOf(element.dataset.id);
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
    newGameBtn.addEventListener('click', _startNewGame);
  });
  // reset the game
  document.querySelectorAll('.reset-game').forEach((resetGameBtn) => {
    resetGameBtn.addEventListener('click', () =>
      _switchParentWrapper(game, gameMode)
    );
  });
})();

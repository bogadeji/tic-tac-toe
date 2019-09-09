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
      function _renderBoard() {}

      let board = ['', '', '', '', '', '', '', '', ''];
      console.log(firstPlayer.getNickname(), secondPlayer.getNickname());
    })(firstPlayer, secondPlayer);
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

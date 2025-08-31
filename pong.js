window.onload = function() {
  const canvas = document.getElementById('pong');
  const ctx = canvas.getContext('2d');

  const paddleWidth = 10, paddleHeight = 100;
  let player = { x: 0, y: canvas.height/2 - paddleHeight/2, score: 0 };
  let ai = { x: canvas.width - paddleWidth, y: canvas.height/2 - paddleHeight/2, score: 0 };
  let ball, gameInterval;
  let isPlaying = false;
  let speedIncrease = 0.9;

  const hitSound = document.getElementById('hit');
  const scoreSound = document.getElementById('score');
  const bgMusic = document.getElementById('music');

  const startBtn = document.getElementById('startBtn');
  const message = document.getElementById('message');

  let npcError = 70; // valor inicial do erro

  const npcErrorSlider = document.getElementById('npcError');
  const npcErrorValue = document.getElementById('npcErrorValue');

  npcErrorSlider.addEventListener('input', function() {
    npcError = parseInt(this.value);
    npcErrorValue.textContent = this.value;
  });

  function resetBall() {
    ball = {
      x: canvas.width/2,
      y: canvas.height/2,
      radius: 10,
      speed: 10,
      velocityX: Math.random() > 0.5 ? 5 : -5,
      velocityY: (Math.random() * 4 - 2)
    };
  }

  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawText(text, x, y) {
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.fillText(text, x, y);
  }

  function collision(ball, paddle) {
    return ball.x < paddle.x + paddleWidth &&
           ball.x + ball.radius > paddle.x &&
           ball.y < paddle.y + paddleHeight &&
           ball.y + ball.radius > paddle.y;
  }

  function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // rebote nas bordas
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.velocityY = -ball.velocityY;
    }

    // oponente com erro proposital
    let aiCenter = ai.y + paddleHeight/2;
    if (ball.y < aiCenter - npcError) ai.y -= 4;
    else if (ball.y > aiCenter + npcError) ai.y += 4;

    // colisão com jogador
    if (collision(ball, { x: player.x, y: player.y })) {
      hitSound.play();
      ball.velocityX = -ball.velocityX;
      ball.speed += speedIncrease;
    }

    // colisão com oponente
    if (collision(ball, { x: ai.x, y: ai.y })) {
      hitSound.play();
      ball.velocityX = -ball.velocityX;
      ball.speed += speedIncrease;
    }

    // ponto oponente
    if (ball.x < 0) {
      ai.score++;
      scoreSound.play();
      resetBall();
    }

    // ponto jogador
    if (ball.x > canvas.width) {
      player.score++;
      scoreSound.play();
      resetBall();
    }

    // fim de jogo
    if (player.score >= 15 || ai.score >= 15) {
      endGame(player.score > ai.score ? "Você venceu!" : "Que pena!o oponente venceu.");
    }
  }

  function render() {
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawRect(player.x, player.y, paddleWidth, paddleHeight, "white");
    drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "white");
    drawCircle(ball.x, ball.y, ball.radius, "white");
    drawText(player.score, canvas.width / 4, 50);
    drawText(ai.score, 3 * canvas.width / 4, 50);
  }

  function game() {
    update();
    render();
  }

  function startGame() {
    player.score = 0;
    ai.score = 0;
    resetBall();
    if (!bgMusic.paused) bgMusic.pause();
    bgMusic.play();
    gameInterval = setInterval(game, 1000 / 60);
    isPlaying = true;
    message.textContent = "";
    startBtn.style.display = 'none';
  }

  function endGame(result) {
    clearInterval(gameInterval);
    isPlaying = false;
    message.textContent = result;
    startBtn.textContent = "Jogar Novamente";
    startBtn.style.display = 'inline-block';
  }

  // mouse
  canvas.addEventListener("mousemove", (evt) => {
    const rect = canvas.getBoundingClientRect();
    player.y = evt.clientY - rect.top - paddleHeight / 2;
  });

  // toque (mobile)
  canvas.addEventListener("touchmove", (evt) => {
    const touch = evt.touches[0];
    const rect = canvas.getBoundingClientRect();
    player.y = touch.clientY - rect.top - paddleHeight / 2;
    evt.preventDefault();
  }, { passive: false });

  startBtn.addEventListener('click', () => {
    if (!isPlaying) startGame();
  });

  // inicialização
  resetBall();
  render();
};
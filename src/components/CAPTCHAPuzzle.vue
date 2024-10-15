<template>
  <div class="captcha-puzzle-game">
    <h3 v-if="!isCaptchaCompleted">Rearrange the tiles to restore the image</h3>
    <p v-if="!isCaptchaCompleted">{{ hint }}</p>

    <div v-if="!isCaptchaCompleted" class="puzzle-grid" :class="{ solved: isSolved }">
      <div
          v-for="(piece, index) in shuffledPieces"
          :key="index"
          class="puzzle-piece"
          @dragover.prevent
          @dragstart="dragStart(index)"
          @drop="drop(index)"
          draggable="true"
          @mousedown="trackUserInteraction"
      >
      <img :src="piece.src" :alt="'Puzzle piece ' + index" />
    </div>
  </div>

  <div v-if="isSolved && !isCaptchaCompleted" class="math-challenge">
    <p>Solve this to proceed: {{ mathQuestion }}</p>
    <img :src="mathQuestionImageSrc" alt="Math question" />
    <input
        v-model="userAnswer"
        placeholder="Your answer"
        type="number"
        aria-label="Math challenge answer"
    />
  </div>

  <!-- Honeypot Field -->
  <input
      type="text"
      v-model="honeypot"
      style="display:none"
      aria-hidden="true"
      autocomplete="off"
      placeholder="Leave this field empty"
  />

  <button
      v-if="!isCaptchaCompleted"
      class="btn-tertiary"
      :disabled="!isMathSolved || isSubmitting || !isJSChallengeSolved"
      @click="handleCaptchaSolved"
      aria-label="Submit CAPTCHA"
  >
    Submit
  </button>

  <p v-if="isCaptchaCompleted" class="success-message">CAPTCHA successfully solved!</p>
  </div>
</template>


<script>
export default {
  data() {
    return {
      mathQuestionImageSrc: "",
      imageSrc: "",
      puzzlePieces: [],
      shuffledPieces: [],
      currentDragIndex: null,
      isSolved: false,
      isMathSolved: false,
      hint: "Drag and drop the tiles to restore the image.",
      captchaStartTime: null,
      mathQuestion: "",
      userAnswer: "",
      correctAnswer: null,
      isCaptchaCompleted: false,
      isSubmitting: false, // Prevent multiple submissions
      honeypot: "", // Honeypot field
      isJSChallengeSolved: false,
    };
  },
  mounted() {
    this.loadPuzzleImage();
    this.generateMathChallenge();
    this.captchaStartTime = new Date();
  },
  methods: {
    async loadPuzzleImage() {
      const imgUrl = `https://picsum.photos/300?random=${Date.now()}`;
      const response = await fetch(imgUrl);
      const imageBlob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(imageBlob);

      this.imageSrc = imageObjectUrl;
      this.createPuzzlePieces();
    },
    createPuzzlePieces() {
      const image = new Image();
      image.src = this.imageSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const pieceSize = 150;
        const pieces = [];
        const gridSize = 2;

        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            canvas.width = pieceSize;
            canvas.height = pieceSize;
            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                image,
                col * pieceSize,
                row * pieceSize,
                pieceSize,
                pieceSize,
                0,
                0,
                pieceSize,
                pieceSize
            );

            const pieceSrc = canvas.toDataURL();
            pieces.push({
              src: pieceSrc,
              correctIndex: row * gridSize + col,
            });
          }
        }

        this.puzzlePieces = [...pieces];
        this.shuffledPieces = this.shuffleArray([...pieces]);
      };
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    trackUserInteraction() {
      this.isJSChallengeSolved = true;
    },

    dragStart(index) {
      this.currentDragIndex = index;
    },
    drop(index) {
      [this.shuffledPieces[index], this.shuffledPieces[this.currentDragIndex]] = [
        this.shuffledPieces[this.currentDragIndex],
        this.shuffledPieces[index],
      ];
      this.checkIfSolved();
    },

    checkIfSolved() {
      this.isSolved = this.shuffledPieces.every(
          (piece, index) => piece.correctIndex === this.puzzlePieces[index].correctIndex
      );
      if (this.isSolved) {
        this.hint = ""; // Clear the hint when the puzzle is solved
        this.isJSChallengeSolved = true; // Mark the JS challenge as solved when puzzle is solved
      }
      this.checkMathSolution();
    },
    generateMathChallenge() {
      const num1 = Math.floor(Math.random() * 10);
      const num2 = Math.floor(Math.random() * 10);
      this.mathQuestion = `What is ${num1} + ${num2}?`;
      this.correctAnswer = num1 + num2;
      this.createMathImage(num1, num2);
    },
    createMathImage(num1, num2) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const fontSize = 24;
      const padding = 10;
      canvas.width = 200; // Width of the canvas
      canvas.height = 50; // Height of the canvas

      ctx.fillStyle = "#f0f0f0"; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000"; // Text color
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const question = `What is ${num1} + ${num2}?`;
      ctx.fillText(question, canvas.width / 2, canvas.height / 2);

      this.mathQuestionImageSrc = canvas.toDataURL();
    },
    checkMathSolution() {
      this.isMathSolved = this.isSolved && parseInt(this.userAnswer) === this.correctAnswer;
    },
    handleCaptchaSolved() {
      if (this.isSubmitting) return;

      const solveTime = (new Date() - this.captchaStartTime) / 1000;

      if (solveTime < 5) {
        alert("Too fast! Please try again.");
        this.loadPuzzleImage();
        this.generateMathChallenge();
        return;
      }

      // Check honeypot field
      if (this.honeypot) {
        alert("Bot detected! Please try again.");
        this.loadPuzzleImage();
        this.generateMathChallenge();
        return;
      }

      if (this.isSolved && this.isMathSolved && this.isJSChallengeSolved) {
        this.isCaptchaCompleted = true;
        this.isSubmitting = true; // Disable button after completion
        alert("CAPTCHA successfully solved!");
      } else {
        alert("CAPTCHA validation failed. Please try again.");
        this.loadPuzzleImage();
        this.generateMathChallenge();
      }
    },
  },
  watch: {
    userAnswer: "checkMathSolution"
  }
};
</script>

<style scoped>
.captcha-puzzle-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(2, 150px);
  grid-template-rows: repeat(2, 150px);
  gap: 2px;
  margin-bottom: 20px;
  border: 2px solid black;
  padding: 5px;
}

.puzzle-grid.solved {
  border: 4px solid green;
}

.puzzle-piece {
  width: 150px;
  height: 150px;
  cursor: pointer;
}

.math-challenge {
  margin-bottom: 20px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  color: green;
  font-weight: bold;
}
</style>

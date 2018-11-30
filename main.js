// UI Config
const PADDING = 10;
const TITLE_TEXT_SIZE = 24;
const DIGIT_UI_SIZE = 400;
var DIGIT_UI = null;
var PREDICTION_UI = null;
var PROGRESS_UI = null;

// ML Config
const EPOCHS = 1;
const BATCH_SIZE = 320;
const VALIDATION_SPLIT = 0.15;
var MODEL = null;
var DATA = null;

/*************** MACHINE LEARNING  ***********/

/**
 * Loads MNIST data and parses into Tensors
 */
async function loadData() {
  PROGRESS_UI.setStatus(`Loading...`);
  DATA = new MnistData();
  await DATA.load();
}

/**
 * Create a Convolutional Neural Network
 */
function createConvModel() {
  // Create a sequential neural network model. tf.sequential provides an API
  // for creating "stacked" models where the output from one layer is used as
  // the input to the next layer.
  const model = tf.sequential();

  // The first layer of the convolutional neural network plays a dual role:
  // it is both the input layer of the neural network and a layer that performs
  // the first convolution operation on the input. It receives the 28x28 pixels
  // black and white images. This input layer uses 16 filters with a kernel size
  // of 5 pixels each. It uses a simple RELU activation function which pretty
  // much just looks like this: __/
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 3,
      filters: 16,
      activation: "relu"
    })
  );

  // After the first layer we include a MaxPooling layer. This acts as a sort of
  // downsampling using max values in a region instead of averaging.
  // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  // Our third layer is another convolution, this time with 32 filters.
  model.add(
    tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
  );

  // Max pooling again.
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  // Add another conv2d layer.
  model.add(
    tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
  );

  // Now we flatten the output from the 2D filters into a 1D vector to prepare
  // it for input into our last layer. This is common practice when feeding
  // higher dimensional data to a final classification output layer.
  model.add(tf.layers.flatten({}));

  model.add(tf.layers.dense({ units: 64, activation: "relu" }));

  // Our last layer is a dense layer which has 10 output units, one for each
  // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
  // represent numbers, but it's the same idea if you had classes that
  // represented other entities like dogs and cats (two output classes: 0, 1).
  // We use the softmax function as the activation for the output layer as it
  // creates a probability distribution over our 10 classes so their output
  // values sum to 1.
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  return model;
}

/**
 * Create a Dense Neural Network
 */

function createDenseModel() {
  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [IMAGE_H, IMAGE_W, 1] }));
  model.add(tf.layers.dense({ units: 42, activation: "relu" }));
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));
  return model;
}

/**
 * Train the model with the training data
 */
async function trainModel() {
  // MODEL = createDenseModel();
  MODEL = createDenseModel();

  // We are using rmsprop as our optimizer.
  // An optimizer is an iterative method for minimizing an loss function.
  // It tries to find the minimum of our loss function with respect to the
  // model's weight parameters.
  const optimizer = "rmsprop";

  // We compile our model by specifying an optimizer, a loss function, and a
  // list of metrics that we will use for model evaluation. Here we're using a
  // categorical crossentropy loss, the standard choice for a multi-class
  // classification problem like MNIST digits.
  // The categorical crossentropy loss is differentiable and hence makes
  // model training possible. But it is not amenable to easy interpretation
  // by a human. This is why we include a "metric", namely accuracy, which is
  // simply a measure of how many of the examples are classified correctly.
  // This metric is not differentiable and hence cannot be used as the loss
  // function of the model.\
  MODEL.compile({
    optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  const trainData = DATA.getTrainData();

  // This is the total number of batches across all epochs
  let trainBatchCount = 0;
  const totalNumBatches =
    Math.ceil((trainData.xs.shape[0] * (1 - VALIDATION_SPLIT)) / BATCH_SIZE) *
    EPOCHS;

  console.log("🎉 Training Start");
  await MODEL.fit(trainData.xs, trainData.labels, {
    batchSize: BATCH_SIZE,
    validationSplit: VALIDATION_SPLIT, // Leave out the last 15% of the training data for validation, to monitor overfitting during training.
    epochs: EPOCHS,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        trainBatchCount++;
        let percentComplete = (
          (trainBatchCount / totalNumBatches) *
          100
        ).toFixed(1);
        PROGRESS_UI.setProgress(percentComplete);
        PROGRESS_UI.setStatus(`ACC ${logs.acc.toFixed(3)}`);
        console.log(`Training... (${percentComplete}% complete)`);
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch, logs) => {
        valAcc = logs.val_acc;
        console.log(`Accuracy: ${valAcc}`);
        PROGRESS_UI.setStatus(`*ACC ${logs.val_acc.toFixed(3)}`);
        await tf.nextFrame();
      }
    }
  });
  console.log("🍾 Training Complete");

  // Do a final test of the model with the test data, check it against data it's never seen before!
  const testData = DATA.getTestData();
  const testResult = MODEL.evaluate(testData.xs, testData.labels);
  const testAccPercent = testResult[1].dataSync()[0] * 100;
  const finalValAccPercent = valAcc * 100;
  console.log(
    `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
      `Final test accuracy: ${testAccPercent.toFixed(1)}%`
  );
}

/**
 * Given an array passed in
 */
function inferModel(data) {
  let inputs = tf.tensor4d(data, [1, 28, 28, 1]);
  // tf.tidy(() => {
  const output = MODEL.predict(inputs);
  const distribution = output.dataSync();
  const axis = 1;
  const prediction = Array.from(output.argMax(axis).dataSync())[0];

  // });
  inputs.dispose();
  output.dispose();
  return { prediction, distribution };
}

async function loadAndTrain() {
  await loadData();
  await trainModel();
}

/*************** USER INTERFACE ***********/
async function setup() {
  console.log("👉 Setup");
  setupCanvas();
}

function resetDigitCanvas() {
  DIGIT_UI.background(0);
  DIGIT_UI.fill(255);
  DIGIT_UI.stroke(255);
  PREDICTION_UI.reset();
}

function setupCanvas() {
  textFont("Neucha", 16);
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  // Handling issues with retina screens, forcce pixel density to 1
  pixelDensity(1);

  PREDICTION_UI = new Preditions();
  PROGRESS_UI = new ProgressBar(110);

  // This is a place to store where the user is drawing
  DIGIT_UI = createGraphics(DIGIT_UI_SIZE, DIGIT_UI_SIZE);
  resetDigitCanvas();

  // Setup the buttons
  var trainBtn = createButton("Train");
  trainBtn.class("btn-secondary btn-small");
  trainBtn.position(100, 5);
  trainBtn.mousePressed(loadAndTrain);

  var checkBtn = createButton("Check");
  checkBtn.class("btn-success btn-small");
  checkBtn.position(100 + 60, 5);
  checkBtn.mousePressed(predictDigit);

  var resetBtn = createButton("Reset");
  resetBtn.class("btn-danger btn-small");
  resetBtn.position(100 + 127, 5);
  resetBtn.mousePressed(resetDigitCanvas);
}

function draw() {
  background(50);

  let Y = PADDING;

  // Draw Title
  fill(255)
    .strokeWeight(0)
    .textSize(16)
    .textFont("Neucha", 24);
  text("MNIST", PADDING + 5, Y + 24);

  // Draw Progress
  push();
  translate(300, Y);
  PROGRESS_UI.draw();
  pop();

  Y = PADDING + 24 + PADDING * 2;

  // Draw Digit
  image(DIGIT_UI, PADDING, Y);
  Y = Y + DIGIT_UI_SIZE + PADDING;

  // Draw predictions chart
  push();
  translate(0, Y);
  PREDICTION_UI.draw();
  pop();
}

// When the mouse is dragged, draw onto the user pixels
function touchMoved() {
  // Only if the user drags within the user pixels area

  const x = PADDING;
  const y = PADDING + 24 + PADDING;
  const w = DIGIT_UI_SIZE;

  if (mouseX > x && mouseY > y && mouseX < x + w && mouseY < y + w) {
    // Draw a white circle
    DIGIT_UI.ellipse(mouseX - x, mouseY - y, 24, 24);
  }
}

/**
 * Takes the image data that you drew and tries to predict the
 */
async function predictDigit() {
  // Copy the digit canvas into a 28 by 28 image
  let inputs = [];
  const smaller = createImage(28, 28, RGB);
  const img = DIGIT_UI.get();
  DIGIT_UI.width;
  smaller.copy(
    img,
    0,
    0,
    DIGIT_UI.width,
    DIGIT_UI.height,

    0,
    0,
    smaller.width,
    smaller.height
  );
  // Get an array representing the smaller image
  smaller.loadPixels();
  for (var i = 0; i < smaller.pixels.length; i += 4) {
    // Just using the red channel since it's a greyscale image
    // Not so great to use inputs of 0 so smallest value is 0.01
    inputs[i / 4] = map(smaller.pixels[i], 0, 255, 0, 0.99) + 0.01;
  }
  console.log(inputs);
  // Get predictions based on that image
  let data = inferModel(inputs);
  PREDICTION_UI.setData(data);
  console.log(data);
}

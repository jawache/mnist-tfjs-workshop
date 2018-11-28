// Global Variables

var UI = null;
var DIGIT_CANVAS = null;

// Configuration
var CONFIG = {
  epochs: 5,
  batchSize: 320,
  validationSplit: 0.15,
  digitCanvasSize: 400,
  digitCanvasX: 0,
  digitCanvasY: 0
};

/*************** MACHINE LEARNING  ***********/
var MODEL = null;
var DATA = null;

async function loadData() {
  DATA = new MnistData();
  await DATA.load();
}

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

function createDenseModel() {
  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [IMAGE_H, IMAGE_W, 1] }));
  model.add(tf.layers.dense({ units: 42, activation: "relu" }));
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));
  return model;
}

async function trainModel() {
  // MODEL = createDenseModel();
  MODEL = createConvModel();

  const learningRate = 0.01;

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
  // function of the model.
  MODEL.compile({
    optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  const batchSize = CONFIG.batchSize;

  // Leave out the last 15% of the training data for validation, to monitor
  // overfitting during training.
  const validationSplit = CONFIG.validationSplit;

  const trainEpochs = CONFIG.epochs;

  let trainBatchCount = 0;
  const trainData = DATA.getTrainData();
  const testData = DATA.getTestData();
  const totalNumBatches =
    Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
    trainEpochs;

  await MODEL.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        trainBatchCount++;
        console.log(
          `Training... (` +
            `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
            ` complete). To stop training, refresh or close page.`
        );
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch, logs) => {
        valAcc = logs.val_acc;
        console.log(`Accuracy: ${valAcc}`);
        await tf.nextFrame();
      }
    }
  });

  // Do a final test of the model with the test data, check it against data it's never seen before!
  const testResult = MODEL.evaluate(testData.xs, testData.labels);
  const testAccPercent = testResult[1].dataSync()[0] * 100;
  const finalValAccPercent = valAcc * 100;
  console.log(
    `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
      `Final test accuracy: ${testAccPercent.toFixed(1)}%`
  );
}

async function inferModel(data) {
  let inputs = tf.tensor4d(data, [1, 28, 28, 1]);
  // tf.tidy(() => {
  const output = MODEL.predict(inputs);
  const axis = 1;
  const predictions = Array.from(output.argMax(axis).dataSync());
  console.log(predictions);
  // });
  inputs.dispose();
  return predictions;
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

function setupCanvas() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  // Handling issues with retina screens, forcce pixel density to 1
  pixelDensity(1);

  // UI = new LayoutVertical(10).add(
  //   new Title("Mnist", 0, 0, windowWidth, 24)
  // );
  // .add(new DrawArea(0, 0, 400, 400));

  // This is a place to store where the user is drawing
  DIGIT_CANVAS = createGraphics(CONFIG.digitCanvasSize, CONFIG.digitCanvasSize);
  DIGIT_CANVAS.background(0);
  DIGIT_CANVAS.fill(255);
  DIGIT_CANVAS.stroke(255);

  var trainBtn = createButton("Train");
  trainBtn.class("btn-secondary");
  trainBtn.position(20, CONFIG.digitCanvasSize + 20);
  trainBtn.mousePressed(loadAndTrain);

  var checkBtn = createButton("Check");
  checkBtn.class("btn-success");
  checkBtn.position(20 + 100, CONFIG.digitCanvasSize + 20);
  checkBtn.mousePressed(predictDigit);

  var resetBtn = createButton("Reset");
  resetBtn.class("btn-danger");
  resetBtn.position(20 + 200, CONFIG.digitCanvasSize + 20);
  resetBtn.mousePressed(_ => {
    console.log("jere");
    DIGIT_CANVAS.background(0);
    DIGIT_CANVAS.fill(255);
    DIGIT_CANVAS.stroke(255);
  });
}

function draw() {
  background(50);
  image(DIGIT_CANVAS, 0, 0);

  // Title
  // LAYOUT.draw();

  // Move 10 down
}

// When the mouse is dragged, draw onto the user pixels
function touchMoved() {
  // Only if the user drags within the user pixels area

  let { digitCanvasX: x, digitCanvasY: y, digitCanvasSize: w } = CONFIG;
  if (mouseX > x && mouseY > y && mouseX < x + w && mouseY < y + w) {
    // Draw a white circle
    DIGIT_CANVAS.ellipse(mouseX - x, mouseY - y, 32, 32);
  }
}

// CONFIG.digitCanvasSize,
// CONFIG.digitCanvasSize,

async function predictDigit() {
  // Copy the digit canvas into a 28 by 28 image
  let inputs = [];
  const smaller = createImage(28, 28, RGB);
  const img = DIGIT_CANVAS.get();
  DIGIT_CANVAS.width;
  smaller.copy(
    img,
    0,
    0,
    DIGIT_CANVAS.width,
    DIGIT_CANVAS.height,

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
  let prediction = inferModel(inputs);
}

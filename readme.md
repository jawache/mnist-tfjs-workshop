# Neen to run with a local server

`npm install serve`

`serve`

# Notes

- Help each other out.
- I don't know anything.

## Intro (Slides)

- Intro to NN
- Intro to TFJS Core + Layers

## Setup

- Show end product
- Show data.csev
- Explain problem
- Show index.html
- Explain dashboard.js, data.js and main.js

## Load and prepare data

- preload() function in p5 js, before setup, waits for data to load.
- create prepareData() function and call from setup().
- Show data.js, explain how it's converting the data to what we need.
- Show how it's splitting the data to training and testing.
- Explain the concept of traiing and testing split.
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## Define the problem & solution (Slides)

- Why we chose this use case?
- How would you solve this problem?

  - It's easy with "if's" 
  - What if you can't use if's? only mults.

- Show matrix multiplication slide, show dot product.
- In fact we "know" the best thing to multiply by is 1,1,1,0,0,0,-1,-1,-1

- Show simple NN, 9 inputs, 9 weights, 1 output
- We are going to build a simple NN.
- The weights remember are initialised at ranodm.
- We KNOW the right weights would look like 1,1,1,0,0,0,-1,-1,-1
- We are going to build a NN which will train those weights to look more like the above.

## Validate model

- We calculate what the result would be with our crappy weigths.
- We figure our how WRONG that prediction was.
- Let's break it down to just those two steps.
- create validateModel() function

- create WEIGHTS
  - transpose() - discuss
  - print()
- create Inputs tensor
- create predict function, this calculates the predicted tensor from the inputs and weights
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

- create labels tensor
- create loss() function

  - This needs to return a single value.
  - It really matters what function you use here.
  - Mean squared error is a good one.
    [SLIDE]
    !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

- Loss doesn't tell us how "accurate" we are, loss is just less the better we are.
- We create an accuracy function which caclulates a %age accuracy function
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## Train Model

- The building blocks are working, really important to make sure this works.
- This isn't like a computer program, it won't barf an error hint if you got it wrong, if you missed a transpose.
- It just won't work.

- Now we want to train the weights, adjust them slowly so they converge to the ideal weights.
- create trainModel()
- create optimizer, discuss learning rate.
- create input and label tensors
- loop over epochs
- Make sure to add await tf.nextFrame(); or it will lock up the UI
- return cost and print it out
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## Create dashboard

- Every 10 epochs let print out the weights and cost
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

- Let's also test with testing data and print out accuracy and loss there
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

- Lets's store the relevant information in the DATA object and show the dashboard
- setupCanvas();
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## Do with Layers

- We did it the hard way, now let's do it the easier way.
- Layers API, abstracts things into concepts of "layers of nodes"
- createModel(), talk through
- trainModelLayers(), talk through model.fit
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!
- Add callbacks
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## TFVIS

- Show how to use the API
- Callbacks, validation split, shuffle
  !!!!!!!!!!!![TRY]!!!!!!!!!!!!!!!!

## Layers + Dashboard

- Finally add the dashboard back in

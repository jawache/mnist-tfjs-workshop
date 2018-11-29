class LayoutVertical {
  constructor(padding) {
    this.children = [];
    this.padding = padding;
  }

  add(panel) {
    this.children.push(panel);
    return this;
  }

  draw() {
    push();

    translate(0, this.padding);

    for (let child of this.children) {
      // Draw the child
      child.draw(this.padding);

      // Move down by height + padding
      translate(0, child.height + this.padding);
    }

    pop();
  }
}

class Panel {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  add(child) {
    this.children.push(child);
    return this;
  }

  draw() {
    console.log("Implement This");
  }
}

class Title extends Panel {
  constructor(title, x, y, width, height) {
    super(x, y, width, height);
    this.title = title;
  }

  draw(padding, width, height) {
    push();
    translate(padding, padding);
    fill(255)
      .strokeWeight(0)
      .textSize(16)
      .textFont("Helvetica", 24);
    text(this.title, 0, 24);
    pop();
  }
}

class DrawArea extends Panel {
  draw(padding) {
    push();
    translate(padding, padding);
    fill(0);
    rect(0, 0, this.width, this.height);
    pop();
  }
}

class ProgressBar {
  constructor(status, percentage, width) {
    this.status = status;
    this.percentage = percentage;
    this.width = width;
  }

  draw() {
    // Gray line full width
    // White line %age width
    strokeCap(SQUARE);
    strokeWeight(20);
    line(0, 0, 0, this.width);
  }
}

class Preditions {
  constructor(data) {
    this.maxheight = 100;
    this.width = 20;
    this.gap = 20;
    this.reset();
  }

  setData(data) {
    this.distribution = data.distribution;
    this.prediction = data.prediction;
  }

  reset() {
    this.distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.prediction = -1;
  }

  draw() {
    const norm = x => map(x, 0, 1, 0, this.maxheight);

    for (let i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      let height = norm(this.distribution[i]);
      let x = (i + 1) * (this.width + this.gap);

      if (i == this.prediction) {
        fill("red");
        stroke("red");
      } else {
        fill(255);
        stroke(255);
      }

      // Labels
      push();
      strokeWeight(0);
      textSize(12);
      textFont("Neucha", 16);
      text(i, x - 5, 120);
      pop();

      // Lines
      push();
      strokeWeight(20);
      strokeCap(SQUARE);
      line(x, 100, x, 100 - height);
      pop();
    }
  }
}
